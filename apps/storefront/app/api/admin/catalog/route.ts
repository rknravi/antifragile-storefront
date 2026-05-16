import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/admin-session";
import { parseCatalogJson } from "@/lib/catalog-parse";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const c = cookieStore.get(adminSessionCookieName())?.value;
  return verifyAdminSessionValue(c);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const raw = await readFile(CATALOG_PATH, "utf8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Could not read catalog." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (process.env.ALLOW_CATALOG_WRITE === "false") {
    return NextResponse.json({ error: "Catalog writes disabled (ALLOW_CATALOG_WRITE=false)." }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const parsed = parseCatalogJson(body);
    const text = JSON.stringify(parsed, null, 2);
    await writeFile(CATALOG_PATH, text, "utf8");
    try {
      revalidateTag("catalog", { expire: 0 });
      revalidatePath("/");
    } catch {
      /* revalidate optional in some runtimes */
    }
    return NextResponse.json({ ok: true, count: parsed.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
