// Loads real eval results from evals/results.json (committed after `npm run eval`).
// If the file doesn't exist or is malformed, returns null and the /research page
// shows a "Run the eval to populate" state instead of fake numbers.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface EvalAxisScores {
  faithfulness: number;
  executability: number;
  format: number;
  conciseness: number;
}

export interface EvalCaseResult extends EvalAxisScores {
  caseId: string;
  domain: string;
  difficulty: string;
  inputType: string;
  inputChars: number;
  skillName: string;
  total: number;
  grade: "A" | "B" | "C" | "D";
  notes: Record<keyof EvalAxisScores, string>;
  costUsd: number;
  durationMs: number;
}

export interface EvalRunResults {
  runAt: string;
  models: { extract: string; synthesize: string; grade: string };
  cases: EvalCaseResult[];
  aggregate: {
    n: number;
    meanTotal: number;
    meanByAxis: EvalAxisScores;
    grades: Record<"A" | "B" | "C" | "D", number>;
    totalCostUsd: number;
  };
}

const RESULTS_PATH = join(process.cwd(), "evals", "results.json");

export async function loadEvalResults(): Promise<EvalRunResults | null> {
  try {
    const raw = await readFile(RESULTS_PATH, "utf8");
    return JSON.parse(raw) as EvalRunResults;
  } catch {
    return null;
  }
}
