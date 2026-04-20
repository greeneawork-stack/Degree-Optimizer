"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { enablePremiumMode } from "@/lib/actions";

type UnlockOptimizerProps = {
  fasterBySemesters: number;
  preferredMaxUnitsPerTerm: number;
  preferFewerDaysOnCampus: boolean;
  isPremium: boolean;
};

export default function UnlockOptimizer({
  fasterBySemesters,
  preferredMaxUnitsPerTerm,
  preferFewerDaysOnCampus,
  isPremium,
}: UnlockOptimizerProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleUnlock = async () => {
    setIsPending(true);
    try {
      await enablePremiumMode();
      router.refresh();
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
          disabled={isPremium || isPending}
          className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:text-slate-500"
        >
          {isPremium ? "Optimized plan unlocked" : isPending ? "Unlocking..." : "Unlock Optimized Plan"}
        </button>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-5">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Locked optimization preview</p>
              <p className="mt-1 text-sm text-emerald-800">
                Premium unlock reveals semester-by-semester planning, unit balancing, and overlap-first recommendations.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Saved preferences</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-600">
                <label className="grid gap-1">
                  <span>Max units per semester</span>
                  <input
                    value={String(preferredMaxUnitsPerTerm)}
                    readOnly
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={preferFewerDaysOnCampus}
                    readOnly
                  />
                  <span>Prefer fewer days on campus</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-6 text-sm text-slate-600">
            <div className="text-base font-semibold text-slate-900">Premium features stay locked in free mode</div>
            <p className="mt-2">
              You can still review progress, remaining requirements, and eligible courses for free. Unlock premium to
              generate a semester-by-semester schedule.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
