import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ArtDetail() {
  const { t } = useTranslation();
  const { id }   = useParams();
  const { addToCart, isInCart } = useCart();
  const [art, setArt]     = useState(null);
  const [img, setImg]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/artworks/${id}`).then(r=>{setArt(r.data);setLoading(false);}).catch(()=>setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-saffron border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!art) return <div className="min-h-screen bg-deep flex items-center justify-center text-cream-muted">{t("product.notFound")}</div>;

  const inCart = isInCart(art._id);

  return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <nav className="text-sm text-cream-muted mb-8">
          <Link to="/" className="hover:text-cream">{t("product.breadcrumbHome")}</Link> &rsaquo; <Link to="/explore" className="hover:text-cream">{t("nav.explore")}</Link> &rsaquo; <span className="text-cream">{art.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface mb-3">
              {art.images?.[img] ? (
                <img src={art.images[img]} alt={art.title} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-cream-muted/20">🎨</div>
              )}
            </div>
            {art.images?.length > 1 && (
              <div className="flex gap-2">
                {art.images.map((src,i)=>(
                  <button key={i} onClick={()=>setImg(i)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${img===i?"border-saffron":"border-transparent"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-saffron bg-saffron/10 border border-saffron/30 rounded-full px-3 py-1">{art.category}</span>
              <h1 className="font-display text-3xl text-cream font-bold mt-3 leading-tight">{art.title}</h1>
              {art.artStyle && <p className="text-cream-muted text-sm mt-1">{t("product.style")}: {art.artStyle}</p>}
            </div>

            <div className="text-4xl font-bold text-saffron">
              ₹{art.price?.toLocaleString("en-IN")}
              {!art.isAvailable && <span className="ml-3 text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-full px-3 py-1">{t("product.sold")}</span>}
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-surface-3">
              <div className="w-12 h-12 rounded-full bg-saffron/20 flex items-center justify-center text-saffron text-lg font-bold">
                {art.artist?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cream font-medium">{art.artist?.name}</span>
                  {art.artist?.isVerified && <span className="badge-verified">✓ {t("product.verified")}</span>}
                </div>
                <p className="text-cream-muted text-xs mt-0.5">{art.artist?.city && `${art.artist.city}, `}{art.artist?.state}</p>
                {art.artist?.artSpecialties?.length > 0 && (
                  <p className="text-cream-muted text-xs">{art.artist.artSpecialties.join(" • ")}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-cream font-semibold mb-2">{t("product.aboutArtwork")}</h3>
              <p className="text-cream-muted text-sm leading-relaxed">{art.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {art.dimensions && <div className="bg-surface p-3 rounded-lg"><p className="text-cream-muted text-xs">{t("product.dimensions")}</p><p className="text-cream mt-0.5">{art.dimensions}</p></div>}
              {art.medium     && <div className="bg-surface p-3 rounded-lg"><p className="text-cream-muted text-xs">{t("product.medium")}</p><p className="text-cream mt-0.5">{art.medium}</p></div>}
              {art.shipsFrom?.state && <div className="bg-surface p-3 rounded-lg"><p className="text-cream-muted text-xs">{t("product.shipsFrom")}</p><p className="text-cream mt-0.5">{art.shipsFrom.city}, {art.shipsFrom.state}</p></div>}
              <div className="bg-surface p-3 rounded-lg"><p className="text-cream-muted text-xs">{t("product.views")}</p><p className="text-cream mt-0.5">{art.views}</p></div>
            </div>

            {art.isAvailable && (
              <div className="flex gap-3 mt-2">
                <button onClick={()=>{addToCart(art);toast.success(t("product.addedToCart"));}}
                        disabled={inCart}
                        className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
                          inCart ? "bg-teal/20 text-teal border border-teal/40 cursor-default" : "btn-saffron"
                        }`}>
                  {inCart ? `✓ ${t("product.inCart")}` : t("product.addToCart")}
                </button>
                <Link to="/cart" className="btn-outline py-3 px-6 rounded-xl font-semibold text-base">{t("product.buyNow")}</Link>
              </div>
            )}
            {art.artist?.phone && (
              <a href={`https://wa.me/91${art.artist.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 text-teal text-sm hover:underline mt-1">
                <span>💬</span> {t("product.contactWhatsapp")}
              </a>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}