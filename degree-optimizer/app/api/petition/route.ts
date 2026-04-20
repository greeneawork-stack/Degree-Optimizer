import { NextResponse } from "next/server";

import type { PetitionFormValues } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as PetitionFormValues;

  const minorLine =
    body.minorName && body.minorName !== "None"
      ? ` I am also planning to complete the ${body.minorName}.`
      : "";

  const emailDraft = `Subject: Request for Support on Accelerated Graduation Plan

Dear Academic Advisor,

I hope you are doing well. My name is [Student Name], and I am currently pursuing the ${body.degreePathName} at Sacramento State.${minorLine} I am writing to ask for guidance on an accelerated path to graduation.

I currently have a GPA of ${body.gpa || "current standing"} and work approximately ${body.workHours || "0"} hours each week. My goal is to graduate ${body.graduationGoal || "as efficiently as possible"}, and I want to make sure my academic plan is realistic and aligned with university policy.

I am especially trying to balance major requirements, Sacramento State graduation requirements, and any high-value overlap courses that may help me complete the degree more efficiently. Could we review whether there are course sequencing options, unit-load considerations, or petition pathways that could support this timeline?

Thank you for your time and support. I would be grateful for the opportunity to discuss recommended next steps.

Sincerely,
[Student Name]`;

  return NextResponse.json({ emailDraft });
}
