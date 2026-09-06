import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const exploreLinks = [
    [t("footer.allArtworks"), "/explore"],
    ["Madhubani", "/explore?category=Madhubani"],
    ["Warli", "/explore?category=Warli"],
    ["Pottery", "/explore?category=Pottery"],
    ["Folk Art", "/explore?category=Folk+Art"],
  ];
  const artistLinks = [
    [t("footer.sellYourArt"), "/register?role=artist"],
    [t("footer.artistDashboard"), "/artist/dashboard"],
    [t("footer.uploadArtwork"), "/artist/upload"],
    [t("footer.howItWorks"), "/explore"],
  ];

  return (
    <footer className="bg-deep-2 border-t border-surface-3/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-display text-3xl text-saffron font-bold tracking-widest">SURANG</span>
            <p className="font-hindi text-gold text-lg mt-1">हर कला की पहचान</p>
            <p className="text-cream-muted text-sm mt-3 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3 mt-5">
              {["Instagram","Twitter","Facebook"].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-cream-muted hover:text-saffron hover:bg-surface-3 transition-colors text-xs">{s[0]}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4 uppercase tracking-wider">{t("footer.exploreHeading")}</h4>
            <ul className="space-y-2.5">
              {exploreLinks.map(([l,h])=>(
                <li key={h}><Link to={h} className="text-cream-muted text-sm hover:text-cream transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4 uppercase tracking-wider">{t("footer.artistsHeading")}</h4>
            <ul className="space-y-2.5">
              {artistLinks.map(([l,h])=>(
                <li key={h}><Link to={h} className="text-cream-muted text-sm hover:text-cream transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-3/50 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-cream-muted text-xs">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p className="text-cream-muted text-xs">{t("footer.celebrating")}</p>
        </div>
      </div>
    </footer>
  );
}
