import { catalog, defaultAppState } from "@/data/catalog";
import type {
  AppState,
  CompletionSummary,
  Course,
  CourseScore,
  OptimizationResult,
  RequirementGroup,
  RequirementItem,
  ScoredCourse,
  SemesterPlan,
} from "@/lib/types";

const BASIC_MAX_UNITS = 12;
const OPTIMIZED_MAX_UNITS = 15;

function flattenRequirements(groups: RequirementGroup[]) {
  return groups.flatMap((group) => group.requirements);
}

function getRemainingRequirements(groups: RequirementGroup[], completedRequirementIds: string[]) {
  return flattenRequirements(groups).filter(
    (requirement) => !completedRequirementIds.includes(requirement.id),
  );
}

export function scoreCourse(course: Course, remainingRequirementIds: Set<string>): CourseScore {
  const majorHits = course.satisfiesMajorRequirementIds.filter((id) => remainingRequirementIds.has(id)).length;
  const geHits = course.satisfiesGe.filter((id) => remainingRequirementIds.has(id)).length;
  const overlapBonus = majorHits > 0 && geHits > 0 ? 1 : 0;

  return {
    majorPoints: majorHits > 0 ? 3 : 0,
    gePoints: geHits > 0 ? 2 : 0,
    overlapBonus,
    total: (majorHits > 0 ? 3 : 0) + (geHits > 0 ? 2 : 0) + overlapBonus,
  };
}

function buildScoredCourseList(state: AppState) {
  const remainingMajor = getRemainingRequirements(catalog.majorRequirements, state.completedRequirementIds);
  const remainingGe = getRemainingRequirements(catalog.geRequirements, state.completedRequirementIds);
  const remainingRequirementIds = new Set([...remainingMajor, ...remainingGe].map((item) => item.id));

  return catalog.courses
    .map((course) => {
      const score = scoreCourse(course, remainingRequirementIds);
      const coveredRequirementIds = [
        ...course.satisfiesMajorRequirementIds.filter((id) => remainingRequirementIds.has(id)),
        ...course.satisfiesGe.filter((id) => remainingRequirementIds.has(id)),
      ];

      return {
        ...course,
        score,
        coveredRequirementIds,
      } satisfies ScoredCourse;
    })
    .filter((course) => course.score.total > 0)
    .sort((left, right) => {
      if (right.score.total !== left.score.total) {
        return right.score.total - left.score.total;
      }

      if (right.coveredRequirementIds.length !== left.coveredRequirementIds.length) {
        return right.coveredRequirementIds.length - left.coveredRequirementIds.length;
      }

      return left.code.localeCompare(right.code);
    });
}

function buildSchedule(scoredCourses: ScoredCourse[], maxUnitsPerSemester: number): SemesterPlan[] {
  const remaining = [...scoredCourses];
  const semesters: SemesterPlan[] = [];
  let semesterIndex = 1;

  while (remaining.length > 0) {
    let totalUnits = 0;
    const picked: ScoredCourse[] = [];

    for (let index = 0; index < remaining.length; ) {
      const course = remaining[index];
      const fits = totalUnits === 0 || totalUnits + course.units <= maxUnitsPerSemester;

      if (fits) {
        picked.push(course);
        totalUnits += course.units;
        remaining.splice(index, 1);
      } else {
        index += 1;
      }
    }

    semesters.push({
      term: `Semester ${semesterIndex}`,
      totalUnits,
      courses: picked,
    });
    semesterIndex += 1;
  }

  return semesters;
}

export function estimateCompletion(state: AppState): CompletionSummary {
  const remainingMajor = getRemainingRequirements(catalog.majorRequirements, state.completedRequirementIds);
  const remainingGe = getRemainingRequirements(catalog.geRequirements, state.completedRequirementIds);
  const totalRequirementCount =
    flattenRequirements(catalog.majorRequirements).length + flattenRequirements(catalog.geRequirements).length;
  const completedCount = totalRequirementCount - remainingMajor.length - remainingGe.length;
  const percentComplete = Math.round((completedCount / totalRequirementCount) * 100);
  const estimatedSemestersRemaining = Math.max(
    buildSchedule(buildScoredCourseList(state), BASIC_MAX_UNITS).length,
    1,
  );

  return {
    percentComplete,
    estimatedSemestersRemaining,
    remainingMajor,
    remainingGe,
  };
}

export function generateBasicSchedule(state: AppState) {
  return buildSchedule(buildScoredCourseList(state), BASIC_MAX_UNITS);
}

export function generateOptimizedSchedule(state: AppState) {
  return buildSchedule(buildScoredCourseList(state), OPTIMIZED_MAX_UNITS);
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
