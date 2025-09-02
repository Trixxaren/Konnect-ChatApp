import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import SideNav from "../components/SideNav";
import { getMessages, createMessage, deleteMessage } from "../api/messages";

/* Enkel sanitering som stoppar HTML taggar + trimmar whitespace */
const sanitize = (s = "") => String(s).replace(/[<>]/g, "").trim();

/* LocalStorag nyckel för att minnas vilka message-id som är mina */
const MY_IDS_KEY = "myMessageIds";

/* Helpers att lagra/läsa "mina ids" fungerar vid refresh) */
function loadMyIds() {
  try {
    const raw = localStorage.getItem(MY_IDS_KEY); // läs från localStorage
    return new Set(raw ? JSON.parse(raw) : []); // gör om till Set av id:n eller tom Set om inget finns
  } catch {
    return new Set(); // vid fel, retunera set, som är en datastruktur som bara lagrar unika värden, perfekt för att hålla reda på vilka meddelande-ID:n som tillhör användaren utan dubbletter.
  }
}
function saveMyIds(set) {
  // tar emot en Set av id:n och sparar den i localStorage
  try {
    localStorage.setItem(MY_IDS_KEY, JSON.stringify([...set])); // gör om Set till array och sen till JSON-sträng för lagring
  } catch {}
}

/* Keyword bot, lokalt */
const KEYWORD_REPLIES = [
  {
    test: /hej|tjena|hallå/i,
    replies: ["Hallå där!", "Tjena! Vad gör du?"],
  },
  { test: /hejdå|hörs|bye/i, replies: ["Hejdå!", "Vi hörs!", "Bye bye!"] },
  {
    test: /Vad gör du|Vad händer|dudå/i,
    replies: ["Käkar Pizza", "Spelar CS", "Ingenting, dudå?"],
  },
  {
    test: /Bugg|Error|fel/i,
    replies: ["Fråga Degen, han löser!"],
  },
];
const FALLBACK_REPLIES = [
  // generella svar om inget keyword matchar
  "Kul!",
  "Låter bra.",
  "Okej, jag fattar.",
  "Berätta mer!",
  "Nice!",
];

