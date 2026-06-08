import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
const ART_TYPES = ["Madhubani","Warli","Kalamkari","Pottery","Pattachitra","Weaving","Sculpture","Folk Art","Photography","Digital Art","Other"];

export default function Register() {
  const [params]   = useSearchParams();
  const [role, setRole] = useState(params.get("role") || "buyer");
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"", state:"", city:"", bio:"", artSpecialties:[] });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const toggleSpecialty = (s) => {
    setForm(p=>({ ...p, artSpecialties: p.artSpecialties.includes(s) ? p.artSpecialties.filter(x=>x!==s) : [...p.artSpecialties, s] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Welcome to SURANG, ${user.name.split(" ")[0]}!`);
      if (role === "artist") navigate("/artist/dashboard");
      else navigate("/explore");
    } catch(err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div className="min-h-screen bg-deep py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-saffron font-bold tracking-widest">SURANG</Link>
          <p className="text-cream-muted text-sm mt-2">Create your free account</p>
        </div>

        {/* Role toggle */}
        <div className="flex gap-2 mb-6 bg-surface rounded-xl p-1">
          {["buyer","artist"].map(r=>(
            <button key={r} onClick={()=>setRole(r)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                      role===r ? "bg-saffron text-deep" : "text-cream-muted hover:text-cream"
                    }`}>{r === "buyer" ? "🛍️ I'm a Buyer" : "🎨 I'm an Artist"}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-cream-muted text-xs mb-1.5 block">Full Name *</label>
              <input value={form.name} onChange={f("name")} placeholder="Your full name" className="input-dark" required/>
            </div>
            <div className="col-span-2">
              <label className="text-cream-muted text-xs mb-1.5 block">Email *</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="email@example.com" className="input-dark" required/>
            </div>
            <div className="col-span-2">
              <label className="text-cream-muted text-xs mb-1.5 block">Password *</label>
              <input type="password" value={form.password} onChange={f("password")} placeholder="Min. 6 characters" className="input-dark" required minLength={6}/>
            </div>
            <div>
              <label className="text-cream-muted text-xs mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={f("phone")} placeholder="10-digit mobile" className="input-dark"/>
            </div>
            <div>
              <label className="text-cream-muted text-xs mb-1.5 block">State</label>
              <select value={form.state} onChange={f("state")} className="input-dark">
                <option value="">Select state</option>
                {STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-cream-muted text-xs mb-1.5 block">City</label>
              <input value={form.city} onChange={f("city")} placeholder="Your city" className="input-dark"/>
            </div>

            {role === "artist" && (<>
              <div className="col-span-2">
                <label className="text-cream-muted text-xs mb-1.5 block">Artist Bio</label>
                <textarea value={form.bio} onChange={f("bio")} placeholder="Tell buyers about yourself, your art tradition, how long you've been creating…"
                          className="input-dark h-24 resize-none" rows={3}/>
              </div>
              <div className="col-span-2">
                <label className="text-cream-muted text-xs mb-2 block">Art Specialties (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {ART_TYPES.map(s=>(
                    <button key={s} type="button" onClick={()=>toggleSpecialty(s)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              form.artSpecialties.includes(s) ? "bg-saffron text-deep border-saffron" : "text-cream-muted border-surface-3 hover:border-saffron/50"
                            }`}>{s}</button>
                  ))}
                </div>
              </div>
            </>)}
          </div>

          <button type="submit" disabled={loading}
                  className={`w-full btn-saffron text-center py-3 rounded-xl font-semibold mt-2 ${loading?"opacity-60 cursor-wait":""}`}>
            {loading ? "Creating account…" : role === "artist" ? "Join as Artist →" : "Join as Buyer →"}
          </button>
          <p className="text-center text-cream-muted text-sm">
            Already have an account? <Link to="/login" className="text-saffron hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
