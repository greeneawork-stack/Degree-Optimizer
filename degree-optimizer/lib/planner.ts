import { catalog, defaultAppState, getSelectedDegreePath, getSelectedMinor } from "@/data/catalog";
import type {
  AppState,
  CompletionSummary,
  Course,
  CourseScore,
  ElectiveSection,
  GraduationRequirementStatus,
  OptimizationResult,
  PlannerResult,
  ProgramRequirementGroup,
  RequirementItem,
  ScoredCourse,
  SemesterPlan,
} from "@/lib/types";

const DEFAULT_BASIC_UNITS = 15;
const DEFAULT_OPTIMIZED_UNITS = 18;
const MAX_MAJOR_CORE_PER_TERM = 2;
const MAX_SEMESTERS = 12;
const DEFAULT_VISIBLE_ELECTIVES = 8;

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function clampUnits(units: number) {
  return Math.min(Math.max(units || 1, 1), catalog.graduationRules.maxUnitsPerTerm);
}

function flattenGroups(groups: ProgramRequirementGroup[] | undefined) {
  return safeArray(groups).flatMap((group) => safeArray(group?.requirements));
}

function getRemainingRequirements(groups: ProgramRequirementGroup[] | undefined, completedIds: string[]) {
  const completed = new Set(safeArray(completedIds));
  return flattenGroups(groups).filter((requirement) => !completed.has(requirement.id));
}

function buildRequirementLookup(groups: ProgramRequirementGroup[] | undefined) {
  return new Map(flattenGroups(groups).map((requirement) => [requirement.id, requirement]));
}

function getActiveRequirementGroups(state: AppState) {
  const degreePath = getSelectedDegreePath(state.degreePathId);
  const minor = getSelectedMinor(state.minorId);

  return {
    degreePath,
    minor,
    majorGroups: safeArray(degreePath?.requirementGroups),
    minorGroups: safeArray(minor?.requirementGroups),
    geGroups: safeArray(catalog.geRequirements),
    universityGroups: safeArray(catalog.universityRequirements),
  };
}

function countCompletedUnits(groups: ProgramRequirementGroup[] | undefined, completedIds: string[]) {
  const completed = new Set(safeArray(completedIds));
  return flattenGroups(groups)
    .filter((requirement) => completed.has(requirement.id))
    .reduce((sum, requirement) => sum + (requirement.units ?? 0), 0);
}

function buildGraduationStatuses(state: AppState): GraduationRequirementStatus[] {
  return [
    {
      id: "total-units",
      label: "120 total units required to graduate",
      explanation: "Complete at least 120 units across GE, major, minor, and electives.",
      completed: state.completedUnits ?? 0,
      required: catalog.graduationRules.minimumTotalUnits,
      remaining: Math.max(catalog.graduationRules.minimumTotalUnits - (state.completedUnits ?? 0), 0),
    },
    {
      id: "upper-division-units",
      label: "39 upper-division units required",
      explanation: "These are advanced 100-level or upper-division courses.",
      completed: state.completedUpperDivisionUnits ?? 0,
      required: catalog.graduationRules.minimumUpperDivisionUnits,
      remaining: Math.max(
        catalog.graduationRules.minimumUpperDivisionUnits - (state.completedUpperDivisionUnits ?? 0),
        0,
      ),
    },
    {
      id: "sac-state-units",
      label: "30 units must be completed at Sacramento State",
      explanation: "Residency requirement counting Sacramento State coursework.",
      completed: state.completedSacStateUnits ?? 0,
      required: catalog.graduationRules.minimumSacStateUnits,
      remaining: Math.max(catalog.graduationRules.minimumSacStateUnits - (state.completedSacStateUnits ?? 0), 0),
    },
    {
      id: "sac-state-upper-division-units",
      label: "24 upper-division Sacramento State units required",
      explanation: "Advanced residency units completed at Sacramento State.",
      completed: state.completedSacStateUpperDivisionUnits ?? 0,
      required: catalog.graduationRules.minimumSacStateUpperDivisionUnits,
      remaining: Math.max(
        catalog.graduationRules.minimumSacStateUpperDivisionUnits -
          (state.completedSacStateUpperDivisionUnits ?? 0),
        0,
      ),
    },
  ];
}

