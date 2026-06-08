import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Madhubani","Warli","Kalamkari","Pottery","Pattachitra","Weaving","Sculpture","Folk Art","Photography","Other"];
const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

export default function UploadArt() {
  const navigate  = useNavigate();
  const fileRef   = useRef();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles]       = useState([]);
  const [form, setForm] = useState({
    title:"", description:"", price:"", category:"Madhubani",
    artStyle:"", dimensions:"", medium:"", weight:"",
    tags:"", state:"", city:"",
  });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0,5);
    setFiles(selected);
    setPreviews(selected.map(f=>URL.createObjectURL(f)));
  };

  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error("Please upload at least one image"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      files.forEach(f => fd.append("images", f));
      await api.post("/artworks", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      toast.success("Artwork uploaded! 🎨");
      navigate("/artist/dashboard");
    } catch(err) {
      toast.error(err.response?.data?.message || "Upload failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-cream font-bold">Upload Your Artwork</h1>
          <p className="text-cream-muted text-sm mt-1">Share your art with buyers across India. Your credit, your price, your story.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="text-cream font-medium mb-3 block">Artwork Photos (1-5) *</label>
            <div onClick={()=>fileRef.current.click()}
                 className="border-2 border-dashed border-surface-3 rounded-2xl p-8 text-center cursor-pointer hover:border-saffron/50 transition-colors">
              {previews.length > 0 ? (
                <div className="flex gap-3 flex-wrap justify-center">
                  {previews.map((src,i)=>(
                    <img key={i} src={src} alt="" className="w-24 h-24 object-cover rounded-xl border border-surface-3"/>
                  ))}
                  <div className="w-24 h-24 rounded-xl border border-dashed border-surface-3 flex items-center justify-center text-cream-muted text-xs">+ More</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2 text-cream-muted/40">📷</div>
                  <p className="text-cream text-sm font-medium">Click to upload photos</p>
                  <p className="text-cream-muted text-xs mt-1">JPG, PNG or WebP · Max 10MB each · Up to 5 photos</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles}/>
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-5">
            <h3 className="text-cream font-semibold">Artwork Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-cream-muted text-xs mb-1.5 block">Artwork Title *</label>
                <input value={form.title} onChange={f("title")} placeholder="e.g. Dancing Peacock in Madhubani" className="input-dark" required/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Category *</label>
                <select value={form.category} onChange={f("category")} className="input-dark" required>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Price (₹) *</label>
                <input type="number" value={form.price} onChange={f("price")} placeholder="e.g. 1500" className="input-dark" required min="1"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-cream-muted text-xs mb-1.5 block">Description & Cultural Story *</label>
                <textarea value={form.description} onChange={f("description")}
                          placeholder="Describe your artwork — what it means, the tradition behind it, technique used, materials, how long it took. This helps buyers appreciate the real value."
                          className="input-dark h-32 resize-none" required rows={4}/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Art Style / Sub-style</label>
                <input value={form.artStyle} onChange={f("artStyle")} placeholder="e.g. Mithila, Gond" className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Medium</label>
                <input value={form.medium} onChange={f("medium")} placeholder="e.g. Acrylic on handmade paper" className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Dimensions</label>
                <input value={form.dimensions} onChange={f("dimensions")} placeholder="e.g. 24 × 18 inches" className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">Tags (comma separated)</label>
                <input value={form.tags} onChange={f("tags")} placeholder="peacock, nature, Bihar folk art" className="input-dark"/>
              </div>
            </div>
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-4">
            <h3 className="text-cream font-semibold">Shipping Origin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">State</label>
                <select value={form.state} onChange={f("state")} className="input-dark">
                  <option value="">Select state</option>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">City</label>
                <input value={form.city} onChange={f("city")} placeholder="Your city" className="input-dark"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
                    className={`btn-saffron px-8 py-3 font-semibold rounded-xl flex-1 text-center ${loading?"opacity-60 cursor-wait":""}`}>
              {loading ? "Uploading… please wait" : "Publish Artwork →"}
            </button>
            <button type="button" onClick={()=>navigate("/artist/dashboard")} className="btn-outline px-6 py-3 rounded-xl">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
