import React, { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-surface-2 border border-saffron/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
      <div className="text-2xl">📲</div>
      <div className="flex-1">
        <p className="text-cream text-sm font-semibold">Install SURANG</p>
        <p className="text-cream-muted text-xs mt-0.5">
          Add to your home screen for quick, app-like access.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleInstall}
          className="btn-saffron text-xs py-1.5 px-3 rounded-lg whitespace-nowrap"
        >
          Install
        </button>
        <button
          onClick={() => setVisible(false)}
          className="text-cream-muted text-xs hover:text-cream"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
