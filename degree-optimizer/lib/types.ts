export type RequirementKind = "GE" | "Major" | "Minor" | "University";
export type RequirementPriority = "required" | "elective";
export type CourseLevel = "lower" | "upper";
export type GlobalRuleMetric =
  | "totalUnits"
  | "upperDivisionUnits"
  | "sacStateUnits"
  | "sacStateUpperDivisionUnits";

export type RequirementItem = {
  id: string;
  label: string;
  description: string;
  kind: RequirementKind;
  priority?: RequirementPriority;
  units?: number;
};

export type ProgramRequirementGroup = {
  id: string;
  title: string;
  description?: string;
  requirements: RequirementItem[];
};

export type School = {
  id: string;
  name: string;
};

export type DegreePath = {
  id: string;
  name: string;
  shortName: string;
  totalUnits: number;
  lowerDivisionUnits?: number;
  upperDivisionUnits?: number;
  requirementGroups: ProgramRequirementGroup[];
  notes: string[];
};

export type DegreeMinor = {
  id: string;
  name: string;
  totalUnits: number;
  requirementGroups: ProgramRequirementGroup[];
  notes: string[];
};

export type GraduationRules = {
  minimumTotalUnits: number;
  minimumUpperDivisionUnits: number;
  minimumSacStateUnits: number;
  minimumSacStateUpperDivisionUnits: number;
  recommendedUnitsPerTerm: number;
  maxUnitsPerTerm: number;
};

export type GlobalRule = {
  id: string;
  label: string;
  metric: GlobalRuleMetric;
  minimum: number;
};

export type Course = {
  code: string;
  title: string;
  units: number;
  level: CourseLevel;
  department: string;
  difficulty?: 1 | 2 | 3;
  categories?: string[];
  tags?: string[];
  satisfiesRequirementIds: string[];
  note?: string;
};

export type Catalog = {
  school: School;
  degreePaths: DegreePath[];
  minors: DegreeMinor[];
  geRequirements: ProgramRequirementGroup[];
  universityRequirements: ProgramRequirementGroup[];
  graduationRules: GraduationRules;
  globalRules: GlobalRule[];
  courses: Course[];
  autoFillCompletedRequirementIdsByDegree: Record<string, string[]>;
  autoFillMinorRequirementIdsByMinor: Record<string, string[]>;
};

export type AppState = {
  schoolId: string;
  schoolName: string;
  degreePathId: string;
  degreePathName: string;
  minorId: string;
  minorName: string;
  mode: "free" | "premium";
  completedRequirementIds: string[];
  unlockedOptimizedPlan: boolean;
  usedAutoFill: boolean;
  preferredMaxUnitsPerTerm: number;
  preferFewerDaysOnCampus: boolean;
  completedUnits: number;
  completedUpperDivisionUnits: number;
  completedSacStateUnits: number;
  completedSacStateUpperDivisionUnits: number;
};

export type CourseScore = {
  majorPoints: number;
  gePoints: number;
  overlapBonus: number;
  upperDivisionPriority: number;
  electivePoints: number;
  total: number;
  coversRequiredMajor: boolean;
  coversMinor: boolean;
  coversUniversity: boolean;
  coveredCount: number;
};

export type ScoredCourse = Course & {
  score: CourseScore;
  coveredRequirementIds: string[];
  coveredRequirementLabels: string[];
};

export type SemesterPlan = {
  term: string;
  totalUnits: number;
  courses: ScoredCourse[];
  summary: string;
  difficultyScore: number;
  projectedTotalUnits: number;
  projectedUpperDivisionUnits: number;
  projectedSacStateUnits: number;
  projectedSacStateUpperDivisionUnits: number;
};

export type GraduationRequirementStatus = {
  id: string;
  label: string;
  completed: number;
  required: number;
  remaining: number;
};

export type CompletionSummary = {
  percentComplete: number;
  estimatedSemestersRemaining: number;
  remainingMajor: RequirementItem[];
  remainingMinor: RequirementItem[];
  remainingGe: RequirementItem[];
  remainingUniversity: RequirementItem[];
  selectedDegreePathName: string;
  selectedMinorName: string;
  degreeUnitsCompleted: number;
  degreeUnitsRequired: number;
  minorUnitsCompleted: number;
  minorUnitsRequired: number;
  graduationRequirements: GraduationRequirementStatus[];
};

export type OptimizationResult = {
  completion: CompletionSummary;
  basicSchedule: SemesterPlan[];
  optimizedSchedule: SemesterPlan[];
  fasterBySemesters: number;
  activeDegreePathName: string;
  activeMinorName: string;
  globalRules: GlobalRule[];
  plannerStatus: "idle" | "locked" | "ready" | "partial";
};

export type PlannerResult = {
  completion: CompletionSummary;
  activeDegreePathName: string;
  activeMinorName: string;
  globalRules: GlobalRule[];
  fasterBySemesters: number;
  basicSchedule: SemesterPlan[];
  optimizedSchedule: SemesterPlan[];
  scheduleGenerated: boolean;
  plannerWarnings: string[];
};

export type PetitionFormValues = {
  gpa: string;
  workHours: string;
  graduationGoal: string;
  degreePathName: string;
  minorName: string;
};
