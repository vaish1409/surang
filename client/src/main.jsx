import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n/i18n.js";
import { registerSW } from "virtual:pwa-register";
import toast from "react-hot-toast";

const updateSW = registerSW({
  onNeedRefresh() {
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          New version available.
          <button
            onClick={() => {
              updateSW(true);
              toast.dismiss(t.id);
            }}
            className="btn-saffron text-xs py-1.5 px-3 rounded-lg whitespace-nowrap"
          >
            Refresh
          </button>
        </span>
      ),
      { duration: 10000 }
    );
  },
  onOfflineReady() {
    toast.success("SURANG is ready to work offline ✨");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
