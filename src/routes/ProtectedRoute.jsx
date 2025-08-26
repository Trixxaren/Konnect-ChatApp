// En väktare vid vakten. Visa armbandet för att komma in. (token), annars tillbaka till receptionen (login).
// Släpper bara in användare som har token
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();
  // Har token, skickas/visa barnroutes (Outlet)
  // Ingen token, skickas/visa till /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
