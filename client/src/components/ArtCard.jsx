import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ArtCard({ artwork }) {
  const { t } = useTranslation();
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(artwork._id);

  const handleCart = (e) => {
    e.preventDefault();
    if (inCart) return;
    addToCart(artwork);
    toast.success(`${artwork.title} ${t("product.addedToCart")}`);
  };

  return (
    <Link to={`/art/${artwork._id}`} className="art-card block bg-surface rounded-2xl overflow-hidden border border-surface-3/50 group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {artwork.images?.[0] ? (
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-cream-muted/30">🎨</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Quick add to cart on hover */}
        <button
          onClick={handleCart}
          className={`absolute bottom-3 left-3 right-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
            inCart ? "bg-teal text-deep" : "bg-saffron text-deep hover:bg-saffron-dark"
          }`}
        >
          {inCart ? `✓ ${t("product.inCart")}` : t("product.addToCart")}
        </button>
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-deep/70 backdrop-blur text-cream text-[11px] px-2.5 py-1 rounded-full">
          {artwork.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-cream font-semibold text-sm leading-tight line-clamp-1">{artwork.title}</h3>
          <span className="text-saffron font-bold text-sm whitespace-nowrap">₹{artwork.price?.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-cream-muted text-xs">{artwork.artist?.name}</span>
          {artwork.artist?.isVerified && <span className="badge-verified">✓</span>}
        </div>
        <p className="text-cream-muted text-xs mt-0.5">
          {artwork.artist?.city && artwork.artist?.state ? `${artwork.artist.city}, ${artwork.artist.state}` : artwork.artist?.state || ""}
        </p>
      </div>
    </Link>
  );
}
