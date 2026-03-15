// src/pages/Student/StudentDashboard.jsx
// Dashboard light, aéré — inspiré Linear / Notion / Udemy
// Fond #f6f5fb, cards blanches, sidebar violet, accent jaune
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  PlayCircle, Trophy, Clock, BookOpen, BarChart2,
  Upload, Eye, FileText, Download, AlertCircle,
  Calendar, TrendingUp, Flame, Award, Zap, ArrowRight,
  RefreshCw, ChevronRight, Search, CheckCircle,
  GraduationCap, ShieldCheck, Lock, XCircle
} from "lucide-react";

/* ── Labels niveaux ── */
const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" }
const LEVEL_COLORS = {
  beginner:     "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
}

/* ── Couleurs fallback thumbnails ── */
const COURSE_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-500",
  "from-violet-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
]

function ThumbnailCard({ title, url, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false)
  const colorIdx = (title?.charCodeAt(0) || 0) % COURSE_COLORS.length
  const gradient = COURSE_COLORS[colorIdx]
  const initials = (title || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {url && !imgFailed
        ? <img src={url} alt={title} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
        : <div className="w-full h-full flex items-center justify-center">
            <span className="text-white font-bold text-xl drop-shadow">{initials}</span>
          </div>
      }
    </div>
  )
}

/* ── Palette ── */
const C = {
  primary:  "#2d287f",
  light:    "#5653e1",
  accent:   "#facc15",
  bg:       "#f6f5fb",
  card:     "#ffffff",
  border:   "#e8e6f5",
  text:     "#1e1b4b",
  muted:    "#6b7280",
};

/* ── Helpers ── */
const STAT = {
  free:     { label:"Actif",       dot:"bg-emerald-400", tx:"text-emerald-700", bg:"bg-emerald-50",  bd:"border-emerald-200" },
  verified: { label:"Actif",       dot:"bg-emerald-400", tx:"text-emerald-700", bg:"bg-emerald-50",  bd:"border-emerald-200" },
  pending:  { label:"En attente",  dot:"bg-amber-400",   tx:"text-amber-700",   bg:"bg-amber-50",    bd:"border-amber-200"   },
  rejected: { label:"Rejeté",      dot:"bg-red-400",     tx:"text-red-700",     bg:"bg-red-50",      bd:"border-red-200"     },
  default:  { label:"Non payé",    dot:"bg-gray-400",    tx:"text-gray-600",    bg:"bg-gray-50",     bd:"border-gray-200"    },
};
const LEVELS = { beginner:"Débutant", intermediate:"Intermédiaire", advanced:"Avancé" };
const LCLR   = { beginner:"bg-emerald-50 text-emerald-700", intermediate:"bg-sky-50 text-sky-700", advanced:"bg-violet-50 text-violet-700" };

const getSt   = c => STAT[c.payment_status] || STAT.default;
const hasAcc  = c => c.is_approved && ["free","verified"].includes(c.payment_status);
const getPct  = c => Number(c.total_lessons)>0
  ? Math.round(((c.completed_lessons||0)/Number(c.total_lessons))*100)
  : Math.min(100, Number(c.completion_percentage||0));
const isDone  = c => !!(c.completed_at) || getPct(c) >= 100;
const isActv  = c => hasAcc(c) && !isDone(c);
const isPend  = c => c.payment_status === "pending";
const isRej   = c => c.payment_status === "rejected";

/* ── Progress bar ── */
function ProgressBar({ pct, done=false }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height:8, background:"#e8e6f5" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.max(pct, pct>0?4:0)}%`,
          background: done
            ? "linear-gradient(90deg, #5653e1, #8b5cf6)"
            : pct >= 80
            ? "linear-gradient(90deg, #059669, #10b981)"
            : `linear-gradient(90deg, #2d287f, #5653e1)`,
          minWidth: pct > 0 ? 8 : 0,
        }}
      />
    </div>
  );
}

