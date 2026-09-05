import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function CulturalMap() {
  const [stats, setStats]     = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/artworks/stats/by-state")
      .then(({ data }) => {
        const map = {};
        (data.stateStats || []).forEach(row => { map[row.state] = row; });
        setStats(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lookup = (name) => {
    const base = stats[name];
    if (name === "Andhra Pradesh" && stats["Telangana"]) {
      return {
        name,
        artworkCount: (base?.artworkCount || 0) + stats["Telangana"].artworkCount,
        topCategory: base?.topCategory || stats["Telangana"].topCategory,
        includesTelangana: true,
      };
    }
    return base ? { name, ...base } : { name, artworkCount: 0, topCategory: null };
  };
  const active = selected;

  return (
    <div className="min-h-screen bg-deep">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <h1 className="font-display text-3xl text-cream font-bold mb-2">Cultural Map of India</h1>
        <p className="text-cream-muted text-sm mb-8">
          Every lit-up state has real artisans selling on SURANG right now. Click a state to explore its craft.
        </p>

        {loading ? (
          <div className="text-center py-20 text-cream-muted">Loading map…</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-2 border border-surface-3 rounded-2xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {STATES.map((name) => {
                  const info = lookup(name);
                  return (
                    <button key={name} onClick={() => setSelected(info)}
                            className={`text-left px-3 py-3 rounded-lg border transition-colors ${
                              info.artworkCount > 0
                                ? "border-saffron/60 bg-saffron/10 text-cream hover:bg-saffron/20"
                                : "border-surface-3 text-cream-muted hover:border-saffron/40 hover:text-cream"
                            }`}>
                      <span className="block text-sm font-medium">{name}</span>
                      <span className="block text-xs mt-1 opacity-70">
                        {info.artworkCount ? `${info.artworkCount} artwork${info.artworkCount !== 1 ? "s" : ""}` : "No artworks yet"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6">
              {active ? (
                <>
                  <h3 className="text-cream font-semibold text-lg">{active.name}{active.includesTelangana && " & Telangana"}</h3>
                  {active.artworkCount > 0 ? (
                    <>
                      <p className="text-cream-muted text-sm mt-2">{active.artworkCount} artwork{active.artworkCount !== 1 && "s"} listed</p>
                      {active.topCategory && (
                        <p className="text-cream-muted text-sm mt-1">Best known here: <span className="text-saffron font-medium">{active.topCategory}</span></p>
                      )}
                      <Link to={`/explore?state=${encodeURIComponent(active.name)}`}
                            className="btn-saffron inline-block mt-4 px-5 py-2 text-sm">
                        Browse artworks from here →
                      </Link>
                    </>
                  ) : (
                    <p className="text-cream-muted text-sm mt-2">No artisans listed from here yet.</p>
                  )}
                </>
              ) : (
                <p className="text-cream-muted text-sm">Hover or click a state to see its craft.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}