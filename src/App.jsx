import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/chat.jsx";

export default function App() {
  return (
    <Routes>
      {/* Starta på /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
