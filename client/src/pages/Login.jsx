import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      if (user.role === "artist") navigate("/artist/dashboard");
      else navigate("/explore");
    } catch(err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-saffron font-bold tracking-widest">SURANG</Link>
          <p className="text-cream-muted text-sm mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-2 border border-surface-3 rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-cream-muted text-xs mb-1.5 block">Email Address</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                   placeholder="you@example.com" className="input-dark" required/>
          </div>
          <div>
            <label className="text-cream-muted text-xs mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                   placeholder="••••••••" className="input-dark" required/>
          </div>
          <button type="submit" disabled={loading}
                  className={`w-full btn-saffron text-center py-3 rounded-xl font-semibold ${loading?"opacity-60 cursor-wait":""}`}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-cream-muted text-sm pt-1">
            No account? <Link to="/register" className="text-saffron hover:underline">Create one free →</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
