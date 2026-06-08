import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TABS = ["overview","users","artworks","orders"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]       = useState("overview");
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get("/admin/stats").then(r=>setStats(r.data)).catch(console.error).finally(()=>setLoading(false));
  },[]);

  const fetchTab = async (t) => {
    setTab(t); setLoading(true);
    try {
      if (t==="users")    { const r = await api.get("/admin/users");    setUsers(r.data); }
      if (t==="artworks") { const r = await api.get("/admin/artworks"); setArtworks(r.data); }
      if (t==="orders")   { const r = await api.get("/admin/orders");   setOrders(r.data); }
    } catch(e){ toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const blockUser = async (id) => {
    const u = await api.patch(`/admin/users/${id}/block`);
    setUsers(p=>p.map(x=>x._id===id?u.data:x));
    toast.success("User status updated");
  };

  const verifyArtist = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    setUsers(p=>p.map(x=>x._id===id?{...x,isVerified:true}:x));
    toast.success("Artist verified ✓");
  };

  const removeArtwork = async (id) => {
    if (!window.confirm("Remove this artwork?")) return;
    await api.patch(`/admin/artworks/${id}/remove`);
    setArtworks(p=>p.filter(a=>a._id!==id));
    toast.success("Artwork removed");
  };

  const featureArtwork = async (id) => {
    const r = await api.patch(`/admin/artworks/${id}/feature`);
    setArtworks(p=>p.map(a=>a._id===id?r.data:a));
    toast.success(r.data.isFeatured ? "Artwork featured!" : "Feature removed");
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Admin Header */}
      <header className="bg-deep-2/95 border-b border-surface-3 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <span className="font-display text-xl text-saffron font-bold tracking-widest">SURANG</span>
          <span className="ml-3 text-xs text-cream-muted uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-cream-muted text-sm">{user?.name}</span>
          <button onClick={()=>{logout();navigate("/");}} className="text-crimson text-sm hover:underline">Sign Out</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit mb-8">
          {TABS.map(t=>(
            <button key={t} onClick={()=>fetchTab(t)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?"bg-saffron text-deep":"text-cream-muted hover:text-cream"}`}>{t}</button>
          ))}
        </div>

        {loading && <div className="text-center py-20 text-cream-muted">Loading…</div>}

        {/* Overview */}
        {!loading && tab==="overview" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:"Total Users",    value: stats.users,    icon:"👥", color:"text-teal" },
              { label:"Total Artworks", value: stats.artworks, icon:"🖼️", color:"text-saffron" },
              { label:"Total Orders",   value: stats.orders,   icon:"📦", color:"text-gold" },
              { label:"Revenue (₹)",    value: `₹${(stats.revenue||0).toLocaleString("en-IN")}`, icon:"💰", color:"text-teal" },
            ].map(s=>(
              <div key={s.label} className="bg-surface-2 border border-surface-3 rounded-2xl p-6">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-cream-muted text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {!loading && tab==="users" && (
          <div className="space-y-2">
            {users.map(u=>(
              <div key={u._id} className="bg-surface-2 border border-surface-3 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cream font-medium text-sm">{u.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role==="artist"?"border-saffron/40 text-saffron bg-saffron/10":u.role==="admin"?"border-crimson/40 text-crimson bg-crimson/10":"border-surface-3 text-cream-muted"}`}>{u.role}</span>
                    {u.isVerified && <span className="badge-verified">✓ Verified</span>}
                    {u.isBlocked  && <span className="text-xs text-crimson bg-crimson/10 border border-crimson/30 px-2 py-0.5 rounded-full">Blocked</span>}
                  </div>
                  <p className="text-cream-muted text-xs mt-0.5">{u.email} · {u.state}</p>
                </div>
                <div className="flex gap-2">
                  {u.role==="artist" && !u.isVerified && (
                    <button onClick={()=>verifyArtist(u._id)} className="text-xs text-teal border border-teal/40 bg-teal/10 px-3 py-1.5 rounded-lg hover:bg-teal/20 transition-colors">Verify Artist</button>
                  )}
                  {u.role!=="admin" && (
                    <button onClick={()=>blockUser(u._id)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${u.isBlocked?"border-teal/40 text-teal bg-teal/10 hover:bg-teal/20":"border-crimson/40 text-crimson bg-crimson/10 hover:bg-crimson/20"}`}>
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Artworks */}
        {!loading && tab==="artworks" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map(art=>(
              <div key={art._id} className="bg-surface rounded-2xl overflow-hidden border border-surface-3/50">
                <div className="aspect-square overflow-hidden bg-surface-2">
                  {art.images?.[0] ? <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-4xl text-cream-muted/20">🎨</div>}
                </div>
                <div className="p-3">
                  <p className="text-cream text-xs font-medium truncate">{art.title}</p>
                  <p className="text-cream-muted text-xs">{art.artist?.name}</p>
                  <p className="text-saffron text-xs font-bold mt-1">₹{art.price?.toLocaleString("en-IN")}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={()=>featureArtwork(art._id)} className={`flex-1 py-1 text-[10px] rounded font-medium transition-all border ${art.isFeatured?"border-gold text-gold bg-gold/10":"border-surface-3 text-cream-muted hover:border-gold/40"}`}>
                      {art.isFeatured?"★ Featured":"Feature"}
                    </button>
                    <button onClick={()=>removeArtwork(art._id)} className="px-2 py-1 text-[10px] rounded border border-crimson/40 text-crimson hover:bg-crimson/10 transition-colors">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {!loading && tab==="orders" && (
          <div className="space-y-3">
            {orders.map(order=>(
              <div key={order._id} className="bg-surface-2 border border-surface-3 rounded-xl px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-cream text-sm font-medium">{order.buyer?.name} <span className="text-cream-muted font-normal">({order.buyer?.email})</span></p>
                    <p className="text-cream-muted text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.items?.length} item{order.items?.length>1?"s":""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-saffron font-bold">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${order.status==="delivered"?"border-teal/40 text-teal bg-teal/10":order.status==="cancelled"?"border-crimson/40 text-crimson bg-crimson/10":"border-saffron/40 text-saffron bg-saffron/10"}`}>{order.status?.replace("_"," ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
