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

const BASIC_UNIT_CAP = 15;
const OPTIMIZED_UNIT_CAP = 18;
const MAX_MAJOR_CORE_PER_TERM = 2;

function flattenGroups(groups: ProgramRequirementGroup[]) {
  return groups.flatMap((group) => group.requirements);
}

function getRemainingRequirements(groups: ProgramRequirementGroup[], completedIds: string[]) {
  return flattenGroups(groups).filter((requirement) => !completedIds.includes(requirement.id));
}

function buildRequirementLookup(groups: ProgramRequirementGroup[]) {
  return new Map(flattenGroups(groups).map((requirement) => [requirement.id, requirement]));
}

function getActiveRequirementGroups(state: AppState) {
  const degreePath = getSelectedDegreePath(state.degreePathId);
  const minor = getSelectedMinor(state.minorId);

  return {
    degreePath,
    minor,
    majorGroups: degreePath.requirementGroups,
    minorGroups: minor?.requirementGroups ?? [],
    geGroups: catalog.geRequirements,
    universityGroups: catalog.universityRequirements,
  };
}

function countCompletedUnits(groups: ProgramRequirementGroup[], completedIds: string[]) {
  return flattenGroups(groups)
    .filter((requirement) => completedIds.includes(requirement.id))
    .reduce((sum, requirement) => sum + requirement.units, 0);
}

function buildGraduationStatuses(state: AppState): GraduationRequirementStatus[] {
  return [
    {
      id: "total-units",
      label: "120 total units",
      completed: state.completedUnits,
      required: catalog.graduationRules.minimumTotalUnits,
      remaining: Math.max(catalog.graduationRules.minimumTotalUnits - state.completedUnits, 0),
    },
    {
      id: "upper-division-units",
      label: "39 upper-division units",
      completed: state.completedUpperDivisionUnits,
      required: catalog.graduationRules.minimumUpperDivisionUnits,
      remaining: Math.max(catalog.graduationRules.minimumUpperDivisionUnits - state.completedUpperDivisionUnits, 0),
    },
    {
      id: "sac-state-units",
      label: "30 Sacramento State units",
      completed: state.completedSacStateUnits,
      required: catalog.graduationRules.minimumSacStateUnits,
      remaining: Math.max(catalog.graduationRules.minimumSacStateUnits - state.completedSacStateUnits, 0),
    },
    {
      id: "sac-state-upper-division-units",
      label: "24 Sacramento State upper-division units",
      completed: state.completedSacStateUpperDivisionUnits,
      required: catalog.graduationRules.minimumSacStateUpperDivisionUnits,
      remaining: Math.max(
        catalog.graduationRules.minimumSacStateUpperDivisionUnits - state.completedSacStateUpperDivisionUnits,
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
  const coveredRequirementIds = course.satisfiesRequirementIds.filter((id) => remainingRequirementIds.has(id));
  const coversRequiredMajor = coveredRequirementIds.some((id) => majorLookup.has(id));
  const coversMinor = coveredRequirementIds.some((id) => minorLookup.has(id));
  const coversUniversity = coveredRequirementIds.some((id) => universityLookup.has(id));
  const coversGe = coveredRequirementIds.some(
    (id) => !majorLookup.has(id) && !minorLookup.has(id) && !universityLookup.has(id),
  );
  const overlapBonus = (coversRequiredMajor || coversMinor) && (coversGe || coversUniversity) ? 1 : 0;
  const upperDivisionPriority = course.level === "upper" ? 1 : 0;

  return {
    majorPoints: coversRequiredMajor || coversMinor ? 3 : 0,
    gePoints: coversGe || coversUniversity ? 2 : 0,
    overlapBonus,
    total:
      (coversRequiredMajor || coversMinor ? 3 : 0) +
      (coversGe || coversUniversity ? 2 : 0) +
      overlapBonus +
      upperDivisionPriority,
    coversRequiredMajor,
    coversMinor,
    coversUniversity,
    coveredCount: coveredRequirementIds.length,
    upperDivisionPriority,
  };
}

function buildScoredCourseList(state: AppState) {
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
  const allRequirementLookup = new Map(
    [...majorLookup, ...minorLookup, ...universityLookup, ...buildRequirementLookup(geGroups)].map(([id, item]) => [
      id,
      item,
    ]),
  );

  return catalog.courses
    .map((course) => {
      const coveredRequirementIds = course.satisfiesRequirementIds.filter((id) => remainingRequirementIds.has(id));
      const score = scoreCourse(course, remainingRequirementIds, majorLookup, minorLookup, universityLookup);

      return {
        ...course,
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
  return courses.filter((course) => course.score.coversRequiredMajor).length;
}

function buildSchedule(state: AppState, scoredCourses: ScoredCourse[], maxUnits: number): SemesterPlan[] {
  const remaining = [...scoredCourses];
  const semesters: SemesterPlan[] = [];
  let semesterIndex = 1;
  let runningTotalUnits = state.completedUnits;
  let runningUpperDivisionUnits = state.completedUpperDivisionUnits;
  let runningSacStateUnits = state.completedSacStateUnits;
  let runningSacStateUpperDivisionUnits = state.completedSacStateUpperDivisionUnits;

  while (remaining.length > 0) {
    let totalUnits = 0;
    let majorCoreCount = 0;
    let difficultyScore = 0;
    const picked: ScoredCourse[] = [];

    for (let index = 0; index < remaining.length; ) {
      const course = remaining[index];
      const wouldExceedUnits = totalUnits > 0 && totalUnits + course.units > maxUnits;
      const wouldOverloadCore = course.score.coversRequiredMajor && majorCoreCount >= MAX_MAJOR_CORE_PER_TERM;

      if (!wouldExceedUnits && !wouldOverloadCore) {
        picked.push(course);
        totalUnits += course.units;
        difficultyScore += course.difficulty;
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
        difficultyScore += fallback.difficulty;
        if (fallback.score.coversRequiredMajor) {
          majorCoreCount += 1;
        }
      }
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
  const completedRequirements = allRequirements.filter((item) =>
    state.completedRequirementIds.includes(item.id),
  ).length;
  const percentComplete = Math.round((completedRequirements / allRequirements.length) * 100);
  const estimatedSemestersRemaining = Math.max(
    buildSchedule(
      state,
      buildScoredCourseList(state),
      Math.min(state.preferredMaxUnitsPerTerm, BASIC_UNIT_CAP),
    ).length,
    1,
  );

  return {
    percentComplete,
    estimatedSemestersRemaining,
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

export function generateBasicSchedule(state: AppState) {
  return buildSchedule(
    state,
    buildScoredCourseList(state),
    Math.min(state.preferredMaxUnitsPerTerm, BASIC_UNIT_CAP),
  );
}

export function generateOptimizedSchedule(state: AppState) {
  return buildSchedule(
    state,
    buildScoredCourseList(state),
    Math.min(state.preferredMaxUnitsPerTerm + 3, OPTIMIZED_UNIT_CAP),
  );
}

export function buildOptimization(state: AppState): OptimizationResult {
  const completion = estimateCompletion(state);
  const basicSchedule = generateBasicSchedule(state);
  const optimizedSchedule = generateOptimizedSchedule(state);

  return {
    completion,
    basicSchedule,
    optimizedSchedule,
    fasterBySemesters: Math.max(basicSchedule.length - optimizedSchedule.length, 0),
  };
}

export const defaultProgressState = defaultAppState;
