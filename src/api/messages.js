// Minimalt API-lager för meddelanden (följer samma mönster som auth.js)

import { getCsrf } from "./auth";

/* Säkert JSON-parse även om svar är tomt
   - Tar en textsträng (kanske tom), försöker JSON.parse
   - Misslyckas parsning eller tom sträng så returnera null (ingen crash) */
function safeJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/* Hämta meddelanden (GET /messages)
   - Kräver endast JWT (Authorization: Bearer ${token})
   - Returnerar en array (eller tom array om servern svarar något annat) */
export async function getMessages({ token }) {
  const res = await fetch("/messages", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // JWT krävs för att "få" meddelanden
    },
  });

  // Läs svaret som text först (kan vara tomt), "försiktigt parse"
  // Metafor: du öppnarett brev och förväntar dig snygt och tryckt papper, men ibland är de tomt och då gör vi en "försiktig parse" för att undvika krascher
  const raw = await res.text().catch(() => "");
  const data = safeJson(raw);

  // Om servern svarar fel (t.ex. 401/403/500) så kör vi ett Error med info
  if (!res.ok) {
    const err = new Error(
      data?.message || `Kunde inte hämta meddelanden (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  // Förväntat är en lista(array) om inte, returnera tom lista så appen inte kraschar
  return Array.isArray(data) ? data : [];
}

/* Skapa meddelande (POST /messages)
   Det krävs CSRF + JWT
     1) Hämta CSRF via getCsrf()
     2) POSTa { text, csrfToken } till /messages
   Returnerar serverns svar (alltså det skapade meddelandet) */

export async function createMessage({ token, text }) {
  const { csrfToken } = await getCsrf(); // 1) hämta CSRF för POST /messages

  const res = await fetch("/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`, //jwt krävs för att skapa meddelande
    },
    body: JSON.stringify({ text, csrfToken }), // text + CSRF i body
  });

  // Parsa svaret säkert (kan vara tomt)
  const raw = await res.text().catch(() => "");
  const data = safeJson(raw);

  // Om något går fel så skickar vi meddelande + statuskod
  if (!res.ok) {
    const err = new Error(
      data?.message || `Kunde inte skapa meddelande (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  return data; // // Lyckat så returnera ev. ny message från servern
}

/** Radera meddelande (DELETE /messages/:id)
    Skickar CSRF + JWT:
      1) Hämta CSRF
      2) DELETE mot /messages/:id, med { csrfToken } i body
      Returnerar true vid lyckad radering */
export async function deleteMessage({ token, id }) {
  // 1) hämta CSRF  för DELETE /messages/:id)
  const { csrfToken } = await getCsrf();

  const res = await fetch(`/messages/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // JWT krävs för att radera meddelande
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ csrfToken }), // CSRF i body
  });

  // Om något går fel, kasta Error med information
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    const data = safeJson(raw);
    const err = new Error(
      data?.message || `Kunde inte radera (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  // Lyckat resultat så returnera true så appen/ui kan uppdatera listan
  return true;
}
