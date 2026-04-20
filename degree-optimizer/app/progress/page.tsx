"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProgressChecklist from "@/components/progress-checklist";
import {
  catalog,
  defaultAppState,
  getAutoFillState,
  getSelectedDegreePath,
  getSelectedMinor,
} from "@/data/catalog";
import { fetchAppState, updateAppState } from "@/lib/actions";
import type { AppState } from "@/lib/types";

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

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
        // Fall back to defaults if state cannot be loaded.
      }
    }

    void hydrateState();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedDegree = getSelectedDegreePath(progress.degreePathId);
  const selectedMinor = getSelectedMinor(progress.minorId);

  const allRequirementIds = useMemo(
    () => [
      ...catalog.geRequirements.flatMap((group) => group.requirements.map((requirement) => requirement.id)),
      ...catalog.universityRequirements.flatMap((group) =>
        group.requirements.map((requirement) => requirement.id),
      ),
      ...selectedDegree.requirementGroups.flatMap((group) =>
        group.requirements.map((requirement) => requirement.id),
      ),
      ...(selectedMinor?.requirementGroups.flatMap((group) =>
        group.requirements.map((requirement) => requirement.id),
      ) ?? []),
    ],
    [selectedDegree, selectedMinor],
  );

  const selectedCount = progress.completedRequirementIds.length;
  const totalCount = allRequirementIds.length;
  const summary = useMemo(
    () => `${selectedCount} of ${totalCount} active requirements marked complete`,
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
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            Mark completed GE, university, major-track, and optional minor requirements. You can also record completed
            total and upper-division units so Sacramento State graduation rules stay realistic.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Option A: Manual Input</h2>
            <p className="text-sm text-slate-600">
              Use the checklist below to reflect completed GE areas, Sacramento State graduation rules, and your
              selected Political Science track.
            </p>
          </div>

          <div className="space-y-8">
            <ProgressChecklist
              title="General Education"
              tone="sky"
              groups={catalog.geRequirements}
              progress={progress}
              setProgress={setProgress}
            />
            <ProgressChecklist
              title="University requirements"
              tone="violet"
              groups={catalog.universityRequirements}
              progress={progress}
              setProgress={setProgress}
            />
            <ProgressChecklist
              title={selectedDegree.name}
              tone="emerald"
              groups={selectedDegree.requirementGroups}
              progress={progress}
              setProgress={setProgress}
            />
            <ProgressChecklist
              title={selectedMinor?.name ?? "Optional minor"}
              tone="amber"
              groups={selectedMinor?.requirementGroups ?? []}
              progress={progress}
              setProgress={setProgress}
              emptyMessage="No minor selected. Choose Political Science Minor during onboarding to track minor requirements."
            />
          </div>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Academic totals</h3>
              <p className="mt-1 text-sm text-slate-600">
                These values help the planner account for 120 total units, upper-division minimums, and Sacramento
                State residency expectations.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                label="Completed total units"
                value={progress.completedUnits}
                onChange={(completedUnits) =>
                  setProgress((current) => ({
                    ...current,
                    completedUnits,
                  }))
                }
              />
              <NumberField
                label="Completed upper-division units"
                value={progress.completedUpperDivisionUnits}
                onChange={(completedUpperDivisionUnits) =>
                  setProgress((current) => ({
                    ...current,
                    completedUpperDivisionUnits,
                  }))
                }
              />
              <NumberField
                label="Completed Sacramento State units"
                value={progress.completedSacStateUnits}
                onChange={(completedSacStateUnits) =>
                  setProgress((current) => ({
                    ...current,
                    completedSacStateUnits,
                  }))
                }
              />
              <NumberField
                label="Completed Sacramento State upper-division units"
                value={progress.completedSacStateUpperDivisionUnits}
                onChange={(completedSacStateUpperDivisionUnits) =>
                  setProgress((current) => ({
                    ...current,
                    completedSacStateUpperDivisionUnits,
                  }))
                }
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-950">Option B: Auto-fill (simulated)</h2>
              <p className="text-sm text-emerald-900/80">
                Load mock progress tailored to your currently selected degree path and optional minor.
              </p>
              <button
                type="button"
                onClick={() => setProgress(getAutoFillState(progress.degreePathId, progress.minorId))}
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
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>School</span>
                  <span className="font-medium text-slate-900">{progress.schoolName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Major track</span>
                  <span className="font-medium text-slate-900">{progress.degreePathName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Minor</span>
                  <span className="font-medium text-slate-900">{progress.minorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preferred max units</span>
                  <span className="font-medium text-slate-900">{progress.preferredMaxUnitsPerTerm}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Planning preferences</h3>
            <div className="mt-4 space-y-4">
              <label className="grid gap-2 text-sm text-slate-700">
                <span>Max units per semester</span>
                <input
                  type="range"
                  min={15}
                  max={18}
                  value={progress.preferredMaxUnitsPerTerm}
                  onChange={(event) =>
                    setProgress((current) => ({
                      ...current,
                      preferredMaxUnitsPerTerm: Number(event.target.value),
                    }))
                  }
                />
                <span className="text-xs text-slate-500">
                  Default 15 units per semester, with optimization allowed up to 18.
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={progress.preferFewerDaysOnCampus}
                  onChange={(event) =>
                    setProgress((current) => ({
                      ...current,
                      preferFewerDaysOnCampus: event.target.checked,
                    }))
                  }
                />
                <span>Prefer fewer days on campus</span>
              </label>
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
