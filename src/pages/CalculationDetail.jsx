import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader, Pencil, User } from "lucide-react";
import { api } from "../api/client";
import { setCurrentStudent } from "../utils/students";

export default function CalculationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [calc, setCalc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const loadCalculation = useCallback(async () => {
    try {
      const response = await api.getCalculation(id);
      setCalc(response.data);
      setNewTitle(response.data.title || "Untitled");
    } catch (err) {
      alert("Calculation not found");
      navigate("/history");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadCalculation();
  }, [loadCalculation]);

  const handleUpdateTitle = async () => {
    try {
      await api.updateCalculation(id, { title: newTitle });
      setCalc({ ...calc, title: newTitle });
      setEditingTitle(false);
    } catch (err) {
      alert("Failed to update title");
    }
  };

  const handleLoadIntoCalculator = () => {
    sessionStorage.setItem("load_calculation", JSON.stringify(calc));
    if (calc.studentId) {
      setCurrentStudent(calc.studentId);
    }
    navigate("/");
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
      F: "bg-red-200 text-red-900",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!calc) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/history")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="text-xl font-bold border-b-2 border-primary outline-none bg-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateTitle}
                      className="px-3 py-1 bg-primary text-white text-sm rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {calc.title || "Untitled Calculation"}
                    </h1>
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="p-1 text-gray-400 hover:text-primary transition"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(calc.createdAt).toLocaleString()}
                  </p>
                  {calc.studentName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User size={14} />
                      {calc.studentName} ({calc.matricNumber})
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLoadIntoCalculator}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit in Calculator
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-primary text-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm opacity-75 mb-1">CGPA</p>
              <p className="text-5xl font-bold">{calc.cgpa}</p>
              <p className="text-sm mt-1 opacity-75">{calc.scale} Scale</p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-sm opacity-75 mb-1">Total Credits</p>
              <p className="text-4xl font-bold">{calc.totalCredits}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Years</p>
              <p className="text-4xl font-bold">
                {calc.yearsCount ||
                  Math.ceil((calc.semesters?.length || 0) / 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Semester Breakdown */}
        {calc.semesters?.map((semester, idx) => {
          const semesterCredits =
            semester.courses?.reduce(
              (sum, c) => sum + (Number(c.credits) || 0),
              0,
            ) || 0;
          const semesterPoints =
            semester.courses?.reduce((sum, c) => {
              const gradeMap =
                calc.scale === "5.0"
                  ? { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }
                  : { A: 4, B: 3, C: 2, D: 1, F: 0 };
              return sum + (gradeMap[c.grade] || 0) * (Number(c.credits) || 0);
            }, 0) || 0;
          const semesterGPA =
            semesterCredits > 0
              ? (semesterPoints / semesterCredits).toFixed(2)
              : "0.00";
          const year = Math.floor(idx / 2) + 1;

          return (
            <div
              key={semester.id || idx}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white px-2 py-1 rounded text-sm font-bold">
                    Year {year}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {semester.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Semester GPA</p>
                  <p className="text-xl font-bold text-primary">
                    {semesterGPA}
                  </p>
                </div>
              </div>

              <div className="divide-y">
                {semester.courses?.map((course, cidx) => (
                  <div
                    key={course.id || cidx}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {course.name || "Unnamed Course"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {course.credits} units
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(course.grade)}`}
                    >
                      {course.grade || "N/A"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-600 flex justify-between">
                <span>{semester.courses?.length || 0} courses</span>
                <span>{semesterCredits} total units</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
