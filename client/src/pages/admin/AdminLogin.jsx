import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") { toast.error("Access denied"); return; }
      toast.success("Admin access granted");
      navigate("/admin/dashboard");
    } catch(err) { toast.error(err.response?.data?.message || "Authentication failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <span className="font-display text-2xl text-saffron font-bold tracking-widest">SURANG</span>
          <p className="text-cream-muted text-xs mt-1 uppercase tracking-widest">Admin Access</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-cream-muted text-xs mb-1.5 block">Admin Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="input-dark" required/>
          </div>
          <div>
            <label className="text-cream-muted text-xs mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className="input-dark" required/>
          </div>
          <button type="submit" disabled={loading} className={`w-full btn-saffron py-3 rounded-xl font-semibold ${loading?"opacity-60 cursor-wait":""}`}>
            {loading ? "Verifying…" : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
