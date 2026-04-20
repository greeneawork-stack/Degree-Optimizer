"use client";

import type { Dispatch, SetStateAction } from "react";

import type { AppState, ProgramRequirementGroup } from "@/lib/types";

type ProgressChecklistProps = {
  title: string;
  tone: "sky" | "emerald" | "violet" | "amber";
  groups: ProgramRequirementGroup[];
  progress: AppState;
  setProgress: Dispatch<SetStateAction<AppState>>;
  emptyMessage?: string;
};

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

function toneClasses(tone: ProgressChecklistProps["tone"]) {
  switch (tone) {
    case "sky":
      return "hover:border-sky-300 hover:bg-sky-50/60";
    case "emerald":
      return "hover:border-emerald-300 hover:bg-emerald-50/60";
    case "violet":
      return "hover:border-violet-300 hover:bg-violet-50/60";
    case "amber":
      return "hover:border-amber-300 hover:bg-amber-50/60";
    default:
      return "hover:border-slate-300 hover:bg-slate-50/60";
  }
}

export default function ProgressChecklist({
  title,
  tone,
  groups,
  progress,
  setProgress,
  emptyMessage = "No requirements are currently loaded for this section.",
}: ProgressChecklistProps) {
  const safeGroups = Array.isArray(groups) ? groups : [];
  const completedRequirementIds = Array.isArray(progress.completedRequirementIds)
    ? progress.completedRequirementIds
    : [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-5 space-y-5">
        {safeGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : null}

        {safeGroups.map((group) => (
          <section key={group.id}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {group.title}
            </h3>
            {group.description ? (
              <p className="mb-3 text-sm text-slate-500">{group.description}</p>
            ) : null}
            <div className="space-y-3">
              {(Array.isArray(group.requirements) ? group.requirements : []).map((requirement) => {
                const isChecked = completedRequirementIds.includes(requirement.id);

                return (
                  <label
                    key={requirement.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition ${toneClasses(
                      tone,
                    )}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                      checked={isChecked}
                      onChange={() =>
                        setProgress((current) => ({
                          ...current,
                          completedRequirementIds: toggleValue(
                            current.completedRequirementIds,
                            requirement.id,
                          ),
                        }))
                      }
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">
                        {requirement.label}
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        {requirement.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
