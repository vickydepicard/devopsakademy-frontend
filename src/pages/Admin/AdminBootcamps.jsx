// src/pages/Admin/AdminBootcamps.jsx
// Gestion complète des bootcamps & lives — DevOpsAkademy
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio, Plus, RefreshCw, Eye, Pencil, Trash2, Calendar,
  Users, Play, X, Clock, CheckCircle, AlertCircle,
  Send, Loader, ExternalLink, Video, Mic, Settings,
  ChevronRight, ArrowRight, Globe, Lock, Zap,
} from "lucide-react";
import api from "../../api/api";

// ── Config statuts ──────────────────────────────────────────
const STATUS = {
  draft:     { label:"Brouillon",   color:"#9ca3af", bg:"#f9fafb", border:"#e5e7eb", emoji:"📝" },
  scheduled: { label:"Planifié",    color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", emoji:"📅" },
  live:      { label:"🔴 En direct",color:"#ef4444", bg:"#fef2f2", border:"#fecaca", emoji:"🔴" },
  ended:     { label:"Terminé",     color:"#10b981", bg:"#f0fdf4", border:"#a7f3d0", emoji:"✅" },
  cancelled: { label:"Annulé",      color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", emoji:"❌" },
};

// Workflow des statuts — dans quel ordre on passe
const NEXT_STATUS = {
  draft:     "scheduled",
  scheduled: "live",
  live:      "ended",
};

const NEXT_LABEL = {
  draft:     "📅 Planifier",
  scheduled: "🔴 Démarrer le live",
  live:      "✅ Terminer le live",
};

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("fr-FR", {
    day:"numeric", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });
};

// ── Prévisualisation du stream ──────────────────────────────
function StreamPreview({ url, onClose }) {
  const isYT = url?.includes("youtube") || url?.includes("youtu.be");
  const isMP4 = url?.match(/\.(mp4|webm|ogg)(\?|$)/i);

  let embedUrl = url;
  if (isYT) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.9)", backdropFilter:"blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:900, background:"#111",
        borderRadius:20, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ padding:"14px 18px", background:"#1a1a1a",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:10, height:10, borderRadius:"50%",
              background:"#ef4444", animation:"pulse 1.5s infinite" }} />
            <span style={{ color:"white", fontWeight:700, fontSize:14 }}>
              TEST PREVIEW — Non visible par les étudiants
            </span>
          </div>
          <button onClick={onClose} style={{ color:"white", background:"none",
            border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <X size={18} /> Fermer
          </button>
        </div>
        <div style={{ aspectRatio:"16/9" }}>
          {isMP4 ? (
            <video width="100%" height="100%" controls autoPlay
              style={{ display:"block", background:"#000" }}>
              <source src={url} />
            </video>
          ) : (
            <iframe width="100%" height="100%" src={embedUrl}
              allow="camera; microphone; fullscreen; autoplay"
              style={{ border:"none", display:"block" }} />
          )}
        </div>
        <div style={{ padding:"12px 18px", background:"#1a1a1a", textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>
            URL : {url}
          </p>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ── Modal Créer/Éditer ──────────────────────────────────────
function BootcampModal({ boot, onClose, onSaved }) {
  const isEdit = !!boot;
  const [form, setForm] = useState({
    title:            boot?.title            || "",
    description:      boot?.description      || "",
    scheduled_at:     (() => {
      if (!boot?.scheduled_at) return "";
      const d = new Date(boot.scheduled_at);
      return isNaN(d.getTime()) ? "" : d.toISOString().slice(0,16);
    })(),
    duration_minutes: boot?.duration_minutes || 120,
    is_free:          boot?.is_free !== undefined ? Number(boot.is_free) : 1,
    price:            boot?.price            || 0,
    max_participants: boot?.max_participants || "",
    level:            boot?.level            || "beginner",
    stream_url:       boot?.stream_url       || "",
    replay_url:       boot?.replay_url       || "",
    language:         boot?.language         || "fr",
  });
  const [saving,    setSaving]   = useState(false);
  const [error,     setError]    = useState("");
  const [preview,   setPreview]  = useState(false);
  const [urlTested, setUrlTested]= useState(false);

  const S = ({ label }) => (
    <label style={{ display:"block", fontSize:12, fontWeight:700,
      color:"#374151", marginBottom:5 }}>{label}</label>
  );
  const inp = {
    width:"100%", border:"2px solid #e5e7eb", borderRadius:10,
    padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box",
    fontFamily:"inherit", transition:"border-color 0.2s",
  };

  const handle = async () => {
    if (!form.title?.trim()) { setError("Le titre est obligatoire."); return; }
    if (!form.scheduled_at) { setError("La date et l'heure sont obligatoires."); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        is_free:          Number(form.is_free),
        price:            Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        max_participants: form.max_participants ? Number(form.max_participants) : null,
      };
      if (isEdit) await api.patch(`/bootcamps/admin/${boot.id}`, payload);
      else        await api.post("/bootcamps/admin", payload);
      onSaved(); onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  };

  return (
    <>
      {preview && <StreamPreview url={form.stream_url} onClose={() => setPreview(false)} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background:"white", borderRadius:28, width:"100%", maxWidth:580,
          maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column",
          boxShadow:"0 32px 80px rgba(0,0,0,0.3)", animation:"fadeIn .25s" }}>

          {/* Header */}
          <div style={{ padding:"20px 24px 16px",
            background:"linear-gradient(135deg,#1e1b4b,#2d287f 60%,#5653e1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h2 style={{ color:"white", fontWeight:900, fontSize:18, margin:0 }}>
                  {isEdit ? "✏️ Modifier le bootcamp" : "🎙️ Nouveau bootcamp"}
                </h2>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, margin:"3px 0 0" }}>
                  {isEdit ? "Modifiez les informations du bootcamp" : "Configurez votre prochain live"}
                </p>
              </div>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:10,
                background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Tabs indicator — processus */}
          <div style={{ padding:"12px 24px", background:"#f9fafb",
            borderBottom:"1px solid #f0f0f0", display:"flex", gap:4, alignItems:"center" }}>
            {["📋 Infos", "🔗 Stream", "💰 Accès"].map((s, i) => (
              <span key={s} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#5653e1" }}>{s}</span>
                {i < 2 && <ChevronRight size={11} color="#d1d5db" />}
              </span>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding:"20px 24px", overflowY:"auto", flex:1,
            display:"flex", flexDirection:"column", gap:16 }}>

            {/* Section Infos */}
            <div style={{ background:"#f8f7ff", borderRadius:14, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#5653e1",
                textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>
                📋 Informations générales
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <S label="Titre du bootcamp *" />
                  <input style={inp} value={form.title}
                    onChange={e => setForm(p => ({...p, title:e.target.value}))}
                    placeholder="ex: Bootcamp Docker — Maîtrisez les conteneurs en 3 jours" />
                </div>

                <div>
                  <S label="Description" />
                  <textarea style={{...inp, minHeight:72, resize:"vertical"}}
                    value={form.description}
                    onChange={e => setForm(p => ({...p, description:e.target.value}))}
                    placeholder="Ce que les participants vont apprendre, les prérequis..." />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <S label="📅 Date & heure *" />
                    <input type="datetime-local" style={inp} value={form.scheduled_at}
                      onChange={e => setForm(p => ({...p, scheduled_at:e.target.value}))} />
                  </div>
                  <div>
                    <S label="⏱ Durée (minutes)" />
                    <input type="number" style={inp} value={form.duration_minutes}
                      onChange={e => setForm(p => ({...p, duration_minutes:e.target.value}))}
                      min={30} max={480} step={30} />
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <S label="Niveau" />
                    <select style={inp} value={form.level}
                      onChange={e => setForm(p => ({...p, level:e.target.value}))}>
                      <option value="beginner">🟢 Débutant</option>
                      <option value="intermediate">🟡 Intermédiaire</option>
                      <option value="advanced">🔴 Avancé</option>
                    </select>
                  </div>
                  <div>
                    <S label="Places max (vide = illimité)" />
                    <input type="number" style={inp} value={form.max_participants}
                      onChange={e => setForm(p => ({...p, max_participants:e.target.value}))}
                      placeholder="ex: 200" min={1} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Stream */}
            <div style={{ background:"#f0fdf4", borderRadius:14, padding:16,
              border:"1px solid #a7f3d0" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#0f766e",
                textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>
                🔗 Configuration du stream
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <S label="URL du live (YouTube Live, Zoom, Loom, vidéo MP4...)" />
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{...inp, flex:1}}
                      value={form.stream_url}
                      onChange={e => { setForm(p => ({...p, stream_url:e.target.value})); setUrlTested(false); }}
                      placeholder="https://youtube.com/live/xxx  ou  https://zoom.us/j/xxx" />
                    {form.stream_url && (
                      <button onClick={() => setPreview(true)}
                        style={{ padding:"9px 14px", borderRadius:10, border:"none",
                          background: urlTested ? "#10b981" : "#2d287f",
                          color:"white", fontWeight:700, fontSize:12,
                          cursor:"pointer", display:"flex", alignItems:"center", gap:5,
                          whiteSpace:"nowrap", flexShrink:0 }}
                        title="Tester le stream avant de lancer">
                        <Play size={13} />
                        {urlTested ? "✓ Testé" : "Tester"}
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:"#0f766e", margin:"5px 0 0" }}>
                    💡 Cliquez "Tester" pour vérifier le stream avant de le lancer publiquement
                  </p>
                </div>

                <div>
                  <S label="URL replay (après le live — YouTube, vidéo uploadée...)" />
                  <input style={inp} value={form.replay_url}
                    onChange={e => setForm(p => ({...p, replay_url:e.target.value}))}
                    placeholder="https://youtu.be/xxx  (à remplir après le live)" />
                </div>
              </div>
            </div>

            {/* Section Accès */}
            <div style={{ background:"#eff6ff", borderRadius:14, padding:16,
              border:"1px solid #bfdbfe" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#0369a1",
                textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>
                💰 Accès & tarification
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <S label="Type d'accès" />
                  <div style={{ display:"flex", gap:8 }}>
                    {[[1,"🎉 Gratuit"],[0,"💳 Payant"]].map(([val, label]) => (
                      <button key={val} onClick={() => setForm(p => ({...p, is_free:Number(val)}))}
                        style={{ flex:1, padding:"9px", borderRadius:10, border:"2px solid",
                          borderColor: Number(form.is_free) === Number(val) ? "#0369a1" : "#e5e7eb",
                          background:  Number(form.is_free) === Number(val) ? "#eff6ff" : "white",
                          color:       Number(form.is_free) === Number(val) ? "#0369a1" : "#6b7280",
                          fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {!form.is_free && (
                  <div>
                    <S label="Prix (FCFA)" />
                    <input type="number" style={inp} value={form.price}
                      onChange={e => setForm(p => ({...p, price:e.target.value}))}
                      min={0} placeholder="ex: 5000" />
                  </div>
                )}
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
                borderRadius:10, padding:"10px 14px", fontSize:13,
                color:"#ef4444", fontWeight:600, display:"flex", gap:8, alignItems:"center" }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:"14px 24px 20px", borderTop:"1px solid #f0f0f0",
            display:"flex", gap:10 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:"11px", border:"2px solid #e5e7eb",
                borderRadius:14, fontWeight:700, fontSize:13, cursor:"pointer",
                background:"white", color:"#374151" }}>
              Annuler
            </button>
            <button onClick={handle} disabled={saving}
              style={{ flex:2, padding:"11px", borderRadius:14, border:"none",
                fontWeight:900, fontSize:13, cursor:"pointer", color:"white",
                background:"linear-gradient(135deg,#2d287f,#5653e1)",
                opacity: saving ? 0.6 : 1, display:"flex",
                alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving
                ? <><Loader size={15} style={{ animation:"spin 1s linear infinite" }} /> Sauvegarde...</>
                : isEdit ? "✅ Enregistrer les modifications" : "🚀 Créer le bootcamp"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}

// ── Panel statut live (sidebar droite quand un bootcamp est sélectionné) ──
function LivePanel({ boot, onStatusChange, onEdit, onClose }) {
  const [preview, setPreview] = useState(false);
  const st = STATUS[boot.status] || STATUS.draft;
  const next = NEXT_STATUS[boot.status];
  const date = boot.scheduled_at ? new Date(boot.scheduled_at) : null;
  const isValidDate = date && !isNaN(date.getTime());

  const steps = [
    { key:"draft",     label:"Brouillon créé",   done: true },
    { key:"scheduled", label:"Planifié & annoncé", done: ["scheduled","live","ended"].includes(boot.status) },
    { key:"live",      label:"Live démarré",      done: ["live","ended"].includes(boot.status) },
    { key:"ended",     label:"Terminé + replay",  done: boot.status === "ended" },
  ];

  return (
    <>
      {preview && <StreamPreview url={boot.stream_url || boot.replay_url} onClose={() => setPreview(false)} />}
      <div style={{ background:"white", borderRadius:20, border:"1.5px solid #f0f0f0",
        padding:20, display:"flex", flexDirection:"column", gap:16,
        boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>

        {/* Header panel */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6,
              padding:"4px 10px", borderRadius:20,
              background:st.bg, border:`1px solid ${st.border}`,
              fontSize:12, fontWeight:800, color:st.color, marginBottom:8 }}>
              {st.emoji} {st.label}
            </div>
            <h3 style={{ fontWeight:900, fontSize:16, color:"#111",
              margin:0, lineHeight:1.3 }}>{boot.title}</h3>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none",
            cursor:"pointer", color:"#9ca3af" }}>
            <X size={18} />
          </button>
        </div>

        {/* Timeline processus */}
        <div style={{ background:"#f8f7ff", borderRadius:14, padding:14 }}>
          <p style={{ fontSize:11, fontWeight:800, color:"#5653e1",
            textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>
            Processus
          </p>
          {steps.map((step, i) => (
            <div key={step.key} style={{ display:"flex", gap:10, alignItems:"flex-start",
              marginBottom: i < steps.length - 1 ? 8 : 0 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0,
                background: step.done ? "#10b981" : "#e5e7eb",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {step.done
                  ? <CheckCircle size={12} color="white" />
                  : <span style={{ width:6, height:6, borderRadius:"50%",
                      background:"#9ca3af", display:"block" }} />}
              </div>
              <span style={{ fontSize:12, fontWeight: step.done ? 700 : 500,
                color: step.done ? "#059669" : "#9ca3af", paddingTop:2 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Infos clés */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            [Calendar, "Date", isValidDate
              ? date.toLocaleDateString("fr-FR", {day:"numeric",month:"short",year:"numeric"})
                + " à " + date.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
              : "Non définie"],
            [Clock,    "Durée",    `${boot.duration_minutes} min`],
            [Users,    "Inscrits", `${fmt(boot.registered_count || 0)}${boot.max_participants ? " / " + fmt(boot.max_participants) : ""}`],
            [boot.is_free ? Globe : Lock, "Accès", boot.is_free ? "Gratuit 🎉" : `${fmt(boot.price)} FCFA`],
          ].map(([Icon, label, val]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", fontSize:12, padding:"6px 0",
              borderBottom:"1px solid #f9fafb" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6, color:"#6b7280" }}>
                <Icon size={12} />{label}
              </span>
              <span style={{ fontWeight:700, color:"#111" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Tester le stream */}
        {(boot.stream_url || boot.replay_url) && (
          <div style={{ background:"#ecfdf5", borderRadius:12, padding:12,
            border:"1px solid #a7f3d0" }}>
            <p style={{ fontSize:11, fontWeight:800, color:"#065f46",
              margin:"0 0 8px" }}>🧪 Tester avant de lancer</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {boot.stream_url && (
                <button onClick={() => setPreview(true)}
                  style={{ flex:1, padding:"8px", borderRadius:10, border:"none",
                    background:"#2d287f", color:"white", fontWeight:700,
                    fontSize:12, cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", gap:5 }}>
                  <Play size={12} /> Tester le stream
                </button>
              )}
              {boot.replay_url && boot.status === "ended" && (
                <button onClick={() => setPreview(true)}
                  style={{ flex:1, padding:"8px", borderRadius:10, border:"none",
                    background:"#0f766e", color:"white", fontWeight:700,
                    fontSize:12, cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", gap:5 }}>
                  <Play size={12} /> Tester le replay
                </button>
              )}
              <a href={`/bootcamps`} target="_blank" rel="noreferrer"
                style={{ flex:1, padding:"8px", borderRadius:10,
                  border:"1px solid #a7f3d0", background:"white",
                  color:"#065f46", fontWeight:700, fontSize:12,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  gap:5, textDecoration:"none" }}>
                <ExternalLink size={12} /> Voir public
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={onEdit}
            style={{ padding:"10px", borderRadius:12, border:"2px solid #e0e7ff",
              background:"#f0efff", color:"#2d287f", fontWeight:700,
              fontSize:13, cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", gap:6 }}>
            <Pencil size={14} /> Modifier les infos
          </button>

          {next && (
            <button onClick={() => onStatusChange(boot, next)}
              style={{ padding:"11px", borderRadius:12, border:"none",
                background: next === "live"
                  ? "linear-gradient(135deg,#dc2626,#ef4444)"
                  : next === "scheduled"
                  ? "linear-gradient(135deg,#d97706,#f59e0b)"
                  : "linear-gradient(135deg,#059669,#10b981)",
                color:"white", fontWeight:900, fontSize:14, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                boxShadow: next === "live" ? "0 4px 16px rgba(239,68,68,0.4)" : "none" }}>
              {NEXT_LABEL[boot.status]} <ArrowRight size={16} />
            </button>
          )}

          {boot.status === "scheduled" && (
            <div style={{ background:"#fffbeb", borderRadius:10, padding:"10px 12px",
              border:"1px solid #fde68a" }}>
              <p style={{ fontSize:11, color:"#92400e", fontWeight:700, margin:"0 0 4px" }}>
                📅 Bootcamp planifié
              </p>
              <p style={{ fontSize:11, color:"#b45309", margin:0 }}>
                Les étudiants voient ce bootcamp et peuvent s'inscrire.
                Quand le live démarre, cliquez "Démarrer le live" pour ouvrir l'accès.
              </p>
            </div>
          )}
          {boot.status === "live" && (
            <div style={{ background:"#fef2f2", borderRadius:10, padding:"10px 12px",
              border:"1px solid #fecaca" }}>
              <p style={{ fontSize:11, color:"#991b1b", fontWeight:700, margin:"0 0 4px" }}>
                🔴 Live en cours — {boot.registered_count || 0} inscrit(s) ont accès
              </p>
              <p style={{ fontSize:11, color:"#dc2626", margin:0 }}>
                {boot.stream_url
                  ? "Les étudiants voient le bouton \"Rejoindre le live\" qui ouvre votre URL de stream."
                  : "⚠️ Aucune URL de stream configurée ! Les étudiants ne peuvent pas rejoindre. Modifiez le bootcamp pour ajouter l'URL."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function AdminBootcamps() {
  const navigate     = useNavigate();
  const [boots,      setBoots]     = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [modal,      setModal]     = useState(null);
  const [selected,   setSelected]  = useState(null);
  const [delConf,    setDelConf]   = useState(null);
  const [filterSt,   setFilterSt]  = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/bootcamps/admin/all");
      setBoots(r.data?.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (boot, status) => {
    try {
      await api.patch(`/bootcamps/admin/${boot.id}/status`, { status });
      setBoots(prev => prev.map(b => b.id === boot.id ? {...b, status} : b));
      // Mettre à jour le panel latéral immédiatement
      if (selected?.id === boot.id) setSelected(prev => ({...prev, status}));
      // Si on passe en LIVE → afficher un message
      if (status === 'live') {
        alert('🔴 Le bootcamp est maintenant EN DIRECT ! Les étudiants inscrits peuvent y accéder.');
      }
    } catch (e) {
      alert('Erreur lors du changement de statut : ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (boot) => {
    await api.delete(`/bootcamps/admin/${boot.id}`).catch(() => {});
    setBoots(prev => prev.filter(b => b.id !== boot.id));
    if (selected?.id === boot.id) setSelected(null);
    setDelConf(null);
  };

  const filtered = filterSt === "all"
    ? boots
    : boots.filter(b => b.status === filterSt);

  const counts = {
    all:       boots.length,
    live:      boots.filter(b => b.status === "live").length,
    scheduled: boots.filter(b => b.status === "scheduled").length,
    ended:     boots.filter(b => b.status === "ended").length,
    draft:     boots.filter(b => b.status === "draft").length,
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontWeight:900, fontSize:22, color:"#111",
            display:"flex", alignItems:"center", gap:8, margin:0 }}>
            <Radio size={24} color="#5653e1" /> Bootcamps & Lives
          </h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"2px 0 0" }}>
            {boots.length} bootcamp{boots.length !== 1 ? "s" : ""} ·{" "}
            {counts.live > 0 && <span style={{ color:"#ef4444", fontWeight:700 }}>
              🔴 {counts.live} en direct
            </span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6,
            padding:"9px 14px", borderRadius:12, border:"2px solid #e5e7eb",
            background:"white", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button onClick={() => { setModal("create"); setSelected(null); }}
            style={{ display:"flex", alignItems:"center", gap:6,
              padding:"9px 18px", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#2d287f,#5653e1)",
              color:"white", fontWeight:800, fontSize:13, cursor:"pointer",
              boxShadow:"0 4px 14px rgba(45,40,127,0.3)" }}>
            <Plus size={16} /> Nouveau bootcamp
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
        {[
          ["all",       "Total",        counts.all,       "#5653e1", "#f0efff"],
          ["live",      "En direct",    counts.live,      "#ef4444", "#fef2f2"],
          ["scheduled", "Planifiés",    counts.scheduled, "#f59e0b", "#fffbeb"],
          ["ended",     "Terminés",     counts.ended,     "#10b981", "#f0fdf4"],
          ["draft",     "Brouillons",   counts.draft,     "#9ca3af", "#f9fafb"],
        ].map(([key, label, count, color, bg]) => (
          <button key={key} onClick={() => setFilterSt(key)}
            style={{ padding:"12px 10px", borderRadius:14, border:"2px solid",
              borderColor: filterSt === key ? color : "transparent",
              background: filterSt === key ? bg : "white",
              cursor:"pointer", textAlign:"center", transition:"all 0.15s",
              boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ fontWeight:900, fontSize:22, color, margin:0 }}>{count}</p>
            <p style={{ fontSize:11, color:"#9ca3af", fontWeight:600, margin:0 }}>{label}</p>
          </button>
        ))}
      </div>

      {/* Layout : liste + panel */}
      <div style={{ display:"grid",
        gridTemplateColumns: selected ? "1fr 320px" : "1fr",
        gap:16, alignItems:"start" }}>

        {/* Liste */}
        <div style={{ background:"white", borderRadius:20,
          border:"1.5px solid #f0f0f0", overflow:"hidden",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

          {loading ? (
            <div style={{ padding:"60px", textAlign:"center" }}>
              <div style={{ width:32, height:32, border:"3px solid #5653e1",
                borderTopColor:"transparent", borderRadius:"50%",
                animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
              <p style={{ color:"#9ca3af" }}>Chargement...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"60px", textAlign:"center" }}>
              <Radio size={40} color="#d1d5db" style={{ margin:"0 auto 12px", display:"block" }} />
              <p style={{ color:"#9ca3af", fontWeight:600 }}>
                {filterSt !== "all" ? `Aucun bootcamp "${STATUS[filterSt]?.label}"` : "Aucun bootcamp créé"}
              </p>
              <button onClick={() => setModal("create")}
                style={{ marginTop:12, padding:"10px 20px", borderRadius:12,
                  border:"none", background:"linear-gradient(135deg,#2d287f,#5653e1)",
                  color:"white", fontWeight:800, cursor:"pointer" }}>
                Créer le premier bootcamp
              </button>
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div style={{ display:"grid",
                gridTemplateColumns:"2fr 130px 120px 80px 70px 100px",
                gap:8, padding:"11px 18px",
                background:"#f9fafb", borderBottom:"1px solid #f0f0f0" }}>
                {["Bootcamp","Date/Heure","Statut","Inscrits","Accès","Actions"].map(h => (
                  <span key={h} style={{ fontSize:10, fontWeight:800, color:"#9ca3af",
                    textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</span>
                ))}
              </div>

              {filtered.map(b => {
                const st = STATUS[b.status] || STATUS.draft;
                const isSelected = selected?.id === b.id;
                const d = b.scheduled_at ? new Date(b.scheduled_at) : null;
                const validD = d && !isNaN(d.getTime());

                return (
                  <div key={b.id}
                    onClick={() => setSelected(isSelected ? null : b)}
                    style={{ display:"grid",
                      gridTemplateColumns:"2fr 130px 120px 80px 70px 100px",
                      gap:8, padding:"13px 18px",
                      borderBottom:"1px solid #f9fafb",
                      background: isSelected ? "#f8f7ff" : "white",
                      cursor:"pointer", transition:"background 0.15s",
                      borderLeft: isSelected ? "3px solid #5653e1" : "3px solid transparent",
                      alignItems:"center" }}>

                    {/* Titre */}
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        {b.status === "live" && (
                          <span style={{ width:7, height:7, borderRadius:"50%",
                            background:"#ef4444", flexShrink:0,
                            animation:"pulse 1.5s infinite",
                            display:"inline-block" }} />
                        )}
                        <p style={{ fontWeight:800, fontSize:13, color:"#111", margin:0,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {b.title || <em style={{ color:"#9ca3af" }}>Sans titre</em>}
                        </p>
                      </div>
                      <p style={{ fontSize:11, color:"#9ca3af", margin:"2px 0 0" }}>
                        {b.instructor_name}
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:"#374151", margin:0 }}>
                        {validD ? d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : "—"}
                      </p>
                      <p style={{ fontSize:10, color:"#9ca3af", margin:"2px 0 0" }}>
                        {validD ? d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : ""}
                      </p>
                    </div>

                    {/* Statut */}
                    <div>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11,
                        fontWeight:800, background:st.bg, color:st.color,
                        border:`1px solid ${st.border}` }}>
                        {st.emoji} {st.label}
                      </span>
                    </div>

                    {/* Inscrits */}
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Users size={12} color="#9ca3af" />
                      <span style={{ fontSize:13, fontWeight:700 }}>
                        {fmt(b.reg_count || b.registered_count || 0)}
                      </span>
                    </div>

                    {/* Prix */}
                    <span style={{ fontSize:11, fontWeight:700,
                      color: b.is_free ? "#10b981" : "#2d287f" }}>
                      {b.is_free ? "Gratuit" : `${fmt(b.price)}F`}
                    </span>

                    {/* Actions rapides */}
                    <div style={{ display:"flex", gap:5 }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => setModal(b)}
                        title="Modifier" style={{ width:28, height:28, borderRadius:8,
                          border:"none", background:"#f5f3ff", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Pencil size={13} color="#7c3aed" />
                      </button>
                      <button onClick={() => setDelConf(b)}
                        title="Supprimer" style={{ width:28, height:28, borderRadius:8,
                          border:"none", background:"#fef2f2", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
            </>
          )}
        </div>

        {/* Panel latéral */}
        {selected && (
          <LivePanel
            boot={selected}
            onStatusChange={changeStatus}
            onEdit={() => setModal(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* Modal créer/éditer */}
      {modal && (
        <BootcampModal
          boot={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {/* Confirm suppression */}
      {delConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}>
          <div style={{ background:"white", borderRadius:24, maxWidth:360,
            width:"100%", padding:24, textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:14, background:"#fef2f2",
              margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontWeight:900, fontSize:16, color:"#111", margin:"0 0 6px" }}>
              Supprimer ce bootcamp ?
            </h3>
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>
              <strong>"{delConf.title}"</strong> et toutes ses données (inscriptions, messages)
              seront supprimés définitivement.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDelConf(null)}
                style={{ flex:1, padding:11, border:"2px solid #e5e7eb",
                  borderRadius:12, fontWeight:700, cursor:"pointer",
                  background:"white", color:"#374151" }}>
                Annuler
              </button>
              <button onClick={() => handleDelete(delConf)}
                style={{ flex:1, padding:11, borderRadius:12, border:"none",
                  background:"linear-gradient(135deg,#dc2626,#ef4444)",
                  color:"white", fontWeight:900, cursor:"pointer" }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}