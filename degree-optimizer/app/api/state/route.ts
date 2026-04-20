import { NextResponse } from "next/server";

import { readAppState, writeAppState } from "@/lib/storage";
import type { AppState } from "@/lib/types";

export async function GET() {
  const state = await readAppState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const nextState = (await request.json()) as AppState;
  const saved = await writeAppState(nextState);
  return NextResponse.json(saved);
}
