import { redirect } from "next/navigation";

import { catalog } from "@/data/catalog";
import { readAppState, writeAppState } from "@/lib/storage";

export default function OnboardingPage() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const schoolName = String(formData.get("schoolName") ?? catalog.school.name);
    const majorName = String(formData.get("majorName") ?? catalog.major.name);

    const currentState = await readAppState();
    await writeAppState({
      ...currentState,
      schoolId: catalog.school.id,
      schoolName,
      majorId: catalog.major.id,
      majorName,
    });
    redirect("/progress");
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-600">Onboarding</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Set up your degree plan</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Start with Sacramento State and choose your major so we can tailor the planner to your degree path.
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="majorName" className="text-sm font-medium text-slate-700">
              Major
            </label>
            <select
              id="majorName"
              name="majorName"
              defaultValue={catalog.major.name}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            >
              <option value={catalog.major.name}>{catalog.major.name}</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue
          </button>
        </form>
      </div>
    </section>
  );
}
