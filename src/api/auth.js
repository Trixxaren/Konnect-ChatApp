// Första steget för att hämta CSRF för att kunnar registrera & logga ina användare

/** Hämta CSRF-stämpel som krävs i register & login*/
export async function getCsrf() {
  const res = await fetch("/csrf", {
    method: "PATCH", //patch för att hämta en ny csrf-token, post/auth/register & post/auth/token kräver csrf-token
    headers: { Accept: "application/json" }, // Vi vill ha JSON tillbaka
  });
  if (!res.ok) throw new Error(`CSRF failed: ${res.status}`);
  return res.json(); // felkod om CCSR misslyckas
}

/** Registrera användare, kräver csrfToken */
export async function registerUser({
  username,
  password,
  email,
  avatar,
  csrfToken,
}) {
  // Skickar POST till /auth/register med användardata
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // vi skickar JSON
    body: JSON.stringify({ username, password, email, avatar, csrfToken }),
  });

  // Läs svaret som text (kan vara tomt ibland)
  const raw = await res.text().catch(() => ""); // om text() misslyckas, returnera tom sträng.catch(() =>"")
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null; // försök tolka texten som JSON
  } catch {}

  if (res.ok) {
    // 201 Created, lyckad registrering
    // { id: 123, username: "...", email: "...", avatar: "
    return { ok: true, data }; // Rreturnera info tillbaka
  }

  // Misslyckad registrering, felhanteringsmeddelande för användaren
  const apiMsg = data?.message || data?.error || raw || "Okänt fel";

  // Klassificera felet (för att kunna ge användaren rätt meddelande)
  let code = "unknown";
  if (res.status === 409) {
    code = "user_exists"; // 409 betyder oftast att användaren finns redan
  } else if (res.status === 400) {
    //400 = "Bad Request" valideringsfel(t.ex. ogiltig email, tomt lösenord etc...)
    if (/exist|already|taken|duplicate|registered/i.test(apiMsg)) {
      code = "user_exists";
    } else {
      code = "validation"; // annars ett valideringsfel (t.ex. ogiltig email etc)
    }
  }
  // Skapa och kasta ett Error-objekt med extra info
  const err = new Error(apiMsg || `Register misslyckades (${res.status}).`);
  err.code = code;
  err.status = res.status;
  throw err;
}

/** Skapa token (login) kräver csrfToken */
export async function createToken({ username, password, csrfToken }) {
  const res = await fetch("/auth/token", {
    method: "POST", // Skickar POST till /auth/token för att logga in
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password, csrfToken }),
  });

  // Läs svaret som text (kan vara tomt / inte JSON)

  const raw = await res.text().catch(() => ""); // om text() misslyckas, returnera tom sträng
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null; // försök tolka texten som JSON
  } catch {}

  if (res.ok) {
    // Lyckad login, returnerar { token: "..." }
    return data || {};
  }

  // Misslyckad login så plockar vi fram felmeddelande
  const apiMsg = data?.message || data?.error || raw || "Login misslyckades.";

  // Klassificera felet (för att kunna ge användaren rätt meddelande)
  let code = "unknown";
  if (res.status === 401) code = "invalid_credentials";
  // 401 = "Unauthorized" felaktiga inloggningsuppgifter
  else if (res.status === 400) code = "validation"; // 400 = "Bad Request" valideringsfel(t.ex. tomt lösenord etc...)

  // Skapa och kasta Error-objekt

  const err = new Error(apiMsg);
  err.code = code;
  err.status = res.status;
  throw err;
}
