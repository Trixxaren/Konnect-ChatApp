import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* om någon går till Root "/" skickas till login*/}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* "Gäst område" routes som bara får visas om man INTE är inloggad */}
      {/* GuestRoute kollar om du redan har token för att sedan skicka till /chat */}
      {/* Om du ej är inloggad får du se dessa "barn-routes" */}
      <Route element={<GuestRoute />}>
        {" "}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Skyddat område för routes som bara får visas om man är inloggad */}
      {/* ProtectedRoute kollar om du har token för att sedan skickas till /chat */}
      {/* Om inte har token redirect till /login */}
      <Route element={<ProtectedRoute />}>
        {" "}
        <Route path="/chat" element={<Chat />} />
      </Route>

      {/* Fallback för att redirecta om man försöker gå till en "okänd" path, då skickas man tillbaka till /login* som en 404./}
      {/* path="*" catch-all görs så att man skickas tillbaka till /login om man försöker med en okänd sida som t ex /abc, /hejsan..  */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
