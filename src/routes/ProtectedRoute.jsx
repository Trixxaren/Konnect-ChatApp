// En väktare vid vakten. Du måste visa armbandet (token) för att komma in.
// Har du armband (token) → du får komma in på festen (Outlet = barnroutes, t.ex. /chat).
// Har du inget armband (ingen token) → vakten skickar dig tillbaka till receptionen (/login).
import { Navigate, Outlet } from "react-router-dom";
// Navigate skickar användaren till en annan route (redirect).
// Outlet platsen där de skyddade barn-routes renderas (t.ex. Chat).
import { useAuth } from "../auth/AuthContext";
//hämmtar Auth-state från AuthContext.

export default function ProtectedRoute() {
  const { token } = useAuth();
  // Hämtar token från AuthContext (där vi sparar det vid login).
  // kikar om den den här besökaren redan ett armband (token).
  return token ? <Outlet /> : <Navigate to="/login" replace />;
  // Om token finns så rendera barnroutes (Outlet).
  // Släpp in till skyddade sidor som Chat.

  // Om token saknas och användaren är inte inloggad.
  // Skicka istället till /login för att logga in eller registrera sig.
}
