// 🔧 NYTT: Minimalt API-lager för meddelanden (följer samma mönster som auth.js)

import { getCsrf } from "./auth";

/** Hjälp: säkert JSON-parse även om svar är tomt */
function safeJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** 🔧 NYTT: Hämta meddelanden (GET /messages) */
export async function getMessages({ token }) {
  const res = await fetch("/messages", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // 🔑 JWT krävs
    },
  });

  const raw = await res.text().catch(() => "");
  const data = safeJson(raw);

  if (!res.ok) {
    const err = new Error(
      data?.message || `Kunde inte hämta meddelanden (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  // Förväntat: array av messages
  return Array.isArray(data) ? data : [];
}

/** 🔧 NYTT: Skapa meddelande (POST /messages) – kräver CSRF + JWT */
export async function createMessage({ token, text }) {
  const { csrfToken } = await getCsrf(); // stämpel enligt Swagger

  const res = await fetch("/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, csrfToken }), // 🔧 VIKTIGT: skicka CSRF i body (enligt er modell)
  });

  const raw = await res.text().catch(() => "");
  const data = safeJson(raw);

  if (!res.ok) {
    const err = new Error(
      data?.message || `Kunde inte skapa meddelande (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  return data; // ny message
}

/** 🔧 NYTT: Radera meddelande (DELETE /messages/:id) – kräver CSRF + JWT */
export async function deleteMessage({ token, id }) {
  const { csrfToken } = await getCsrf();

  const res = await fetch(`/messages/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ csrfToken }), // om API:et kräver CSRF i body på DELETE
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    const data = safeJson(raw);
    const err = new Error(
      data?.message || `Kunde inte radera (${res.status}).`
    );
    err.status = res.status;
    throw err;
  }
  return true;
}
