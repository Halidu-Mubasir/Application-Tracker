import { NextRequest, NextResponse } from "next/server";
import { runSearch } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await runSearch(q);
  return NextResponse.json({ results });
}
