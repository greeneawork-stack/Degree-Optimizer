import type { AppState, Catalog } from "@/lib/types";

const school = {
  id: "csus",
  name: "California State University, Sacramento",
};

const major = {
  id: "political-science",
  name: "Political Science",
};

export const catalog: Catalog = {
  school,
  major,
  geRequirements: [
    {
      id: "ge-foundations",
      title: "GE Foundations",
      requirements: [
        {
          id: "A1",
          label: "A1 Oral Communication",
          description: "Complete a course focused on public speaking and presentations.",
          kind: "GE",
        },
        {
          id: "A2",
          label: "A2 Written Communication",
          description: "Complete lower-division college writing.",
          kind: "GE",
        },
        {
          id: "A3",
          label: "A3 Critical Thinking",
          description: "Complete a course centered on argument analysis and logic.",
          kind: "GE",
        },
      ],
    },
    {
      id: "ge-science-math",
      title: "GE Science and Math",
      requirements: [
        {
          id: "B1",
          label: "B1 Physical Science",
          description: "Choose a physical science course with Sacramento State GE credit.",
          kind: "GE",
        },
        {
          id: "B2",
          label: "B2 Life Science",
          description: "Choose a life science course with Sacramento State GE credit.",
          kind: "GE",
        },
        {
          id: "B4",
          label: "B4 Mathematics / Quantitative Reasoning",
          description: "Complete a statistics or quantitative reasoning requirement.",
          kind: "GE",
        },
      ],
    },
    {
      id: "ge-arts-humanities",
      title: "GE Arts and Humanities",
      requirements: [
        {
          id: "C1",
          label: "C1 Arts",
          description: "Complete an arts appreciation or performance course.",
          kind: "GE",
        },
        {
          id: "C2",
          label: "C2 Humanities",
          description: "Complete a humanities course covering ideas, values, or culture.",
          kind: "GE",
        },
      ],
    },
    {
      id: "ge-lifelong-learning",
      title: "GE Society and Lifelong Learning",
      requirements: [
        {
          id: "D",
          label: "D Social Sciences",
          description: "Complete a social sciences requirement.",
          kind: "GE",
        },
        {
          id: "E",
          label: "E Lifelong Learning",
          description: "Complete a lifelong learning and self-development requirement.",
          kind: "GE",
        },
      ],
    },
  ],
  majorRequirements: [
    {
      id: "major-core",
      title: "Political Science Core",
      requirements: [
        {
          id: "POLS-1",
          label: "POLS 1 Introduction to Government",
          description: "Gateway course into American government and political systems.",
          kind: "Major",
        },
        {
          id: "POLS-150",
          label: "POLS 150 Scope and Methods",
          description: "Research design and methods for political science majors.",
          kind: "Major",
        },
        {
          id: "POLS-171",
          label: "POLS 171 Public Law",
          description: "Upper-division public law requirement.",
          kind: "Major",
        },
        {
          id: "POLS-173",
          label: "POLS 173 California Government and Politics",
          description: "State and local government institutions and policy.",
          kind: "Major",
        },
      ],
    },
    {
      id: "major-capstone",
      title: "Political Science Capstone and Electives",
      requirements: [
        {
          id: "POLS-180",
          label: "POLS 180 Senior Seminar",
          description: "Capstone seminar near graduation.",
          kind: "Major",
        },
        {
          id: "POLS-ELECTIVE",
          label: "Political Science Elective",
          description: "One upper-division elective chosen from the major list.",
          kind: "Major",
        },
      ],
    },
  ],
  courses: [
    {
      code: "COMS 4",
      title: "Public Speaking",
      units: 3,
      satisfiesGe: ["A1"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "ENGL 5",
      title: "Academic Writing",
      units: 3,
      satisfiesGe: ["A2"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "PHIL 4",
      title: "Critical Thinking",
      units: 3,
      satisfiesGe: ["A3"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "ASTR 6",
      title: "Introduction to Astronomy",
      units: 3,
      satisfiesGe: ["B1"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "BIO 10",
      title: "Contemporary Biology",
      units: 3,
      satisfiesGe: ["B2"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "STAT 1",
      title: "Introduction to Statistics",
      units: 3,
      satisfiesGe: ["B4"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "ART 1",
      title: "Art Appreciation",
      units: 3,
      satisfiesGe: ["C1"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "HRS 70",
      title: "Introduction to Humanities",
      units: 3,
      satisfiesGe: ["C2"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "PSYC 8",
      title: "Life Span Development",
      units: 3,
      satisfiesGe: ["E"],
      satisfiesMajorRequirementIds: [],
    },
    {
      code: "POLS 1",
      title: "Introduction to Government",
      units: 3,
      satisfiesGe: ["D"],
      satisfiesMajorRequirementIds: ["POLS-1"],
      satisfiesMajorCategory: "Core",
    },
    {
      code: "POLS 136",
      title: "International Relations",
      units: 3,
      satisfiesGe: ["D"],
      satisfiesMajorRequirementIds: ["POLS-ELECTIVE"],
      satisfiesMajorCategory: "Elective",
    },
    {
      code: "POLS 145",
      title: "Public Policy",
      units: 3,
      satisfiesGe: [],
      satisfiesMajorRequirementIds: ["POLS-ELECTIVE"],
      satisfiesMajorCategory: "Elective",
    },
    {
      code: "POLS 150",
      title: "Scope and Methods in Political Science",
      units: 3,
      satisfiesGe: [],
      satisfiesMajorRequirementIds: ["POLS-150"],
      satisfiesMajorCategory: "Core",
    },
    {
      code: "POLS 171",
      title: "Public Law",
      units: 3,
      satisfiesGe: [],
      satisfiesMajorRequirementIds: ["POLS-171"],
      satisfiesMajorCategory: "Core",
    },
    {
      code: "POLS 173",
      title: "California Government and Politics",
      units: 3,
      satisfiesGe: ["D"],
      satisfiesMajorRequirementIds: ["POLS-173"],
      satisfiesMajorCategory: "Core",
    },
    {
      code: "POLS 180",
      title: "Senior Seminar in Political Science",
      units: 3,
      satisfiesGe: [],
      satisfiesMajorRequirementIds: ["POLS-180"],
      satisfiesMajorCategory: "Capstone",
    },
  ],
  autoFillCompletedRequirementIds: ["A1", "A2", "B4", "C1", "POLS-1"],
};

export const defaultAppState: AppState = {
  schoolId: school.id,
  schoolName: school.name,
  majorId: major.id,
  majorName: major.name,
  completedRequirementIds: [],
  unlockedOptimizedPlan: false,
  usedAutoFill: false,
};
