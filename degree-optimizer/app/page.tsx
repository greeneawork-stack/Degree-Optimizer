import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
          California State University, Sacramento
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Plan smarter. Graduate faster.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Degree Optimizer helps Sacramento State students compare Political Science degree paths, add an
            optional minor, map real graduation requirements, and preview an overlap-aware path to finish
            sooner.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Get Started
          </Link>
          <p className="text-sm text-slate-500">No login required. Mock data and planner included.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">What the MVP includes</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Ready now
            </span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-4">
              Track GE, university graduation requirements, degree-path milestones, and an optional Political
              Science minor with a manual checklist or simulated auto-fill.
            </li>
            <li className="rounded-2xl bg-slate-50 p-4">
              See completion percentage, Sacramento State unit-rule progress, estimated semesters remaining, and
              a semester-by-semester basic plan.
            </li>
            <li className="rounded-2xl bg-slate-50 p-4">
              Unlock an optimized plan that prioritizes major requirements, overlap courses, upper-division
              progress, and balanced semesters.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
