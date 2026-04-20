import { promises as fs } from "fs";
import path from "path";

import { defaultAppState } from "@/data/catalog";
import type { AppState, PlannerResult } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "progress.json");
const planFilePath = path.join(process.cwd(), "data", "generated-plan.json");

function clampUnits(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return defaultAppState.preferredMaxUnitsPerTerm;
  }

  return Math.min(18, Math.max(1, Math.round(value)));
}

function sanitizeState(raw: Partial<AppState> | undefined): AppState {
  return {
    ...defaultAppState,
    ...raw,
    mode: raw?.mode === "premium" ? "premium" : "free",
    completedRequirementIds: Array.isArray(raw?.completedRequirementIds)
      ? Array.from(new Set(raw.completedRequirementIds))
      : defaultAppState.completedRequirementIds,
    preferredMaxUnitsPerTerm: clampUnits(raw?.preferredMaxUnitsPerTerm),
    preferFewerDaysOnCampus: Boolean(raw?.preferFewerDaysOnCampus),
    completedUnits:
      typeof raw?.completedUnits === "number" && raw.completedUnits >= 0
        ? raw.completedUnits
        : defaultAppState.completedUnits,
    completedUpperDivisionUnits:
      typeof raw?.completedUpperDivisionUnits === "number" && raw.completedUpperDivisionUnits >= 0
        ? raw.completedUpperDivisionUnits
        : defaultAppState.completedUpperDivisionUnits,
    completedSacStateUnits:
      typeof raw?.completedSacStateUnits === "number" && raw.completedSacStateUnits >= 0
        ? raw.completedSacStateUnits
        : defaultAppState.completedSacStateUnits,
    completedSacStateUpperDivisionUnits:
      typeof raw?.completedSacStateUpperDivisionUnits === "number" && raw.completedSacStateUpperDivisionUnits >= 0
        ? raw.completedSacStateUpperDivisionUnits
        : defaultAppState.completedSacStateUpperDivisionUnits,
    generatedPlan: raw?.generatedPlan ?? null,
  };
}

export async function readAppState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    return sanitizeState(JSON.parse(raw) as Partial<AppState>);
  } catch {
    return defaultAppState;
  }
}

export async function writeAppState(state: AppState): Promise<AppState> {
  const sanitized = sanitizeState(state);
  await fs.writeFile(dataFilePath, JSON.stringify(sanitized, null, 2), "utf8");
  return sanitized;
}

export async function readGeneratedPlan(): Promise<PlannerResult | null> {
  try {
    const raw = await fs.readFile(planFilePath, "utf8");
    const parsed = JSON.parse(raw) as PlannerResult;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeGeneratedPlan(plan: PlannerResult): Promise<PlannerResult> {
  await fs.writeFile(planFilePath, JSON.stringify(plan, null, 2), "utf8");
  return plan;
}

export async function clearGeneratedPlan(): Promise<void> {
  try {
    await fs.unlink(planFilePath);
  } catch {
    // Ignore missing plan file.
  }
}
