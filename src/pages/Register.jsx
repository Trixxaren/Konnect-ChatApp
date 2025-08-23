// 🔧 __NYTT: importera useNavigate__ + useState
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🔧 __NYTT: useNavigate__
import { useAuth } from "../auth/AuthContext"; // Om du använder AuthContext

export default function Register() {
  const navigate = useNavigate(); // 🔧 __NYTT: skapa navigate-funktionen__
  const { login } = useAuth?.() ?? { login: () => {} }; // defensivt: funkar även om AuthContext saknas

  // Lokalt state för formuläret
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // ✅ Antaganden: du har redan:
  // import { useState } from "react";
  // import { Link, useNavigate } from "react-router-dom";
  // import { useAuth } from "../auth/AuthContext";
  // const API_URL = import.meta.env.VITE_API_URL ?? ""; // 🔧 ÄNDRAT: bas-URL om du kör proxy/Vite

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/auth/register", {
        // 🔧 ÄNDRAT: använd bas-URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Om ditt API kräver cookies/CSRF:
        // credentials: "include", // 🔧 ÄNDRAT: avkommentera vid behov
        body: JSON.stringify({ username, password, email }),
      });

      // --- Branch 1: Konto finns redan ---
      if (res.status === 409) {
        // 🔧 ÄNDRAT: kolla uttryckligen 409
        // Försök läsa felmeddelande från API (om det finns)
        let msg = "Kontot finns redan. Prova att logga in i stället.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {}
        alert(msg);
        return;
      }

      // --- Branch 2: Valideringsfel ---
      if (res.status === 400) {
        // 🔧 ÄNDRAT
        let msg = "Felaktiga fält. Kontrollera uppgifterna.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {}
        alert(msg);
        return;
      }

      // --- Branch 3: Lyckat (200 eller 201) ---
      if (res.ok) {
        // ✅ fångar 200, 201, 204 etc.
        // En del API:er returnerar body med token/user, andra inte.
        let data = null;
        try {
          // Läs JSON bara om det finns nåt att läsa
          const text = await res.text(); // 🔧 ÄNDRAT
          data = text ? JSON.parse(text) : null; // 🔧 ÄNDRAT
        } catch {
          data = null;
        }

        // Förväntat: { token, user } – justera efter ditt API
        if (data?.token && data?.user) {
          login(data.token, data.user); // ✅ Spara auth
        } else {
          // Om API:t inte skickar token, kanske du ska logga in direkt efter register
          // Exempel:
          // const loginRes = await fetch(`${API_URL}/auth/login`, {...})
          // ...
        }

        navigate("/chat"); // ✅ in i chatten
        return;
      }

      // --- Branch 4: Övriga fel (t.ex. 500, 404, CORS, etc.) ---
      let fallback = `Kunde inte registrera (HTTP ${res.status}). Försök igen.`;
      try {
        const data = await res.json();
        if (data?.message) fallback = data.message;
      } catch {}
      alert(fallback);
    } catch (err) {
      console.error("Register error:", err);
      alert("Nätverksfel eller CORS-problem. Kolla devtools → Network-fliken.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Registrera dig</h1>

      {/* 🔧 __ÄNDRAT: onSubmit i stället för action/method__ */}
      <form
        onSubmit={handleRegister}
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
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Lösenord</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            name="password"
            type="password" // 🔧 __ÄNDRAT: password-fält__
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Mejladress</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="heaton@cs.se"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Registrera
        </button>
      </form>

      <p className="mt-4">
        Har du redan konto?{" "}
        <Link to="/login" className="text-green-600 hover:underline">
          Logga in
        </Link>
      </p>
    </div>
  );
}
