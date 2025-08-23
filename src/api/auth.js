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
    body: JSON.stringify({ username, password, email, avatar, csrfToken }), // 🔧 __VIKTIGT__
  });

  if (res.status === 409) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.message || "Kontot finns redan.");
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.message || `Register misslyckades (${res.status}).`);
  }
  // 201 Created – vissa API:n svarar tom body. Vi bryr oss inte om svaret här.
  return true;
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
