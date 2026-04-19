import type { AppState, OptimizationResult, PetitionFormValues } from "@/lib/types";

export async function saveAppState(state: AppState) {
  const response = await fetch("/api/state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    throw new Error("Failed to save application state.");
  }

  return (await response.json()) as AppState;
}

export async function updateAppState(state: AppState) {
  return saveAppState(state);
}

export async function fetchOptimization() {
  const response = await fetch("/api/plan", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load degree plan.");
  }

  return (await response.json()) as OptimizationResult;
}

export async function setUnlockedPlan(unlocked: boolean) {
  const currentResponse = await fetch("/api/state", {
    cache: "no-store",
  });

  if (!currentResponse.ok) {
    throw new Error("Failed to load current application state.");
  }

  const currentState = (await currentResponse.json()) as AppState;

  return saveAppState({
    ...currentState,
    unlockedOptimizedPlan: unlocked,
  });
}

export async function generatePetitionDraft(payload: PetitionFormValues) {
  const response = await fetch("/api/petition", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate petition draft.");
  }

  return (await response.json()) as { emailDraft: string };
}