// Välj ett botsvar utifrån text annars fallback reply
function pickReply(text) {
  for (const r of KEYWORD_REPLIES) {
    // kolla alla keywords
    if (r.test.test(text)) {
      // om matchar välja slumpmässigt reply
      const list = r.replies; // lista av möjliga svar
      return list[Math.floor(Math.random() * list.length)]; // slumpa fram ett svar
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

export default function Chat() {
  const { user, token, logout } = useAuth();

  // UI state
  const [openNav, setOpenNav] = useState(false); // sidomeny
  const [loading, setLoading] = useState(true); // visar "Laddar…" medan GET pågår
  const [sending, setSending] = useState(false); // disablar "Skicka" under POST
  const [botTyping, setBotTyping] = useState(false);

  // Data state
  const [messages, setMessages] = useState([]); // start tom lista av meddelanden
  const [input, setInput] = useState(""); // text-input i formuläret, tom från början

  // Mina message id över refresh, useRef så det inte nollställs vid render (lagra)
  const myIdsRef = useRef(loadMyIds());

  // För att undvika dubbel bot i StrictMode // ev ta bort StrictMode som jag gjort just nu.
  const botTimerRef = useRef(null);

  // Auto scroll till botten
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  // Avatar för SideNav som sparas under varje User
  const avatar = `https://i.pravatar.cc/200?u=${encodeURIComponent(
    user?.username || "guest"
  )}`;

  /* HÄMTA ALLA MEDDELANDEN (GET /messages) när token ändras */
  useEffect(() => {
    if (!token) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // API-lager sköter Authorization header + ev. CSRF
        const items = await getMessages({ token });
        if (!alive) return;

        // Normalisera fält försiktigt så UI inte kraschar, för samma struktur, id, text, CreatedAT, userId, sender
        const normalized = (items ?? []).map((m, i) => ({
          id: m.id ?? i, // fallback key
          text: m.text ?? m.content ?? "", // textfält
          createdAt: m.createdAt ?? new Date().toISOString(),
          userId: m.userId ?? null, // ev. userId från backend om det finns
          sender: m.sender ?? m.user ?? null, // ev. namn/avsändare
        }));

        setMessages(normalized); // lägg i state för visning på appen
      } catch (err) {
        alert(err.message || "Kunde inte hämta meddelanden.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  /* Tar fram vem som skickade, användarnamnet från backended (den registrerade personen) */
  const authorName = (m) =>
    m.sender?.username ||
    m.sender ||
    m.user?.username ||
    m.user ||
    m.author ||
    null;

  /*  Är meddelandet "mitt" matcha namn (sender/user == user.username), som sista steg så kollar vi om id finns i"mina ids" (sparades när du postade) */
  const isMine = (m) => {
    const name = authorName(m); // kolla alla varianter av namn
    if (name && user?.username && String(name) === String(user.username))
      return true;
    if (m.userId && user?.id && String(m.userId) === String(user.id))
      return true;
    if (m.id && myIdsRef.current.has(String(m.id))) return true;
    return false;
  };

  // Variablar för att visa mina/andras för höger/vänster chat bubblor i chatten
  const rowClass = (m) => `flex ${isMine(m) ? "justify-end" : "justify-start"}`; // Enkel flexbox rad för att visa höger/vänster "chatt bubblor"
  const bubbleClass = (m) =>
    `px-3 py-2 rounded-xl max-w-[75%] ${
      isMine(m) ? "bg-indigo-100" : "bg-gray-100"
    }`;

  /* SKICKA (POST /messages) */
  const handleSend = async (e) => {
    e.preventDefault(); // prevent Default så sidan inte refresar

    const text = sanitize(input); // sanitering (ta bort HTML taggar + trimma)
    if (!text) return; // inget att skicka
    if (sending) return; // undvik dubbelklick

    setSending(true);
    try {
      // Skicka till servern (API-lager lägger på JWT + CSRF)
      // Får tillbaka det skapade meddelandet (med id, text, createdAt, userId, sender)
      const created = await createMessage({ token, text });

      // En del varianter av API:t returnerar { latestMessage }, andra bara objektet
      const serverMsg = created?.latestMessage ?? created;

      // Normalisera objekt till appens format
      // Om servern inte returnerar allt, fyll på med det vi har
      // (id, text, createdAt, userId, sender) för att undvika UI-krasch
      // Om servern inte returnerar id, text, createdAt så skapar vi egna
      const newMsg = {
        id: serverMsg?.id ?? Date.now(),
        text: serverMsg?.text ?? text,
        createdAt: serverMsg?.createdAt ?? new Date().toISOString(),
        userId: serverMsg?.userId ?? null,
        sender: user?.username || "me",
      };

      // Markera detta id som mitt (sparas i localStorage, funkar efter refresh)
      myIdsRef.current.add(String(newMsg.id));
      saveMyIds(myIdsRef.current);

      // Lägg i chatten + töm input
      setMessages((prev) => [...prev, newMsg]);
      setInput("");

      // Lokal bot svarar efter kort delay
      triggerBotReply(text);
    } catch (err) {
      alert(err.message || "Kunde inte skicka meddelande.");
    } finally {
      setSending(false);
    }
  };

  /* Boten "skriver…" och svarar efter kort delay */
  const triggerBotReply = (userText) => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    setBotTyping(true);

    const delay = 600 + Math.random() * 900; // 0.6–1.5 s
    botTimerRef.current = setTimeout(() => {
      const reply = {
        id: `bot-${Date.now()}`, // unikt id
        text: pickReply(userText), // välj ett svar
        createdAt: new Date().toISOString(), // nu som tid
        userId: null, // bot har inget userId
        sender: "Degen", // avsändare är "Bot"
      };
      setMessages((prev) => [...prev, reply]); // lägg till i chatten
      setBotTyping(false); // sluta visa "skriver…" för att boten han svarat
    }, delay);
  };

  // Rensa ev. timers om komponenten avmonteras
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current); // rensa timer om den finns
    };
  }, []);

  /* RADERA (DELETE /messages/:id) bara mina logiskt. */
  const handleDelete = async (msg) => {
    // tar emot hela message objektet
    if (!isMine(msg)) return; // säkerställ att det är mitt meddelande
    if (!confirm("Återkalla meddelandet?")) return; // bekräfta med användaren
    // Radera på servern, lägger på JWT + CSRF för att radera

    try {
      await deleteMessage({ token, id: msg.id }); // skicka id
      // Ta bort lokalt i chatten
      setMessages((prev) => prev.filter((m) => m.id !== msg.id)); // ta bort från state
      // Ta bort från "mina ids" också
      myIdsRef.current.delete(String(msg.id)); // ta bort från set i ref
      saveMyIds(myIdsRef.current); // spara uppdaterad set i localStorage
    } catch (err) {
      alert(err.message || "Kunde inte radera meddelandet."); // felhantering
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenNav(true)} // öppna sidomeny
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
          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b">
            {loading ? (
              <p className="text-center text-gray-500">Laddar meddelanden…</p> // visar medan GET /messages pågår
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">Börja chatta!</p> // visar om inga meddelanden finns
            ) : (
              messages.map(
                (
                  m,
                  idx // visa alla meddelanden
                ) => (
                  <div key={m.id ?? idx} className={rowClass(m)}>
                    {" "}
                    {/* rad höger/vänster */}
                    <div className={bubbleClass(m)}>
                      {/* Namn + klocka */}
                      <div className="text-[10px] text-gray-500 mb-0.5 flex items-center justify-between gap-3">
                        <span className="font-semibold">
                          {isMine(m)
                            ? authorName(m) || `${user?.username}` // visa "mitt" namn (username)
                            : authorName(m) || "Degen"}
                        </span>
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            // visa tid HH:MM
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Själva texten */}
                      <div className="whitespace-pre-wrap break-words">
                        {m.text}
                      </div>

                      {/* Radera (enbart mina) */}
                      {isMine(m) && (
                        <div className="text-right mt-1">
                          <button
                            onClick={() => handleDelete(m)} // handleDelete med message objektet
                            className="text-[11px] text-red-600 hover:underline"
                            title="Återkalla detta meddelande"
                          >
                            Återkalla
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}

            {/* Bots "skriver…" */}
            {botTyping && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm italic">
                  skriver…
                </div>
              </div>
            )}

            {/* Scroll-ankare */}
            <div ref={bottomRef} />
          </div>

          {/* Composer?  */}
          <form
            onSubmit={handleSend} // hantera skicka
            className="p-3 md:p-4 flex gap-2 items-center"
          >
            <input
              value={input} // hantera input
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ett meddelande..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending || sanitize(input).length === 0} // disablar om skickar eller tom input
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {sending ? "Skickar…" : "Skicka"}
            </button>
          </form>
        </main>
      </div>

      {/* SideNav (avatar & logout) */}
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
