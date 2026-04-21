import { Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { ACADEMIC_LIMITS } from "../utils/grades";

export default function CourseRow({ course, onUpdate, onDelete, scale }) {
  const grades = Object.keys(scale || {});
  const [showWarning, setShowWarning] = useState(false);

  const handleCreditsChange = (e) => {
    let value = e.target.value;

    if (value === "") {
      onUpdate({ ...course, credits: "" });
      setShowWarning(false);
      return;
    }

    let numValue = Number(value);

    if (numValue > ACADEMIC_LIMITS.MAX_UNITS_PER_COURSE) {
      setShowWarning(true);
      numValue = ACADEMIC_LIMITS.MAX_UNITS_PER_COURSE;
    } else {
      setShowWarning(false);
    }

    if (numValue < 0) numValue = 0;

    onUpdate({ ...course, credits: numValue });
  };

  return (
    <div className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border">
      <input
        type="text"
        placeholder="Course Name"
        value={course.name || ""}
        onChange={(e) => onUpdate({ ...course, name: e.target.value })}
        className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white"
      />

      <div className="relative">
        <div className="flex items-center">
          <input
            type="number"
            min="0"
            max={ACADEMIC_LIMITS.MAX_UNITS_PER_COURSE}
            step="1"
            placeholder="0"
            value={course.credits || ""}
            onChange={handleCreditsChange}
            className={`w-20 px-3 py-2 border rounded-l-md focus:ring-2 focus:ring-primary outline-none bg-white ${
              showWarning ? "border-danger focus:ring-danger" : ""
            }`}
          />
          <span className="px-2 py-2 bg-gray-200 border border-l-0 rounded-r-md text-sm text-gray-600 font-medium">
            Units
          </span>
        </div>

        {showWarning && (
          <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-xs text-danger whitespace-nowrap">
            <AlertCircle size={12} />
            Max {ACADEMIC_LIMITS.MAX_UNITS_PER_COURSE} units
          </div>
        )}
      </div>

      <select
        value={course.grade || ""}
        onChange={(e) => onUpdate({ ...course, grade: e.target.value })}
        className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none bg-white"
      >
        <option value="">Grade</option>
        {grades.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-md transition"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
