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

/** Byt inlogg till JWT — kräver csrfToken */
export async function createToken({ username, password, csrfToken }) {
  const res = await fetch("/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password, csrfToken }), // 🔧 __VIKTIGT__
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.message || `Token misslyckades (${res.status}).`);
  }
  return res.json(); // { token: "..." }
}
