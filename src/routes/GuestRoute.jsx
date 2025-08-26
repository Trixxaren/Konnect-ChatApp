// En väktare vid vakten. Visa armbandet för att komma i, har du redan ett armband (token) skickas in till festen (/chat)
// Släpper bara in gäster (utan token). Har du token, skickas till /chat
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function GuestRoute() {
  const { token } = useAuth();
  return token ? <Navigate to="/chat" replace /> : <Outlet />;
}
