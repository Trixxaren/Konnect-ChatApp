// En "väktare" vid dörren som kollar armband (token).
// Om du redan har ett armband (token), skickas du direkt in i festen (/chat).
// Om du INTE har armband, får du passera in till "gäst-området" (Outlet, t.ex. /login eller /register).
import { Navigate, Outlet } from "react-router-dom";
// Navigate skickar användaren till en annan route (redirect).
// Outlet platsen där de barn-routes (t.ex. Login, Register) kommer att renderas.
import { useAuth } from "../auth/AuthContext";
//hämmtar Auth-state från AuthContext.

export default function GuestRoute() {
  const { token } = useAuth();
  // Hämtar token från AuthContext.
  // kikar om den den här besökaren redan ett armband (token).

  return token ? <Navigate to="/chat" replace /> : <Outlet />;
  // Om token finns så skicka till /chat om inte skickas till barn-routes (Outlet) /login eller /register.
  // Så en enkel funktion som kollar om token finns eller inte.
}
