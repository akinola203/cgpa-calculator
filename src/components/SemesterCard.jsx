import { Plus, Trash2, AlertTriangle } from "lucide-react";
import CourseRow from "./CourseRow";
import {
  calculateGPA,
  GRADE_SCALES,
  ACADEMIC_LIMITS,
  getYearFromSemester,
  getSemesterType,
} from "../utils/grades";

export default function SemesterCard({
  semester,
  semesterIndex,
  onUpdate,
  onDelete,
  scale = "4.0",
  yearUnits = 0,
  canDelete = true,
}) {
  const addCourse = () => {
    onUpdate({
      ...semester,
      courses: [
        ...(semester.courses || []),
        { id: Date.now(), name: "", credits: 3, grade: "" },
      ],
    });
  };

  const updateCourse = (updated) => {
    onUpdate({
      ...semester,
      courses: (semester.courses || []).map((c) =>
        c.id === updated.id ? updated : c,
      ),
    });
  };

  const deleteCourse = (id) => {
    onUpdate({
      ...semester,
      courses: (semester.courses || []).filter((c) => c.id !== id),
    });
  };

  const semesterUnits = (semester.courses || []).reduce(
    (sum, c) => sum + (Number(c.credits) || 0),
    0,
  );
  const gpa = calculateGPA(semester.courses || [], scale);
  const year = getYearFromSemester(semesterIndex);
  const semType = getSemesterType(semesterIndex);
  const yearLimitWarning = yearUnits > ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div
        className={`px-6 py-4 border-b flex justify-between items-center ${
          yearLimitWarning ? "bg-red-50" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
            Year {year}
          </div>
          <div>
            <input
              type="text"
              value={semester.name || `${semType} Semester`}
              onChange={(e) => onUpdate({ ...semester, name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary outline-none px-1"
            />
            <p className="text-xs text-gray-500 mt-0.5">
              {semesterUnits} units this semester
            </p>
          </div>
          {yearLimitWarning && (
            <div className="flex items-center gap-1 text-danger text-sm">
              <AlertTriangle size={16} />
              Year exceeds {ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR} units!
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">{semesterUnits} Units</p>
            <p className="text-2xl font-bold text-primary">{gpa}</p>
            <p className="text-xs text-gray-400">GPA</p>
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-2">
        {(semester.courses || []).map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            scale={GRADE_SCALES[scale] || {}}
            onUpdate={updateCourse}
            onDelete={() => deleteCourse(course.id)}
          />
        ))}

        <button
          onClick={addCourse}
          className="mt-4 flex items-center gap-2 text-primary hover:bg-blue-50 px-4 py-2 rounded-lg transition w-full justify-center"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>
    </div>
  );
}
