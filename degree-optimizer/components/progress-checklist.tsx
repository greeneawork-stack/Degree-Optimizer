"use client";

import type { Dispatch, SetStateAction } from "react";

import type { AppState, RequirementGroup } from "@/lib/types";

type ProgressChecklistProps = {
  geRequirements: RequirementGroup[];
  majorRequirements: RequirementGroup[];
  progress: AppState;
  setProgress: Dispatch<SetStateAction<AppState>>;
};

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

function RequirementSection({
  title,
  tone,
  groups,
  progress,
  setProgress,
}: {
  title: string;
  tone: "sky" | "emerald";
  groups: RequirementGroup[];
  progress: AppState;
  setProgress: Dispatch<SetStateAction<AppState>>;
}) {
  const toneClasses =
    tone === "sky"
      ? "hover:border-sky-300 hover:bg-sky-50/60"
      : "hover:border-emerald-300 hover:bg-emerald-50/60";

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <section key={group.id}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.requirements.map((requirement) => {
                const isChecked = progress.completedRequirementIds.includes(requirement.id);

                return (
                  <label
                    key={requirement.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition ${toneClasses}`}
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
                    <span>
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

export default function ProgressChecklist({
  geRequirements,
  majorRequirements,
  progress,
  setProgress,
}: ProgressChecklistProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <RequirementSection
        title="General Education"
        tone="sky"
        groups={geRequirements}
        progress={progress}
        setProgress={setProgress}
      />
      <RequirementSection
        title="Political Science Major"
        tone="emerald"
        groups={majorRequirements}
        progress={progress}
        setProgress={setProgress}
      />
    </div>
  );
}
