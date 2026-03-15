// ╔══════════════════════════════════════════════════════════════════╗
// ║  AdminCourses.jsx  —  DevOpsAkademy                             ║
// ║  Gestion COMPLÈTE cours · modules · leçons · ressources         ║
// ║  Upload vidéo depuis l'ordi · Publier/Dépublier partout         ║
// ║  Intégré aux couleurs Tailwind du projet (#2d287f / #facc15)    ║
// ╚══════════════════════════════════════════════════════════════════╝
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen, Plus, Search, Filter, Eye, EyeOff, Edit3, Trash2,
  ChevronDown, ChevronRight, Video, FileText, Brain, Zap, Download,
  Upload, Link, Film, Paperclip, Star, Users, Clock, Tag,
  Globe, Lock, CheckCircle, Circle, AlertCircle, X, Save,
  Play, Pause, RefreshCw, Layers, Settings, Award, TrendingUp
} from "lucide-react";

/* ──────── CONSTANTES ──────── */
const LEVEL_MAP  = { beginner:"Débutant",   intermediate:"Intermédiaire", advanced:"Avancé" };
const LEVEL_CLR  = { beginner:"#10b981",    intermediate:"#f59e0b",       advanced:"#ef4444" };
const LEVEL_BG   = { beginner:"#d1fae5",    intermediate:"#fef3c7",       advanced:"#fee2e2" };
const TYPE_MAP   = { video:"Vidéo", article:"Article", quiz:"Quiz", exercise:"Exercice", download:"Téléchargement" };
const TYPE_ICO   = { video:Film, article:FileText, quiz:Brain, exercise:Zap, download:Download };
const TYPE_CLR   = { video:"#6366f1", article:"#0ea5e9", quiz:"#8b5cf6", exercise:"#f97316", download:"#059669" };

/* ──────── API HELPER ──────── */
async function api(token, method, path, body) {
  try {
    const r = await fetch(`/api/admin${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    try { return JSON.parse(t); }
    catch { return { success: false, message: `HTTP ${r.status}` }; }
  } catch(e) { return { success: false, message: "Réseau: " + e.message }; }
}

/* ──────── TOAST ──────── */
function Toast({ t }) {
  if (!t) return null;
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm text-white shadow-2xl animate-slide-in-right min-w-[260px] ${t.ok ? "bg-emerald-600" : "bg-red-500"}`}>
      {t.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {t.msg}
    </div>
  );
}

/* ──────── CONFIRM DIALOG ──────── */
function Confirm({ d, onClose }) {
  if (!d) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="font-bold text-slate-900 text-lg mb-2">{d.title}</p>
        <p className="text-slate-500 text-sm leading-relaxed mb-7">{d.msg}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition">Annuler</button>
          <button onClick={d.ok} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ──────── MODAL ──────── */
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-bold text-slate-900 text-base">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition text-sm">✕</button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ──────── TOGGLE ──────── */
function Toggle({ label, checked, on, color = "#2d287f" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => on(!checked)}
        className="relative flex-shrink-0"
        style={{ width: 44, height: 24, borderRadius: 12, background: checked ? color : "#cbd5e1", transition: "background .2s" }}
      >
        <div style={{ position:"absolute", top:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,.22)", transition:"left .2s", left: checked ? 23 : 3 }} />
      </div>
      <span className="text-sm text-slate-600 font-medium">{label}</span>
    </label>
  );
}

/* ──────── BADGE ──────── */
function Badge({ children, color = "#2d287f", bg }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg || (color + "18"), color }}>
      {children}
    </span>
  );
}

