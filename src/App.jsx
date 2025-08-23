// 🔧 <u>NYTT: Importera Routes/Route/Navigate</u>
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";

export default function App() {
  return (
    // 🔧 <u>NYTT: Definiera dina routes</u>
    <Routes>
      {/* Starta på /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
