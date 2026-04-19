"use client";

import { useState } from "react";

import { generatePetitionDraft } from "@/lib/actions";

type PetitionAssistantProps = {
  defaultGraduationGoal: string;
};

export default function PetitionAssistant({ defaultGraduationGoal }: PetitionAssistantProps) {
  const [gpa, setGpa] = useState("3.4");
  const [workHours, setWorkHours] = useState("20");
  const [graduationGoal, setGraduationGoal] = useState(defaultGraduationGoal);
  const [emailDraft, setEmailDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await generatePetitionDraft({
        gpa,
        workHours,
        graduationGoal,
      });
      setEmailDraft(result.emailDraft);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Petition Assistant
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Generate a professional advisor email
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Draft an email asking for course sequencing advice, a unit exception, or support for an accelerated
          graduation plan.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-slate-700">
          GPA
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-indigo-400"
            value={gpa}
            onChange={(event) => setGpa(event.target.value)}
            placeholder="3.4"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Work hours per week
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-indigo-400"
            value={workHours}
            onChange={(event) => setWorkHours(event.target.value)}
            placeholder="20"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Graduation goal
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-indigo-400"
            value={graduationGoal}
            onChange={(event) => setGraduationGoal(event.target.value)}
            placeholder="Graduate by Spring 2028"
          />
        </label>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {isLoading ? "Generating..." : "Generate email draft"}
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">Draft output</p>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
          {emailDraft || "Your draft email will appear here after you submit the form."}
        </pre>
      </div>
    </section>
  );
}
