import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();

  const handleLogin = async () => {
    const fakeToken = "123abc";
    const fakeUser = { id: 1, name: "Robin" };
    login(fakeToken, fakeUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Välkommen till Konnect</h1>

      {/* Två knappar sida vid sida */}
      <div className="flex space-x-4">
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Logga in
        </button>
        <Link
          to="/register"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Registrera dig
        </Link>
      </div>
    </div>
  );
}
