import { NextResponse } from "next/server";

import { buildOptimization, generatePlanSnapshot } from "@/lib/planner";
import { clearGeneratedPlan, readAppState, readGeneratedPlan, writeAppState, writeGeneratedPlan } from "@/lib/storage";

export async function GET() {
  const state = await readAppState();
  const generatedPlan = await readGeneratedPlan();
  const hydratedState = {
    ...state,
    generatedPlan,
  };

  return NextResponse.json(buildOptimization(hydratedState));
}

export async function POST() {
  const state = await readAppState();

  if (state.mode === "free") {
    const generatedPlan = await readGeneratedPlan();
    const hydratedState = generatedPlan ? { ...state, generatedPlan } : state;
    return NextResponse.json(buildOptimization(hydratedState));
  }

  const generatedPlan = generatePlanSnapshot(state);
  await writeGeneratedPlan(generatedPlan);
  await writeAppState({
    ...state,
    generatedPlan,
  });

  return NextResponse.json(generatedPlan);
}

export async function DELETE() {
  const state = await readAppState();
  await clearGeneratedPlan();
  await writeAppState({
    ...state,
    generatedPlan: null,
  });

  return NextResponse.json({ ok: true });
}