/* ── Course Card — light, minimal ── */
function CourseCard({ c, onUpload, uploading, onGo }) {
  const st  = getSt(c);
  const pct = getPct(c);
  const done= isDone(c);
  const acc = hasAcc(c);

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:-translate-y-1 cursor-default"
      style={{
        border: `1.5px solid ${done ? "#c4b5fd" : acc ? "#ddd9f9" : C.border}`,
        boxShadow: "0 2px 8px rgba(45,40,127,0.07)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 24px rgba(45,40,127,0.14)"; e.currentTarget.style.borderColor=done?"#a78bfa":acc?"#6366f1":"#c4b5fd"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 8px rgba(45,40,127,0.07)"; e.currentTarget.style.borderColor=done?"#c4b5fd":acc?"#ddd9f9":C.border; }}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        <ThumbnailCard title={c.title} url={c.thumbnail_url} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${st.bg} ${st.tx} ${st.bd}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        {/* Level badge */}
        {c.level && (
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${LCLR[c.level]||"bg-gray-50 text-gray-600"}`}>
              {LEVELS[c.level]||c.level}
            </span>
          </div>
        )}
        {/* Done checkmark */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center bg-violet-900/20">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" style={{ color:"#5653e1" }} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="text-sm font-bold line-clamp-2 leading-snug" style={{ color: C.text }}>
          {c.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {c.category_name && <span className="text-indigo-500 font-medium">{c.category_name}</span>}
          {c.duration_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{c.duration_hours}h</span>}
          {c.total_lessons  && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/>{c.total_lessons} leçons</span>}
        </div>

        {/* Progress */}
        {acc && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{c.completed_lessons||0}/{c.total_lessons||0} leçons</span>
              <span className="font-bold px-1.5 py-0.5 rounded-md text-[10px]"
                style={{ background: done?"#ede9fe":pct>=50?"#d1fae5":"#eff6ff", color: done?"#5653e1":pct>=50?"#059669":"#2d287f" }}>
                {pct}%
              </span>
            </div>
            <ProgressBar pct={pct} done={done} />
          </div>
        )}

        {/* Alerts */}
        {isPend(c) && !acc && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-200">
            <Clock className="w-3 h-3 flex-shrink-0" /> Vérification en cours
          </div>
        )}
        {isRej(c) && !acc && (
          <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 rounded-lg px-2.5 py-2 border border-red-200">
            <AlertCircle className="w-3 h-3 flex-shrink-0" /> Preuve rejetée
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {done ? (
            <div className="flex gap-1.5">
              <button onClick={() => onGo(`/courses/${c.id}/learn`)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border transition hover:opacity-90"
                style={{ borderColor:"#5653e1", color:"#5653e1", background:"#f0efff" }}>
                Revoir
              </button>
              <button onClick={() => onGo("/student/certificates")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition hover:opacity-90"
                style={{ background:"#facc15", color:"#2d287f" }}>
                Certificat
              </button>
            </div>
          ) : acc ? (
            <div className="flex gap-1.5">
              <button onClick={() => onGo(`/courses/${c.id}/learn`)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90 flex items-center justify-center gap-1"
                style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
                <PlayCircle className="w-3.5 h-3.5" />
                {(c.completed_lessons || 0) > 0 ? "Continuer" : "Commencer"}
              </button>
              <button onClick={() => onGo(`/courses/${c.id}/progress`)}
                className="py-2 px-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
                title="Détails">
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isRej(c) ? (
            <label className="block cursor-pointer">
              <div className={`w-full py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1 transition hover:bg-emerald-100 ${uploading?"opacity-60":""}`}>
                <Upload className="w-3 h-3" /> {uploading ? "Envoi…" : "Renvoyer la preuve"}
              </div>
              <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploading} onChange={e => onUpload(c.id, e)} />
            </label>
          ) : (
            <button onClick={() => onGo(`/courses/${c.id}`)}
              className="w-full py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" /> Voir le cours
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stat card clickable ── */
function StatCard({ icon: Icon, label, value, sub, color, bg, border, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border transition-all hover:-translate-y-0.5 text-left w-full"
      style={{ border: `1px solid ${border || "#e8e6f5"}`, boxShadow:"0 1px 4px rgba(45,40,127,0.06)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(45,40,127,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 4px rgba(45,40,127,0.06)"}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black" style={{ color: C.primary }}>{value}</div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </button>
  );
}

/* ── Section header ── */
function SectionHeader({ icon: Icon, color, title, count, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${color}`} />
        <h2 className="text-base font-bold" style={{ color: C.text }}>{title}</h2>
        {count != null && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── SeeAll button ── */
function SeeAll({ to }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition"
      style={{ color: C.light }}>
      Voir tout <ChevronRight className="w-3.5 h-3.5" />
    </button>
  );
}

/* ── Grid ── */
function CourseGrid({ list, onUpload, uploading, onGo, empty }) {
  return list.length === 0 ? (
    <div className="bg-white rounded-2xl border p-10 text-center" style={{ border:`1px solid ${C.border}` }}>
      <p className="text-slate-400 text-sm">{empty}</p>
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {list.map(c => (
        <CourseCard key={c.id} c={c} onUpload={onUpload} uploading={uploading === c.id} onGo={onGo} />
      ))}
    </div>
  );
}

/* ── Sort / search toolbar ── */
function Toolbar({ search, setSearch, sortBy, setSortBy }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un cours…"
          className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 w-48 transition-all focus:w-60" />
      </div>
      <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
        {[{k:"recent",l:"Récents"},{k:"progress",l:"Progression"},{k:"name",l:"Nom"}].map(s => (
          <button key={s.k} onClick={() => setSortBy(s.k)}
            className="px-3 py-2 text-xs font-semibold transition-all"
            style={sortBy===s.k ? { background:C.primary, color:"white" } : { color:"#6b7280" }}>
            {s.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
export default function StudentDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [uploadId, setUploadId] = useState(null);
  const [sortBy,   setSortBy]   = useState("recent");
  const [search,   setSearch]   = useState("");

  const view = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith("/active"))    return "active";
    if (p.endsWith("/completed")) return "completed";
    if (p.endsWith("/pending"))   return "pending";
    return "overview";
  }, [location.pathname]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await api.get("/enrollments/me"); setCourses(data?.data||[]); }
    catch(_) {} finally { setLoading(false); }
  };

  const doUpload = async (eid, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/jpg","application/pdf"].includes(file.type)) { alert("❌ JPG/PNG/PDF"); return; }
    if (file.size > 5*1024*1024) { alert("❌ Max 5MB"); return; }
    const fd = new FormData();
    fd.append("payment_proof", file);
    try {
      setUploadId(eid);
      await api.post(`/enrollments/${eid}/upload-proof`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      await load();
      alert("✅ Preuve envoyée !");
    } catch(err) { alert(err.response?.data?.message||"❌ Erreur"); }
    finally { setUploadId(null); }
  };

  const g = useMemo(() => ({
    active:    courses.filter(c => isActv(c)),
    completed: courses.filter(c => isDone(c)),
    pending:   courses.filter(c => isPend(c) && !hasAcc(c)),
    rejected:  courses.filter(c => isRej(c)  && !hasAcc(c)),
  }), [courses]);

  const lastAcc = useMemo(() =>
    [...courses]
      .filter(c => hasAcc(c) && !isDone(c) && c.last_accessed_at)
      .sort((a,b) => new Date(b.last_accessed_at)-new Date(a.last_accessed_at))[0]
  , [courses]);

  const avgPct = g.active.length > 0
    ? Math.round(g.active.reduce((s,c) => s+getPct(c),0) / g.active.length) : 0;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Étudiant";

  const sorted = (list) => {
    const f = search ? list.filter(c => (c.title||"").toLowerCase().includes(search.toLowerCase())) : list;
    if (sortBy === "progress") return [...f].sort((a,b) => getPct(b)-getPct(a));
    if (sortBy === "name")     return [...f].sort((a,b) => (a.title||"").localeCompare(b.title||""));
    return [...f].sort((a,b) => new Date(b.last_accessed_at||b.enrolled_at||0) - new Date(a.last_accessed_at||a.enrolled_at||0));
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center" style={{ background:C.bg }}>
      <div className="text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color:C.light }} />
        <p className="text-sm text-slate-400">Chargement…</p>
      </div>
    </div>
  );

  /* ══════════════ SHARED PANEL WRAPPER ══════════════ */
  const Panel = ({ header, children }) => (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:C.bg }}>
      {/* Header fixe */}
      <div className="flex-shrink-0 bg-white px-8 py-5 border-b" style={{ borderColor:C.border }}>
        {header}
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {children}
      </div>
    </div>
  );

  /* ══════════════ OVERVIEW ══════════════ */
  if (view === "overview") return (
    <Panel header={
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-0.5">Bonjour 👋</p>
          <h1 className="text-xl font-black" style={{ color: C.primary }}>{fullName}</h1>
        </div>
        <Link to="/courses"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 shadow-sm"
          style={{ background:C.accent, color:C.primary }}>
          <Zap className="w-4 h-4" /> Explorer
        </Link>
      </div>
    }>
      <div className="max-w-5xl space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Flame}    label="En cours"   value={g.active.length}
            sub={g.active.length>0 ? `${avgPct}% de progression` : "Commencer un cours"}
            color="text-orange-500" bg="bg-orange-50" border="#fed7aa"
            onClick={() => navigate("/student/active")} />
          <StatCard icon={Trophy}   label="Terminés"   value={g.completed.length}
            sub={g.completed.length>0 ? "Certificats disponibles" : undefined}
            color="text-violet-600" bg="bg-violet-50" border="#c4b5fd"
            onClick={() => navigate("/student/completed")} />
          <StatCard icon={Clock}    label="En attente" value={g.pending.length}
            sub={g.pending.length>0 ? "Vérification en cours" : "Tout est en ordre"}
            color="text-amber-600" bg="bg-amber-50" border="#fde68a"
            onClick={() => navigate("/student/pending")} />
          <StatCard icon={BookOpen} label="Formations" value={courses.length}
            sub={`${courses.length} cours inscrits`}
            color="text-blue-600" bg="bg-blue-50" border="#bfdbfe"
            onClick={() => navigate("/courses")} />
        </div>

        {/* Resume banner */}
        {lastAcc && (
          <div className="flex items-center gap-5 bg-white p-5 rounded-2xl border"
            style={{ border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(45,40,127,0.06)" }}>
            <ThumbnailCard title={lastAcc.title} url={lastAcc.thumbnail_url} className="w-16 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" style={{ color:C.light }} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color:C.light }}>Reprendre où vous en étiez</p>
              </div>
              <p className="font-bold text-sm truncate mb-2" style={{ color:C.text }}>{lastAcc.title}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-48">
                  <ProgressBar pct={getPct(lastAcc)} />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background:"#ede9fe", color:C.primary }}>{getPct(lastAcc)}%</span>
              </div>
            </div>
            <button onClick={() => navigate(`/courses/${lastAcc.id}/learn`)}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
              <PlayCircle className="w-4 h-4" />
              {(lastAcc.completed_lessons || 0) > 0 ? "Continuer" : "Commencer"}
            </button>
          </div>
        )}

        {/* En cours preview */}
        {g.active.length > 0 && (
          <div>
            <SectionHeader icon={Flame} color="text-orange-500" title="En cours"
              count={g.active.length} action={<SeeAll to="/student/active" />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {g.active.slice(0,5).map(c => (
                <CourseCard key={c.id} c={c} onUpload={doUpload} uploading={uploadId} onGo={navigate} />
              ))}
              {g.active.length > 5 && (
                <button onClick={() => navigate("/student/active")}
                  className="bg-white border rounded-2xl flex flex-col items-center justify-center gap-2 p-6 transition hover:bg-slate-50"
                  style={{ border:`1px dashed ${C.border}`, minHeight:180 }}>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                  <p className="text-xs text-slate-400 font-medium text-center">+{g.active.length-5} cours</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Terminés preview */}
        {g.completed.length > 0 && (
          <div>
            <SectionHeader icon={Trophy} color="text-violet-600" title="Cours terminés"
              count={g.completed.length}
              action={
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate("/student/certificates")}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-90"
                    style={{ background:"#facc15", color:C.primary }}>
                    <Award className="w-3.5 h-3.5" /> Certificats
                  </button>
                  <SeeAll to="/student/completed" />
                </div>
              } />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {g.completed.slice(0,5).map(c => (
                <CourseCard key={c.id} c={c} onUpload={doUpload} uploading={uploadId} onGo={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Pending alert */}
        {g.pending.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-600 w-[18px] h-[18px]" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {g.pending.length} paiement{g.pending.length>1?"s":""} en cours de vérification
                </p>
                <p className="text-xs text-amber-600 mt-0.5">Délai habituel : 24 à 48h ouvrées</p>
              </div>
            </div>
            <button onClick={() => navigate("/student/pending")}
              className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition">
              Voir <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Rejected alert */}
        {g.rejected.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {g.rejected.length} preuve{g.rejected.length>1?"s":""} de paiement refusée{g.rejected.length>1?"s":""}
              </p>
              <p className="text-xs text-red-600 mt-0.5">Veuillez renvoyer une preuve valide depuis la carte du cours concerné.</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {courses.length === 0 && (
          <div className="bg-white rounded-2xl border p-16 text-center" style={{ border:`1px solid ${C.border}` }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background:"#eeeeff" }}>
              <GraduationCap className="w-8 h-8" style={{ color:C.light }} />
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color:C.text }}>
              Démarrez votre parcours DevOps
            </h3>
            <p className="text-sm text-slate-400 mb-6">Inscrivez-vous à votre première formation.</p>
            <Link to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
              <Zap className="w-4 h-4" /> Explorer les formations
            </Link>
          </div>
        )}
      </div>
    </Panel>
  );

  /* ══════════════ ACTIVE ══════════════ */
  if (view === "active") return (
    <Panel header={
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-black" style={{ color:C.primary }}>Cours en cours</h1>
            <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{g.active.length}</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">Progression moyenne · {avgPct}%</p>
      </div>
    }>
      <Toolbar search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />
      <CourseGrid list={sorted(g.active)} onUpload={doUpload} uploading={uploadId} onGo={navigate}
        empty="Aucun cours en cours — explorez le catalogue pour commencer !" />
    </Panel>
  );

  /* ══════════════ COMPLETED ══════════════ */
  if (view === "completed") return (
    <Panel header={
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-violet-600" />
          <h1 className="text-lg font-black" style={{ color:C.primary }}>Cours terminés</h1>
          <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{g.completed.length}</span>
        </div>
        {g.completed.length > 0 && (
          <button onClick={() => navigate("/student/certificates")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ background:"#facc15", color:C.primary }}>
            <Award className="w-4 h-4" /> Mes certificats
          </button>
        )}
      </div>
    }>
      {g.completed.length > 0 && (
        <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-5">
          <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
          <p className="text-sm text-violet-700">
            🎉 Félicitations ! <strong>{g.completed.length} cours</strong> terminé{g.completed.length>1?"s":""}. Vos certificats sont prêts.
          </p>
        </div>
      )}
      <Toolbar search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />
      <CourseGrid list={sorted(g.completed)} onUpload={doUpload} uploading={uploadId} onGo={navigate}
        empty="Aucun cours terminé pour l'instant — continuez vos formations !" />
    </Panel>
  );

  /* ══════════════ PENDING ══════════════ */
  if (view === "pending") {
    const all = [...g.pending, ...g.rejected];
    return (
      <Panel header={
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-black" style={{ color:C.primary }}>Paiements & Vérifications</h1>
          <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{all.length}</span>
        </div>
      }>
        <div className="space-y-3 mb-6">
          {g.pending.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                <strong>{g.pending.length} paiement{g.pending.length>1?"s":""}</strong> en cours d'examen par l'équipe.
                Délai habituel : <strong>24 à 48h ouvrées</strong>. Accès immédiat après validation.
              </p>
            </div>
          )}
          {g.rejected.length > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                <strong>{g.rejected.length} preuve{g.rejected.length>1?"s":""}</strong> refusée{g.rejected.length>1?"s":""}.
                Cliquez sur "Renvoyer la preuve" dans la carte du cours concerné.
              </p>
            </div>
          )}
        </div>
        <CourseGrid list={sorted(all)} onUpload={doUpload} uploading={uploadId} onGo={navigate}
          empty="Aucun paiement en attente — tout est en ordre ✓" />
      </Panel>
    );
  }

  return null;
}