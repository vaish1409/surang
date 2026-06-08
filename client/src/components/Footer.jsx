import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-deep-2 border-t border-surface-3/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-display text-3xl text-saffron font-bold tracking-widest">SURANG</span>
            <p className="font-hindi text-gold text-lg mt-1">हर कला की पहचान</p>
            <p className="text-cream-muted text-sm mt-3 leading-relaxed max-w-xs">
              India's first direct art marketplace. Connecting local artists from every corner of India directly with buyers — no middlemen, full credit, fair prices.
            </p>
            <div className="flex gap-3 mt-5">
              {["Instagram","Twitter","Facebook"].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-cream-muted hover:text-saffron hover:bg-surface-3 transition-colors text-xs">{s[0]}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5">
              {[["All Artworks","/explore"],["Madhubani","/explore?category=Madhubani"],["Warli","/explore?category=Warli"],["Pottery","/explore?category=Pottery"],["Folk Art","/explore?category=Folk+Art"]].map(([l,h])=>(
                <li key={l}><Link to={h} className="text-cream-muted text-sm hover:text-cream transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4 uppercase tracking-wider">Artists</h4>
            <ul className="space-y-2.5">
              {[["Sell Your Art","/register?role=artist"],["Artist Dashboard","/artist/dashboard"],["Upload Artwork","/artist/upload"],["How it Works","/explore"]].map(([l,h])=>(
                <li key={l}><Link to={h} className="text-cream-muted text-sm hover:text-cream transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-3/50 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-cream-muted text-xs">© {new Date().getFullYear()} SURANG. Made with ❤️ for Indian artists.</p>
          <p className="text-cream-muted text-xs">Celebrating the art of Bharat</p>
        </div>
      </div>
    </footer>
  );
}
