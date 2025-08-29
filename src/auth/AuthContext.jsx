// AuthContext för att göra en "central lista" på vilka som har token och vilka som inte har det istället för att varje component ska behöva kolla det själv.
// Utan token och user måste man skicka dem som props genom många lager av komponenter, vilket blir bökigt.
// Context gör det möjligt att "slippa props" och istället hämta det direkt i komponenten som behöver det.

import { createContext, useContext, useState, useEffect, use } from "react";

/* Skapar själva Context-objektet
   Detta är "lådan" som håller vår auth-data
   Vi sätter default till null (ingen auth från början) */
const AuthContext = createContext(null);

/* Custom hook för enklare åtkomst
   Med useAuth() kan man skriva `const { token, user } = useAuth();`
   Istället för att importera useContext(AuthContext) varje gång */
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State som håller reda på auth-info i minnet
  const [token, setToken] = useState(null); // medlemskortet (JWT)
  const [user, setUser] = useState(null); // info om medlemmen (username, email)

  /* När appen startar: hämtar från localStorage för att se om man ska till chat eller login/register. 
     Gör att man stannar inloggad vid refresh */
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken"); // hämta ev. JWT
    const storedUser = localStorage.getItem("authUser"); // hämta ev. user-info om det finns i localStorage
    // Om vi hittar något i localStorage, sätt det i state (inloggad)
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser)); // JSON.parse = gör om text till objekt
  }, []);

  /* Funktion för login
     Uppdaterar state (token + user)
     Sparar dessutom i localStorage för att hålla kvar efter refresh */
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Sparar i localStorage för att hålla kvar efter refresh
    localStorage.setItem("authToken", newToken); // spara JWT
    localStorage.setItem("authUser", JSON.stringify(newUser)); // spara user som JSON-sträng
  };

  /* Funktion för logout
     Tar bort state och tömmer localStorage */
  const logout = () => {
    setToken(null);
    setUser(null);

    // Rensar localStorage
    localStorage.removeItem("authToken"); //tar bort JWT
    localStorage.removeItem("authUser"); //tar bort user
  };

  /* Provider: gör att ALLA barnkomponenter får tillgång till auth
     value innehåller allt vi vill kunna använda: token, user, login, logout
     {children} = resten av appen som ligger inuti AuthProvider i main.jsx */
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
