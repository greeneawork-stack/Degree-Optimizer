import { NextResponse } from "next/server";

import type { PetitionFormValues } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as PetitionFormValues;

  const emailDraft = `Subject: Request for Support on Accelerated Graduation Plan

Dear Academic Advisor,

I hope you are doing well. My name is [Student Name], and I am a Political Science student at Sacramento State. I am writing to ask for guidance on an accelerated path to graduation.

I currently have a GPA of ${body.gpa || "current standing"} and work approximately ${body.workHours || "0"} hours each week. My goal is to graduate ${body.graduationGoal || "as efficiently as possible"}, and I want to make sure my plan is realistic and aligned with university policy.

Could we review whether there are course sequencing options, overlap opportunities, or petition pathways that could help me complete my remaining degree requirements sooner? I would especially appreciate advice on unit limits, scheduling strategy, and any formal petitions that may support this timeline.

Thank you for your time and support. I would be grateful for the opportunity to discuss recommended next steps.

Sincerely,
[Student Name]`;

  return NextResponse.json({ emailDraft });
}
