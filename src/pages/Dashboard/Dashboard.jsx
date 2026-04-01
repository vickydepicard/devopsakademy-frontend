// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  BookOpen, Clock, Award, PlayCircle, BarChart2, CheckCircle,
  AlertCircle, Upload, Eye, Calendar, FileText, TrendingUp,
  ChevronRight, Zap, CreditCard, ShieldCheck, XCircle,
  Trophy, Flame, Target, ArrowRight, Lock, Download, BadgeCheck,
  RefreshCw
} from "lucide-react";

/* ─── helpers ─── */
const STATUS = {
  free:     { label:"Accès actif",  color:"text-emerald-600 bg-emerald-50 border-emerald-200", dot:"bg-emerald-500", icon:ShieldCheck },
  verified: { label:"Accès actif",  color:"text-emerald-600 bg-emerald-50 border-emerald-200", dot:"bg-emerald-500", icon:ShieldCheck },
  pending:  { label:"En attente",   color:"text-amber-600 bg-amber-50 border-amber-200",        dot:"bg-amber-400",  icon:Clock },
  rejected: { label:"Rejeté",       color:"text-red-600 bg-red-50 border-red-200",              dot:"bg-red-500",    icon:XCircle },
  default:  { label:"Non payé",     color:"text-gray-500 bg-gray-50 border-gray-200",           dot:"bg-gray-400",   icon:Lock },
};
const LEVELS = { beginner:"Débutant", intermediate:"Intermédiaire", advanced:"Avancé" };
const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
};

const getStatus   = c => STATUS[c.payment_status] || STATUS.default;
const hasAccess   = c => c.is_approved && ["free","verified"].includes(c.payment_status);
const getProgress = c => {
  if (Number(c.total_lessons) > 0) return Math.round(((c.completed_lessons || 0) / c.total_lessons) * 100);
  return Math.min(100, Number(c.completion_percentage || 0));
};
const isDone      = c => c.completed_at || getProgress(c) >= 100;
const isActive    = c => hasAccess(c) && !isDone(c);
const isPending   = c => c.payment_status === "pending";
const isRejected  = c => c.payment_status === "rejected";

