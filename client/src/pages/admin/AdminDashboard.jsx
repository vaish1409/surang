import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TABS = ["overview","users","artworks","orders"];
const ROLE_FILTERS   = ["all","buyer","artist"];
const STATUS_FILTERS = ["all","pending","verified","blocked"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]       = useState("overview");
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId]     = useState(null); // which user's verify form is open
  const [docId, setDocId]               = useState("");
  const [notes, setNotes]               = useState("");

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

  const visibleUsers = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter === "pending"  && (u.isVerified || u.isBlocked)) return false;
    if (statusFilter === "verified" && !u.isVerified) return false;
    if (statusFilter === "blocked"  && !u.isBlocked) return false;
    return true;
  });

  const openVerifyForm = (u) => {
    setExpandedId(u._id);
    setDocId(u.verificationDocId || "");
    setNotes(u.verificationNotes || "");
  };

  const confirmVerify = async (id) => {
    try {
      const r = await api.patch(`/admin/users/${id}/verify`, {
        verificationDocId: docId,
        verificationNotes: notes,
      });
      setUsers(p => p.map(x => x._id === id ? r.data : x));
      setExpandedId(null);
      toast.success("Verified ✓");
    } catch { toast.error("Couldn't verify — try again"); }
  };

  const unverifyUser = async (id) => {
    if (!window.confirm("Revoke this user's verification?")) return;
    try {
      const r = await api.patch(`/admin/users/${id}/unverify`);
      setUsers(p => p.map(x => x._id === id ? r.data : x));
      toast.success("Verification revoked");
    } catch { toast.error("Couldn't update — try again"); }
  };

  const blockUser = async (id) => {
    try {
      const r = await api.patch(`/admin/users/${id}/block`);
      setUsers(p => p.map(x => x._id === id ? r.data : x));
      toast.success("User status updated");
    } catch { toast.error("Couldn't update — try again"); }
  };

  const removeArtwork = async (id) => {
    if (!window.confirm("Hide this artwork from buyers?")) return;
    try {
      await api.patch(`/admin/artworks/${id}/remove`);
      setArtworks(p => p.map(a => a._id === id ? { ...a, isAvailable: false } : a));
      toast.success("Artwork hidden");
    } catch { toast.error("Couldn't update — try again"); }
  };

  const featureArtwork = async (id) => {
    try {
      const r = await api.patch(`/admin/artworks/${id}/feature`);
      setArtworks(p => p.map(a => a._id === id ? r.data : a));
      toast.success(r.data.isFeatured ? "Artwork featured!" : "Feature removed");
    } catch { toast.error("Couldn't update — try again"); }
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label:"Total Users",    value: stats.users,    icon:"👥", color:"text-teal" },
              { label:"Pending Verification", value: stats.pendingVerification, icon:"🛡️", color:"text-saffron" },
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
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-5">
              <div className="flex gap-1 bg-surface rounded-lg p-1">
                {ROLE_FILTERS.map(r=>(
                  <button key={r} onClick={()=>setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${roleFilter===r?"bg-saffron text-deep":"text-cream-muted hover:text-cream"}`}>
                    {r==="all"?"All Roles":r+"s"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-surface rounded-lg p-1">
                {STATUS_FILTERS.map(s=>(
                  <button key={s} onClick={()=>setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${statusFilter===s?"bg-saffron text-deep":"text-cream-muted hover:text-cream"}`}>
                    {s==="all"?"All Status":s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {visibleUsers.length === 0 && (
                <p className="text-cream-muted text-sm text-center py-10">No users match this filter.</p>
              )}
              {visibleUsers.map(u=>(
                <div key={u._id} className="bg-surface-2 border border-surface-3 rounded-xl px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-cream font-medium text-sm">{u.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role==="artist"?"border-saffron/40 text-saffron bg-saffron/10":u.role==="admin"?"border-crimson/40 text-crimson bg-crimson/10":"border-surface-3 text-cream-muted"}`}>{u.role}</span>
                        {u.isVerified && <span className="badge-verified">✓ Verified</span>}
                        {u.isBlocked  && <span className="text-xs text-crimson bg-crimson/10 border border-crimson/30 px-2 py-0.5 rounded-full">Blocked</span>}
                      </div>
                      <p className="text-cream-muted text-xs mt-0.5">{u.email} · {u.state}</p>
                      {u.isVerified && u.verificationDocId && (
                        <p className="text-cream-muted text-xs mt-1">ID on file: <span className="text-cream">{u.verificationDocId}</span></p>
                      )}
                      {u.isVerified && u.verificationNotes && (
                        <p className="text-cream-muted text-xs italic mt-0.5">"{u.verificationNotes}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!u.isVerified && (
                        <button onClick={()=>openVerifyForm(u)} className="text-xs text-teal border border-teal/40 bg-teal/10 px-3 py-1.5 rounded-lg hover:bg-teal/20 transition-colors">Verify</button>
                      )}
                      {u.isVerified && (
                        <button onClick={()=>unverifyUser(u._id)} className="text-xs text-gold border border-gold/40 bg-gold/10 px-3 py-1.5 rounded-lg hover:bg-gold/20 transition-colors">Revoke</button>
                      )}
                      {u.role!=="admin" && (
                        <button onClick={()=>blockUser(u._id)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${u.isBlocked?"border-teal/40 text-teal bg-teal/10 hover:bg-teal/20":"border-crimson/40 text-crimson bg-crimson/10 hover:bg-crimson/20"}`}>
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline verify form */}
                  {expandedId === u._id && (
                    <div className="mt-4 pt-4 border-t border-surface-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-cream-muted text-xs mb-1 block">
                          ID reference (optional) {u.role==="artist" ? "— e.g. Pehchan Artisan ID" : "— any govt ID the user shared"}
                        </label>
                        <input value={docId} onChange={e=>setDocId(e.target.value)}
                               placeholder="Leave blank if not provided" className="input-dark text-sm py-2"/>
                      </div>
                      <div>
                        <label className="text-cream-muted text-xs mb-1 block">Admin note (optional)</label>
                        <input value={notes} onChange={e=>setNotes(e.target.value)}
                               placeholder="e.g. Verified via phone call" className="input-dark text-sm py-2"/>
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <button onClick={()=>confirmVerify(u._id)} className="btn-saffron text-xs py-2 px-4 rounded-lg">Confirm Verification</button>
                        <button onClick={()=>setExpandedId(null)} className="text-cream-muted text-xs hover:text-cream">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artworks */}
        {!loading && tab==="artworks" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map(art=>(
              <div key={art._id} className={`bg-surface rounded-2xl overflow-hidden border border-surface-3/50 ${!art.isAvailable ? "opacity-50" : ""}`}>
                <div className="aspect-square overflow-hidden bg-surface-2 relative">
                  {art.images?.[0] ? <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-4xl text-cream-muted/20">🎨</div>}
                  {!art.isAvailable && <span className="absolute top-2 left-2 bg-crimson/80 text-white text-[10px] px-2 py-0.5 rounded-full">Hidden</span>}
                </div>
                <div className="p-3">
                  <p className="text-cream text-xs font-medium truncate">{art.title}</p>
                  <p className="text-cream-muted text-xs">{art.artist?.name}</p>
                  <p className="text-saffron text-xs font-bold mt-1">₹{art.price?.toLocaleString("en-IN")}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={()=>featureArtwork(art._id)} className={`flex-1 py-1 text-[10px] rounded font-medium transition-all border ${art.isFeatured?"border-gold text-gold bg-gold/10":"border-surface-3 text-cream-muted hover:border-gold/40"}`}>
                      {art.isFeatured?"★ Featured":"Feature"}
                    </button>
                    <button onClick={()=>removeArtwork(art._id)} disabled={!art.isAvailable} className="px-2 py-1 text-[10px] rounded border border-crimson/40 text-crimson hover:bg-crimson/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {art.isAvailable ? "Remove" : "Hidden"}
                    </button>
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