function getCourseDisplayTags(course: Course, score: CourseScore) {
  const tags = new Set<string>();

  if (score.coversRequiredMajor) {
    tags.add("Major");
  }
  if (score.coversUniversity || score.gePoints > 0) {
    tags.add("GE");
  }
  if (score.coversRequiredMajor && (score.coversUniversity || score.gePoints > 0)) {
    tags.add("Both");
  }

  if (safeArray(course.tags).includes("Outside Department")) {
    tags.add("External");
  }

  return Array.from(tags);
}

export function scoreCourse(
  course: Course,
  remainingRequirementIds: Set<string>,
  majorLookup: Map<string, RequirementItem>,
  minorLookup: Map<string, RequirementItem>,
  universityLookup: Map<string, RequirementItem>,
): CourseScore {
  const coveredRequirementIds = safeArray(course.satisfiesRequirementIds).filter((id) =>
    remainingRequirementIds.has(id),
  );
  const coversRequiredMajor = coveredRequirementIds.some((id) => majorLookup.has(id));
  const coversMinor = coveredRequirementIds.some((id) => minorLookup.has(id));
  const coversUniversity = coveredRequirementIds.some((id) => universityLookup.has(id));
  const coversGe = coveredRequirementIds.some(
    (id) => !majorLookup.has(id) && !minorLookup.has(id) && !universityLookup.has(id),
  );
  const overlapBonus = (coversRequiredMajor || coversMinor) && (coversGe || coversUniversity) ? 1 : 0;
  const upperDivisionPriority = course.level === "upper" ? 1 : 0;
  const electivePoints = safeArray(course.categories).includes("elective") ? 1 : 0;

  return {
    majorPoints: coversRequiredMajor || coversMinor ? 3 : 0,
    gePoints: coversGe || coversUniversity ? 2 : 0,
    overlapBonus,
    upperDivisionPriority,
    electivePoints,
    total:
      (coversRequiredMajor || coversMinor ? 3 : 0) +
      (coversGe || coversUniversity ? 2 : 0) +
      overlapBonus +
      upperDivisionPriority +
      electivePoints,
    coversRequiredMajor,
    coversMinor,
    coversUniversity,
    coveredCount: coveredRequirementIds.length,
  };
}

function buildScoredCourseList(state: AppState): ScoredCourse[] {
  const { majorGroups, minorGroups, geGroups, universityGroups } = getActiveRequirementGroups(state);
  const remainingMajor = getRemainingRequirements(majorGroups, state.completedRequirementIds);
  const remainingMinor = getRemainingRequirements(minorGroups, state.completedRequirementIds);
  const remainingGe = getRemainingRequirements(geGroups, state.completedRequirementIds);
  const remainingUniversity = getRemainingRequirements(universityGroups, state.completedRequirementIds);

  const remainingRequirementIds = new Set(
    [...remainingMajor, ...remainingMinor, ...remainingGe, ...remainingUniversity].map((item) => item.id),
  );

  const majorLookup = buildRequirementLookup(majorGroups);
  const minorLookup = buildRequirementLookup(minorGroups);
  const universityLookup = buildRequirementLookup(universityGroups);
  const geLookup = buildRequirementLookup(geGroups);
  const allRequirementLookup = new Map([...majorLookup, ...minorLookup, ...universityLookup, ...geLookup]);

  return safeArray(catalog.courses)
    .map((course) => {
      const coveredRequirementIds = safeArray(course.satisfiesRequirementIds).filter((id) =>
        remainingRequirementIds.has(id),
      );
      const score = scoreCourse(course, remainingRequirementIds, majorLookup, minorLookup, universityLookup);

      return {
        ...course,
        difficulty: course.difficulty ?? 2,
        categories: safeArray(course.categories),
        tags: safeArray(course.tags),
        score,
        coveredRequirementIds,
        coveredRequirementLabels: coveredRequirementIds
          .map((id) => allRequirementLookup.get(id)?.label)
          .filter((label): label is string => Boolean(label)),
      } satisfies ScoredCourse;
    })
    .filter((course) => course.score.total > 0)
    .sort((left, right) => {
      if (right.score.total !== left.score.total) {
        return right.score.total - left.score.total;
      }

      if (right.score.coveredCount !== left.score.coveredCount) {
        return right.score.coveredCount - left.score.coveredCount;
      }

      if (right.score.upperDivisionPriority !== left.score.upperDivisionPriority) {
        return right.score.upperDivisionPriority - left.score.upperDivisionPriority;
      }

      return left.code.localeCompare(right.code);
    });
}

