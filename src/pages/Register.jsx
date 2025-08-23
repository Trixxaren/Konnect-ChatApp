// 🔧 __NYTT: imports__
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getCsrf, registerUser, createToken } from "../api/auth"; // 🔧 __NYTT__

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // En enkel default-avatar (Swagger säger avatar är valfri)
  const defaultAvatar =
    "https://api.dicebear.com/9.x/identicon/svg?seed=" +
    encodeURIComponent(username || "guest");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) CSRF
      const { csrfToken } = await getCsrf(); // 🔧 __NYTT__

      // 2) Register — enligt Swagger kräver csrfToken i body
      await registerUser({
        username,
        password,
        email,
        avatar: defaultAvatar, // 🔧 __NYTT: skicka något vettigt eller låt user välja__
        csrfToken,
      });

      // 3) Skapa JWT token (”login”)
      const { token } = await createToken({ username, password, csrfToken }); // 🔧 __NYTT__

      // 4) Spara i AuthContext och hoppa till chat
      const user = { username, email, avatar: defaultAvatar }; // Anpassa om API returnerar user-objekt någonstans
      login(token, user); // sparar i localStorage etc.
      navigate("/chat");
    } catch (err) {
      console.error("Register flow error:", err);
      alert(err.message || "Något gick fel vid registrering.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Registrera dig</h1>

      {/* 🔧 __ÄNDRAT: onSubmit hanteras i React__ */}
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
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Lösenord</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            name="password"
            type="password" // 🔧 __ÄNDRAT__
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Mejladress</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="heaton@cs.se"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Registrerar..." : "Registrera"}
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
