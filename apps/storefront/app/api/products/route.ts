import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/get-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Could not load catalog." }, { status: 500 });
  }
}
