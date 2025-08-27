import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Start på /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Gäst-område: bara om man INTE är inloggad */}
      <Route element={<GuestRoute />}>
        {" "}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Skyddat område: kräver token */}
      <Route element={<ProtectedRoute />}>
        {" "}
        <Route path="/chat" element={<Chat />} />
      </Route>

      {/* 404 fallback (valfritt) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
