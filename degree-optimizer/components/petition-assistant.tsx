"use client";

import { useState } from "react";

import { generatePetitionDraft } from "@/lib/actions";

type PetitionAssistantProps = {
  defaultGraduationGoal: string;
  degreeLabel: string;
  minorLabel: string;
};

export default function PetitionAssistant({
  defaultGraduationGoal,
  degreeLabel,
  minorLabel,
}: PetitionAssistantProps) {
  const [gpa, setGpa] = useState("3.4");
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState("20");
  const [workType, setWorkType] = useState("Part-time job");
  const [targetGraduationTerm, setTargetGraduationTerm] = useState(defaultGraduationGoal);
  const [petitionReason, setPetitionReason] = useState("graduate early");
  const [additionalContext, setAdditionalContext] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await generatePetitionDraft({
        gpa,
        workHoursPerWeek,
        workType,
        targetGraduationTerm,
        petitionReason,
        additionalContext,
        degreePathName: degreeLabel,
        minorName: minorLabel,
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
          graduation plan for your {degreeLabel} pathway.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-slate-700">
          GPA
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
            value={gpa}
            onChange={(event) => setGpa(event.target.value)}
            placeholder="3.4"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Work hours per week (job/work commitments)
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
            value={workHoursPerWeek}
            onChange={(event) => setWorkHoursPerWeek(event.target.value)}
            placeholder="20"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Type of work
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
            value={workType}
            onChange={(event) => setWorkType(event.target.value)}
            placeholder="Part-time job, internship, family responsibility"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Target graduation term/year
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
            value={targetGraduationTerm}
            onChange={(event) => setTargetGraduationTerm(event.target.value)}
            placeholder="Spring 2028"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700 md:col-span-3">
          Reason for petition
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
            value={petitionReason}
            onChange={(event) => setPetitionReason(event.target.value)}
          >
            <option value="overload units">Overload units</option>
            <option value="graduate early">Graduate early</option>
            <option value="scheduling conflict">Scheduling conflict</option>
            <option value="academic acceleration">Academic acceleration</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-700 md:col-span-3">
          Additional context
          <textarea
            className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
            value={additionalContext}
            onChange={(event) => setAdditionalContext(event.target.value)}
            placeholder="Add any other context you want included, such as family responsibilities, course availability issues, or academic goals."
          />
        </label>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:bg-sky-400"
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
