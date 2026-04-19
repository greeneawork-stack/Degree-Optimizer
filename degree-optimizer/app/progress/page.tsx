"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProgressChecklist from "@/components/progress-checklist";
import { catalog, defaultAppState } from "@/data/catalog";
import { fetchAppState, updateAppState } from "@/lib/actions";
import type { AppState } from "@/lib/types";

const allRequirementIds = [
  ...catalog.geRequirements.flatMap((group) => group.requirements.map((requirement) => requirement.id)),
  ...catalog.majorRequirements.flatMap((group) => group.requirements.map((requirement) => requirement.id)),
];

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<AppState>(defaultAppState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateState() {
      try {
        const savedState = await fetchAppState();
        if (isMounted) {
          setProgress(savedState);
        }
      } catch {
        // Fall back to the default state if the local JSON file is unavailable.
      }
    }

    void hydrateState();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCount = progress.completedRequirementIds.length;
  const totalCount = allRequirementIds.length;
  const summary = useMemo(
    () => `${selectedCount} of ${totalCount} requirements marked complete`,
    [selectedCount, totalCount],
  );

  const saveAndContinue = async () => {
    setSaving(true);

    try {
      await updateAppState(progress);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Progress input
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Tell us what you&apos;ve completed</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Mark completed GE areas and Political Science requirements, or use the simulated auto-fill option to
            preview the planner with mock student progress.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Option A: Manual Input</h2>
            <p className="text-sm text-slate-600">
              Use the checklist below to reflect completed GE areas and Political Science milestones.
            </p>
          </div>
          <ProgressChecklist
            geRequirements={catalog.geRequirements}
            majorRequirements={catalog.majorRequirements}
            progress={progress}
            setProgress={setProgress}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-950">Option B: Auto-fill (simulated)</h2>
              <p className="text-sm text-emerald-900/80">
                Load a mock student profile to instantly populate completed requirements and see the dashboard in
                action.
              </p>
              <button
                type="button"
                onClick={() =>
                  setProgress((current) => ({
                    ...current,
                    completedRequirementIds: [...catalog.autoFillCompletedRequirementIds],
                    usedAutoFill: true,
                  }))
                }
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Auto-fill your progress
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Progress summary</p>
              <p className="text-3xl font-semibold text-slate-900">{selectedCount}</p>
              <p className="text-sm text-slate-600">{summary}</p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>School</span>
                  <span className="font-medium text-slate-900">{progress.schoolName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Major</span>
                  <span className="font-medium text-slate-900">{progress.majorName}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={saveAndContinue}
            disabled={saving}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      </section>
    </div>
  );
}
