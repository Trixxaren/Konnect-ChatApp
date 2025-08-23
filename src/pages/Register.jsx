import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Registrera dig</h1>
      <p className="mb-8">Registreringssidan är under konstruktion.</p>

      {/* Två knappar sida vid sida */}
      <div className="flex space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Logga in
        </Link>
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Registrera dig
        </button>
      </div>
    </div>
  );
}
