import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Plus,
  History,
  Loader,
  AlertTriangle,
  GraduationCap,
  User,
} from "lucide-react";
import SemesterCard from "../components/SemesterCard";
import CGPADisplay from "../components/CGPADisplay";
import StudentSelector from "../components/StudentSelector";
import {
  calculateCGPA,
  calculateYearUnits,
  ACADEMIC_LIMITS,
  getYearFromSemester,
  getSemesterType,
} from "../utils/grades";
import { getCurrentStudent } from "../utils/students";
import { api } from "../api/client";

export default function Calculator() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [scale, setScale] = useState("4.0");
  const [title, setTitle] = useState("");
  const [semesters, setSemesters] = useState([
    { id: Date.now(), name: "First Semester", courses: [] },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const curr = getCurrentStudent();
    setStudent(curr);
    if (curr?.scale) setScale(curr.scale);

    const saved = sessionStorage.getItem("load_calculation");
    if (saved) {
      const data = JSON.parse(saved);
      setScale(data.scale || curr?.scale || "4.0");
      setTitle(data.title || "");
      setSemesters(
        data.semesters || [
          { id: Date.now(), name: "First Semester", courses: [] },
        ],
      );
      sessionStorage.removeItem("load_calculation");
    }
  }, []);

  const cgpa = calculateCGPA(semesters, scale);
  const totalCredits = semesters.reduce(
    (sum, s) =>
      sum +
      (s.courses || []).reduce(
        (c, course) => c + (Number(course.credits) || 0),
        0,
      ),
    0,
  );

  const yearsCount = Math.ceil(semesters.length / 2);
  const totalSemesters = semesters.length;

  const yearWarnings = [];
  for (let year = 1; year <= yearsCount; year++) {
    const yearUnits = calculateYearUnits(semesters, year);
    if (yearUnits > ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR) {
      yearWarnings.push({ year, units: yearUnits });
    }
  }

  const canAddSemester = semesters.length < ACADEMIC_LIMITS.MAX_TOTAL_SEMESTERS;

  const addSemester = () => {
    if (!canAddSemester) {
      alert(
        `Maximum ${ACADEMIC_LIMITS.MAX_TOTAL_SEMESTERS} semesters (${ACADEMIC_LIMITS.MAX_TOTAL_YEARS} years) allowed`,
      );
      return;
    }
    const newIndex = semesters.length;
    const semType = getSemesterType(newIndex);

    setSemesters([
      ...semesters,
      {
        id: Date.now(),
        name: `${semType} Semester`,
        courses: [],
      },
    ]);
  };

  const updateSemester = useCallback((updated) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  }, []);

  const deleteSemester = (id) => {
    if (semesters.length === 1) {
      alert("You must have at least one semester");
      return;
    }
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!student) {
      alert("Please select a student first");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title for this calculation");
      return;
    }
    if (yearWarnings.length > 0) {
      if (!window.confirm("Some years exceed 60 units. Save anyway?")) return;
    }
    setSaving(true);
    try {
      await api.saveCalculation({
        title: title.trim(),
        scale,
        cgpa,
        totalCredits,
        semesters,
        yearsCount,
        totalSemesters,
        studentName: student.name,
        matricNumber: student.matricNumber,
      });
      alert("Saved successfully!");
      setTitle("");
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <StudentSelector onStudentChange={setStudent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap size={28} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  CGPA Calculator
                </h1>
                <p className="text-xs text-gray-500">
                  Full Academic Career • Max{" "}
                  {ACADEMIC_LIMITS.MAX_SEMESTERS_PER_YEAR} Semesters/Year • Max{" "}
                  {ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR} Units/Year
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-48">
                <StudentSelector onStudentChange={setStudent} />
              </div>
              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <History size={18} />
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Student Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-primary text-white p-3 rounded-full">
            <User size={24} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{student.name}</p>
            <p className="text-sm text-gray-600">
              {student.matricNumber} • {student.department} • {student.program}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Default Scale</p>
            <p className="font-bold text-primary">{student.scale}</p>
          </div>
        </div>

        {/* Year Warnings */}
        {yearWarnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-danger shrink-0" size={20} />
            <div>
              <p className="font-semibold text-danger text-sm">
                Year Unit Limit Exceeded
              </p>
              {yearWarnings.map((w) => (
                <p key={w.year} className="text-sm text-red-600">
                  Year {w.year}: {w.units} units (max{" "}
                  {ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR})
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Title Input */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <input
            type="text"
            placeholder="Enter calculation title (e.g., 'BSc Computer Science - 4 Years')..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-semibold border-b-2 border-transparent hover:border-gray-200 focus:border-primary outline-none px-1 py-2 transition"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              Grading Scale:
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="4.0">4.0 Scale (A=4, B=3, C=2, D=1, F=0)</option>
              <option value="5.0">
                5.0 Scale (A=5, B=4, C=3, D=2, E=1, F=0)
              </option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={
              saving || semesters.every((s) => (s.courses || []).length === 0)
            }
            className="flex items-center gap-2 bg-success text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save CGPA"}
          </button>
        </div>

        {/* CGPA Display */}
        <CGPADisplay
          cgpa={cgpa}
          totalCredits={totalCredits}
          scale={scale}
          yearsCount={yearsCount}
          totalSemesters={totalSemesters}
          studentName={student.name}
        />

        {/* Year Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: yearsCount }, (_, i) => {
            const year = i + 1;
            const units = calculateYearUnits(semesters, year);
            const isOverLimit = units > ACADEMIC_LIMITS.MAX_UNITS_PER_YEAR;
            return (
              <div
                key={year}
                className={`rounded-lg p-3 text-center border ${
                  isOverLimit
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-xs text-gray-500">Year {year}</p>
                <p
                  className={`text-lg font-bold ${isOverLimit ? "text-danger" : "text-gray-800"}`}
                >
                  {units}
                </p>
                <p className="text-xs text-gray-400">units</p>
              </div>
            );
          })}
        </div>

        {/* Semesters */}
        <div className="space-y-6">
          {semesters.map((semester, idx) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              semesterIndex={idx}
              scale={scale}
              yearUnits={calculateYearUnits(
                semesters,
                getYearFromSemester(idx),
              )}
              onUpdate={updateSemester}
              onDelete={() => deleteSemester(semester.id)}
              canDelete={semesters.length > 1}
            />
          ))}
        </div>

        {/* Add Semester */}
        {canAddSemester ? (
          <button
            onClick={addSemester}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add {getSemesterType(semesters.length)} Semester (Year{" "}
            {getYearFromSemester(semesters.length)})
          </button>
        ) : (
          <div className="w-full py-4 bg-gray-100 rounded-xl text-center text-gray-400">
            Maximum {ACADEMIC_LIMITS.MAX_TOTAL_SEMESTERS} semesters (
            {ACADEMIC_LIMITS.MAX_TOTAL_YEARS} years) reached
          </div>
        )}
      </div>
    </div>
  );
}
