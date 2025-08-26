import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import SideNav from "../components/SideNav";

export default function Chat() {
  const { user, logout } = useAuth();
  const [openNav, setOpenNav] = useState(false);

  // ➡️ Då får varje sträng (Robin, Lisa, Hammlét) en unik men stabil avatar. Det betyder: samma användarnamn → samma avatar varje gång, på alla datorer.

  const avatar = `https://i.pravatar.cc/200?u=${encodeURIComponent(
    // u=${username} → gör avataren personlig per användare
    user?.username || "guest"
  )}`;

  const demoMessages = [
    {
      id: "1",
      author: "Emma",
      text: "Hallå där!",
      createdAt: "10:00",
    },
    {
      id: "2",
      author: user?.username ?? "Du",
      text: "Layouten först, logik sen 🙌",
      createdAt: "10:01",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 🔧 Visas ALLTID (inte md:hidden) */}
            <button
              onClick={() => setOpenNav(true)}
              aria-label="Öppna meny"
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Meny"
            >
              {/* Hamburgarmenyn  */}
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="currentColor">
                <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
              </svg>
            </button>

            <span className="text-xl font-semibold">Konnect Chat</span>
            {/* <span className="hidden sm:inline text-sm text-gray-500">
              / general
            </span> */}
          </div>

          <div className="flex items-center gap-3">
            {/* 🔧 Klick på avatar öppnar också menyn */}
            {/* <img
              src={avatar}
              alt="Avatar"
              className="h-8 w-8 rounded-full border cursor-pointer"
              onClick={() => setOpenNav(true)}
              title="Öppna meny"
            /> */}
            {/* <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Logga ut
            </button> */}
          </div>
        </div>
      </header>

      {/* Content (demo) */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <main className="bg-white rounded-xl shadow flex flex-col h-[calc(100vh-9rem)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b">
            {demoMessages.map((m) => (
              <div key={m.id} className="max-w-[75%]">
                <div className="text-xs text-gray-500 mb-0.5">
                  <span className="font-semibold">{m.author}</span> •{" "}
                  {m.createdAt}
                </div>
                <div className="bg-gray-100 rounded-xl px-3 py-2">{m.text}</div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="p-3 md:p-4 flex gap-2 items-center"
          >
            <input
              placeholder="Skriv ett meddelande..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Skicka
            </button>
          </form>
        </main>
      </div>

      {/* 🔧 Slide-over sidenav */}
      <SideNav
        open={openNav}
        onClose={() => setOpenNav(false)}
        user={user}
        onLogout={logout}
        avatarUrl={avatar}
      />
    </div>
  );
}
