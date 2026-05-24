import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-api-auth";
import { parsePoliciesJson } from "@/lib/policies-parse";

const POLICIES_PATH = path.join(process.cwd(), "data", "policies.json");

const POLICY_PATHS = [
  "/shipping-policy",
  "/returns",
  "/privacy",
  "/terms",
  "/cancellation",
] as const;

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const raw = await readFile(POLICIES_PATH, "utf8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Could not read policies." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (process.env.ALLOW_POLICIES_WRITE === "false") {
    return NextResponse.json(
      { error: "Policy writes disabled (ALLOW_POLICIES_WRITE=false)." },
      { status: 403 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const parsed = parsePoliciesJson(body);
    const text = JSON.stringify(parsed, null, 2);
    await writeFile(POLICIES_PATH, text, "utf8");
    try {
      revalidateTag("policies", { expire: 0 });
      for (const p of POLICY_PATHS) revalidatePath(p);
      revalidatePath("/blog");
    } catch {
      /* optional in some runtimes */
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
