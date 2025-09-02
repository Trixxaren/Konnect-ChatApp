import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getCsrf, createToken } from "../api/auth";

export default function Login() {
  // Komponent för inloggningssidan
  const navigate = useNavigate(); // för att byta sida (till chatten)
  // AuthContext (för att spara token + user vid lyckad login)
  const { token, login } = useAuth(); // token = null om ej inloggad, annars JWT

  // Form state
  const [username, setUsername] = useState(""); // styr inputfält för username
  const [password, setPassword] = useState(""); // styr inputfält för password
  const [loading, setLoading] = useState(false); // visar "Loggar in..." under login

  // Om already logged in, hoppa till chat direkt
  useEffect(() => {
    if (token) navigate("/chat"); // om token finns, in i chatten
  }, [token, navigate]); // körs vid mount + när token ändras

  // Hantera formulärets onSubmit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Hämta CSRF-stämpel
      const { csrfToken } = await getCsrf();

      // 2) Byt användarnamn+lösenord mot en JWT-token
      const { token: jwt } = await createToken({
        username,
        password,
        csrfToken,
      });

      // 3) Spara auth, vi vet bara username här API:t ger inte user-objekt tillbak
      const user = { username };
      login(jwt, user); // spara i context + localStorage

      // 4) till chatten
      navigate("/chat");
    } catch (err) {
      // Använd klassificerade felkoder från createToken
      // invalid_credentials (401)
      // validation (400)
      // unknown (övrigt)
      if (err?.code === "invalid_credentials") {
        // 401 från API:t
        alert("Fel användarnamn eller lösenord."); // användarvänligt meddelande för att se om det är fel på inloggningen
        console.warn("Login failed:", err); // console.warn för att testa på olika consolers
      } else if (err?.code === "validation") {
        // 400 från API:t, valideringsfel, t.ex. tomt lösenord
        alert(err.message || "Valideringsfel – kontrollera fälten."); // visa meddelande från API:t om det finns
      } else {
        alert(
          err?.message || `Kunde inte logga in (HTTP ${err?.status ?? "?"}).` // generellt fel
        );
      }
    } finally {
      setLoading(false); // oavsett om det lyckas eller misslyckas, sluta visa "Loggar in..."
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Logga in</h1>

      <form
        onSubmit={handleLogin} // kör handleLogin funktionen vid submit
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <label className="block mb-4">
          <span className="text-gray-700">Användarnamn</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)} // uppdatera state vid ändring
            placeholder="Heaton"
            name="username"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Lösenord</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)} // uppdatera state vid ändring
            placeholder="********"
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading} // disablar knappen under login
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Loggar in..." : "Logga in"}
          {/* visar "Loggar in..." om loading är true, annars "Logga in" */}
        </button>
      </form>

      <p className="mt-4">
        Har du inget konto?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Registrera dig
        </Link>
        {/* Länk till registreringssidan */}
      </p>
    </div>
  );
}