/* ─── Ring SVG ─── */
function Ring({ pct, size = 38, stroke = 3, color = "#6366f1" }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset .6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        style={{ transform:"rotate(90deg)", transformOrigin:"center", fontSize:"9px", fontWeight:700, fill:color }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ─── Compact Course Card ─── */
function CourseCard({ course, onUpload, uploading }) {
  const navigate = useNavigate();
  const st    = getStatus(course);
  const pct   = getProgress(course);
  const done  = isDone(course);
  const access = hasAccess(course);
  const StatusIcon = st.icon;

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden
      ${done ? "border-purple-100" : access ? "border-gray-100 hover:border-indigo-100" : "border-gray-100"}`}>

      {/* Thumbnail */}
      <div className="relative h-28 bg-gradient-to-br from-slate-100 to-indigo-50 flex-shrink-0 overflow-hidden">
        {course.thumbnail_url && (
          <img src={course.thumbnail_url} alt=""
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display="none"; }} />
        )}
        {done && (
          <div className="absolute inset-0 bg-purple-900/25 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-yellow-300 drop-shadow" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between gap-1">
          {course.level && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold leading-none ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
              {LEVELS[course.level] || course.level}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 font-semibold ${st.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        {access && !done && (
          <div className="absolute bottom-1.5 right-1.5">
            <Ring pct={pct} size={32} stroke={3} />
          </div>
        )}
        {done && (
          <div className="absolute bottom-1.5 right-1.5 bg-yellow-400 text-indigo-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
            100%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-xs line-clamp-2 leading-snug mb-1.5">{course.title}</h3>

        <div className="flex gap-2 text-xs text-gray-400 mb-2">
          {course.enrolled_at && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(course.enrolled_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short" })}
            </span>
          )}
          {course.duration_hours && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {course.duration_hours}h
            </span>
          )}
        </div>

        {access && (
          <div className="mb-2">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${done ? "bg-purple-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                style={{ width:`${pct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{course.completed_lessons||0}/{course.total_lessons||0} leçons</p>
          </div>
        )}

        {isPending(course) && !access && (
          <div className="mb-1.5 bg-amber-50 rounded-lg p-1.5 text-xs text-amber-700 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 flex-shrink-0" /> Vérification en cours
          </div>
        )}
        {isRejected(course) && !access && (
          <div className="mb-1.5 bg-red-50 rounded-lg p-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> Preuve rejetée
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto">
          {done ? (
            <div className="flex gap-1">
              <button onClick={() => navigate(`/courses/${course.id}/learn`)}
                className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 transition">
                <Eye className="w-2.5 h-2.5" /> Revoir
              </button>
              <button onClick={() => navigate("/certificates")}
                className="flex-1 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 transition">
                <Download className="w-2.5 h-2.5" /> Certificat
              </button>
            </div>
          ) : access ? (
            <div className="flex gap-1">
              <button onClick={() => navigate(`/courses/${course.id}/learn`)}
                className="flex-1 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 transition shadow-sm">
                <PlayCircle className="w-2.5 h-2.5" /> Continuer
              </button>
              <button onClick={() => navigate(`/courses/${course.id}/progress`)}
                className="px-2 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                title="Progression">
                <BarChart2 className="w-3 h-3" />
              </button>
            </div>
          ) : isRejected(course) ? (
            <label className="block cursor-pointer">
              <div className={`w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 transition ${uploading?"opacity-60 cursor-wait":""}`}>
                <Upload className="w-2.5 h-2.5" /> {uploading ? "Envoi..." : "Renvoyer preuve"}
              </div>
              <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploading}
                onChange={e => onUpload(course.id, e)} />
            </label>
          ) : (
            <button onClick={() => navigate(`/courses/${course.id}`)}
              className="w-full py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition flex items-center justify-center gap-0.5">
              <Eye className="w-2.5 h-2.5" /> Voir le cours
            </button>
          )}
        </div>

        {course.payment_proof_url && (
          <a href={course.payment_proof_url} target="_blank" rel="noopener noreferrer"
            className="mt-1.5 pt-1.5 border-t border-gray-50 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition">
            <FileText className="w-2.5 h-2.5" /> Preuve ✓
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Section ─── */
function Section({ icon: Icon, title, count, color, bg, children, action, banner }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <h2 className="font-black text-gray-800 text-sm">{title}</h2>
          {count !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>{count}</span>
          )}
        </div>
        {action}
      </div>
      {banner && <div className="mb-3">{banner}</div>}
      {children}
    </div>
  );
}

/* ─── MAIN ─── */
export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => { if (token) fetchCourses(); }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/enrollments/me");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error("Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (enrollmentId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/jpg","application/pdf"].includes(file.type)) {
      alert("❌ JPG, PNG ou PDF uniquement."); return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("❌ Max 5MB."); return; }
    const fd = new FormData();
    fd.append("payment_proof", file);
    try {
      setUploadingId(enrollmentId);
      await api.post(`/enrollments/${enrollmentId}/upload-proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCourses();
      alert("✅ Preuve envoyée ! Validation sous 24h.");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Erreur envoi.");
    } finally {
      setUploadingId(null);
    }
  };

  const groups = useMemo(() => ({
    active:    courses.filter(c => isActive(c)),
    completed: courses.filter(c => isDone(c)),
    pending:   courses.filter(c => isPending(c) && !hasAccess(c)),
    rejected:  courses.filter(c => isRejected(c) && !hasAccess(c)),
  }), [courses]);

  const stats = useMemo(() => ({
    total:     courses.length,
    active:    groups.active.length,
    pending:   groups.pending.length,
    completed: groups.completed.length,
    rejected:  groups.rejected.length,
  }), [courses, groups]);

  const lastAccessed = useMemo(() =>
    [...courses]
      .filter(c => hasAccess(c) && !isDone(c) && c.last_accessed_at)
      .sort((a,b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at))[0]
  , [courses]);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Étudiant";
  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const avatar   = user?.avatar_url;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      {/* ══════ HERO ══════ */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
        {/* Orbs déco */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-5 pb-4">
          {/* Profil row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="avatar"
                  className="w-13 h-13 rounded-2xl border-2 border-white/25 shadow-xl object-contain w-[52px] h-[52px]" />
              ) : (
                <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/25 shadow-xl">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a1740]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-indigo-300 text-xs font-medium">Bonjour 👋</p>
              <h1 className="text-white text-lg font-black truncate leading-tight">{fullName}</h1>
              <p className="text-indigo-400 text-xs capitalize">{user?.role} · DevOps Akademy</p>
            </div>
            <Link to="/courses"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-black rounded-xl text-xs transition shadow-lg flex-shrink-0">
              <Zap className="w-3.5 h-3.5" /> Explorer
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label:"Inscrits",  value:stats.total,     clr:"text-sky-300",    bg:"bg-sky-500/15",    icon:BookOpen },
              { label:"En cours",  value:stats.active,    clr:"text-orange-300", bg:"bg-orange-500/15", icon:Flame },
              { label:"Attente",   value:stats.pending,   clr:"text-amber-300",  bg:"bg-amber-500/15",  icon:Clock },
              { label:"Terminés",  value:stats.completed, clr:"text-violet-300", bg:"bg-violet-500/15", icon:Trophy },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} border border-white/10 rounded-xl px-3 py-2.5`}>
                  <Icon className={`w-3.5 h-3.5 ${s.clr} mb-1`} />
                  <div className="text-white font-black text-2xl leading-none">{s.value}</div>
                  <div className={`text-xs ${s.clr} mt-0.5`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-7">

        {/* ══════ CONTINUER ══════ */}
        {lastAccessed && (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-3">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reprendre où tu t'es arrêté</p>
            </div>
            <div className="p-4 flex gap-3 items-center">
              <div className="w-20 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 flex items-center justify-center">
                {lastAccessed.thumbnail_url
                  ? <img src={lastAccessed.thumbnail_url} alt="" className="w-full h-full object-contain"
                      onError={e => e.target.style.display="none"} />
                  : <BookOpen className="w-5 h-5 text-indigo-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-800 text-sm truncate">{lastAccessed.title}</p>
                <p className="text-xs text-gray-400">{lastAccessed.category_name}</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width:`${getProgress(lastAccessed)}%` }} />
                </div>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">{getProgress(lastAccessed)}% complété</p>
              </div>
              <button onClick={() => navigate(`/courses/${lastAccessed.id}/learn`)}
                className="flex-shrink-0 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black text-xs transition shadow flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" /> Continuer
              </button>
            </div>
          </div>
        )}

        {/* ══════ COURS EN COURS ══════ */}
        {groups.active.length > 0 && (
          <Section icon={Flame} title="Mes cours en cours" count={groups.active.length}
            color="text-orange-600" bg="bg-orange-50"
            action={
              <Link to="/courses" className="text-xs text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-0.5">
                Explorer <ChevronRight className="w-3 h-3" />
              </Link>
            }>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groups.active.map(c => (
                <CourseCard key={c.id} course={c} onUpload={handleUpload} uploading={uploadingId === c.id} />
              ))}
            </div>
          </Section>
        )}

        {/* ══════ COURS TERMINÉS ══════ */}
        {groups.completed.length > 0 && (
          <Section icon={Trophy} title="Cours terminés" count={groups.completed.length}
            color="text-purple-600" bg="bg-purple-50"
            action={
              <Link to="/certificates"
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-bold">
                <Award className="w-3 h-3" /> Mes certificats
              </Link>
            }
            banner={
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-indigo-900" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-purple-900 text-sm">
                    🎉 Félicitations ! {groups.completed.length} cours {groups.completed.length > 1 ? "complétés" : "complété"}.
                  </p>
                  <p className="text-purple-600 text-xs">Téléchargez vos certificats depuis votre espace de formation.</p>
                </div>
                <Link to="/certificates"
                  className="flex-shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-black transition flex items-center gap-1">
                  <Download className="w-3 h-3" /> Télécharger
                </Link>
              </div>
            }>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groups.completed.map(c => (
                <CourseCard key={c.id} course={c} onUpload={handleUpload} uploading={uploadingId === c.id} />
              ))}
            </div>
          </Section>
        )}

        {/* ══════ EN ATTENTE DE VALIDATION ══════ */}
        {groups.pending.length > 0 && (
          <Section icon={Clock} title="En attente de validation" count={groups.pending.length}
            color="text-amber-600" bg="bg-amber-50"
            banner={
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Paiements en cours de vérification</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Vos preuves sont examinées par l'équipe admin · Délai : <strong>24-48h ouvrées</strong>.
                    Un accès immédiat est accordé dès validation.
                  </p>
                </div>
              </div>
            }>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groups.pending.map(c => (
                <CourseCard key={c.id} course={c} onUpload={handleUpload} uploading={uploadingId === c.id} />
              ))}
            </div>
          </Section>
        )}

        {/* ══════ PAIEMENTS REJETÉS ══════ */}
        {groups.rejected.length > 0 && (
          <Section icon={XCircle} title="Paiements refusés" count={groups.rejected.length}
            color="text-red-600" bg="bg-red-50"
            banner={
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 text-sm">Preuves de paiement refusées</p>
                  <p className="text-red-600 text-xs mt-0.5">
                    Vos preuves n'ont pas pu être validées. Soumettez une nouvelle preuve
                    (photo de reçu, capture d'écran de virement) directement depuis chaque carte.
                  </p>
                </div>
              </div>
            }>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groups.rejected.map(c => (
                <CourseCard key={c.id} course={c} onUpload={handleUpload} uploading={uploadingId === c.id} />
              ))}
            </div>
          </Section>
        )}

        {/* ══════ TABLEAU PAIEMENTS ══════ */}
        {courses.some(c => c.payment_status !== "free") && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-black text-gray-800 text-sm">Historique de paiements</h2>
              </div>
              <Link to="/profile" className="text-xs text-indigo-500 font-bold hover:text-indigo-700 flex items-center gap-0.5">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {courses.filter(c => c.payment_status !== "free").map(course => {
                const st = getStatus(course);
                const StIcon = st.icon;
                return (
                  <div key={course.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/70 transition">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {course.thumbnail_url
                        ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-contain"
                            onError={e => e.target.style.display="none"} />
                        : <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{course.title}</p>
                      <p className="text-xs text-gray-400">
                        Inscrit le {course.enrolled_at && new Date(course.enrolled_at).toLocaleDateString("fr-FR")}
                        {course.enrollment_type && ` · ${course.enrollment_type}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold ${st.color}`}>
                        <StIcon className="w-2.5 h-2.5" /> {st.label}
                      </span>
                      {course.payment_proof_url && (
                        <a href={course.payment_proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 transition" title="Voir preuve de paiement">
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                      {isRejected(course) && (
                        <label className="cursor-pointer text-emerald-500 hover:text-emerald-700 transition" title="Renvoyer preuve">
                          <Upload className="w-4 h-4" />
                          <input type="file" accept="image/*,.pdf" className="hidden"
                            onChange={e => handleUpload(course.id, e)} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ RACCOURCIS ══════ */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { to:"/courses",      emoji:"🔍", label:"Explorer",    cls:"from-indigo-50 border-indigo-100" },
            { to:"/profile",      emoji:"👤", label:"Mon profil",  cls:"from-blue-50 border-blue-100" },
            { to:"/certificates", emoji:"🏆", label:"Certificats", cls:"from-yellow-50 border-yellow-100" },
            { to:"/leaderboard",  emoji:"🥇", label:"Classement",  cls:"from-orange-50 border-orange-100" },
            { to:"/settings",     emoji:"⚙️",  label:"Paramètres", cls:"from-gray-50 border-gray-200" },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`bg-gradient-to-br ${item.cls} to-white rounded-xl p-3 border shadow-sm hover:shadow-md transition text-center group hover:scale-[1.02]`}>
              <div className="text-xl mb-1">{item.emoji}</div>
              <p className="text-xs font-bold text-gray-600 group-hover:text-indigo-700 transition leading-tight">{item.label}</p>
            </Link>
          ))}
        </div>

        {/* ══════ GUIDE si aucun cours ══════ */}
        {courses.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-800 mb-5 flex items-center gap-2">
              <span>📋</span> Comment accéder à vos cours ?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n:"1", title:"S'inscrire",  desc:"Choisissez votre formation",          icon:BookOpen,    color:"text-indigo-600 bg-indigo-50 border-indigo-100" },
                { n:"2", title:"Paiement",    desc:"Envoyez votre preuve de paiement",    icon:CreditCard,  color:"text-blue-600 bg-blue-50 border-blue-100" },
                { n:"3", title:"Validation",  desc:"Admin valide votre paiement (24h)",   icon:ShieldCheck, color:"text-amber-600 bg-amber-50 border-amber-100" },
                { n:"4", title:"Accès",       desc:"Accédez au contenu du cours",         icon:PlayCircle,  color:"text-green-600 bg-green-50 border-green-100" },
              ].map(step => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className={`border rounded-xl p-4 text-center ${step.color.split(" ").slice(1).join(" ")}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-2 ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="font-black text-gray-800 text-sm mb-0.5">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 text-center">
              <Link to="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black text-sm transition shadow-md">
                <Zap className="w-4 h-4" /> Explorer les formations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}