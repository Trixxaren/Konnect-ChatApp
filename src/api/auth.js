// kod för att hämta CSRF-token
export async function fetchCsrfToken() {
  const response = await fetch("https://chatify-api.up.railway.app/csrf", {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }
  const data = await res.json(); // Gör om svaret från text -> JS-objekt
  return data.csrfToken; // Returnera bara själva token-strängen (enkelt att använda)
}
