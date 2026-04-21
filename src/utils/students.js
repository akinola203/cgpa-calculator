const STORAGE_KEY = "cgpa_students";
const CURRENT_KEY = "cgpa_current_student";

export const getStudents = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const getCurrentStudent = () => {
  const id = localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  const students = getStudents();
  return students.find((s) => s.id === id) || null;
};

export const setCurrentStudent = (id) => {
  if (id) {
    localStorage.setItem(CURRENT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_KEY);
  }
};

export const addStudent = (studentData) => {
  const students = getStudents();
  const newStudent = {
    id: Date.now().toString(),
    name: studentData.name.trim(),
    matricNumber: studentData.matricNumber.trim(),
    department: studentData.department?.trim() || "",
    program: studentData.program?.trim() || "",
    scale: studentData.scale || "4.0",
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  setCurrentStudent(newStudent.id);
  return newStudent;
};

export const updateStudent = (id, updates) => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;
  students[index] = {
    ...students[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  return students[index];
};

export const deleteStudent = (id) => {
  let students = getStudents().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  localStorage.removeItem(`cgpa_history_${id}`);
  if (getCurrentStudent()?.id === id) {
    localStorage.removeItem(CURRENT_KEY);
  }
};

export const getStudentCalculations = (studentId) => {
  try {
    return JSON.parse(
      localStorage.getItem(`cgpa_history_${studentId}`) || "[]",
    );
  } catch {
    return [];
  }
};

export const saveStudentCalculation = (studentId, data) => {
  const history = getStudentCalculations(studentId);
  const entry = {
    id: Date.now(),
    studentId,
    studentName: data.studentName,
    matricNumber: data.matricNumber,
    ...data,
    createdAt: new Date().toISOString(),
  };
  history.unshift(entry);
  localStorage.setItem(`cgpa_history_${studentId}`, JSON.stringify(history));
  return entry;
};

export const deleteStudentCalculation = (studentId, calcId) => {
  const history = getStudentCalculations(studentId).filter(
    (c) => c.id !== Number(calcId),
  );
  localStorage.setItem(`cgpa_history_${studentId}`, JSON.stringify(history));
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_KEY);
  // Clear all student histories
  const students = getStudents();
  students.forEach((s) => localStorage.removeItem(`cgpa_history_${s.id}`));
};