function countMajorCoreCourses(courses: ScoredCourse[]) {
  return safeArray(courses).filter((course) => course.score.coversRequiredMajor).length;
}

function buildEmptyScheduleResult(): SemesterPlan[] {
  return [];
}

function buildSchedule(state: AppState, scoredCourses: ScoredCourse[], requestedMaxUnits: number): SemesterPlan[] {
  const remaining = [...safeArray(scoredCourses)];
  const semesters: SemesterPlan[] = [];
  let semesterIndex = 1;
  let runningTotalUnits = state.completedUnits ?? 0;
  let runningUpperDivisionUnits = state.completedUpperDivisionUnits ?? 0;
  let runningSacStateUnits = state.completedSacStateUnits ?? 0;
  let runningSacStateUpperDivisionUnits = state.completedSacStateUpperDivisionUnits ?? 0;
  const maxUnits = clampUnits(requestedMaxUnits);

  while (remaining.length > 0 && semesterIndex <= MAX_SEMESTERS) {
    let totalUnits = 0;
    let majorCoreCount = 0;
    let difficultyScore = 0;
    const picked: ScoredCourse[] = [];
    const startingLength = remaining.length;

    for (let index = 0; index < remaining.length; ) {
      const course = remaining[index];
      const wouldExceedUnits = totalUnits > 0 && totalUnits + course.units > maxUnits;
      const wouldOverloadCore = course.score.coversRequiredMajor && majorCoreCount >= MAX_MAJOR_CORE_PER_TERM;

      if (!wouldExceedUnits && !wouldOverloadCore) {
        picked.push(course);
        totalUnits += course.units;
        difficultyScore += course.difficulty ?? 2;
        if (course.score.coversRequiredMajor) {
          majorCoreCount += 1;
        }
        remaining.splice(index, 1);
      } else {
        index += 1;
      }
    }

    if (picked.length === 0 && remaining.length > 0) {
      const fallback = remaining.shift();
      if (fallback) {
        picked.push(fallback);
        totalUnits += fallback.units;
        difficultyScore += fallback.difficulty ?? 2;
        if (fallback.score.coversRequiredMajor) {
          majorCoreCount += 1;
        }
      }
    }

    if (picked.length === 0 || remaining.length === startingLength) {
      break;
    }

    const upperDivisionUnitsThisTerm = picked.reduce(
      (sum, course) => sum + (course.level === "upper" ? course.units : 0),
      0,
    );

    runningTotalUnits += totalUnits;
    runningUpperDivisionUnits += upperDivisionUnitsThisTerm;
    runningSacStateUnits += totalUnits;
    runningSacStateUpperDivisionUnits += upperDivisionUnitsThisTerm;

    semesters.push({
      term: `Semester ${semesterIndex}`,
      totalUnits,
      courses: picked,
      summary: `${majorCoreCount} core course${majorCoreCount === 1 ? "" : "s"} • ${upperDivisionUnitsThisTerm} upper-division units`,
      difficultyScore,
      projectedTotalUnits: runningTotalUnits,
      projectedUpperDivisionUnits: runningUpperDivisionUnits,
      projectedSacStateUnits: runningSacStateUnits,
      projectedSacStateUpperDivisionUnits: runningSacStateUpperDivisionUnits,
    });

    semesterIndex += 1;
  }

  return semesters;
}

