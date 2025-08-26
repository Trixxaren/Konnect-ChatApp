// src/pages/Chat.jsx
// 🧼 HELT FEJK-LÄGE (ingen API): ren CRUD i minnet
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import SideNav from "../components/SideNav";

/* ─────────────────────────────────────────────────────────────────────
   🧠 Kontext & Metafor:
   - Vi kör "studioläge": all data bor i minnet.
   - CRUD = Create/Read/Update/Delete → här använder vi Create + Delete.
   - "Min" användare markeras med userId: "me"; "andra" = "other-user".
   - Fejk-botten svarar slumpmässigt/keyword-baserat med liten delay.
   ───────────────────────────────────────────────────────────────────── */

// 🧼 Enkel sanitering: tar bort < och > och trimmar
const sanitize = (s = "") => String(s).replace(/[<>]/g, "").trim();

// 🎭 Fejkade standardsvar (slumpas när inga keywords matchar)
const FAKE_REPLIES = [
  "Kul! 👌",
  "Berätta mer! 🤔",
  "Låter rimligt.",
  "Haha, sant! 😄",
  "Jag håller med.",
  "Intressant, hur tänker du då?",
  "Kan du ge ett exempel?",
  "Nice! 🙌",
];

// 🔎 Keyword-styrda svar (om texten matchar, välj ett härifrån)
const KEYWORD_REPLIES = [
  {
    test: /hej|tjena|hallå/i,
    replies: ["Hallå där! 👋", "Tjena! Vad gör du?"],
  },
  {
    test: /hejdå|hörs|bye/i,
    replies: ["Hejdå", "Bye bye!", "Vi hörs!"],
  },
  {
    test: /gör|görs/i,
    replies: ["Jag gör ingenting", "Jag kollar på TV", "Chillar bara"],
  },
  {
    test: /är du där|är du kvar/i,
    replies: ["Jag är kvar", "Jag är upptagen"],
  },
];

// 🎲 Välj ett fejk-svar baserat på användarens text
function pickReply(userText) {
  for (const k of KEYWORD_REPLIES) {
    if (k.test.test(userText)) {
      return k.replies[Math.floor(Math.random() * k.replies.length)];
    }
  }
  return FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
}

export default function Chat() {
  const { user, logout } = useAuth();

  // UI-state
  const [openNav, setOpenNav] = useState(false);
  const [sending, setSending] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  // Data-state
  const [messages, setMessages] = useState(() => {
    // 📦 Starta med några seed-meddelanden
    const now = new Date().toISOString();
    return [
      { id: "d1", text: "Hallå där!", createdAt: now, userId: "other-user" },
      {
        id: "d2",
        text: "Layouten först, logik sen 🙌",
        createdAt: now,
        userId: "me",
      },
    ];
  });
  const [input, setInput] = useState("");

  // Auto-scroll till botten när listan ändras
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  // Avatar (stabil per användarnamn)
  const avatar = `https://i.pravatar.cc/200?u=${encodeURIComponent(
    user?.username || "guest"
  )}`;

  // Hjälp: min/deras bubblor
  const isMine = (m) => m.userId === "me";
  const rowClass = (m) => `flex ${isMine(m) ? "justify-end" : "justify-start"}`;
  const bubbleClass = (m) =>
    `px-3 py-2 rounded-xl max-w-[75%] ${
      isMine(m) ? "bg-indigo-100" : "bg-gray-100"
    }`;

  // CREATE: skicka nytt meddelande + trigga fejk-svar
  const handleSend = async (e) => {
    e.preventDefault();
    const text = sanitize(input);
    if (!text) return;

    setSending(true);
    try {
      // 1) Lägg in mitt meddelande optimistiskt
      const mine = {
        id: `tmp-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        userId: "me",
      };
      setMessages((prev) => [...prev, mine]);
      setInput("");

      // 2) Fejk-boten “skriver…” och svarar efter en liten delay
      setBotTyping(true);
      const delay = 600 + Math.random() * 900; // 0.6–1.5s
      setTimeout(() => {
        const replyText = pickReply(text);
        const other = {
          id: `demo-${Date.now()}`,
          text: replyText,
          createdAt: new Date().toISOString(),
          userId: "other-user",
        };
        setMessages((prev) => [...prev, other]);
        setBotTyping(false);

        // (Valfritt) ytterligare följdsvar ibland
        if (Math.random() < 0.3) {
          setTimeout(() => {
            const extra = {
              id: `demo-extra-${Date.now()}`,
              text: pickReply(text + " extra"),
              createdAt: new Date().toISOString(),
              userId: "other-user",
            };
            setMessages((prev) => [...prev, extra]);
          }, 1200 + Math.random() * 1200);
        }
      }, delay);
    } catch (err) {
      alert(err.message || "Kunde inte skicka meddelande.");
    } finally {
      setSending(false);
    }
  };

  // DELETE: radera ett meddelande (endast mina)
  const handleDelete = (msg) => {
    if (!isMine(msg)) return; // bara mina bubblor
    if (!confirm("Radera meddelandet?")) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };

  // Demo-lista (memo för att undvika re-skapning i render)
  const demoMessages = useMemo(() => messages, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenNav(true)}
              aria-label="Öppna meny"
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Meny"
            >
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="currentColor">
                <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
              </svg>
            </button>
            <span className="text-xl font-semibold">Konnect Chat</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <main className="bg-white rounded-xl shadow flex flex-col h-[calc(100vh-9rem)]">
          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b">
            {demoMessages.length === 0 ? (
              <p className="text-center text-gray-500">
                Inga meddelanden än. Skriv något nedan!
              </p>
            ) : (
              demoMessages.map((m, idx) => (
                <div
                  key={m.id ?? `${m.createdAt}-${idx}`}
                  className={rowClass(m)}
                >
                  <div className={bubbleClass(m)}>
                    <div className="text-[10px] text-gray-500 mb-0.5 flex items-center justify-between gap-3">
                      <span className="font-semibold">
                        {isMine(m) ? "Du" : "Okänd"}
                      </span>
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {m.text}
                    </div>

                    {isMine(m) && (
                      <div className="text-right mt-1">
                        <button
                          onClick={() => handleDelete(m)}
                          className="text-[11px] text-red-600 hover:underline"
                          title="Radera"
                        >
                          Radera
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* "Skriver…" indikator när botten förbereder svar */}
            {botTyping && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm italic">
                  skriver…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 md:p-4 flex gap-2 items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ett meddelande..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending || sanitize(input).length === 0}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {sending ? "Skickar…" : "Skicka"}
            </button>
          </form>
        </main>
      </div>

      {/* Slide-over sidenav */}
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
