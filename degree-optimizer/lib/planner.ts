import { catalog, defaultAppState, getSelectedDegreePath, getSelectedMinor } from "@/data/catalog";
import type {
  AppState,
  CompletionSummary,
  Course,
  CourseScore,
  GraduationRequirementStatus,
  OptimizationResult,
  ProgramRequirementGroup,
  RequirementItem,
  ScoredCourse,
  SemesterPlan,
} from "@/lib/types";

const DEFAULT_BASIC_UNITS = 15;
const DEFAULT_OPTIMIZED_UNITS = 18;
const MAX_MAJOR_CORE_PER_TERM = 2;
const MAX_SEMESTERS = 12;

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
      label: "120 total units",
      completed: state.completedUnits ?? 0,
      required: catalog.graduationRules.minimumTotalUnits,
      remaining: Math.max(catalog.graduationRules.minimumTotalUnits - (state.completedUnits ?? 0), 0),
    },
    {
      id: "upper-division-units",
      label: "39 upper-division units",
      completed: state.completedUpperDivisionUnits ?? 0,
      required: catalog.graduationRules.minimumUpperDivisionUnits,
      remaining: Math.max(
        catalog.graduationRules.minimumUpperDivisionUnits - (state.completedUpperDivisionUnits ?? 0),
        0,
      ),
    },
    {
      id: "sac-state-units",
      label: "30 Sacramento State units",
      completed: state.completedSacStateUnits ?? 0,
      required: catalog.graduationRules.minimumSacStateUnits,
      remaining: Math.max(catalog.graduationRules.minimumSacStateUnits - (state.completedSacStateUnits ?? 0), 0),
    },
    {
      id: "sac-state-upper-division-units",
      label: "24 Sacramento State upper-division units",
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
  const allRequirementLookup = new Map([
    ...majorLookup,
    ...minorLookup,
    ...universityLookup,
    ...geLookup,
  ]);

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
    };
  }

  const scoredCourses = buildScoredCourseList(state);
  const basicSchedule = buildSchedule(
    state,
    scoredCourses,
    Math.min(clampUnits(state.preferredMaxUnitsPerTerm), DEFAULT_BASIC_UNITS),
  );
  const optimizedSchedule = buildSchedule(
    state,
    scoredCourses,
    Math.min(clampUnits(state.preferredMaxUnitsPerTerm + 3), DEFAULT_OPTIMIZED_UNITS),
  );

  return {
    completion: {
      ...completion,
      estimatedSemestersRemaining: Math.max(basicSchedule.length, 0),
    },
    basicSchedule,
    optimizedSchedule,
    fasterBySemesters: Math.max(basicSchedule.length - optimizedSchedule.length, 0),
    activeDegreePathName: degreePath.name,
    activeMinorName: minor?.name ?? "None",
    globalRules: safeArray(catalog.globalRules),
    plannerStatus: optimizedSchedule.length > 0 ? "ready" : "partial",
  };
}

export const defaultProgressState = defaultAppState;
