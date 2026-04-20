"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProgressChecklist from "@/components/progress-checklist";
import {
  catalog,
  getAutoFillState,
  getSelectedDegreePath,
  getSelectedMinor,
} from "@/data/catalog";
import { generatePlan, updateAppState } from "@/lib/actions";
import type { AppState, ProgramRequirementGroup } from "@/lib/types";

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
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-sky-50/40"
      />
    </label>
  );
}

function safeRequirementIds(groups: ProgramRequirementGroup[] | undefined) {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap((group) =>
    Array.isArray(group?.requirements) ? group.requirements.map((requirement) => requirement.id) : [],
  );
}

type ProgressFormProps = {
  initialState: AppState;
};

export default function ProgressForm({ initialState }: ProgressFormProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<AppState>(initialState);
  const [saving, setSaving] = useState(false);

  const selectedDegree = getSelectedDegreePath(progress.degreePathId);
  const selectedMinor = getSelectedMinor(progress.minorId);

  const allRequirementIds = useMemo(
    () => [
      ...safeRequirementIds(catalog.geRequirements),
      ...safeRequirementIds(catalog.universityRequirements),
      ...safeRequirementIds(selectedDegree.requirementGroups),
      ...safeRequirementIds(selectedMinor?.requirementGroups),
    ],
    [selectedDegree, selectedMinor],
  );

  const selectedCount = Array.isArray(progress.completedRequirementIds)
    ? progress.completedRequirementIds.length
    : 0;
  const totalCount = allRequirementIds.length;
  const summary = useMemo(
    () => `${selectedCount} of ${totalCount} active requirements marked complete`,
    [selectedCount, totalCount],
  );

  const saveAndContinue = async () => {
    setSaving(true);

    try {
      await updateAppState(progress);
      await generatePlan(progress);
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
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
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
                  <span>Plan access</span>
                  <span className="font-medium text-slate-900 capitalize">{progress.mode}</span>
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
                  min={1}
                  max={18}
                  value={progress.preferredMaxUnitsPerTerm}
                  onChange={(event) =>
                    setProgress((current) => ({
                      ...current,
                      preferredMaxUnitsPerTerm: Number(event.target.value),
                    }))
                  }
                  className="accent-sky-500"
                />
                <span className="text-xs text-slate-500">
                  Choose between 1 and 18 units per semester. The planner respects this limit directly.
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
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:text-sky-700"
          >
            {saving ? "Saving..." : "Generate Plan"}
          </button>
        </div>
      </section>
    </div>
  );
}
