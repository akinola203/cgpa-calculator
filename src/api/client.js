import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MOCK_DELAY = 600;

const mockAPI = {
  async saveCalculation(data) {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    const saved = JSON.parse(localStorage.getItem("cgpa_history") || "[]");
    const entry = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      title: data.title || `Calculation ${saved.length + 1}`,
    };
    saved.unshift(entry);
    localStorage.setItem("cgpa_history", JSON.stringify(saved));
    return { data: entry };
  },

  async getHistory() {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return {
      data: JSON.parse(localStorage.getItem("cgpa_history") || "[]"),
    };
  },

  async getCalculation(id) {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    const saved = JSON.parse(localStorage.getItem("cgpa_history") || "[]");
    const calc = saved.find((s) => s.id === Number(id));
    if (!calc) throw new Error("Calculation not found");
    return { data: calc };
  },

  async deleteCalculation(id) {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    const saved = JSON.parse(localStorage.getItem("cgpa_history") || "[]");
    localStorage.setItem(
      "cgpa_history",
      JSON.stringify(saved.filter((s) => s.id !== Number(id))),
    );
    return { data: { success: true } };
  },

  async updateCalculation(id, data) {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    const saved = JSON.parse(localStorage.getItem("cgpa_history") || "[]");
    const index = saved.findIndex((s) => s.id === Number(id));
    if (index === -1) throw new Error("Calculation not found");
    saved[index] = {
      ...saved[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("cgpa_history", JSON.stringify(saved));
    return { data: saved[index] };
  },
};

// Toggle between mock and real API
const USE_MOCK = true;

export const api = USE_MOCK
  ? mockAPI
  : {
      saveCalculation: (data) => client.post("/calculations", data),
      getHistory: () => client.get("/calculations"),
      getCalculation: (id) => client.get(`/calculations/${id}`),
      deleteCalculation: (id) => client.delete(`/calculations/${id}`),
      updateCalculation: (id, data) => client.put(`/calculations/${id}`, data),
    };

export default client;
