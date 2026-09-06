// client/src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./hi.json";
import kn from "./kn.json";

i18n
  .use(LanguageDetector) // auto-detects browser/localStorage language
  .use(initReactI18next) // hooks i18next into React
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      kn: { translation: kn },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "surang_lang",
    },
  });

// Keep <html lang="..."> in sync so CSS can target the right font per
// language (e.g. Kannada needs its own font — see index.css).
document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
