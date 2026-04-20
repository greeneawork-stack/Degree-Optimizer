import { NextResponse } from "next/server";

import type { PetitionFormValues } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as PetitionFormValues;

  const gpa = body.gpa?.trim() || "my current GPA";
  const workHours = body.workHoursPerWeek?.trim() || "0";
  const workType = body.workType?.trim() || "ongoing work commitments";
  const targetTerm = body.targetGraduationTerm?.trim() || "my intended graduation term";
  const petitionReason = body.petitionReason?.trim() || "academic acceleration";
  const minorLine =
    body.minorName && body.minorName !== "None"
      ? ` I am also planning to complete the ${body.minorName}.`
      : "";

  const requestLine =
    petitionReason === "overload units"
      ? "I would like to request guidance and support for an increased unit load."
      : petitionReason === "scheduling conflict"
        ? "I would like to request support in resolving a scheduling issue that affects my path to graduation."
        : petitionReason === "graduate early"
          ? "I would like to request support for an accelerated graduation plan."
          : "I would like to request support for a more efficient degree-completion plan.";

  const emailDraft = `Subject: Request for Academic Planning Support for ${targetTerm}

Dear Academic Advisor,

I hope you are doing well. My name is [Student Name], and I am currently pursuing the ${body.degreePathName} at Sacramento State.${minorLine} ${requestLine}

At this time, I have a GPA of ${gpa} and I am balancing approximately ${workHours} work hours per week through ${workType}. My target graduation term is ${targetTerm}, so I am trying to build a plan that is both academically realistic and aligned with university policy.

I am reaching out because I would appreciate your guidance on the best way to move forward given my remaining requirements and current obligations. In particular, I am hoping to understand whether there are course sequencing strategies, unit-load options, or petition pathways that would make this request reasonable. If appropriate, I would also appreciate advice on how to prioritize required courses, overlap opportunities, and any Sacramento State graduation requirements that could affect this timeline.

Thank you very much for your time and support. I would be grateful for the opportunity to discuss next steps and any recommendations you may have.

Sincerely,
[Student Name]`;

  return NextResponse.json({ emailDraft });
}
