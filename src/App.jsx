import { BrowserRouter, Routes, Route } from "react-router-dom";
import Calculator from "./pages/Calculator";
import Dashboard from "./pages/Dashboard";
import CalculationDetail from "./pages/CalculationDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/history" element={<Dashboard />} />
          <Route path="/calculation/:id" element={<CalculationDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
