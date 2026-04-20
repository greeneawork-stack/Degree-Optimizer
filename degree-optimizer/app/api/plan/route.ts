import { NextResponse } from "next/server";

import { buildOptimization } from "@/lib/planner";
import { readAppState } from "@/lib/storage";

export async function GET() {
  const state = await readAppState();
  return NextResponse.json(buildOptimization(state, { includeSchedules: state.mode === "premium" }));
}
