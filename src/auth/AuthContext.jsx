// AuthContext för att göra en "central lista" på vilka som har token och vilka som inte har det istället för att varje component ska behöva kolla det själv.
// Utan token och user måste man skicka dem som props genom många lager av komponenter, vilket blir bökigt.
// Context gör det möjligt att "slippa props" och istället hämta det direkt i komponenten som behöver det.
// Metafor "klubbchefen som håller gästlistan för att sedan uppdatera varje rum vem som har token och inte och inte behöva fråga varje person själv".

import { createContext, useContext, useState, useEffect, use } from "react";

/* --- Skapar själva Context-objektet --- */
const AuthContext = createContext(null);

/* --- Custom hook för enklare åtkomst --- */
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State för auth-data
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  /* --- När appen startar: kolla om något ligger i localStorage --- */
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  /* --- Funktion för inloggning & utlogging --- */
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Spara i localStorage så man stannar inloggad vid refresh
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Rensar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
