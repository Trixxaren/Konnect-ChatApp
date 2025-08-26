// Enkel login-sida som följer Swagger-flödet
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getCsrf, createToken } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const { token, login } = useAuth();

  // Form-state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Om already logged in, hoppa till chat direkt
  useEffect(() => {
    if (token) navigate("/chat");
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Hämta CSRF-stämpel (krävs av API:t)
      const { csrfToken } = await getCsrf();

      // 2) Byt användarnamn+lösenord mot en JWT-token
      const { token: jwt } = await createToken({
        username,
        password,
        csrfToken,
      });

      // 3) Spara auth (vi vet bara username här – API:t ger inte user-objekt)
      const user = { username };
      login(jwt, user);

      // 4) In i chatten!
      navigate("/chat");
    } catch (err) {
      // Använd klassificerade felkoder från createToken
      //    - invalid_credentials (401)
      //    - validation (400)
      //    - unknown (övrigt)
      if (err?.code === "invalid_credentials") {
        alert("Fel användarnamn eller lösenord.");
        console.warn("Login failed:", err); // valfritt, för debugging/uppgifts kraven. Användarvänligt med alert och sedan console för utvecklare.
      } else if (err?.code === "validation") {
        alert(err.message || "Valideringsfel – kontrollera fälten.");
      } else {
        alert(
          err?.message || `Kunde inte logga in (HTTP ${err?.status ?? "?"}).`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Logga in</h1>

      {/* Hanteras i React med onSubmit */}
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <label className="block mb-4">
          <span className="text-gray-700">Användarnamn</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>
      </form>

      <p className="mt-4">
        Har du inget konto?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Registrera dig
        </Link>
      </p>
    </div>
  );
}
