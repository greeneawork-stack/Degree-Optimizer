import PetitionAssistant from "@/components/petition-assistant";
import UnlockOptimizer from "@/components/unlock-optimizer";
import { buildOptimization } from "@/lib/planner";
import { readAppState } from "@/lib/storage";
import type { RequirementItem, SemesterPlan } from "@/lib/types";

function ProgressSummary({
  completion,
  remainingSemesters,
}: {
  completion: number;
  remainingSemesters: number;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
        <p className="mt-4 text-4xl font-semibold text-slate-950">{completion}%</p>
        <p className="mt-2 text-sm text-slate-600">Completed toward your Sacramento State Political Science degree.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Estimated remaining</p>
        <p className="mt-4 text-4xl font-semibold text-slate-950">{remainingSemesters}</p>
        <p className="mt-2 text-sm text-slate-600">Semesters left at a balanced course load.</p>
      </div>
    </section>
  );
}

function RequirementColumns({
  remainingMajor,
  remainingGe,
}: {
  remainingMajor: RequirementItem[];
  remainingGe: RequirementItem[];
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Required classes: Major</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {remainingMajor.map((requirement) => (
            <li key={requirement.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="font-medium text-slate-900">{requirement.label}</div>
              <div className="mt-1 text-xs text-slate-500">{requirement.description}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Required classes: General Education</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {remainingGe.map((requirement) => (
            <li key={requirement.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="font-medium text-slate-900">{requirement.label}</div>
              <div className="mt-1 text-xs text-slate-500">{requirement.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ScheduleCard({
  title,
  description,
  schedule,
}: {
  title: string;
  description: string;
  schedule: SemesterPlan[];
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schedule.map((semester) => (
          <article key={semester.term} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{semester.term}</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                {semester.totalUnits} units
              </span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {semester.courses.map((course) => (
                <li key={course.code} className="rounded-2xl border border-white bg-white/90 px-3 py-3">
                  <div className="font-medium text-slate-900">
                    {course.code}: {course.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {course.units} units{course.satisfiesMajorCategory ? ` • ${course.satisfiesMajorCategory}` : ""}
                    {course.satisfiesGe.length > 0 ? ` • GE ${course.satisfiesGe.join(", ")}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const state = await readAppState();
  const optimization = buildOptimization(state);
  const completion = optimization.completion;
  const basicPlan = optimization.basicSchedule;
  const optimizedPlan = optimization.optimizedSchedule;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-500 to-cyan-500 px-8 py-10 text-white shadow-lg shadow-emerald-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50/90">Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Your Degree Optimizer snapshot</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
          See what is left, map it semester by semester, and preview how an overlap-aware plan could help you finish
          sooner.
        </p>
      </section>

      <ProgressSummary
        completion={completion.percentComplete}
        remainingSemesters={completion.estimatedSemestersRemaining}
      />

      <RequirementColumns
        remainingMajor={completion.remainingMajor}
        remainingGe={completion.remainingGe}
      />

      <ScheduleCard
        title="Basic Plan"
        description="A straightforward semester-by-semester path based on the remaining requirements."
        schedule={basicPlan}
      />

      <UnlockOptimizer
        optimizedSchedule={optimizedPlan}
        fasterBySemesters={optimization.fasterBySemesters}
        initiallyUnlocked={state.unlockedOptimizedPlan}
      />

      <PetitionAssistant defaultGraduationGoal="by Spring 2028" />
    </div>
  );
}
