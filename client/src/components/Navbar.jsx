import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const navCls = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled || pathname !== "/" ? "bg-deep-2/95 backdrop-blur-md border-b border-surface-3/50" : "bg-transparent"
  }`;

  return (
    <nav className={navCls}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-saffron font-bold tracking-widest">SURANG</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-cream-muted hover:text-cream text-sm font-medium transition-colors">Explore Art</Link>
            <Link to="/cultural-map" className="text-cream-muted hover:text-cream text-sm font-medium transition-colors">Cultural Map</Link>
            {user?.role === "artist" && (
              <Link to="/artist/dashboard" className="text-cream-muted hover:text-cream text-sm font-medium transition-colors">My Dashboard</Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <Link to="/register?role=artist" className="text-saffron text-sm font-medium hover:text-saffron-light transition-colors">
                Sell Art
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/cart" className="relative p-2 text-cream-muted hover:text-cream transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-saffron text-deep text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-surface rounded-full px-3 py-1.5 text-sm text-cream-muted hover:text-cream transition-colors">
                    <div className="w-6 h-6 rounded-full bg-saffron/30 flex items-center justify-center text-saffron text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="max-w-20 truncate">{user.name.split(" ")[0]}</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-surface-2 border border-surface-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {user.role === "buyer" && <Link to="/cart" className="block px-4 py-2.5 text-sm text-cream-muted hover:text-cream hover:bg-surface-3 rounded-t-xl transition-colors">My Orders</Link>}
                    {user.role === "artist" && <Link to="/artist/dashboard" className="block px-4 py-2.5 text-sm text-cream-muted hover:text-cream hover:bg-surface-3 rounded-t-xl transition-colors">Dashboard</Link>}
                    {user.role === "artist" && <Link to="/artist/upload" className="block px-4 py-2.5 text-sm text-cream-muted hover:text-cream hover:bg-surface-3 transition-colors">Upload Art</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-crimson hover:bg-surface-3 rounded-b-xl transition-colors">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-outline text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-saffron text-sm py-2 px-4">Join Free</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-cream-muted" onClick={() => setMenu(!menu)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menu ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menu && (
          <div className="md:hidden bg-surface-2/95 backdrop-blur-md border-t border-surface-3 pb-4">
            <div className="flex flex-col gap-1 pt-2 px-2">
              <Link to="/explore" onClick={() => setMenu(false)} className="px-3 py-2.5 rounded-lg text-cream-muted hover:text-cream hover:bg-surface-3 text-sm transition-colors">Explore Art</Link>
              {user?.role === "artist" && <Link to="/artist/dashboard" onClick={() => setMenu(false)} className="px-3 py-2.5 rounded-lg text-cream-muted hover:text-cream hover:bg-surface-3 text-sm transition-colors">My Dashboard</Link>}
              {user?.role === "artist" && <Link to="/artist/upload" onClick={() => setMenu(false)} className="px-3 py-2.5 rounded-lg text-cream-muted hover:text-cream hover:bg-surface-3 text-sm transition-colors">Upload Art</Link>}
              {user ? (
                <button onClick={() => { handleLogout(); setMenu(false); }} className="mt-2 px-3 py-2.5 rounded-lg text-crimson text-sm text-left">Sign Out</button>
              ) : (
                <div className="flex gap-2 mt-2 px-1">
                  <Link to="/login"    onClick={() => setMenu(false)} className="btn-outline text-sm py-2 px-4 flex-1 text-center">Sign In</Link>
                  <Link to="/register" onClick={() => setMenu(false)} className="btn-saffron text-sm py-2 px-4 flex-1 text-center">Join Free</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
