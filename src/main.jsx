import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

// BrowserRouter som ger hela appen routing-funktionalitet.
// Så vi kan använda <Routes>, <Route>, <Navigate> osv. i App.jsx)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider lägger AuthContext runt appen.
          Det betyder att vi kan nå token, user, login, logout 
          från vilken komponent som helst i App. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
