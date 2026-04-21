import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Eye,
  Calendar,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Loader,
  User,
} from "lucide-react";
import { api } from "../api/client";
import {
  getStudents,
  getCurrentStudent,
  setCurrentStudent,
} from "../utils/students";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScale, setFilterScale] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudentState] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStudents(getStudents());
    const curr = getCurrentStudent();
    setCurrentStudentState(curr);
    if (curr) setFilterStudent(curr.id);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory();
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFilterChange = (studentId) => {
    setFilterStudent(studentId);
    if (studentId !== "all") {
      setCurrentStudent(studentId);
      setCurrentStudentState(getStudents().find((s) => s.id === studentId));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this calculation?"))
      return;

    setDeletingId(id);
    try {
      await api.deleteCalculation(id);
      setHistory(history.filter((h) => h.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
    setDeletingId(null);
  };

  const handleView = (id) => {
    navigate(`/calculation/${id}`);
  };

  const handleLoadIntoCalculator = (calc) => {
    sessionStorage.setItem("load_calculation", JSON.stringify(calc));
    if (calc.studentId) {
      setCurrentStudent(calc.studentId);
    }
    navigate("/");
  };

  const getGradeClass = (cgpa, scale) => {
    const val = parseFloat(cgpa);
    const max = scale === "5.0" ? 5.0 : 4.0;
    const ratio = val / max;
    if (ratio >= 0.7) return "bg-green-100 text-green-800 border-green-200";
    if (ratio >= 0.6) return "bg-blue-100 text-blue-800 border-blue-200";
    if (ratio >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getHonors = (cgpa, scale) => {
    const val = parseFloat(cgpa);
    if (scale === "5.0") {
      if (val >= 4.5) return "First Class Honours";
      if (val >= 3.5) return "Second Class Upper";
      if (val >= 2.5) return "Second Class Lower";
      if (val >= 2.0) return "Third Class";
      return "Pass";
    }
    if (val >= 3.5) return "First Class";
    if (val >= 3.0) return "Second Class Upper";
    if (val >= 2.0) return "Second Class Lower";
    return "Pass";
  };

  const filteredHistory = history.filter((calc) => {
    const matchesSearch =
      calc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.cgpa?.includes(searchTerm) ||
      calc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.matricNumber?.includes(searchTerm);
    const matchesScale = filterScale === "all" || calc.scale === filterScale;
    const matchesStudent =
      filterStudent === "all" || calc.studentId === filterStudent;
    return matchesSearch && matchesScale && matchesStudent;
  });

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cgpa-history-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Calculation History
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredHistory.length} of {history.length} calculations
                  {currentStudent && ` • ${currentStudent.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={exportToJSON}
              disabled={filteredHistory.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Download size={18} />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title, CGPA, name, or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              <select
                value={filterStudent}
                onChange={(e) => handleStudentFilterChange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.matricNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterScale}
                onChange={(e) => setFilterScale(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Scales</option>
                <option value="4.0">4.0 Scale</option>
                <option value="5.0">5.0 Scale</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Grid */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No calculations found
            </h3>
            <p className="text-gray-500 mb-4">
              {history.length === 0
                ? "Start calculating your CGPA and save your results to see them here."
                : "No calculations match your search criteria."}
            </p>
            {history.length === 0 && (
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Calculator
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((calc) => (
              <div
                key={calc.id}
                onClick={() => handleView(calc.id)}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition">
                        {calc.title || "Untitled Calculation"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getGradeClass(calc.cgpa, calc.scale)}`}
                      >
                        {calc.scale} Scale
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border">
                        {getHonors(calc.cgpa, calc.scale)}
                      </span>
                    </div>

                    {/* Student Info */}
                    {calc.studentName && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <User size={14} />
                        <span className="font-medium">{calc.studentName}</span>
                        <span className="text-gray-400">•</span>
                        <span>{calc.matricNumber}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        <div>
                          <p className="text-xs text-gray-500">CGPA</p>
                          <p className="text-xl font-bold text-gray-800">
                            {calc.cgpa}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-success" />
                        <div>
                          <p className="text-xs text-gray-500">Total Credits</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {calc.totalCredits}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-warning" />
                        <div>
                          <p className="text-xs text-gray-500">Semesters</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {calc.semesters?.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Saved</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(calc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {calc.semesters?.slice(0, 2).map((sem, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded"
                        >
                          {sem.name}: {sem.courses?.length || 0} courses
                        </span>
                      ))}
                      {(calc.semesters?.length || 0) > 2 && (
                        <span className="text-xs text-gray-400 px-2 py-1">
                          +{calc.semesters.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadIntoCalculator(calc);
                      }}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition"
                      title="Load into calculator"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(calc.id, e)}
                      disabled={deletingId === calc.id}
                      className="p-2 text-danger hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === calc.id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