/* ──────── FIELD ──────── */
function Field({ label, required, hint, children, col2 }) {
  return (
    <div className="flex flex-col gap-1.5" style={{ gridColumn: col2 ? "span 2" : undefined }}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="font-normal normal-case tracking-normal text-slate-300 ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ──────── INPUT STYLE ──────── */
const IS = "w-full border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none bg-white font-[inherit] focus:border-primary focus:ring-2 focus:ring-primary/10 transition";

/* ──────── SPINNER ──────── */
const Spin = ({ sm }) => (
  <div className={`rounded-full border-4 border-slate-200 border-t-primary animate-spin ${sm ? "w-5 h-5 border-[3px]" : "w-9 h-9"}`} style={{ borderTopColor: "#2d287f" }} />
);

/* ──────── UPLOAD VIDÉO ──────── */
function VideoUploader({ token, lessonId, currentUrl, onSuccess }) {
  const [tab,       setTab]       = useState(currentUrl?.includes("/uploads/") ? "file" : "url");
  const [urlVal,    setUrlVal]    = useState(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef(null);

  const doUpload = (file) => {
    if (!file) return;
    setUploading(true); setProgress(2);
    const fd = new FormData(); fd.append("video", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/upload-video`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 95)); };
    xhr.onload = () => {
      setProgress(100);
      try {
        const r = JSON.parse(xhr.responseText);
        if (r.success) onSuccess(r.data.file_url);
        else alert("Erreur: " + r.message);
      } catch { alert("Erreur serveur"); }
      setTimeout(() => { setUploading(false); setProgress(null); }, 800);
    };
    xhr.onerror = () => { setUploading(false); setProgress(null); alert("Erreur réseau"); };
    xhr.send(fd);
  };

  const getYoutubeId = (url) => {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? m[1] : null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {[["url", Link, "URL externe"], ["file", Upload, "Depuis mon ordi"]].map(([v, Icon, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${tab === v ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`} style={tab === v ? { color: "#2d287f" } : {}}>
            <Icon size={15} /> {l}
          </button>
        ))}
      </div>

      {/* URL externe */}
      {tab === "url" && (
        <div className="flex flex-col gap-3">
          <Field label="URL de la vidéo" hint="YouTube, Vimeo, MP4 direct…">
            <input className={IS} value={urlVal} onChange={e => { setUrlVal(e.target.value); onSuccess(e.target.value); }} placeholder="https://youtube.com/watch?v=… ou https://…/video.mp4" />
          </Field>
          {urlVal && (
            <div className="rounded-2xl overflow-hidden bg-black aspect-video">
              {getYoutubeId(urlVal) ? (
                <iframe src={`https://www.youtube.com/embed/${getYoutubeId(urlVal)}`} className="w-full h-full border-none" allowFullScreen title="preview" />
              ) : urlVal.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={urlVal} controls className="w-full max-h-48" />
              ) : (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">🔗 {urlVal.slice(0, 80)}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload depuis ordi */}
      {tab === "file" && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); doUpload(e.dataTransfer.files[0]); }}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"}`}
            style={dragging ? { borderColor: "#2d287f" } : {}}
          >
            {uploading ? (
              <div>
                <div className="flex justify-center mb-3"><Spin sm /></div>
                <p className="text-sm font-bold mb-3" style={{ color: "#2d287f" }}>Upload en cours…</p>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#2d287f,#5653e1)" }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">{progress}%</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#2d287f18" }}>
                  <Film size={26} style={{ color: "#2d287f" }} />
                </div>
                <p className="font-bold text-slate-700 mb-1">Glissez votre vidéo ici</p>
                <p className="text-xs text-slate-400">ou cliquez pour sélectionner · MP4, MKV, AVI, MOV, WebM · max 2 Go</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => doUpload(e.target.files?.[0])} />

          {/* Prévisualisation vidéo uploadée */}
          {currentUrl?.includes("/uploads/") && (
            <video src={currentUrl} controls className="w-full rounded-xl mt-3 max-h-40" />
          )}
        </div>
      )}
    </div>
  );
}

/* ──────── UPLOAD RESSOURCE ──────── */
function ResourceUploader({ token, lessonId, onSuccess }) {
  const [fileType, setFileType] = useState("pdf");
  const [title,    setTitle]    = useState("");
  const [urlVal,   setUrlVal]   = useState("");
  const [file,     setFile]     = useState(null);
  const [uploading,setUploading]= useState(false);
  const [progress, setProgress] = useState(null);
  const inputRef = useRef(null);

  const isLink = fileType === "link";

  const submit = async () => {
    if (isLink) {
      if (!urlVal.trim()) { alert("URL requise"); return; }
      const r = await api(token, "POST", "/lessons/resources", { lesson_id: lessonId, title: title || urlVal, file_url: urlVal, file_type: "link" });
      if (r.success) { onSuccess(); setUrlVal(""); setTitle(""); }
      else alert(r.message);
      return;
    }
    if (!file) { alert("Choisissez un fichier"); return; }
    setUploading(true); setProgress(5);
    const fd = new FormData(); fd.append("file", file);
    if (title) fd.append("title", title);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/upload-resource`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 95)); };
    xhr.onload = () => {
      setProgress(100);
      try {
        const r = JSON.parse(xhr.responseText);
        if (r.success) { onSuccess(); setFile(null); setTitle(""); }
        else alert("Erreur: " + r.message);
      } catch { alert("Erreur serveur"); }
      setTimeout(() => { setUploading(false); setProgress(null); }, 800);
    };
    xhr.onerror = () => { setUploading(false); setProgress(null); alert("Erreur réseau"); };
    xhr.send(fd);
  };

  const FILE_TYPES = [
    ["pdf", "📄", "PDF"], ["mp4", "🎬", "Vidéo"],
    ["pptx", "📊", "Slides"], ["docx", "📝", "Word"],
    ["zip", "🗜", "ZIP"], ["code", "💻", "Code"],
    ["link", "🔗", "Lien"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILE_TYPES.map(([v, ic, l]) => (
          <button key={v} onClick={() => setFileType(v)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${fileType === v ? "border-primary/50 bg-primary/8 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300"}`} style={fileType === v ? { borderColor: "#2d287f50", background: "#2d287f10", color: "#2d287f" } : {}}>
            <span>{ic}</span>{l}
          </button>
        ))}
      </div>

      <Field label="Titre" hint="optionnel">
        <input className={IS} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Slides cours Docker…" />
      </Field>

      {isLink ? (
        <Field label="URL externe">
          <input className={IS} value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://…" />
        </Field>
      ) : (
        <div>
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition"
          >
            {uploading ? (
              <div>
                <div className="flex justify-center mb-2"><Spin sm /></div>
                <p className="text-xs font-bold mb-2" style={{ color: "#2d287f" }}>Envoi…</p>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#2d287f" }} />
                </div>
              </div>
            ) : file ? (
              <p className="text-sm text-slate-700 font-medium">📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} Mo)</p>
            ) : (
              <p className="text-sm text-slate-400">Cliquez pour choisir un fichier</p>
            )}
          </div>
          <input ref={inputRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
      )}

      <button onClick={submit} disabled={uploading} className="w-full py-3 rounded-xl font-bold text-sm text-white transition" style={{ background: uploading ? "#a5b4fc" : "#059669" }}>
        {uploading ? "Envoi…" : "✓ Ajouter la ressource"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════ */
export default function AdminCourses() {
  const { token } = useAuth();

  const [courses,     setCourses]    = useState([]);
  const [categories,  setCategories] = useState([]);
  const [instructors, setInstructors]= useState([]);
  const [loading,     setLoading]    = useState(true);

  const [view,   setView]   = useState("list"); // list | form | editor
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [course, setCourse] = useState(null);
  const [cForm,  setCForm]  = useState({});
  const [isNew,  setIsNew]  = useState(true);
  const [saving, setSaving] = useState(false);

  const [modules,   setModules]  = useState([]);
  const [lessons,   setLessons]  = useState({});
  const [resources, setResources]= useState({});
  const [expanded,  setExpanded] = useState({});
  const [edLoad,    setEdLoad]   = useState(false);
  const [edError,   setEdError]  = useState(null);

  // Modals
  const [modM,   setModM]  = useState(null);
  const [modSv,  setModSv] = useState(false);
  const [lesM,   setLesM]  = useState(null);
  const [lesSv,  setLesSv] = useState(false);
  const [upVid,     setUpVid]     = useState(null);  // leçon pour upload vidéo
  const [resM,      setResM]      = useState(null);  // { lesId, les }
  const [dlCourse,  setDlCourse]  = useState(false); // téléchargement cours en local

  const [toast, setToast] = useState(null);
  const [dlg,   setDlg]   = useState(null);
  const tmr = useRef(null);

  const t$ = (msg, ok = true) => { clearTimeout(tmr.current); setToast({ msg, ok }); tmr.current = setTimeout(() => setToast(null), 3500); };
  const ask = (title, msg, ok) => setDlg({ title, msg, ok: () => { setDlg(null); ok(); } });

  /* ── Load ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [rC, rCat, rI] = await Promise.all([
      api(token, "GET", "/courses"),
      api(token, "GET", "/categories"),
      api(token, "GET", "/instructors"),
    ]);
    setCourses(rC.data || []);
    setCategories(rCat.data || []);
    setInstructors(rI.data || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { if (token) loadAll(); }, [token, loadAll]);

  const openEditor = async (c) => {
    setCourse(c); setModules([]); setLessons({}); setResources({});
    setExpanded({}); setEdError(null);
    setModM(null); setLesM(null); setResM(null); setUpVid(null);
    setView("editor"); setEdLoad(true);
    const rM = await api(token, "GET", `/courses/${c.id}/modules`);
    if (!rM.success) { setEdError(rM.message); setEdLoad(false); return; }
    const mods = rM.data || [];
    setModules(mods);
    const lesMap = {};
    if (mods.length > 0) {
      const res = await Promise.all(mods.map(m => api(token, "GET", `/modules/${m.id}/lessons`)));
      mods.forEach((m, i) => { lesMap[m.id] = res[i].data || []; });
    }
    setLessons(lesMap);
    const exp = {};
    mods.forEach(m => exp[m.id] = true);
    setExpanded(exp);
    setEdLoad(false);
  };

  const reloadMod = async (mid) => {
    const r = await api(token, "GET", `/modules/${mid}/lessons`);
    setLessons(p => ({ ...p, [mid]: r.data || [] }));
  };

  const reloadAllMods = async () => {
    if (!course) return;
    const rM = await api(token, "GET", `/courses/${course.id}/modules`);
    const mods = rM.data || [];
    setModules(mods);
    const lesMap = {};
    if (mods.length > 0) {
      const res = await Promise.all(mods.map(m => api(token, "GET", `/modules/${m.id}/lessons`)));
      mods.forEach((m, i) => { lesMap[m.id] = res[i].data || []; });
    }
    setLessons(lesMap);
    const exp = {};
    mods.forEach(m => { exp[m.id] = expanded[m.id] !== false; });
    setExpanded(exp);
  };

  const loadRes = async (lid) => {
    const r = await api(token, "GET", `/lessons/${lid}/resources`);
    setResources(p => ({ ...p, [lid]: r.data || [] }));
  };

  /* ═══ COURS ═══ */
  const BLANK = {
    title:"",slug:"",short_description:"",description:"",
    instructor_id:"",category_id:"",price:0,original_price:"",duration_hours:"",
    level:"beginner",language:"fr",thumbnail_url:"",video_preview_url:"",
    is_published:false,is_featured:false,is_free:false,
    is_subscription_included:false,is_forum_enabled:true,
    sequential_mode:false,requires_approval:false,
    instructor_commission_rate:70,requirements:"",learning_outcomes:"",
  };

  const openCreate = () => { setIsNew(true); setCourse(null); setCForm(BLANK); setView("form"); };
  const openEdit = (c, e) => {
    e?.stopPropagation(); setIsNew(false); setCourse(c);
    setCForm({
      title:c.title||"",slug:c.slug||"",short_description:c.short_description||"",
      description:c.description||"",instructor_id:c.instructor_id||"",
      category_id:c.category_id||"",price:c.price??0,
      original_price:c.original_price||"",duration_hours:c.duration_hours||"",
      level:c.level||"beginner",language:c.language||"fr",
      thumbnail_url:c.thumbnail_url||"",video_preview_url:c.video_preview_url||"",
      is_published:!!c.is_published,is_featured:!!c.is_featured,is_free:!!c.is_free,
      is_subscription_included:!!c.is_subscription_included,
      is_forum_enabled:c.is_forum_enabled!==false,
      sequential_mode:!!c.sequential_mode,requires_approval:!!c.requires_approval,
      instructor_commission_rate:c.instructor_commission_rate||70,
      requirements:Array.isArray(c.requirements)?c.requirements.join("\n"):(c.requirements||""),
      learning_outcomes:Array.isArray(c.learning_outcomes)?c.learning_outcomes.join("\n"):(c.learning_outcomes||""),
    });
    setView("form");
  };

  const saveCourse = async () => {
    if (!cForm.title?.trim()) { t$("Titre requis", false); return; }
    if (!cForm.instructor_id) { t$("Instructeur requis", false); return; }
    setSaving(true);
    const payload = {
      ...cForm, price: Number(cForm.price) || 0,
      requirements: cForm.requirements ? cForm.requirements.split("\n").filter(Boolean) : [],
      learning_outcomes: cForm.learning_outcomes ? cForm.learning_outcomes.split("\n").filter(Boolean) : [],
    };
    const r = isNew
      ? await api(token, "POST", "/courses", payload)
      : await api(token, "PATCH", `/courses/${course.id}`, payload);
    setSaving(false);
    if (r.success) { t$(r.message || "Cours enregistré ✓"); await loadAll(); setView("list"); }
    else t$(r.message || "Erreur", false);
  };

  const togglePublishCourse = async (c, e) => {
    e?.stopPropagation();
    const r = await api(token, "PATCH", `/courses/${c.id}/publish`, { is_published: !c.is_published });
    if (r.success) { t$(r.message); loadAll(); }
    else t$(r.message, false);
  };

  const deleteCourse = (c, e) => {
    e?.stopPropagation();
    ask("Supprimer ce cours ?", `"${c.title}" et tout son contenu sera supprimé.`, async () => {
      const r = await api(token, "DELETE", `/courses/${c.id}`);
      if (r.success) { t$("Cours supprimé"); loadAll(); if (view !== "list") setView("list"); }
      else t$(r.message, false);
    });
  };

  /* ═══ TÉLÉCHARGER COURS EN LOCAL ═══ */
  const downloadCourse = async () => {
    if (!course) return;
    setDlCourse(true);
    try {
      // Charger modules + leçons + ressources
      const rM = await api(token, "GET", `/courses/${course.id}/modules`);
      const mods = rM.data || [];
      const full = [];
      for (const mod of mods) {
        const rL = await api(token, "GET", `/modules/${mod.id}/lessons`);
        const lessFull = [];
        for (const les of (rL.data || [])) {
          const rR = await api(token, "GET", `/lessons/${les.id}/resources`);
          lessFull.push({ ...les, resources: rR.data || [] });
        }
        full.push({ ...mod, lessons: lessFull });
      }
      const payload = {
        exported_at: new Date().toISOString(),
        course: { ...course },
        modules: full,
        stats: {
          total_modules: full.length,
          total_lessons: full.flatMap(m => m.lessons).length,
          total_resources: full.flatMap(m => m.lessons).flatMap(l => l.resources).length,
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      a.href     = url;
      a.download = `cours-${slug}-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      t$("📥 Cours téléchargé !");
    } catch(e) {
      t$("Erreur export: " + e.message, false);
    } finally {
      setDlCourse(false);
    }
  };

  /* ═══ MODULES ═══ */
  const openModM = (mod = null) => setModM(mod || { _new: true, title: "", description: "", order_index: modules.length, is_published: true });

  const saveMod = async () => {
    if (!modM?.title?.trim()) { t$("Titre requis", false); return; }
    setModSv(true);
    const payload = { title: modM.title, description: modM.description || "", order_index: +modM.order_index || 0, is_published: modM.is_published !== false };
    const r = modM._new
      ? await api(token, "POST", "/modules", { ...payload, course_id: course.id })
      : await api(token, "PATCH", `/modules/${modM.id}`, payload);
    setModSv(false);
    if (r.success) { t$(r.message || "Module enregistré"); setModM(null); await reloadAllMods(); }
    else t$(r.message, false);
  };

  const togglePublishMod = async (mod) => {
    const r = await api(token, "PATCH", `/modules/${mod.id}/publish`, { is_published: !mod.is_published });
    if (r.success) { t$(r.message); await reloadAllMods(); }
    else t$(r.message, false);
  };

  const deleteMod = (mod) => ask("Supprimer ce module ?", `"${mod.title}" et toutes ses leçons seront supprimés.`, async () => {
    const r = await api(token, "DELETE", `/modules/${mod.id}`);
    if (r.success) { t$("Module supprimé"); await reloadAllMods(); }
    else t$(r.message, false);
  });

  /* ═══ LEÇONS ═══ */
  const openLesM = (mid, les = null) => setLesM({
    modId: mid, les,
    title: les?.title || "", content_type: les?.content_type || "video",
    content_url: les?.content_url || "", article_content: les?.article_content || "",
    duration_minutes: les?.duration_minutes || 0, order_index: les?.order_index || 0,
    is_published: les ? les.is_published !== 0 : true,
    is_preview: !!les?.is_preview,
    requires_completion: les ? les.requires_completion !== 0 : true,
    is_downloadable: !!les?.is_downloadable,
  });

  const saveLes = async () => {
    if (!lesM?.title?.trim()) { t$("Titre requis", false); return; }
    setLesSv(true);
    const { modId, les, title, content_type, content_url, article_content, duration_minutes, order_index, is_published, is_preview, requires_completion, is_downloadable } = lesM;
    const payload = { title, content_type, content_url: content_url || null, article_content: article_content || null, duration_minutes: +duration_minutes || 0, order_index: +order_index || 0, is_published, is_preview, requires_completion, is_downloadable };
    const r = les
      ? await api(token, "PATCH", `/lessons/${les.id}`, payload)
      : await api(token, "POST", "/lessons", { ...payload, module_id: modId });
    setLesSv(false);
    if (r.success) { t$(r.message || "Leçon enregistrée"); setLesM(null); await reloadMod(modId); }
    else t$(r.message, false);
  };

  const togglePublishLes = async (les, mid) => {
    const r = await api(token, "PATCH", `/lessons/${les.id}/publish`, { is_published: !les.is_published });
    if (r.success) { t$(r.message); await reloadMod(mid); }
    else t$(r.message, false);
  };

  const deleteLes = (les, mid) => ask("Supprimer cette leçon ?", `"${les.title}" sera supprimée.`, async () => {
    const r = await api(token, "DELETE", `/lessons/${les.id}`);
    if (r.success) { t$("Leçon supprimée"); await reloadMod(mid); }
    else t$(r.message, false);
  });

  /* ═══ RESSOURCES ═══ */
  const deleteRes = (res, lid) => ask("Supprimer ?", `"${res.title}" sera supprimée.`, async () => {
    const r = await api(token, "DELETE", `/lesson-resources/${res.id}`);
    if (r.success) { t$("Supprimé"); await loadRes(lid); }
    else t$(r.message, false);
  });

  /* ═══ FILTRES ═══ */
  const filtered = courses.filter(c => {
    const s = (c.title + (c.instructor_name || "") + (c.category_name || "")).toLowerCase().includes(search.toLowerCase());
    if (filter === "published") return s && c.is_published;
    if (filter === "draft")     return s && !c.is_published;
    if (filter === "free")      return s && c.is_free;
    if (filter === "featured")  return s && c.is_featured;
    return s;
  });

  const totalLessons = Object.values(lessons).flat().length;

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <Toast t={toast} />
      <Confirm d={dlg} onClose={() => setDlg(null)} />

      {/* ════ LISTE DES COURS ════ */}
      {view === "list" && (
        <>
          {/* Header */}
          <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen size={26} style={{ color: "#2d287f" }} /> Gestion des cours
              </h1>
              <p className="text-sm text-slate-400 mt-1">{courses.length} cours · {courses.filter(c => c.is_published).length} publiés · {courses.filter(c => c.is_free).length} gratuits</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              <Plus size={16} /> Nouveau cours
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par titre, instructeur…" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" style={{ "--tw-ring-color": "#2d287f20" }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[["all","Tous"],["published","✅ Publiés"],["draft","○ Brouillons"],["free","🆓 Gratuits"],["featured","⭐ Vedette"]].map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${filter === v ? "text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`} style={filter === v ? { background: "#2d287f" } : {}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Grille */}
          {loading ? (
            <div className="flex justify-center py-20"><Spin /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-6xl mb-3">📭</div>
              <p className="font-bold text-base">Aucun cours trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
              {filtered.map(c => {
                const lc = LEVEL_CLR[c.level] || "#2d287f";
                return (
                  <div key={c.id} onClick={() => openEditor(c)} className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 shadow-sm">
                    {/* Bannière */}
                    <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg,${lc}30,${lc}88)` }}>
                      {c.thumbnail_url && <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover opacity-80" onError={e => e.target.style.display = "none"} />}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,.55))" }} />
                      <div className="absolute top-2.5 left-3 flex gap-1.5">
                        <Badge color={lc} bg={lc + "30"}>{LEVEL_MAP[c.level]}</Badge>
                        <Badge color="#fff" bg="rgba(0,0,0,.35)">{(c.language || "fr").toUpperCase()}</Badge>
                      </div>
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                        {c.is_featured && <Badge color="#facc15" bg="rgba(0,0,0,.4)">⭐</Badge>}
                        <Badge color={c.is_published ? "#4ade80" : "#fca5a5"} bg="rgba(0,0,0,.4)">{c.is_published ? "✓ Publié" : "○ Brouillon"}</Badge>
                      </div>
                      <p className="absolute bottom-2 left-3 right-3 font-bold text-white text-sm leading-tight" style={{ textShadow: "0 1px 5px rgba(0,0,0,.6)" }}>{c.title}</p>
                    </div>
                    {/* Corps */}
                    <div className="p-4">
                      <p className="text-xs text-slate-400 mb-2 truncate">{c.instructor_name || "—"} · {c.category_name || "—"}</p>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        <Badge color="#2d287f">{c.is_free ? "GRATUIT" : `${Number(c.price || 0).toLocaleString()} XAF`}</Badge>
                        <Badge color="#64748b">⏱ {c.duration_hours || 0}h</Badge>
                        <Badge color="#64748b">👥 {(c.student_count || 0).toLocaleString()}</Badge>
                        <Badge color="#d97706">⭐ {Number(c.rating || 0).toFixed(1)}</Badge>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditor(c)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1">
                          <Layers size={12} /> Contenu
                        </button>
                        <button onClick={e => openEdit(c, e)} className="flex-1 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-100 transition flex items-center justify-center gap-1">
                          <Edit3 size={12} /> Modifier
                        </button>
                        <button onClick={e => togglePublishCourse(c, e)} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${c.is_published ? "bg-orange-50 text-orange-500 hover:bg-orange-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                          {c.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={e => deleteCourse(c, e)} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════ FORMULAIRE COURS ════ */}
      {view === "form" && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-4 mb-7">
            <button onClick={() => setView("list")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
              ← Retour
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">{isNew ? "🆕 Nouveau cours" : `✏️ ${course?.title}`}</h1>
              {!isNew && <p className="text-xs text-slate-400 mt-0.5">ID #{course?.id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_290px] gap-5 items-start">
            {/* Gauche */}
            <div className="flex flex-col gap-4">
              {[
                ["📋 Informations générales", "#2d287f", () => (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Titre" required><input className={IS} value={cForm.title || ""} onChange={e => setCForm(p => ({ ...p, title: e.target.value }))} placeholder="Docker Fondamentaux" /></Field>
                    <Field label="Slug"><input className={IS} value={cForm.slug || ""} onChange={e => setCForm(p => ({ ...p, slug: e.target.value }))} placeholder="docker-fondamentaux" /></Field>
                    <Field label="Résumé court" col2><input className={IS} value={cForm.short_description || ""} onChange={e => setCForm(p => ({ ...p, short_description: e.target.value }))} placeholder="Description affichée dans les listes" /></Field>
                    <Field label="Description complète" col2><textarea className={`${IS} resize-y`} rows={5} value={cForm.description || ""} onChange={e => setCForm(p => ({ ...p, description: e.target.value }))} /></Field>
                  </div>
                )],
                ["📝 Pédagogie", "#0ea5e9", () => (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Prérequis" hint="1 par ligne" col2><textarea className={`${IS} resize-y`} rows={3} value={cForm.requirements || ""} onChange={e => setCForm(p => ({ ...p, requirements: e.target.value }))} placeholder={"Bases de Linux\nConnaissance Docker"} /></Field>
                    <Field label="Objectifs d'apprentissage" hint="1 par ligne" col2><textarea className={`${IS} resize-y`} rows={3} value={cForm.learning_outcomes || ""} onChange={e => setCForm(p => ({ ...p, learning_outcomes: e.target.value }))} placeholder={"Déployer des conteneurs\nMaîtriser Docker Compose"} /></Field>
                  </div>
                )],
                ["🖼 Médias", "#f59e0b", () => (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="URL Image de couverture">
                      <input className={IS} value={cForm.thumbnail_url || ""} onChange={e => setCForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://…" />
                      {cForm.thumbnail_url && <img src={cForm.thumbnail_url} alt="" className="mt-2 h-16 rounded-lg object-cover" onError={e => e.target.style.display = "none"} />}
                    </Field>
                    <Field label="URL Vidéo de prévisualisation"><input className={IS} value={cForm.video_preview_url || ""} onChange={e => setCForm(p => ({ ...p, video_preview_url: e.target.value }))} placeholder="https://youtube.com/…" /></Field>
                  </div>
                )],
              ].map(([title, accent, render]) => (
                <div key={title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm" style={{ borderLeft: `4px solid ${accent}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: accent }}>{title}</p>
                  {render()}
                </div>
              ))}
            </div>

            {/* Droite */}
            <div className="flex flex-col gap-3">
              {[
                ["👤 Assignation", "#8b5cf6", () => (
                  <div className="flex flex-col gap-3">
                    <Field label="Instructeur" required>
                      <select className={IS} value={cForm.instructor_id || ""} onChange={e => setCForm(p => ({ ...p, instructor_id: e.target.value }))}>
                        <option value="">— Sélectionner un instructeur —</option>
                        {instructors.filter(i=>i.role==="instructor").length>0 && (
                          <optgroup label="👨‍🏫 Instructeurs">
                            {instructors.filter(i=>i.role==="instructor").map(i => (
                              <option key={i.id} value={i.id}>{i.first_name} {i.last_name} — {i.email}</option>
                            ))}
                          </optgroup>
                        )}
                        {instructors.filter(i=>i.role==="admin").length>0 && (
                          <optgroup label="🛡️ Admins">
                            {instructors.filter(i=>i.role==="admin").map(i => (
                              <option key={i.id} value={i.id}>{i.first_name} {i.last_name} — {i.email}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </Field>
                    <Field label="Catégorie">
                      <select className={IS} value={cForm.category_id || ""} onChange={e => setCForm(p => ({ ...p, category_id: e.target.value }))}>
                        <option value="">— Aucune —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </Field>
                  </div>
                )],
                ["⚙️ Paramètres", "#10b981", () => (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Niveau"><select className={IS} value={cForm.level || "beginner"} onChange={e => setCForm(p => ({ ...p, level: e.target.value }))}>{Object.entries(LEVEL_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                    <Field label="Langue"><select className={IS} value={cForm.language || "fr"} onChange={e => setCForm(p => ({ ...p, language: e.target.value }))}><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 Anglais</option><option value="ar">🇸🇦 Arabe</option></select></Field>
                    <Field label="Durée (h)"><input type="number" min="0" className={IS} value={cForm.duration_hours || ""} onChange={e => setCForm(p => ({ ...p, duration_hours: e.target.value }))} /></Field>
                    <Field label="Commission %"><input type="number" min="0" max="100" className={IS} value={cForm.instructor_commission_rate || 70} onChange={e => setCForm(p => ({ ...p, instructor_commission_rate: e.target.value }))} /></Field>
                  </div>
                )],
                ["💰 Prix", "#f97316", () => (
                  <div className="flex flex-col gap-3">
                    <Toggle label="Cours gratuit" checked={!!cForm.is_free} on={v => setCForm(p => ({ ...p, is_free: v, price: v ? 0 : p.price }))} color="#059669" />
                    {!cForm.is_free && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field label="Prix XAF"><input type="number" min="0" className={IS} value={cForm.price || 0} onChange={e => setCForm(p => ({ ...p, price: e.target.value }))} /></Field>
                        <Field label="Prix barré"><input type="number" min="0" className={IS} value={cForm.original_price || ""} onChange={e => setCForm(p => ({ ...p, original_price: e.target.value }))} /></Field>
                      </div>
                    )}
                  </div>
                )],
                ["👁 Visibilité & Options", "#6366f1", () => (
                  <div className="flex flex-col gap-3">
                    <Toggle label="Publié" checked={!!cForm.is_published} on={v => setCForm(p => ({ ...p, is_published: v }))} />
                    <Toggle label="Mis en avant" checked={!!cForm.is_featured} on={v => setCForm(p => ({ ...p, is_featured: v }))} color="#d97706" />
                    <Toggle label="Inclus dans l'abonnement" checked={!!cForm.is_subscription_included} on={v => setCForm(p => ({ ...p, is_subscription_included: v }))} color="#7c3aed" />
                    <Toggle label="Forum activé" checked={!!cForm.is_forum_enabled} on={v => setCForm(p => ({ ...p, is_forum_enabled: v }))} color="#0ea5e9" />
                    <Toggle label="Mode séquentiel" checked={!!cForm.sequential_mode} on={v => setCForm(p => ({ ...p, sequential_mode: v }))} color="#f59e0b" />
                    <Toggle label="Approbation requise" checked={!!cForm.requires_approval} on={v => setCForm(p => ({ ...p, requires_approval: v }))} color="#ef4444" />
                  </div>
                )],
              ].map(([title, accent, render]) => (
                <div key={title} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm" style={{ borderLeft: `4px solid ${accent}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{title}</p>
                  {render()}
                </div>
              ))}

              <button onClick={saveCourse} disabled={saving} className="w-full py-3.5 text-white font-bold text-sm rounded-2xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5" style={{ background: saving ? "#a5b4fc" : "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                {saving ? "Enregistrement…" : isNew ? "✓ Créer le cours" : "✓ Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ ÉDITEUR DE CONTENU ════ */}
      {view === "editor" && course && (
        <div className="animate-fade-in-up">
          {/* Bandeau cours */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex-wrap">
            <button onClick={() => setView("list")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex-shrink-0">
              ← Retour
            </button>
            <div className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg,${LEVEL_CLR[course.level] || "#2d287f"}50,${LEVEL_CLR[course.level] || "#2d287f"})` }}>
              {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-slate-900 text-lg">{course.title}</h1>
                <Badge color={course.is_published ? "#059669" : "#94a3b8"}>{course.is_published ? "✓ Publié" : "○ Brouillon"}</Badge>
                {course.is_featured && <Badge color="#d97706">⭐ Vedette</Badge>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {course.instructor_name} · {LEVEL_MAP[course.level]} · {(course.language || "fr").toUpperCase()}
                {" · "}<strong className="text-primary" style={{ color: "#2d287f" }}>{modules.length}</strong> module{modules.length !== 1 ? "s" : ""}
                {" · "}<strong className="text-primary" style={{ color: "#2d287f" }}>{totalLessons}</strong> leçon{totalLessons !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={e => openEdit(course, e)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-sm font-bold hover:bg-violet-100 transition">
                <Edit3 size={14} /> Modifier
              </button>
              <button onClick={downloadCourse} disabled={dlCourse} title="Télécharger le cours en JSON" className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition disabled:opacity-60">
                {dlCourse ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Download size={14} />}
                {dlCourse ? "Export…" : "Export"}
              </button>
              <button onClick={() => openModM()} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md" style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                <Plus size={15} /> Module
              </button>
            </div>
          </div>

          {/* Erreur */}
          {edError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-red-600 text-sm font-medium">
              <AlertCircle size={16} /> {edError}
            </div>
          )}

          {edLoad ? (
            <div className="flex justify-center py-16"><Spin /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {modules.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="font-bold text-slate-700 text-base mb-2">Ce cours n'a pas encore de modules</p>
                  <p className="text-sm text-slate-400 mb-5">Vérifiez que le backend est rebuild · npm run build && pm2 restart 0</p>
                  <button onClick={() => openModM()} className="px-7 py-3 text-white rounded-2xl font-bold text-sm shadow-lg" style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                    + Créer le premier module
                  </button>
                </div>
              )}

              {modules.map((mod, mi) => {
                const isOpen = expanded[mod.id];
                const modLes = lessons[mod.id] || [];
                const totMin = modLes.reduce((s, l) => s + (+l.duration_minutes || 0), 0);

                return (
                  <div key={mod.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {/* Header module */}
                    <div
                      onClick={() => setExpanded(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                      className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${isOpen ? "bg-gradient-to-r from-blue-50 to-violet-50" : "bg-slate-50 hover:bg-slate-100"}`}
                      style={{ borderBottom: isOpen ? "1px solid #e2e8f0" : "none" }}
                    >
                      {/* Numéro */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>{mi + 1}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{mod.title}</p>
                          {/* Statut publié MODULE */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {mod.is_published ? "✓ Publié" : "○ Brouillon"}
                          </span>
                        </div>
                        {mod.description && <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>}
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <Badge color="#2d287f">{modLes.length} leçon{modLes.length !== 1 ? "s" : ""}</Badge>
                          {totMin > 0 && <Badge color="#64748b">⏱ {totMin} min</Badge>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openLesM(mod.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                          <Plus size={11} /> Leçon
                        </button>
                        {/* Publier/Dépublier MODULE */}
                        <button onClick={() => togglePublishMod(mod)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${mod.is_published ? "bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"}`}>
                          {mod.is_published ? <><EyeOff size={11} /> Dépublier</> : <><Eye size={11} /> Publier</>}
                        </button>
                        <button onClick={() => openModM(mod)} className="w-8 h-8 flex items-center justify-center bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition"><Edit3 size={13} /></button>
                        <button onClick={() => deleteMod(mod)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 size={13} /></button>
                        <ChevronDown size={14} className="text-slate-400 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
                      </div>
                    </div>

                    {/* Corps leçons */}
                    {isOpen && (
                      <div className="p-4 pb-5">
                        {modLes.length === 0 ? (
                          <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <p className="text-sm text-slate-400 font-medium mb-2">Aucune leçon dans ce module</p>
                            <button onClick={() => openLesM(mod.id)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">+ Ajouter la première leçon</button>
                          </div>
                        ) : (
                          <>
                            {modLes.map((les, li) => {
                              const tc = TYPE_CLR[les.content_type] || "#64748b";
                              const TIcon = TYPE_ICO[les.content_type] || Film;
                              const rc = les.resource_count || 0;
                              return (
                                <div key={les.id} className="border border-slate-100 rounded-2xl mb-2 overflow-hidden">
                                  {/* Ligne leçon */}
                                  <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80">
                                    <span className="text-[8px] text-slate-300 flex-shrink-0">⠿</span>
                                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: "#e0e7ff", color: "#4f46e5" }}>{li + 1}</span>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tc + "18", color: tc }}>
                                      <TIcon size={13} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-slate-900 text-sm truncate">{les.title}</p>
                                      <div className="flex gap-1.5 mt-1 flex-wrap">
                                        <Badge color={tc}>{TYPE_MAP[les.content_type]}</Badge>
                                        {les.duration_minutes > 0 && <Badge color="#64748b">⏱ {les.duration_minutes}min</Badge>}
                                        {les.is_preview === 1 && <Badge color="#d97706">👁 Aperçu</Badge>}
                                        {les.is_downloadable === 1 && <Badge color="#7c3aed">📥 Offline</Badge>}
                                        {les.content_url && <Badge color="#0ea5e9">🔗 URL</Badge>}
                                        {rc > 0 && <Badge color="#059669">📎 {rc}</Badge>}
                                        {/* Statut LEÇON */}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${les.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                          {les.is_published ? "✓" : "○ Brouillon"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {/* Bouton vidéo upload */}
                                      {les.content_type === "video" && (
                                        <button onClick={() => setUpVid(les)} className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">
                                          <Film size={11} /> Vidéo
                                        </button>
                                      )}
                                      {/* Ressources */}
                                      <button onClick={async () => { await loadRes(les.id); setResM({ lesId: les.id, les }); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition">
                                        <Paperclip size={11} /> Fichiers
                                      </button>
                                      {/* Publier/Dépublier LEÇON */}
                                      <button onClick={() => togglePublishLes(les, mod.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${les.is_published ? "bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"}`}>
                                        {les.is_published ? <EyeOff size={11} /> : <Eye size={11} />}
                                      </button>
                                      <button onClick={() => openLesM(mod.id, les)} className="w-7 h-7 flex items-center justify-center bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition"><Edit3 size={12} /></button>
                                      <button onClick={() => deleteLes(les, mod.id)} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 size={12} /></button>
                                    </div>
                                  </div>

                                  {/* Ressources inline */}
                                  {resources[les.id] !== undefined && (
                                    <div className="px-4 pb-3 pt-2.5 bg-white border-t border-slate-50">
                                      {resources[les.id].length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Aucun fichier attaché</p>
                                      ) : resources[les.id].map(r => (
                                        <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl mb-1.5 border border-slate-100">
                                          <span className="text-sm">{r.file_type==="pdf"?"📄":r.file_type==="mp4"||r.file_type==="video"?"🎬":r.file_type==="zip"?"🗜":r.file_type==="pptx"?"📊":r.file_type==="docx"?"📝":r.file_type==="code"?"💻":r.file_type==="link"?"🔗":"📎"}</span>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs text-slate-800">{r.title}</p>
                                            <a href={r.file_url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 truncate block hover:text-indigo-700">{(r.file_url || "").slice(0, 55)}{(r.file_url || "").length > 55 ? "…" : ""}</a>
                                          </div>
                                          {r.file_size > 0 && <Badge color="#64748b">{(r.file_size/1024/1024).toFixed(1)}Mo</Badge>}
                                          <a href={r.file_url} target="_blank" rel="noreferrer" download className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-400 rounded-lg hover:bg-blue-100 transition" title="Télécharger"><Download size={10} /></a>
                                          <button onClick={() => deleteRes(r, les.id)} className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition"><Trash2 size={10} /></button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <button onClick={() => openLesM(mod.id)} className="w-full mt-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition">
                              + Ajouter une leçon
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {modules.length > 0 && (
                <button onClick={() => openModM()} className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                  + Ajouter un module
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════ MODAL MODULE ════ */}
      <Modal open={!!modM} onClose={() => setModM(null)} title={modM?._new ? "➕ Nouveau module" : `✏️ ${modM?.title || ""}`}>
        {modM && (
          <>
            <div className="flex flex-col gap-4">
              <Field label="Titre" required><input className={IS} value={modM.title || ""} onChange={e => setModM(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Introduction et Prérequis" autoFocus onKeyDown={e => e.key === "Enter" && saveMod()} /></Field>
              <Field label="Description"><input className={IS} value={modM.description || ""} onChange={e => setModM(p => ({ ...p, description: e.target.value }))} placeholder="Description courte du module" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ordre"><input type="number" min="0" className={IS} value={modM.order_index ?? 0} onChange={e => setModM(p => ({ ...p, order_index: +e.target.value }))} /></Field>
                <div className="flex items-end pb-2"><Toggle label="Module publié" checked={modM.is_published !== false} on={v => setModM(p => ({ ...p, is_published: v }))} color="#059669" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setModM(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Annuler</button>
              <button onClick={saveMod} disabled={modSv} className="flex-[2] py-3 text-white rounded-xl font-bold text-sm transition" style={{ background: modSv ? "#a5b4fc" : "#2d287f" }}>
                {modSv ? "Enregistrement…" : modM._new ? "✓ Créer le module" : "✓ Mettre à jour"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ════ MODAL LEÇON ════ */}
      <Modal open={!!lesM} onClose={() => setLesM(null)} title={lesM?.les ? `✏️ ${lesM.les.title}` : "➕ Nouvelle leçon"} wide>
        {lesM && (
          <>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[1fr_90px] gap-3">
                <Field label="Titre" required><input className={IS} value={lesM.title || ""} onChange={e => setLesM(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Introduction à Docker" autoFocus /></Field>
                <Field label="Ordre"><input type="number" min="0" className={IS} value={lesM.order_index ?? 0} onChange={e => setLesM(p => ({ ...p, order_index: +e.target.value }))} /></Field>
              </div>

              {/* Type de contenu */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Type de contenu *</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(TYPE_MAP).map(([v, l]) => {
                    const sel = (lesM.content_type || "video") === v;
                    const tc = TYPE_CLR[v];
                    const TIcon = TYPE_ICO[v] || Film;
                    return (
                      <button key={v} onClick={() => setLesM(p => ({ ...p, content_type: v }))} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 font-bold text-xs transition" style={{ borderColor: sel ? tc : "#e2e8f0", background: sel ? tc + "14" : "#fff", color: sel ? tc : "#64748b" }}>
                        <TIcon size={13} /> {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL vidéo + Upload inline */}
              {["video", "exercise", "download"].includes(lesM.content_type || "video") && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#2d287f" }}>
                    {lesM.content_type === "video" ? "🎬 Contenu vidéo" : lesM.content_type === "download" ? "📥 URL du fichier" : "⚡ URL de l'exercice"}
                  </p>

                  {/* Onglets URL / Upload — uniquement pour vidéo */}
                  {lesM.content_type === "video" && (
                    <>
                      <div className="flex gap-2 p-1 bg-white rounded-xl mb-3 border border-slate-200">
                        {[["url", "🔗 URL externe"], ["upload", "💾 Depuis mon PC"]].map(([v, l]) => (
                          <button key={v} onClick={() => setLesM(p => ({ ...p, _vidTab: v }))} className="flex-1 py-2 rounded-lg text-xs font-bold transition" style={{ background: (lesM._vidTab||"url")===v ? "#2d287f" : "transparent", color: (lesM._vidTab||"url")===v ? "#fff" : "#64748b" }}>
                            {l}
                          </button>
                        ))}
                      </div>

                      {/* Tab URL */}
                      {(lesM._vidTab||"url") === "url" && (
                        <>
                          <Field label="URL YouTube / Vimeo / MP4 direct" hint="optionnel">
                            <input className={IS} value={lesM.content_url || ""} onChange={e => setLesM(p => ({ ...p, content_url: e.target.value }))} placeholder="https://youtube.com/watch?v=…" />
                          </Field>
                          {lesM.content_url && (
                            <div className="mt-3 rounded-2xl overflow-hidden bg-black max-h-44" style={{ aspectRatio:"16/9" }}>
                              {(lesM.content_url.includes("youtube") || lesM.content_url.includes("youtu.be")) ? (
                                <iframe src={`https://www.youtube.com/embed/${lesM.content_url.includes("v=") ? lesM.content_url.split("v=")[1]?.split("&")[0] : lesM.content_url.split("/").pop()}`} className="w-full h-full border-none" allowFullScreen title="preview" />
                              ) : lesM.content_url.match(/\.(mp4|webm|ogg|mkv|avi|mov)$/i) || lesM.content_url.includes("/uploads/") ? (
                                <video
                                  src={lesM.content_url.includes("localhost:5000/uploads/")
                                    ? lesM.content_url.replace(/^https?:\/\/[^/]+\/uploads\//, "/uploads/")
                                    : lesM.content_url}
                                  controls className="w-full max-h-44"
                                />
                              ) : <div className="flex items-center justify-center h-32 text-slate-400 text-xs">🔗 {lesM.content_url.slice(0,60)}</div>}
                            </div>
                          )}
                        </>
                      )}

                      {/* Tab Upload PC — seulement si leçon existante (a un ID) */}
                      {(lesM._vidTab||"url") === "upload" && (
                        lesM.les?.id ? (
                          <div>
                            <VideoUploader
                              token={token}
                              lessonId={lesM.les.id}
                              currentUrl={lesM.content_url || ""}
                              onSuccess={(url) => {
                                setLesM(p => ({ ...p, content_url: url, _vidTab: "url" }));
                                t$("🎬 Vidéo uploadée !");
                                // Mettre à jour la leçon dans la liste
                                setLessons(prev => {
                                  const map = { ...prev };
                                  for (const [mid, arr] of Object.entries(map)) {
                                    map[mid] = arr.map(l => l.id === lesM.les.id ? { ...l, content_url: url } : l);
                                  }
                                  return map;
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 text-center bg-amber-50">
                            <p className="text-amber-700 font-bold text-sm mb-1">⚠️ Créez d'abord la leçon</p>
                            <p className="text-amber-600 text-xs">L'upload depuis PC n'est disponible qu'après la création de la leçon.</p>
                            <p className="text-amber-600 text-xs mt-1">Créez la leçon, puis cliquez sur le bouton <strong>🎬 Vidéo</strong> sur la ligne de la leçon.</p>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {/* Pour exercice et téléchargement : juste l'URL */}
                  {lesM.content_type !== "video" && (
                    <Field label={lesM.content_type === "download" ? "URL du fichier" : "URL du Lab / exercice"} hint="optionnel">
                      <input className={IS} value={lesM.content_url || ""} onChange={e => setLesM(p => ({ ...p, content_url: e.target.value }))} placeholder="https://…" />
                    </Field>
                  )}
                </div>
              )}

              {/* Contenu article */}
              {lesM.content_type === "article" && (
                <div className="rounded-2xl overflow-hidden border-2 border-red-200">
                  {/* Bandeau rouge */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-200">
                    <FileText size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">📝 Contenu de l'article</span>
                    <span className="text-xs text-red-400 ml-1">— HTML accepté</span>
                  </div>
                  <textarea
                    className="w-full resize-y font-mono text-xs text-red-900 bg-red-50/40 border-none outline-none p-4 placeholder:text-red-300"
                    rows={9}
                    value={lesM.article_content || ""}
                    onChange={e => setLesM(p => ({ ...p, article_content: e.target.value }))}
                    placeholder={"<h2>Introduction</h2>\n<p>Dans cette leçon…</p>\n\n<h3>Section 1</h3>\n<p>Contenu de la section</p>"}
                    style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace", lineHeight: 1.6 }}
                  />
                  {/* Aperçu rendu */}
                  {lesM.article_content && (
                    <div className="border-t border-red-200">
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Aperçu rendu</span>
                      </div>
                      <div
                        className="px-5 py-4 bg-white text-sm text-slate-700 leading-7
                          [&_h2]:text-slate-900 [&_h2]:font-bold [&_h2]:text-base [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-1
                          [&_h3]:text-slate-800 [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mb-1.5 [&_h3]:mt-2
                          [&_p]:mb-2 [&_p]:text-slate-600
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_li]:text-slate-600 [&_li]:mb-0.5
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                          [&_strong]:font-bold [&_strong]:text-slate-900
                          [&_code]:bg-slate-100 [&_code]:text-red-600 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
                          [&_blockquote]:border-l-4 [&_blockquote]:border-red-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: lesM.article_content }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Durée */}
              <div className="flex items-end gap-4">
                <div className="w-40">
                  <Field label="Durée (minutes)"><input type="number" min="0" className={IS} value={lesM.duration_minutes ?? 0} onChange={e => setLesM(p => ({ ...p, duration_minutes: +e.target.value }))} /></Field>
                </div>
                {lesM.duration_minutes > 0 && <p className="text-sm text-slate-400 pb-2">≈ {Math.floor(lesM.duration_minutes / 60) > 0 ? `${Math.floor(lesM.duration_minutes / 60)}h ` : ""}{lesM.duration_minutes % 60 > 0 ? `${lesM.duration_minutes % 60}min` : ""}</p>}
              </div>

              {/* Options */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">⚙️ Options</p>
                <div className="grid grid-cols-2 gap-3">
                  <Toggle label="Leçon publiée" checked={lesM.is_published !== false} on={v => setLesM(p => ({ ...p, is_published: v }))} />
                  <Toggle label="Aperçu gratuit" checked={!!lesM.is_preview} on={v => setLesM(p => ({ ...p, is_preview: v }))} color="#d97706" />
                  <Toggle label="Complétion requise" checked={lesM.requires_completion !== false} on={v => setLesM(p => ({ ...p, requires_completion: v }))} color="#0ea5e9" />
                  <Toggle label="Téléchargeable offline" checked={!!lesM.is_downloadable} on={v => setLesM(p => ({ ...p, is_downloadable: v }))} color="#7c3aed" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setLesM(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Annuler</button>
              <button onClick={saveLes} disabled={lesSv} className="flex-[2] py-3 text-white rounded-xl font-bold text-sm transition" style={{ background: lesSv ? "#a5b4fc" : "#2d287f" }}>
                {lesSv ? "Enregistrement…" : lesM.les ? "✓ Mettre à jour la leçon" : "✓ Créer la leçon"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ════ MODAL UPLOAD VIDÉO ════ */}
      <Modal open={!!upVid} onClose={() => setUpVid(null)} title={`🎬 Vidéo — ${upVid?.title || ""}`} wide>
        {upVid && (
          <>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Glisse ta vidéo <strong>directement depuis ton ordinateur</strong> ou colle une URL YouTube / MP4.
              La vidéo uploadée sera stockée sur le serveur et automatiquement associée à la leçon.
            </p>
            <VideoUploader
              token={token}
              lessonId={upVid.id}
              currentUrl={upVid.content_url || ""}
              onSuccess={(url) => {
                t$("🎬 Vidéo enregistrée !");
                setLessons(prev => {
                  const map = { ...prev };
                  for (const [mid, arr] of Object.entries(map)) {
                    map[mid] = arr.map(l => l.id === upVid.id ? { ...l, content_url: url } : l);
                  }
                  return map;
                });
              }}
            />
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setUpVid(null)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Fermer</button>
            </div>
          </>
        )}
      </Modal>

      {/* ════ MODAL RESSOURCES / FICHIERS ════ */}
      <Modal open={!!resM} onClose={() => setResM(null)} title={`📎 Fichiers — ${resM?.les?.title || ""}`} wide>
        {resM && (
          <>
            {/* Ressources existantes */}
            {(resources[resM.lesId] || []).length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Fichiers existants ({resources[resM.lesId].length})</p>
                {resources[resM.lesId].map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl mb-2 border border-slate-100">
                    <span className="text-lg">{r.file_type === "pdf" ? "📄" : r.file_type === "mp4" ? "🎬" : r.file_type === "zip" ? "🗜" : r.file_type === "pptx" ? "📊" : "📎"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">{r.title}</p>
                      <a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">{(r.file_url || "").slice(0, 70)}</a>
                    </div>
                    {r.file_size && <Badge color="#64748b">{(r.file_size / 1024 / 1024).toFixed(1)} Mo</Badge>}
                    <button onClick={() => deleteRes(r, resM.lesId)} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">+ Ajouter un fichier</p>
              <ResourceUploader
                token={token}
                lessonId={resM.lesId}
                onSuccess={() => { t$("📎 Fichier ajouté !"); loadRes(resM.lesId); }}
              />
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <button onClick={() => setResM(null)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Fermer</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}