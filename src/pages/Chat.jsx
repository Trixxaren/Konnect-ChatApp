import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Chat() {
  const { user, logout } = useAuth(); // hämtar user från AuthContext
  const [messages, setMessages] = useState([]); // lokala meddelanden
  const [input, setInput] = useState("");

  // Skicka nytt meddelande (just nu bara lokalt)
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: user?.username || "Du",
    };

    setMessages((prev) => [...prev, newMessage]); // lägg till nytt i listan
    setInput(""); // rensa fältet
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold">Chatrum</h1>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logga ut
          </button>
        </div>

        {/* Meddelandelista */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              Inga meddelanden än. Skriv något nedan!
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg max-w-[70%] ${
                  msg.sender === user?.username
                    ? "bg-blue-100 self-end ml-auto"
                    : "bg-gray-200"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {msg.sender}
                </span>
                <span>{msg.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Inputfält */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t flex items-center space-x-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv ett meddelande..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Skicka
          </button>
        </form>
      </div>
    </div>
  );
}
