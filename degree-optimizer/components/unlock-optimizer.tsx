"use client";

import { useState } from "react";

import { setUnlockedPlan } from "@/lib/actions";
import type { SemesterPlan } from "@/lib/types";

type UnlockOptimizerProps = {
  optimizedSchedule: SemesterPlan[];
  fasterBySemesters: number;
  initiallyUnlocked?: boolean;
};

export default function UnlockOptimizer({
  optimizedSchedule,
  fasterBySemesters,
  initiallyUnlocked = false,
}: UnlockOptimizerProps) {
  const [isUnlocked, setIsUnlocked] = useState(initiallyUnlocked);
  const [isPending, setIsPending] = useState(false);

  const handleUnlock = async () => {
    setIsPending(true);
    try {
      await setUnlockedPlan(true);
      setIsUnlocked(true);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Optimization Preview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            We found a faster path to graduation
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Graduate {Math.max(fasterBySemesters, 1)} semester earlier
            {Math.max(fasterBySemesters, 1) > 1 ? "s" : ""}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUnlock}
          disabled={isUnlocked || isPending}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isUnlocked ? "Optimized plan unlocked" : isPending ? "Unlocking..." : "Unlock Optimized Plan"}
        </button>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-5">
        {!isUnlocked ? (
          <>
            <div className="pointer-events-none select-none space-y-4 blur-sm">
              {optimizedSchedule.slice(0, 3).map((semester) => (
                <article key={semester.term} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{semester.term}</h3>
                    <span className="text-xs text-slate-500">{semester.totalUnits} units</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {semester.courses.map((course) => (
                      <li key={course.code}>
                        {course.code} - {course.title}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-sm">
              <div className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
                Unlock to reveal the overlap-aware schedule
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">Optimized schedule</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Classes with major + GE overlap are moved earlier to compress the path.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Preferences (UI only)</p>
                <div className="mt-3 grid gap-3 text-sm text-slate-600">
                  <label className="grid gap-1">
                    <span>Max units per semester</span>
                    <input
                      value="15"
                      readOnly
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span>Prefer fewer days on campus</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {optimizedSchedule.map((semester) => (
                <article key={semester.term} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{semester.term}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      {semester.totalUnits} units
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {semester.courses.map((course) => (
                      <li key={course.code} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {course.code}: {course.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Score {course.score.total}
                          {course.satisfiesMajorCategory ? ` • ${course.satisfiesMajorCategory}` : ""}
                          {course.satisfiesGe.length > 0 ? ` • GE ${course.satisfiesGe.join(", ")}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
