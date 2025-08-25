import { useEffect } from "react";

export default function SideNav({ open, onClose, user, onLogout, avatarUrl }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const fallback = `https://i.pravatar.cc/200?u=${encodeURIComponent(
    user?.username || "guest"
  )}`;
  const avatar = avatarUrl || user?.avatar || fallback;

  return (
    <div
      className={`fixed inset-0 z-[100] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`
          absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="Avatar"
              className="h-10 w-10 rounded-full border"
            />
            <div className="leading-tight">
              <p className="font-semibold">{user?.username ?? "Användare"}</p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Stäng meny"
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10l-4.95-4.95L5.05 3.636 10 8.586z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">
            Navigation
          </p>
          <ul className="mt-1 space-y-1">
            <li>
              <a
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                href="#"
              >
                Hem
              </a>
            </li>
            <li>
              <a
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                href="#"
              >
                Profil
              </a>
            </li>
            <li>
              <a
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                href="#"
              >
                Inställningar
              </a>
            </li>
          </ul>
        </nav>

        <div className="border-t p-3">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Logga ut
          </button>
        </div>
      </aside>
    </div>
  );
}
