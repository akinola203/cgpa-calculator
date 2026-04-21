export const GRADE_SCALES = {
  "4.0": {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0,
  },
  "5.0": {
    A: 5.0,
    B: 4.0,
    C: 3.0,
    D: 2.0,
    E: 1.0,
    F: 0.0,
  },
};

export const ACADEMIC_LIMITS = {
  MAX_SEMESTERS_PER_YEAR: 2,
  MAX_UNITS_PER_YEAR: 60,
  MAX_UNITS_PER_COURSE: 3,
  MAX_TOTAL_SEMESTERS: 12,
  MAX_TOTAL_YEARS: 6,
};

export const calculateGPA = (courses, scale = "4.0") => {
  const gradeMap = GRADE_SCALES[scale];
  if (!gradeMap) return "0.00";

  let totalPoints = 0;
  let totalCredits = 0;

  (courses || []).forEach((course) => {
    const credits = Number(course.credits) || 0;
    const points = gradeMap[course.grade] || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};

export const calculateCGPA = (semesters, scale = "4.0") => {
  const gradeMap = GRADE_SCALES[scale];
  if (!gradeMap) return "0.00";

  let allPoints = 0;
  let allCredits = 0;

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      const credits = Number(course.credits) || 0;
      allPoints += (gradeMap[course.grade] || 0) * credits;
      allCredits += credits;
    });
  });

  return allCredits > 0 ? (allPoints / allCredits).toFixed(2) : "0.00";
};

export const getYearFromSemester = (semesterIndex) => {
  return Math.floor(semesterIndex / 2) + 1;
};

export const getSemesterType = (semesterIndex) => {
  return semesterIndex % 2 === 0 ? "First" : "Second";
};

export const calculateYearUnits = (semesters, year) => {
  const startIdx = (year - 1) * 2;
  const endIdx = startIdx + 2;
  let total = 0;

  for (let i = startIdx; i < endIdx && i < semesters.length; i++) {
    total += (semesters[i].courses || []).reduce(
      (sum, c) => sum + (Number(c.credits) || 0),
      0,
    );
  }
  return total;
};

export const calculateYearGPA = (semesters, year, scale = "4.0") => {
  const gradeMap = GRADE_SCALES[scale];
  if (!gradeMap) return "0.00";

  const startIdx = (year - 1) * 2;
  const endIdx = startIdx + 2;
  let yearPoints = 0;
  let yearCredits = 0;

  for (let i = startIdx; i < endIdx && i < semesters.length; i++) {
    (semesters[i].courses || []).forEach((course) => {
      const credits = Number(course.credits) || 0;
      yearPoints += (gradeMap[course.grade] || 0) * credits;
      yearCredits += credits;
    });
  }

  return yearCredits > 0 ? (yearPoints / yearCredits).toFixed(2) : "0.00";
};
