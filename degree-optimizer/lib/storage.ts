import { promises as fs } from "fs";
import path from "path";

import { defaultAppState } from "@/data/catalog";
import type { AppState } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "progress.json");

function sanitizeState(raw: Partial<AppState> | undefined): AppState {
  return {
    ...defaultAppState,
    ...raw,
    completedRequirementIds: Array.isArray(raw?.completedRequirementIds)
      ? Array.from(new Set(raw.completedRequirementIds))
      : defaultAppState.completedRequirementIds,
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