function buildElectiveSections(scoredCourses: ScoredCourse[]): ElectiveSection[] {
  const electiveCourses = safeArray(scoredCourses).filter((course) =>
    course.coveredRequirementLabels.some((label) => /elective/i.test(label)),
  );

  const politicalScienceElectives = electiveCourses.filter((course) => course.department === "POLS");
  const externalElectives = electiveCourses.filter((course) => course.department !== "POLS");

  return [
    {
      id: "pols-electives",
      title: "Political Science Electives",
      description: "Recommended POLS electives that continue major or minor progress.",
      requiredUnitsLabel: "You need elective units in Political Science.",
      courses: politicalScienceElectives.slice(0, DEFAULT_VISIBLE_ELECTIVES).map((course) => ({
        code: course.code,
        title: course.title,
        units: course.units,
        tags: getCourseDisplayTags(course, course.score),
      })),
      totalCourseCount: politicalScienceElectives.length,
      hasMore: politicalScienceElectives.length > DEFAULT_VISIBLE_ELECTIVES,
    },
    {
      id: "external-electives",
      title: "Approved External Electives",
      description: "Approved outside-department options, especially useful for International Relations.",
      requiredUnitsLabel: "Use approved external electives when your track allows them.",
      courses: externalElectives.slice(0, DEFAULT_VISIBLE_ELECTIVES).map((course) => ({
        code: course.code,
        title: course.title,
        units: course.units,
        tags: getCourseDisplayTags(course, course.score),
      })),
      totalCourseCount: externalElectives.length,
      hasMore: externalElectives.length > DEFAULT_VISIBLE_ELECTIVES,
    },
  ].filter((section) => section.courses.length > 0 || section.totalCourseCount > 0);
}

export function estimateCompletion(state: AppState): CompletionSummary {
  const { degreePath, minor, majorGroups, minorGroups, geGroups, universityGroups } = getActiveRequirementGroups(state);
  const remainingMajor = getRemainingRequirements(majorGroups, state.completedRequirementIds);
  const remainingMinor = getRemainingRequirements(minorGroups, state.completedRequirementIds);
  const remainingGe = getRemainingRequirements(geGroups, state.completedRequirementIds);
  const remainingUniversity = getRemainingRequirements(universityGroups, state.completedRequirementIds);

  const allRequirements = [
    ...flattenGroups(majorGroups),
    ...flattenGroups(minorGroups),
    ...flattenGroups(geGroups),
    ...flattenGroups(universityGroups),
  ];
  const totalRequirementCount = allRequirements.length || 1;
  const completedRequirements = allRequirements.filter((item) =>
    safeArray(state.completedRequirementIds).includes(item.id),
  ).length;
  const percentComplete = Math.round((completedRequirements / totalRequirementCount) * 100);

  return {
    percentComplete,
    estimatedSemestersRemaining: 0,
    remainingMajor,
    remainingMinor,
    remainingGe,
    remainingUniversity,
    selectedDegreePathName: degreePath.name,
    selectedMinorName: minor?.name ?? "None",
    degreeUnitsCompleted: countCompletedUnits(majorGroups, state.completedRequirementIds),
    degreeUnitsRequired: degreePath.totalUnits,
    minorUnitsCompleted: countCompletedUnits(minorGroups, state.completedRequirementIds),
    minorUnitsRequired: minor?.totalUnits ?? 0,
    graduationRequirements: buildGraduationStatuses(state),
  };
}

