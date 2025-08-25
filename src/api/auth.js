// 🔧 __NYTT: Litet auth-API som följer Swagger__

/** Hämta CSRF-stämpel */
export async function getCsrf() {
  const res = await fetch("/csrf", {
    method: "PATCH",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CSRF failed: ${res.status}`);
  return res.json(); // { csrfToken: "..." }
}

// src/api/auth.js

/** Registrera användare — kräver csrfToken */
export async function registerUser({
  username,
  password,
  email,
  avatar,
  csrfToken,
}) {
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email, avatar, csrfToken }),
  });

  // ✅ NYTT: läs råtext först (ibland tom), parsa försiktigt
  const raw = await res.text().catch(() => ""); // ✅ NYTT
  let data = null; // ✅ NYTT
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {} // ✅ NYTT

  if (res.ok) {
    // 201 Created – ibland utan body. Allt OK.
    return { ok: true, data }; // 🔧 ÄNDRAT (returnera lite mer info)
  }

  // ✅ NYTT: hämta meddelande från olika fält
  const apiMsg = data?.message || data?.error || raw || "Okänt fel"; // ✅ NYTT

  // ✅ NYTT: klassificera felet
  let code = "unknown"; // ✅ NYTT
  if (res.status === 409) {
    code = "user_exists"; // ✅ NYTT
  } else if (res.status === 400) {
    // Vissa API:er svarar 400 även när kontot redan finns
    if (/exist|already|taken|duplicate|registered/i.test(apiMsg)) {
      code = "user_exists"; // ✅ NYTT
    } else {
      code = "validation"; // ✅ NYTT
    }
  }

  const err = new Error(apiMsg || `Register misslyckades (${res.status}).`); // 🔧 ÄNDRAT
  err.code = code; // ✅ NYTT
  err.status = res.status; // ✅ NYTT
  throw err; // 🔧 ÄNDRAT
}

// Vissa API:er svarar 400 även när kontot redan finns
// 🔧 ÄNDRAT: robust felhantering för login/token
export async function createToken({ username, password, csrfToken }) {
  const res = await fetch("/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password, csrfToken }),
  });

  // Läs body säkert (kan vara tom / inte JSON)
  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {}

  if (res.ok) {
    // { token: "..." }
    return data || {};
  }

  // Plocka fram meddelande
  const apiMsg = data?.message || data?.error || raw || "Login misslyckades.";

  // 🔎 Klassificera
  let code = "unknown";
  if (res.status === 401) code = "invalid_credentials";
  else if (res.status === 400) code = "validation";

  const err = new Error(apiMsg);
  err.code = code;
  err.status = res.status;
  throw err;
}
