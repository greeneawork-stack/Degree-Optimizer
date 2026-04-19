import { promises as fs } from "fs";
import path from "path";

import { defaultAppState } from "@/data/catalog";
import type { AppState } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "progress.json");

export async function readAppState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultAppState;
  }
}

export async function writeAppState(state: AppState): Promise<AppState> {
  await fs.writeFile(dataFilePath, JSON.stringify(state, null, 2), "utf8");
  return state;
}
