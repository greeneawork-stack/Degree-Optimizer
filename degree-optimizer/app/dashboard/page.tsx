import PetitionAssistant from "@/components/petition-assistant";
import UnlockOptimizer from "@/components/unlock-optimizer";
import { buildOptimization } from "@/lib/planner";
import { readAppState } from "@/lib/storage";
import type { GraduationRequirementStatus, RequirementItem, SemesterPlan } from "@/lib/types";

function ProgressSummary({
  completion,
  remainingSemesters,
  selectedDegreePathName,
  selectedMinorName,
  degreeUnitsCompleted,
  degreeUnitsRequired,
  minorUnitsCompleted,
  minorUnitsRequired,
}: {
  completion: number;
  remainingSemesters: number;
  selectedDegreePathName: string;
  selectedMinorName: string;
  degreeUnitsCompleted: number;
  degreeUnitsRequired: number;
  minorUnitsCompleted: number;
  minorUnitsRequired: number;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
        <p className="mt-4 text-4xl font-semibold text-slate-950">{completion}%</p>
        <p className="mt-2 text-sm text-slate-600">
          Completed toward your {selectedDegreePathName}
          {selectedMinorName !== "None" ? ` with ${selectedMinorName}` : ""}.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Estimated remaining</p>
        <p className="mt-4 text-4xl font-semibold text-slate-950">{remainingSemesters}</p>
        <p className="mt-2 text-sm text-slate-600">Semesters left at a balanced course load.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Degree units</p>
        <p className="mt-4 text-2xl font-semibold text-slate-950">
          {degreeUnitsCompleted} / {degreeUnitsRequired}
        </p>
        <p className="mt-2 text-sm text-slate-600">Units completed toward the selected major path.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Minor units</p>
        <p className="mt-4 text-2xl font-semibold text-slate-950">
          {minorUnitsRequired === 0 ? "None" : `${minorUnitsCompleted} / ${minorUnitsRequired}`}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {minorUnitsRequired === 0 ? "No optional minor selected." : `Active minor: ${selectedMinorName}`}
        </p>
      </div>
    </section>
  );
}

function RequirementList({
  title,
  requirements,
}: {
  title: string;
  requirements: RequirementItem[];
}) {
  const safeRequirements = Array.isArray(requirements) ? requirements : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {safeRequirements.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No remaining items in this section.</p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {safeRequirements.map((requirement) => (
            <li key={requirement.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="font-medium text-slate-900">{requirement.label}</div>
              <div className="mt-1 text-xs text-slate-500">{requirement.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GraduationRulesCard({ statuses }: { statuses: GraduationRequirementStatus[] }) {
  const safeStatuses = Array.isArray(statuses) ? statuses : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-950">Global graduation rules</h2>
        <p className="text-sm text-slate-600">
          Sacramento State unit milestones are tracked alongside your program requirements.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {safeStatuses.map((status) => {
          const complete = status.remaining === 0;
          return (
            <article
              key={status.id}
              className={`rounded-2xl border p-4 ${
                complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">{status.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {status.completed} / {status.required}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {complete ? "Requirement complete" : `${status.remaining} units remaining`}
              </p>
            </article>
          );
        })}
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
  const safeSchedule = Array.isArray(schedule) ? schedule : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {safeSchedule.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          No semester data available.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safeSchedule.map((semester) => (
            <article key={semester.term} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{semester.term}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                  {semester.totalUnits} units
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{semester.summary}</p>
              <div className="mt-1 text-xs text-slate-500">Difficulty score: {semester.difficultyScore}</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {semester.courses.map((course) => (
                  <li key={course.code} className="rounded-2xl border border-white bg-white/90 px-3 py-3">
                    <div className="font-medium text-slate-900">
                      {course.code}: {course.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {course.units} units • {course.level === "upper" ? "Upper division" : "Lower division"} • Score{" "}
                      {course.score.total}
                    </div>
                    {course.coveredRequirementLabels.length > 0 ? (
                      <div className="mt-2 text-xs text-slate-500">
                        Covers: {course.coveredRequirementLabels.join(", ")}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
                Projected totals: {semester.projectedTotalUnits} total units • {semester.projectedUpperDivisionUnits}{" "}
                upper division • {semester.projectedSacStateUnits} Sac State
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const state = await readAppState();
  const optimization = buildOptimization(state);
  const completion = optimization.completion;
  const isPremium = state.mode === "premium";

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-500 to-cyan-500 px-8 py-10 text-white shadow-lg shadow-emerald-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50/90">Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Your Degree Optimizer snapshot</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/90 sm:text-base">
          Review your remaining GE, university, major, and minor requirements. Upgrade to the optimized planning view
          to unlock semester-by-semester scheduling and unit-balancing logic.
        </p>
      </section>

      <ProgressSummary
        completion={completion.percentComplete}
        remainingSemesters={completion.estimatedSemestersRemaining}
        selectedDegreePathName={completion.selectedDegreePathName}
        selectedMinorName={completion.selectedMinorName}
        degreeUnitsCompleted={completion.degreeUnitsCompleted}
        degreeUnitsRequired={completion.degreeUnitsRequired}
        minorUnitsCompleted={completion.minorUnitsCompleted}
        minorUnitsRequired={completion.minorUnitsRequired}
      />

      <GraduationRulesCard statuses={completion.graduationRequirements} />

      <section className="grid gap-6 xl:grid-cols-2">
        <RequirementList title="Remaining major requirements" requirements={completion.remainingMajor} />
        <RequirementList title="Remaining minor requirements" requirements={completion.remainingMinor} />
        <RequirementList title="Remaining GE requirements" requirements={completion.remainingGe} />
        <RequirementList title="Remaining university requirements" requirements={completion.remainingUniversity} />
      </section>

      {isPremium ? (
        <>
          <ScheduleCard
            title="Optimized Schedule"
            description="Semester-by-semester planning is available in premium mode and balances core requirements, overlaps, and unit pacing."
            schedule={optimization.optimizedSchedule}
          />

          <PetitionAssistant
            defaultGraduationGoal="as early as possible while meeting Sacramento State graduation rules"
            degreeLabel={completion.selectedDegreePathName}
            minorLabel={completion.selectedMinorName}
          />
        </>
      ) : (
        <UnlockOptimizer
          fasterBySemesters={optimization.fasterBySemesters}
          preferredMaxUnitsPerTerm={state.preferredMaxUnitsPerTerm}
          preferFewerDaysOnCampus={state.preferFewerDaysOnCampus}
          isPremium={false}
        />
      )}
    </div>
  );
}
