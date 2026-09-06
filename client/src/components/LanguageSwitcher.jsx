// client/src/components/LanguageSwitcher.jsx
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full bg-surface px-1 py-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            i18n.language === lang.code
              ? "bg-saffron text-deep"
              : "text-cream-muted hover:text-cream"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
