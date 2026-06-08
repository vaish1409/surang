import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["confirmed","packed","shipped","out_for_delivery","delivered"];
const STATUS_COLORS  = { confirmed:"text-saffron", packed:"text-gold", shipped:"text-teal", out_for_delivery:"text-teal", delivered:"text-teal", cancelled:"text-crimson" };

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [tab, setTab]         = useState("artworks");
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([
      api.get("/artworks", { params: { artist: user._id, limit: 50 } }),
      api.get("/orders/artist"),
    ]).then(([a,o])=>{ setArtworks(a.data.artworks||[]); setOrders(o.data||[]); })
    .catch(console.error).finally(()=>setLoading(false));
  },[user._id]);

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/artworks/${id}/toggle`);
      setArtworks(p=>p.map(a=>a._id===id?{...a,isAvailable:data.isAvailable}:a));
      toast.success(data.isAvailable?"Listed for sale":"Marked as unavailable");
    } catch(e){ toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this artwork permanently?")) return;
    try {
      await api.delete(`/artworks/${id}`);
      setArtworks(p=>p.filter(a=>a._id!==id));
      toast.success("Artwork deleted");
    } catch(e){ toast.error("Delete failed"); }
  };

  const handleStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(p=>p.map(o=>o._id===orderId?{...o,status}:o));
      toast.success("Status updated");
    } catch(e){ toast.error("Update failed"); }
  };

  const stats = [
    { label:"Artworks Listed", value: artworks.length,                   icon:"🖼️" },
    { label:"Total Sold",      value: artworks.reduce((s,a)=>s+(a.soldCount||0),0), icon:"💰" },
    { label:"Orders Received", value: orders.length,                     icon:"📦" },
    { label:"Verified",        value: user?.isVerified ? "Yes ✓" : "Pending", icon:"✅" },
  ];

  return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-cream font-bold">Artist Dashboard</h1>
            <p className="text-cream-muted text-sm mt-0.5">Welcome back, {user?.name} {user?.isVerified && "✓"}</p>
          </div>
          <Link to="/artist/upload" className="btn-saffron px-6 py-2.5 text-sm font-semibold">+ Upload New Artwork</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s=>(
            <div key={s.label} className="bg-surface-2 border border-surface-3 rounded-2xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-cream">{s.value}</div>
              <div className="text-cream-muted text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit mb-6">
          {["artworks","orders"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?"bg-saffron text-deep":"text-cream-muted hover:text-cream"}`}>{t}</button>
          ))}
        </div>

        {loading ? <div className="text-center py-20 text-cream-muted">Loading…</div> : (
          <>
            {/* Artworks tab */}
            {tab === "artworks" && (
              artworks.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-cream-muted">No artworks yet.</p>
                  <Link to="/artist/upload" className="btn-saffron inline-block mt-4 px-6 py-2.5 text-sm">Upload Your First Artwork</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artworks.map(art=>(
                    <div key={art._id} className="bg-surface rounded-2xl overflow-hidden border border-surface-3/50">
                      <div className="aspect-square overflow-hidden bg-surface-2">
                        {art.images?.[0] ? <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-4xl text-cream-muted/20">🎨</div>}
                      </div>
                      <div className="p-3">
                        <p className="text-cream text-sm font-medium truncate">{art.title}</p>
                        <p className="text-saffron text-sm font-bold">₹{art.price?.toLocaleString("en-IN")}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={()=>handleToggle(art._id)}
                                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all border ${art.isAvailable?"border-teal text-teal hover:bg-teal/10":"border-surface-3 text-cream-muted hover:border-saffron/50"}`}>
                            {art.isAvailable ? "Listed ✓" : "Unlisted"}
                          </button>
                          <button onClick={()=>handleDelete(art._id)} className="px-2.5 py-1.5 text-xs rounded-lg border border-surface-3 text-cream-muted hover:border-crimson hover:text-crimson transition-all">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Orders tab */}
            {tab === "orders" && (
              orders.length === 0 ? (
                <div className="text-center py-20 text-cream-muted">No orders yet. Keep listing your artworks!</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order=>(
                    <div key={order._id} className="bg-surface-2 border border-surface-3 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-cream text-sm font-medium">Buyer: {order.buyer?.name}</p>
                          <p className="text-cream-muted text-xs">{order.buyer?.phone} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-saffron font-bold">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                          <select value={order.status} onChange={e=>handleStatus(order._id,e.target.value)}
                                  className={`input-dark text-xs py-1.5 w-40 ${STATUS_COLORS[order.status]}`}>
                            {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {order.items?.filter(i=>i.artist?.toString()===user._id?.toString()).map((item,idx)=>(
                          <div key={idx} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                            {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover"/>}
                            <span className="text-cream text-xs">{item.title}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-cream-muted">
                        Ship to: {order.shippingAddress?.name} · {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
}
