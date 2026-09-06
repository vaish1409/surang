import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { MAP_VIEWBOX, STATE_PATHS } from "../data/indiaStatePaths";

// Short, factual craft notes for states with a widely-known signature craft.
// States not listed here still work — the panel just shows a generic line.
// English only for now — a future pass could translate these too.
const CRAFT_HERITAGE = {
  "Bihar": "Home of Madhubani painting — intricate line work and natural dyes, traditionally practiced by women and passed down through generations.",
  "Maharashtra": "Birthplace of Warli art — tribal wall paintings that use simple geometric shapes to tell stories of daily and communal life.",
  "Andhra Pradesh": "Known for Kalamkari — hand-painted or block-printed textile art made using natural dyes.",
  "Odisha": "Famous for Pattachitra — intricate cloth-based scroll paintings depicting mythology and folklore.",
  "Rajasthan": "Renowned for Blue Pottery and vibrant Bandhani tie-dye textiles.",
  "Gujarat": "Known for Bandhani tie-dye and the rare, geometric Rogan art of Kutch.",
  "West Bengal": "Home to Kantha embroidery and centuries-old terracotta temple art.",
  "Tamil Nadu": "Known for Tanjore paintings with gold-foil work, and bronze Chola-style sculpture.",
  "Jammu and Kashmir": "Famous for Pashmina weaving and intricate papier-mâché craftsmanship.",
  "Karnataka": "Home to Mysore paintings and traditional sandalwood carving.",
  "Kerala": "Known for temple mural painting and coir-based craft.",
  "Uttar Pradesh": "Famous for Chikankari embroidery and traditional brassware.",
  "Punjab": "Known for Phulkari — vibrant floral embroidery on hand-spun cloth.",
  "Madhya Pradesh": "Home to Gond art — intricate dot-and-line tribal paintings.",
  "Assam": "Famous for Muga silk weaving, a golden silk unique to this region.",
  "Manipur": "Known for hand-woven Moirang Phee textiles and bamboo craft.",
};

export default function CulturalMap() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [counts, setCounts]   = useState({});
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered]   = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/artworks/meta/state-counts");
        const map = {};
        data.forEach(({ state, count }) => { map[state] = count; });
        setCounts(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(counts)),
    [counts]
  );

  const fillFor = (name) => {
    const c = counts[name] || 0;
    if (c === 0) return "rgba(255,248,240,0.06)";
    const intensity = 0.35 + (c / maxCount) * 0.65;
    return `rgba(230,126,34,${intensity})`;
  };

  const activeState    = hovered || selected;
  const activeCount    = activeState ? counts[activeState] || 0 : null;
  const activeHeritage = activeState ? CRAFT_HERITAGE[activeState] : null;

  return (
    <div className="min-h-screen bg-deep">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-cream font-bold">{t("culturalMap.title")}</h1>
          <p className="text-cream-muted text-sm mt-2 max-w-xl mx-auto">
            {t("culturalMap.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          {/* Map */}
          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-4 sm:p-6">
            <svg viewBox={MAP_VIEWBOX} className="w-full h-auto select-none">
              {STATE_PATHS.map((s) => (
                <path
                  key={s.name}
                  d={s.d}
                  fill={fillFor(s.name)}
                  stroke={hovered === s.name || selected === s.name ? "#FFA630" : "#443a6b"}
                  strokeWidth={hovered === s.name || selected === s.name ? 2 : 1}
                  fillRule="evenodd"
                  className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={() => setHovered(s.name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(s.name)}
                >
                  <title>{s.name}</title>
                </path>
              ))}
            </svg>
            <div className="flex items-center gap-4 mt-4 text-xs text-cream-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(255,248,240,0.06)" }} />
                {t("culturalMap.noListings")}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(230,126,34,0.75)" }} />
                {t("culturalMap.activeArtisans")}
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 min-h-[280px] flex flex-col">
            {!activeState ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-cream-muted">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-sm">{t("culturalMap.hoverPrompt")}</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl text-cream font-bold">{activeState}</h3>
                <p className="text-saffron text-sm font-medium mt-1">
                  {activeCount > 0
                    ? t("culturalMap.artworksListed", { count: activeCount })
                    : t("culturalMap.beFirst")}
                </p>
                <p className="text-cream-muted text-sm mt-4 leading-relaxed flex-1">
                  {activeHeritage || t("culturalMap.genericHeritage")}
                </p>
                <button
                  onClick={() => navigate(`/explore?state=${encodeURIComponent(activeState)}`)}
                  className="btn-saffron mt-4 py-2.5 rounded-xl font-medium"
                >
                  {t("culturalMap.browseButton")}
                </button>
              </>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-center text-cream-muted text-sm mt-6">{t("culturalMap.loading")}</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
