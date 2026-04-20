import { redirect } from "next/navigation";

import { catalog, defaultAppState } from "@/data/catalog";
import { readAppState, writeAppState } from "@/lib/storage";

export default function OnboardingPage() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const schoolName = String(formData.get("schoolName") ?? catalog.school.name);
    const degreePathId = String(formData.get("degreePathId") ?? defaultAppState.degreePathId);
    const minorId = String(formData.get("minorId") ?? "none");
    const selectedDegreePath =
      catalog.degreePaths.find((path) => path.id === degreePathId) ?? catalog.degreePaths[0];
    const selectedMinor = catalog.minors.find((minor) => minor.id === minorId);

    const currentState = await readAppState();
    await writeAppState({
      ...currentState,
      schoolId: catalog.school.id,
      schoolName,
      degreePathId: selectedDegreePath.id,
      degreePathName: selectedDegreePath.name,
      minorId: selectedMinor?.id ?? "none",
      minorName: selectedMinor?.name ?? "None",
      unlockedOptimizedPlan: false,
    });
    redirect("/progress");
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-600">Onboarding</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Set up your degree plan</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Start with Sacramento State, choose your Political Science track, and optionally add the minor so
          the planner can load the right academic structure.
        </p>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="schoolName" className="text-sm font-medium text-slate-700">
              School
            </label>
            <input
              id="schoolName"
              name="schoolName"
              defaultValue={catalog.school.name}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="degreePathId" className="text-sm font-medium text-slate-700">
              Step 1: Select Major
            </label>
            <select
              id="degreePathId"
              name="degreePathId"
              defaultValue={defaultAppState.degreePathId}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              {catalog.degreePaths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="minorId" className="text-sm font-medium text-slate-700">
              Step 2: Optional Minor
            </label>
            <select
              id="minorId"
              name="minorId"
              defaultValue="none"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="none">None</option>
              {catalog.minors.map((minor) => (
                <option key={minor.id} value={minor.id}>
                  {minor.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:bg-sky-400"
          >
            Continue
          </button>
        </form>
      </div>
    </section>
  );
}
