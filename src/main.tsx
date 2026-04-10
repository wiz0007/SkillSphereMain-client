import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";
import 'remixicon/fonts/remixicon.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);