export function buildOptimization(state: AppState): OptimizationResult {
  const completion = estimateCompletion(state);
  const degreePath = getSelectedDegreePath(state.degreePathId);
  const minor = getSelectedMinor(state.minorId);

  if (state.mode === "free") {
    return {
      completion,
      basicSchedule: buildEmptyScheduleResult(),
      optimizedSchedule: buildEmptyScheduleResult(),
      fasterBySemesters: Math.max(Math.min(completion.remainingMajor.length + completion.remainingMinor.length, 2), 1),
      activeDegreePathName: degreePath.name,
      activeMinorName: minor?.name ?? "None",
      globalRules: safeArray(catalog.globalRules),
      plannerStatus: "locked",
      plannerWarnings: [],
      scheduleGenerated: false,
      electiveSections: [],
    };
  }

  return state.generatedPlan ?? {
    completion,
    basicSchedule: buildEmptyScheduleResult(),
    optimizedSchedule: buildEmptyScheduleResult(),
    fasterBySemesters: 0,
    activeDegreePathName: degreePath.name,
    activeMinorName: minor?.name ?? "None",
    globalRules: safeArray(catalog.globalRules),
    plannerStatus: "idle",
    plannerWarnings: ["Generate Plan first to create a semester-by-semester schedule."],
    scheduleGenerated: false,
    electiveSections: [],
  };
}

export function buildPlanSummary(state: AppState): PlannerResult {
  const completion = estimateCompletion(state);
  const degreePath = getSelectedDegreePath(state.degreePathId);
  const minor = getSelectedMinor(state.minorId);
  const scoredCourses = buildScoredCourseList(state);
  const generatedPlan = state.generatedPlan;

  return {
    completion: {
      ...completion,
      estimatedSemestersRemaining:
        state.mode === "premium" && generatedPlan?.scheduleGenerated
          ? generatedPlan.completion.estimatedSemestersRemaining
          : completion.estimatedSemestersRemaining,
    },
    activeDegreePathName: degreePath.name,
    activeMinorName: minor?.name ?? "None",
    globalRules: safeArray(catalog.globalRules),
    fasterBySemesters:
      state.mode === "premium" && generatedPlan?.scheduleGenerated
        ? generatedPlan.fasterBySemesters
        : Math.max(Math.min(completion.remainingMajor.length + completion.remainingMinor.length, 2), 1),
    basicSchedule: state.mode === "premium" ? safeArray(generatedPlan?.basicSchedule) : [],
    optimizedSchedule: state.mode === "premium" ? safeArray(generatedPlan?.optimizedSchedule) : [],
    scheduleGenerated: Boolean(state.mode === "premium" && generatedPlan?.scheduleGenerated),
    plannerWarnings: safeArray(generatedPlan?.plannerWarnings),
    plannerStatus:
      state.mode === "premium"
        ? generatedPlan?.plannerStatus ?? "idle"
        : "locked",
    electiveSections: buildElectiveSections(scoredCourses),
  };
}

export function generatePlanSnapshot(state: AppState): PlannerResult {
  const completion = estimateCompletion(state);
  const degreePath = getSelectedDegreePath(state.degreePathId);
  const minor = getSelectedMinor(state.minorId);
  const scoredCourses = buildScoredCourseList(state);
  const basicSchedule = buildSchedule(
    state,
    scoredCourses,
    clampUnits(state.preferredMaxUnitsPerTerm),
  );
  const optimizedSchedule = buildSchedule(
    state,
    scoredCourses,
    Math.min(clampUnits(state.preferredMaxUnitsPerTerm + 2), DEFAULT_OPTIMIZED_UNITS),
  );
  const plannerWarnings: string[] = [];

  if (basicSchedule.length === 0) {
    plannerWarnings.push("No eligible schedule could be generated from the current remaining requirements.");
  }

  if (optimizedSchedule.length >= MAX_SEMESTERS) {
    plannerWarnings.push("The generated plan reached the semester cap and may be incomplete.");
  }

  return {
    completion: {
      ...completion,
      estimatedSemestersRemaining: basicSchedule.length,
    },
    activeDegreePathName: degreePath.name,
    activeMinorName: minor?.name ?? "None",
    globalRules: safeArray(catalog.globalRules),
    fasterBySemesters: Math.max(basicSchedule.length - optimizedSchedule.length, 0),
    basicSchedule,
    optimizedSchedule,
    scheduleGenerated: basicSchedule.length > 0,
    plannerWarnings,
    plannerStatus: basicSchedule.length > 0 ? "ready" : "partial",
    electiveSections: buildElectiveSections(scoredCourses),
  };
}

export const defaultProgressState = defaultAppState;
