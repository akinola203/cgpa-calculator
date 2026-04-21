import { useState, useEffect } from "react";
import {
  User,
  Plus,
  LogOut,
  ChevronDown,
  GraduationCap,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  getStudents,
  getCurrentStudent,
  setCurrentStudent,
  addStudent,
  deleteStudent,
} from "../utils/students";

export default function StudentSelector({ onStudentChange }) {
  const [students, setStudents] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    matricNumber: "",
    department: "",
    program: "",
    scale: "4.0",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const all = getStudents();
    setStudents(all);
    const curr = getCurrentStudent();
    setCurrent(curr);
  };

  const handleSelect = (student) => {
    setCurrentStudent(student.id);
    setCurrent(student);
    setIsOpen(false);
    onStudentChange?.(student);
    window.location.reload();
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.matricNumber.trim()) {
      alert("Name and Matric Number are required");
      return;
    }

    const existing = students.find(
      (s) => s.matricNumber === newStudent.matricNumber.trim(),
    );
    if (existing) {
      alert("A student with this matric number already exists");
      return;
    }

    addStudent(newStudent);
    setNewStudent({
      name: "",
      matricNumber: "",
      department: "",
      program: "",
      scale: "4.0",
    });
    setShowAddForm(false);
    loadStudents();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this student and all their calculations? This cannot be undone.",
      )
    )
      return;
    deleteStudent(id);
    loadStudents();
    if (current?.id === id) {
      setCurrent(null);
      onStudentChange?.(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cgpa_current_student");
    setCurrent(null);
    onStudentChange?.(null);
    window.location.reload();
  };

  if (showAddForm) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-primary" />
          Add New Student
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matric Number *
            </label>
            <input
              type="text"
              required
              value={newStudent.matricNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, matricNumber: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g., 2020/123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={newStudent.department}
              onChange={(e) =>
                setNewStudent({ ...newStudent, department: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <input
              type="text"
              value={newStudent.program}
              onChange={(e) =>
                setNewStudent({ ...newStudent, program: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g., BSc Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Grading Scale
            </label>
            <select
              value={newStudent.scale}
              onChange={(e) =>
                setNewStudent({ ...newStudent, scale: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="4.0">4.0 Scale</option>
              <option value="5.0">5.0 Scale</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6 text-center max-w-md mx-auto">
        <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Welcome to CGPA Calculator
        </h2>
        <p className="text-gray-500 mb-4">
          Select an existing student or add a new one to start calculating CGPA.
        </p>

        {students.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-left mb-2">
              Existing Students
            </p>
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition text-left"
              >
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">
                    {s.matricNumber} • {s.department}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <ChevronDown size={16} className="text-gray-400 -rotate-90" />
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add New Student
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white rounded-lg border px-4 py-2 hover:bg-gray-50 transition w-full"
      >
        <div className="bg-primary text-white p-2 rounded-full">
          <User size={18} />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {current.name}
          </p>
          <p className="text-xs text-gray-500">{current.matricNumber}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Switch Student
            </p>
          </div>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition text-left ${
                s.id === current.id ? "bg-blue-50" : ""
              }`}
            >
              <div>
                <p className="font-medium text-sm text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">{s.matricNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {s.id === current.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="p-1 text-gray-400 hover:text-danger transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))}
          <div className="border-t p-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowAddForm(true);
              }}
              className="w-full flex items-center gap-2 p-2 text-sm text-primary hover:bg-blue-50 rounded transition"
            >
              <Plus size={16} />
              Add New Student
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 p-2 text-sm text-danger hover:bg-red-50 rounded transition"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
