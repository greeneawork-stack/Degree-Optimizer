export type RequirementKind = "GE" | "Major";

export type RequirementItem = {
  id: string;
  label: string;
  description: string;
  kind: RequirementKind;
};

export type RequirementGroup = {
  id: string;
  title: string;
  requirements: RequirementItem[];
};

export type Course = {
  code: string;
  title: string;
  units: number;
  satisfiesGe: string[];
  satisfiesMajorRequirementIds: string[];
  satisfiesMajorCategory?: string;
};

export type School = {
  id: string;
  name: string;
};

export type Major = {
  id: string;
  name: string;
};

export type Catalog = {
  school: School;
  major: Major;
  geRequirements: RequirementGroup[];
  majorRequirements: RequirementGroup[];
  courses: Course[];
  autoFillCompletedRequirementIds: string[];
};

export type AppState = {
  schoolId: string;
  schoolName: string;
  majorId: string;
  majorName: string;
  completedRequirementIds: string[];
  unlockedOptimizedPlan: boolean;
  usedAutoFill: boolean;
};

export type CourseScore = {
  majorPoints: number;
  gePoints: number;
  overlapBonus: number;
  total: number;
};

export type ScoredCourse = Course & {
  score: CourseScore;
  coveredRequirementIds: string[];
};

export type SemesterPlan = {
  term: string;
  totalUnits: number;
  courses: ScoredCourse[];
};

export type CompletionSummary = {
  percentComplete: number;
  estimatedSemestersRemaining: number;
  remainingMajor: RequirementItem[];
  remainingGe: RequirementItem[];
};

export type OptimizationResult = {
  completion: CompletionSummary;
  basicSchedule: SemesterPlan[];
  optimizedSchedule: SemesterPlan[];
  fasterBySemesters: number;
};

export type PetitionFormValues = {
  gpa: string;
  workHours: string;
  graduationGoal: string;
};
