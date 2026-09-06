import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Madhubani","Warli","Kalamkari","Pottery","Pattachitra","Weaving","Sculpture","Folk Art","Photography","Other"];
const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];
const VOICE_LANGUAGES = [
  { code: "hi-IN", label: "Hindi" },
  { code: "en-IN", label: "English (India)" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "pa-IN", label: "Punjabi" },
  { code: "or-IN", label: "Odia" },
];

export default function UploadArt() {
  const { t }     = useTranslation();
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

  // --- AI auto-catalog state (photo -> listing) ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMeta, setAiMeta] = useState(null); // { confidence, artisanPrompt }
  const [detectedContext, setDetectedContext] = useState(null); // category/style/medium from photo, reused by voice polish

  // --- Voice-based description state (speech -> listing) ---
  const [voiceLang, setVoiceLang] = useState("hi-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0,5);
    setFiles(selected);
    setPreviews(selected.map(f=>URL.createObjectURL(f)));
    setAiMeta(null); // new photos invalidate any previous AI suggestion
    setDetectedContext(null);
  };

  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleAutoCatalog = async () => {
    if (files.length === 0) {
      toast.error(t("uploadArt.aiNoPhotoToast"));
      return;
    }
    setAiLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", files[0]);
      const { data } = await api.post("/ai/auto-catalog", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((p) => ({
        ...p,
        category: data.category || p.category,
        title: data.title || p.title,
        description: data.description || p.description,
        artStyle: data.artStyle || p.artStyle,
        medium: data.medium || p.medium,
        tags: [p.tags, ...(data.suggestedTags || [])].filter(Boolean).join(", "),
      }));
      setAiMeta({ confidence: data.confidence, artisanPrompt: data.artisanPrompt });
      setDetectedContext({ category: data.category, artStyle: data.artStyle, medium: data.medium });
      toast.success(t("uploadArt.aiSuccessToast"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("uploadArt.aiFailToast"));
    } finally {
      setAiLoading(false);
    }
  };

  // --- Voice-based description handlers ---
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t("uploadArt.voiceNotSupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      setLiveTranscript(finalText + interim);
    };

    recognition.onerror = () => {
      toast.error(t("uploadArt.voiceRecognitionError"));
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setLiveTranscript("");
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);

    const transcript = liveTranscript.trim();
    if (!transcript) {
      toast.error(t("uploadArt.voiceNothingCaught"));
      return;
    }

    setVoiceLoading(true);
    try {
      const { data } = await api.post("/ai/polish-description", { transcript, detectedContext });
      setForm((p) => ({ ...p, description: data.description || transcript }));
      toast.success(t("uploadArt.voiceSuccessToast"));
    } catch (err) {
      // Never block the artisan — fall back to their raw words if polishing fails
      setForm((p) => ({ ...p, description: transcript }));
      toast.error(err.response?.data?.message || t("uploadArt.voiceFailToast"));
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error(t("uploadArt.needOneImageToast")); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      files.forEach(f => fd.append("images", f));
      await api.post("/artworks", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      toast.success(t("uploadArt.uploadSuccessToast"));
      navigate("/artist/dashboard");
    } catch(err) {
      toast.error(err.response?.data?.message || t("uploadArt.uploadFailToast"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-cream font-bold">{t("uploadArt.title")}</h1>
          <p className="text-cream-muted text-sm mt-1">{t("uploadArt.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="text-cream font-medium mb-3 block">{t("uploadArt.photosLabel")}</label>
            <div onClick={()=>fileRef.current.click()}
                 className="border-2 border-dashed border-surface-3 rounded-2xl p-8 text-center cursor-pointer hover:border-saffron/50 transition-colors">
              {previews.length > 0 ? (
                <div className="flex gap-3 flex-wrap justify-center">
                  {previews.map((src,i)=>(
                    <img key={i} src={src} alt="" className="w-24 h-24 object-cover rounded-xl border border-surface-3"/>
                  ))}
                  <div className="w-24 h-24 rounded-xl border border-dashed border-surface-3 flex items-center justify-center text-cream-muted text-xs">{t("uploadArt.moreLabel")}</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2 text-cream-muted/40">📷</div>
                  <p className="text-cream text-sm font-medium">{t("uploadArt.clickToUpload")}</p>
                  <p className="text-cream-muted text-xs mt-1">{t("uploadArt.fileHint")}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles}/>
          </div>

          {/* AI auto-catalog trigger — only shows once a photo is selected */}
          {files.length > 0 && (
            <button
              type="button"
              onClick={handleAutoCatalog}
              disabled={aiLoading}
              className={`btn-outline w-full py-3 rounded-xl font-medium ${aiLoading ? "opacity-60 cursor-wait" : ""}`}
            >
              {aiLoading ? t("uploadArt.aiButtonLoading") : t("uploadArt.aiButtonIdle")}
            </button>
          )}

          {aiMeta && (
            <div className="bg-surface-2 border border-saffron/30 rounded-2xl p-4 text-sm">
              <p className="text-cream">
                {t("uploadArt.aiBannerLine1", { confidence: aiMeta.confidence })}{" "}
                {t("uploadArt.aiBannerLine2")}
              </p>
              {aiMeta.artisanPrompt && (
                <p className="text-cream-muted mt-2">💬 {aiMeta.artisanPrompt}</p>
              )}
            </div>
          )}

          {/* Voice-based description — speak in your own language instead of typing */}
          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-cream text-sm font-medium">{t("uploadArt.voicePrompt")}</p>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                disabled={isRecording || voiceLoading}
                className="input-dark w-auto text-xs py-1.5"
              >
                {VOICE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={voiceLoading}
              className={`btn-outline w-full py-3 rounded-xl font-medium
                ${isRecording ? "border-red-400 text-red-300" : ""}
                ${voiceLoading ? "opacity-60 cursor-wait" : ""}`}
            >
              {voiceLoading ? t("uploadArt.voicePolishing") : isRecording ? t("uploadArt.voiceStop") : t("uploadArt.voiceStart")}
            </button>

            {isRecording && (
              <p className="text-cream-muted text-xs italic min-h-[1.25rem]">
                {liveTranscript || t("uploadArt.voiceListening")}
              </p>
            )}
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-5">
            <h3 className="text-cream font-semibold">{t("uploadArt.detailsHeading")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.titleLabel")}</label>
                <input value={form.title} onChange={f("title")} placeholder={t("uploadArt.titlePlaceholder")} className="input-dark" required/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.categoryLabel")}</label>
                <select value={form.category} onChange={f("category")} className="input-dark" required>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.priceLabel")}</label>
                <input type="number" value={form.price} onChange={f("price")} placeholder={t("uploadArt.pricePlaceholder")} className="input-dark" required min="1"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.descriptionLabel")}</label>
                <textarea value={form.description} onChange={f("description")}
                          placeholder={t("uploadArt.descriptionPlaceholder")}
                          className="input-dark h-32 resize-none" required rows={4}/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.artStyleLabel")}</label>
                <input value={form.artStyle} onChange={f("artStyle")} placeholder={t("uploadArt.artStylePlaceholder")} className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.mediumLabel")}</label>
                <input value={form.medium} onChange={f("medium")} placeholder={t("uploadArt.mediumPlaceholder")} className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.dimensionsLabel")}</label>
                <input value={form.dimensions} onChange={f("dimensions")} placeholder={t("uploadArt.dimensionsPlaceholder")} className="input-dark"/>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.tagsLabel")}</label>
                <input value={form.tags} onChange={f("tags")} placeholder={t("uploadArt.tagsPlaceholder")} className="input-dark"/>
              </div>
            </div>
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-4">
            <h3 className="text-cream font-semibold">{t("uploadArt.shippingHeading")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.stateLabel")}</label>
                <select value={form.state} onChange={f("state")} className="input-dark">
                  <option value="">{t("uploadArt.selectState")}</option>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-cream-muted text-xs mb-1.5 block">{t("uploadArt.cityLabel")}</label>
                <input value={form.city} onChange={f("city")} placeholder={t("uploadArt.cityPlaceholder")} className="input-dark"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
                    className={`btn-saffron px-8 py-3 font-semibold rounded-xl flex-1 text-center ${loading?"opacity-60 cursor-wait":""}`}>
              {loading ? t("uploadArt.publishing") : t("uploadArt.publishButton")}
            </button>
            <button type="button" onClick={()=>navigate("/artist/dashboard")} className="btn-outline px-6 py-3 rounded-xl">{t("uploadArt.cancelButton")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
