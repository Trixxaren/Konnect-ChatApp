import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getCsrf, registerUser, createToken } from "../api/auth";

export default function Register() {
  // Komponent för registreringssidan
  const navigate = useNavigate(); // för att byta sida (till chatten)
  const { login } = useAuth(); // AuthContext (för att spara token + user vid lyckad registrering)

  // Form state
  const [username, setUsername] = useState(""); // styr inputfält för username
  const [password, setPassword] = useState(""); // styr inputfält för password
  const [email, setEmail] = useState(""); // styr inputfält för email
  const [loading, setLoading] = useState(false); // visar "Registrerar..." under registrering

  const handleRegister = async (e) => {
    // Hantera formulärets onSubmit
    e.preventDefault(); // förhindra att sidan laddas om
    setLoading(true); // börja visa "Registrerar..."
    try {
      // 1) CSRF
      const { csrfToken } = await getCsrf(); // hämta CSRF-stämpel

      // 2) Register
      await registerUser({
        // registrera användaren
        username,
        password,
        email,
        avatar: "", //tom sträng då vi skapar avatar i chat.jsx
        csrfToken,
      });

      // 3) Skapa JWT token
      const { token } = await createToken({ username, password, csrfToken });

      // 4) Spara och gå till chat
      const user = { username, email, avatar: "" };
      login(token, user); // spara i context + localStorage
      navigate("/chat");
    } catch (err) {
      // Felmeddelanden för felkod och alert vid registrering (warn för att testa olika consolers)
      console.warn("Register error:", err); // logga alltid felet i konsolen
      if (err?.code === "user_exists") {
        // 409 från API:t
        alert(
          "Det finns redan ett konto med dessa uppgifter. Prova att logga in."
        );
      } else if (err?.code === "validation") {
        // 400 från API:t, valideringsfel
        alert(err.message || "Valideringsfel – kontrollera fälten."); // visa meddelande från API:t om det finns
      } else {
        alert(err?.message || `Något gick fel (HTTP ${err?.status ?? "?"}).`); // generellt fel
      }
    } finally {
      setLoading(false); // oavsett om det lyckas eller misslyckas, sluta visa "Registrerar..."
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Registrera dig</h1>

      <form
        onSubmit={handleRegister} // kör handleRegister funktionen vid submit
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
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Lösenord</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)} // uppdatera state vid ändring
            placeholder="********"
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Mejladress</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)} // uppdatera state vid ändring
            placeholder="heaton@cs.se"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <button
          type="submit"
          disabled={loading} // disablar knappen under registrering
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60"
        >
          {/* visar "Registrerar..." om loading är true, annars "Registrera" */}
          {loading ? "Registrerar..." : "Registrera"}
        </button>
      </form>

      <p className="mt-4">
        Har du redan konto?{" "}
        <Link to="/login" className="text-green-600 hover:underline">
          Logga in
        </Link>
        {/* Länk till inloggningssidan */}
      </p>
    </div>
  );
}
