// CourseDetails.jsx — DevOpsAkademy
// Page détail cours — 100% dynamique — Prix en FCFA
// Design cohérent avec les couleurs #2d287f / #facc15
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import {
  Star, Users, Clock, BookOpen, CheckCircle, Lock, Award,
  PlayCircle, FileText, Download, Globe, Target, BarChart,
  Shield, Video, Zap, TrendingUp, Share2, AlertCircle,
  GraduationCap, Eye, ArrowRight, Info, HelpCircle,
  ChevronDown, ChevronUp, ChevronRight, Terminal,
  Code, Cloud, Settings, ShieldCheck, CreditCard,
  Check, X, Mail, Phone, Loader, FileCode
} from "lucide-react";
import CourseReviews from "../../components/Reviews/CourseReviews";


/* ── Dé-encoder les champs JSON multi-encodés ── */
function parseJsonField(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // Peut-être un tableau de tableaux encodés récursivement
    if (raw.length === 1 && typeof raw[0] === "string") return parseJsonField(raw[0]);
    return raw.flatMap(item => typeof item === "string" ? parseJsonField(item) : item);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parseJsonField(parsed);
    } catch {
      // Pas du JSON valide → c'est une chaîne simple
      return raw.trim() ? [raw] : [];
    }
  }
  return [];
}

/* ══════════════════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════════════════ */
// Prix UNIQUEMENT en FCFA
const formatPrice = (price, isFree) => {
  if (isFree || price === 0 || !price) return "Gratuit";
  return new Intl.NumberFormat("fr-FR").format(Number(price)) + " FCFA";
};

const formatDuration = (hours) => {
  if (!hours) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours} heure${hours > 1 ? "s" : ""}`;
};

const formatRating = (r) => (!r ? "0.0" : parseFloat(r).toFixed(1));

const LEVELS = {
  beginner:     { label: "Débutant",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🟢" },
  intermediate: { label: "Intermédiaire", cls: "bg-blue-50 text-blue-700 border-blue-200",          icon: "🔵" },
  advanced:     { label: "Avancé",        cls: "bg-purple-50 text-purple-700 border-purple-200",    icon: "🟣" },
};
const LANGS = {
  fr: { name: "Français", flag: "🇫🇷" },
  en: { name: "English",  flag: "🇬🇧" },
  ar: { name: "Arabe",    flag: "🇸🇦" },
};
const LESSON_TYPES = {
  video:    { icon: Video,    bg: "bg-blue-50 text-blue-600",   label: "Vidéo" },
  article:  { icon: FileText, bg: "bg-emerald-50 text-emerald-600", label: "Article" },
  quiz:     { icon: FileCode, bg: "bg-purple-50 text-purple-600",  label: "Quiz" },
  exercise: { icon: Zap,      bg: "bg-orange-50 text-orange-600",  label: "Exercice" },
  download: { icon: Download, bg: "bg-gray-50 text-gray-600",      label: "Téléchargement" },
};

/* ══════════════════════════════════════════════════════
   COMPOSANTS
══════════════════════════════════════════════════════ */
function Thumbnail({ url, title, h = "h-80" }) {
  const [failed, setFailed] = useState(false);
  const initials = (title || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  if (url && !failed) {
    return (
      <img
        src={url} alt={title}
        className={`w-full ${h} object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`w-full ${h} flex items-center justify-center`}
      style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
      <div className="text-center">
        <span className="text-white font-black text-5xl drop-shadow">{initials}</span>
        <p className="text-white/70 text-sm mt-2">DevOps Akademy</p>
      </div>
    </div>
  );
}

function PriceBadge({ price, originalPrice, isFree }) {
  const discount = originalPrice && price && !isFree
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  return { discount };
}

/* ══════════════════════════════════════════════════════
   MODAL PAIEMENT
══════════════════════════════════════════════════════ */
function PaymentModal({ onClose, price, isFree }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-900">💳 Informations de Paiement</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Prix FCFA */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
            <p className="text-sm text-indigo-600 font-semibold mb-1">Montant à payer</p>
            <p className="text-3xl font-black" style={{ color: "#2d287f" }}>
              {formatPrice(price, isFree)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Paiement unique — accès à vie</p>
          </div>

          {/* Méthodes de paiement */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-gray-900">Méthodes acceptées (FCFA)</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Orange Money", icon: "🟠", detail: "Via mobile money" },
                { name: "MTN MoMo",     icon: "🟡", detail: "Via mobile money" },
                { name: "Wave",         icon: "🌊", detail: "Via Wave App" },
                { name: "Virement",     icon: "🏦", detail: "Banque locale" },
              ].map(m => (
                <div key={m.name} className="bg-white rounded-xl p-3 border border-amber-200 text-center">
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <p className="text-sm font-bold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Processus */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">Processus d'inscription</h4>
            </div>
            <ol className="space-y-3">
              {[
                { icon: "1", text: "Cliquez sur \"S'inscrire\" et créez votre compte" },
                { icon: "2", text: "Effectuez le paiement via votre méthode préférée" },
                { icon: "3", text: "Envoyez la preuve à support@devopsakademy.com" },
                { icon: "4", text: "Accès activé sous 24h après validation" },
              ].map((s) => (
                <li key={s.icon} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: "#2d287f" }}>{s.icon}</div>
                  <p className="text-sm text-gray-700">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-3">📞 Support & Assistance</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> support@devopsakademy.com</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Lun–Ven : 8h–18h (WAT)</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Garantie satisfait ou remboursé 30 jours</div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */
export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isUserEnrolled, isEnrollmentApproved, getEnrollmentStatus, enrollInCourse } = usePermissions();

  const [course,          setCourse]         = useState(null);
  const [loading,         setLoading]        = useState(true);
  const [enrolling,       setEnrolling]      = useState(false);
  const [error,           setError]          = useState(null);
  const [activeTab,       setActiveTab]      = useState("overview");
  const [expandedMods,    setExpandedMods]   = useState([]);
  const [showPayment,     setShowPayment]    = useState(false);
  const [notif,           setNotif]          = useState(location.state?.message || null);

  /* ── Chargement ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        if (isAuthenticated) {
          try {
            const r = await api.get(`/courses/${id}/details`);
            if (r.data?.success) { setCourse(r.data.data); return; }
          } catch (_) {}
        }
        const r = await api.get(`/courses/${id}`);
        if (r.data?.success) setCourse(r.data.data);
        else setError("Impossible de charger ce cours.");
      } catch (err) {
        setError(err.response?.data?.message || "Erreur de connexion au serveur");
      } finally { setLoading(false); }
    };
    load();
  }, [id, isAuthenticated]);

  /* ── Inscription ── */
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${course?.id || id}` } });
      return;
    }
    const cid = String(course?.id || id);
    if (isUserEnrolled(cid)) {
      if (isEnrollmentApproved(cid)) navigate(`/courses/${course?.id || id}/learn`);
      else setNotif("Votre inscription est en attente de validation.");
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(cid);
      setNotif("✅ Inscription soumise ! Accès activé après validation du paiement sous 24h.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally { setEnrolling(false); }
  };

  /* ── Statut d'accès ── */
  const access = useMemo(() => {
    if (!isAuthenticated) return { status: "guest" };
    const s = getEnrollmentStatus(String(course?.id || id));
    return { status: s };
  }, [isAuthenticated, course, id, getEnrollmentStatus]);

  /* ── Helpers ── */
  const level    = LEVELS[course?.level] || LEVELS.beginner;
  const lang     = LANGS[course?.language] || LANGS.fr;
  const discount = course?.original_price && course?.price && !course?.is_free
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;
  const totalLessons = course?.modules?.reduce((s, m) => s + Number(m.lesson_count || 0), 0) || 0;

  /* ── Skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-8 bg-gray-200 rounded-xl w-1/2" />
            <div className="h-80 bg-gray-200 rounded-3xl" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-72 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Erreur ── */
  if (error || !course) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Cours non disponible</h3>
        <p className="text-gray-500 mb-6 text-sm">{error || "Ce cours n'est pas accessible actuellement."}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/courses")} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
            Explorer les cours
          </button>
          <button onClick={() => window.location.reload()} className="flex-1 py-3 rounded-xl font-bold text-sm border-2" style={{ borderColor: "#2d287f", color: "#2d287f" }}>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════ RENDER PRINCIPAL ══════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} price={course.price} isFree={!!course.is_free} />
      )}

      {/* Notification banner */}
      {notif && (
        <div className={`border-b px-4 py-3 ${notif.startsWith("✅") ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className={`text-sm font-medium ${notif.startsWith("✅") ? "text-emerald-800" : "text-blue-800"}`}>{notif}</p>
            <button onClick={() => setNotif(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-gray-800 transition">Accueil</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("/courses")} className="hover:text-gray-800 transition">Formations</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-xs">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ════ COLONNE GAUCHE ════ */}
          <div className="lg:col-span-2 space-y-7">

            {/* Header cours */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${level.cls}`}>
                  {level.icon} {level.label}
                </span>
                <span className="px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {lang.flag} {lang.name}
                </span>
                {course.category_name && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium border" style={{ background: "#ede9fe", color: "#2d287f", borderColor: "#c4b5fd" }}>
                    {course.category_name}
                  </span>
                )}
                {discount && (
                  <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
                    -{discount}% PROMO
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {course.short_description || course.description?.substring(0, 180) + "…"}
              </p>

              {/* Mini stats inline */}
              <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <strong className="text-gray-900">{(course.student_count || 0).toLocaleString("fr-FR")}</strong> étudiants
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <strong className="text-gray-900">{formatRating(course.rating)}/5</strong>
                  {course.review_count > 0 && <span className="text-gray-400">({course.review_count} avis)</span>}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <strong className="text-gray-900">{formatDuration(course.duration_hours)}</strong>
                </span>
                {totalLessons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <strong className="text-gray-900">{totalLessons}</strong> leçons
                  </span>
                )}
              </div>

              {/* Instructeur */}
              {(course.first_name || course.last_name) && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                    {(course.first_name?.[0] || "") + (course.last_name?.[0] || "")}
                  </div>
                  <span>Présenté par <strong className="text-gray-800">{course.first_name} {course.last_name}</strong></span>
                </div>
              )}
            </div>

            {/* Image/Thumbnail */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200/50">
              <Thumbnail url={course.thumbnail_url} title={course.title} h="h-72 sm:h-80" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users,    color: "text-blue-600",   bg: "bg-blue-50",   label: "Étudiants",       val: (course.student_count || 0).toLocaleString("fr-FR") },
                { icon: Star,     color: "text-amber-600",  bg: "bg-amber-50",  label: "Note moyenne",    val: `${formatRating(course.rating)}/5` },
                { icon: Clock,    color: "text-emerald-600",bg: "bg-emerald-50",label: "Durée",           val: formatDuration(course.duration_hours) },
                { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Leçons",          val: totalLessons || "—" },
              ].map(({ icon: Icon, color, bg, label, val }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-black text-gray-900 truncate">{val}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── TABS ── */}
            <div>
              {/* Tab nav */}
              <div className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-0">
                {[
                  { id: "overview",    icon: Eye,       label: "Aperçu" },
                  { id: "curriculum",  icon: BookOpen,  label: "Programme" },
                  { id: "instructor",  icon: Users,     label: "Instructeur" },
                  { id: "outcomes",    icon: Target,    label: "Compétences" },
                  { id: "faq",         icon: HelpCircle,label: "FAQ" },
                  { id: "reviews",     icon: Star,      label: "Avis" },
                ].map(({ id: tid, icon: Icon, label }) => (
                  <button key={tid} onClick={() => setActiveTab(tid)}
                    className={`flex items-center gap-1.5 py-3 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px
                      ${activeTab === tid
                        ? "text-white border-transparent rounded-t-xl"
                        : "text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300"
                      }`}
                    style={activeTab === tid ? { background: "linear-gradient(135deg,#2d287f,#5653e1)" } : {}}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-gray-200 border-t-0 shadow-sm">
                <div className="p-6">

                  {/* ── Aperçu ── */}
                  {activeTab === "overview" && (
                    <div className="space-y-7">
                      {/* Description */}
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-4">À propos de ce cours</h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                          {course.description || "Aucune description disponible."}
                        </div>
                      </div>

                      {/* Ce que vous apprendrez */}
                      {course.learning_outcomes && (
                        <div>
                          <h3 className="text-xl font-black text-gray-900 mb-4">Ce que vous apprendrez</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {parseJsonField(course.learning_outcomes).map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prérequis */}
                      {course.requirements && (
                        <div>
                          <h3 className="text-xl font-black text-gray-900 mb-4">Prérequis</h3>
                          <ul className="space-y-2">
                            {parseJsonField(course.requirements).map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Ce qui est inclus */}
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-4">Ce qui est inclus</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { icon: Video,      label: `Vidéos HD ${formatDuration(course.duration_hours)}` },
                            { icon: Download,   label: "Ressources téléchargeables" },
                            { icon: Award,      label: "Certificat officiel" },
                            { icon: GraduationCap, label: "Accès mobile & TV" },
                            { icon: HelpCircle, label: "Support Q&A" },
                            { icon: Clock,      label: "Accès à vie" },
                          ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700">
                              <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Infos clés */}
                      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-base font-black text-gray-900 mb-4">Informations clés</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          {[
                            { l: "Niveau",      v: level.label },
                            { l: "Catégorie",   v: course.category_name || "—" },
                            { l: "Accès",       v: "À vie" },
                            { l: "Langue",      v: `${lang.flag} ${lang.name}` },
                            { l: "Durée",       v: formatDuration(course.duration_hours) },
                            { l: "Mise à jour", v: course.updated_at ? new Date(course.updated_at).toLocaleDateString("fr-FR", { year:"numeric", month:"short" }) : "Récent" },
                          ].map(({ l, v }) => (
                            <div key={l}>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{l}</p>
                              <p className="font-semibold text-gray-800">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Programme ── */}
                  {activeTab === "curriculum" && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-black text-gray-900">Programme du cours</h3>
                        {course.modules?.length > 0 && (
                          <span className="text-sm text-gray-500">{course.modules.length} modules · {totalLessons} leçons</span>
                        )}
                      </div>

                      {course.modules?.length > 0 ? (
                        <div className="space-y-3">
                          {course.modules.map((mod, mi) => (
                            <div key={mod.id || mi} className="border border-gray-200 rounded-2xl overflow-hidden">
                              <button
                                onClick={() => setExpandedMods(p =>
                                  p.includes(mod.id || mi)
                                    ? p.filter(x => x !== (mod.id || mi))
                                    : [...p, (mod.id || mi)]
                                )}
                                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                                    {mi + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{mod.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {mod.lesson_count || 0} leçon{mod.lesson_count !== 1 ? "s" : ""}
                                      {mod.total_duration > 0 && ` · ${Math.round(mod.total_duration / 60)}h`}
                                    </p>
                                  </div>
                                </div>
                                {expandedMods.includes(mod.id || mi)
                                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                }
                              </button>

                              {expandedMods.includes(mod.id || mi) && mod.lessons?.length > 0 && (
                                <div className="divide-y divide-gray-50">
                                  {mod.lessons.map((les, li) => {
                                    const lt = LESSON_TYPES[les.content_type] || LESSON_TYPES.video;
                                    const Icon = lt.icon;
                                    return (
                                      <div key={les.id || li} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lt.bg}`}>
                                            <Icon className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{les.title}</p>
                                            <p className="text-xs text-gray-400">{lt.label}{les.duration_minutes ? ` · ${les.duration_minutes} min` : ""}</p>
                                          </div>
                                        </div>
                                        {access.status === "approved" ? (
                                          <button
                                            onClick={() => navigate(`/courses/${course.id}/lessons/${les.id}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                                            <PlayCircle className="w-3.5 h-3.5" /> Accéder
                                          </button>
                                        ) : les.is_preview ? (
                                          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                                            Aperçu libre
                                          </span>
                                        ) : (
                                          <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                          <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="font-bold text-gray-700 mb-1">Programme en cours de finalisation</p>
                          <p className="text-sm text-gray-500">Le programme détaillé sera disponible prochainement.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Instructeur ── */}
                  {activeTab === "instructor" && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-black text-gray-900">Votre instructeur</h3>
                      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-start gap-5">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                            {(course.first_name?.[0] || "") + (course.last_name?.[0] || "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-black text-gray-900">{course.first_name} {course.last_name}</h4>
                            <p className="text-indigo-600 font-medium text-sm mb-3">Expert DevOps & Cloud</p>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              Spécialiste DevOps avec une expertise approfondie en CI/CD, conteneurisation et cloud.
                              Formateur expérimenté avec de nombreux apprenants formés.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { icon: Users, label: "Étudiants", val: (course.student_count || 0).toLocaleString("fr-FR") },
                                { icon: BookOpen, label: "Cours", val: "15+" },
                                { icon: Star, label: "Note", val: `${formatRating(course.rating)}/5` },
                                { icon: Award, label: "Certifié", val: "AWS & K8s" },
                              ].map(({ icon: Icon, label, val }) => (
                                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                  <Icon className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                                  <p className="text-sm font-bold text-gray-900">{val}</p>
                                  <p className="text-xs text-gray-500">{label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Compétences ── */}
                  {activeTab === "outcomes" && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-black text-gray-900">Compétences acquises</h3>

                      {/* Depuis la BDD learning_outcomes */}
                      {course.learning_outcomes && (() => {
                        const outcomes = parseJsonField(course.learning_outcomes);
                        if (outcomes.length > 0) return (
                          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-500" /> Objectifs de ce cours
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {outcomes.map((o, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {o}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Grille compétences DevOps génériques */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { icon: Code,       bg:"bg-blue-50 border-blue-100",    title:"Dev & CI/CD",     color:"text-blue-600",    skills:["Git & GitHub Actions","Jenkins Pipelines","Docker","Kubernetes","Terraform"] },
                          { icon: Cloud,      bg:"bg-emerald-50 border-emerald-100",title:"Cloud",          color:"text-emerald-600", skills:["AWS / Azure / GCP","IaC","Networking","Monitoring","Cost Optim."] },
                          { icon: ShieldCheck,bg:"bg-purple-50 border-purple-100", title:"DevSecOps",       color:"text-purple-600",  skills:["SAST/DAST","Secret Mgmt","Compliance","Vuln. Assessment","Zero Trust"] },
                          { icon: Settings,   bg:"bg-amber-50 border-amber-100",   title:"Automatisation",  color:"text-amber-600",   skills:["Ansible","Prometheus","Grafana","ArgoCD","Helm"] },
                        ].map(({ icon: Icon, bg, title, color, skills }) => (
                          <div key={title} className={`rounded-xl p-4 border ${bg}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Icon className={`w-5 h-5 ${color}`} />
                              <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                            </div>
                            <ul className="space-y-1.5">
                              {skills.map(s => (
                                <li key={s} className="flex items-center gap-2 text-xs text-gray-700">
                                  <CheckCircle className={`w-3.5 h-3.5 ${color} flex-shrink-0`} /> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── FAQ ── */}
                  {activeTab === "faq" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 mb-5">Questions fréquentes</h3>
                      {[
                        { q:"Puis-je suivre ce cours à mon rythme ?",      a:"Oui, tous nos cours sont 100% à la demande. Vous apprenez quand vous voulez, depuis n'importe quel appareil." },
                        { q:"Comment s'effectue le paiement ?",             a:"Le paiement s'effectue uniquement en FCFA via Orange Money, MTN MoMo, Wave ou virement bancaire. Envoyez la preuve à notre équipe, accès sous 24h." },
                        { q:"Ai-je besoin de prérequis ?",                  a:"Chaque cours précise ses prérequis dans l'onglet Aperçu. Les cours Débutant n'en nécessitent aucun." },
                        { q:"Comment obtenir mon certificat ?",             a:"Le certificat est généré automatiquement après avoir complété toutes les leçons et réussi les évaluations avec 80% minimum." },
                        { q:"Puis-je obtenir un remboursement ?",           a:"Oui, garantie satisfait ou remboursé 30 jours. Contactez support@devopsakademy.com pour toute demande." },
                        { q:"Le cours est-il accessible sur mobile ?",      a:"Oui, la plateforme est 100% responsive. Vous pouvez aussi télécharger les ressources pour un accès hors-ligne." },
                      ].map(({ q, a }) => (
                        <div key={q} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2 text-sm">
                            <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" /> {q}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed pl-6">{a}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Avis ── */}
                  {activeTab === "reviews" && (
                    <CourseReviews
                      courseId={course.id || id}
                      isEnrolled={isUserEnrolled(String(course?.id || id)) && isEnrollmentApproved(String(course?.id || id))}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>{/* fin colonne gauche */}

          {/* ════ SIDEBAR DROITE — STICKY ════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">

              {/* Card prix + inscription */}
              <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">

                {/* Promo banner */}
                {discount && (
                  <div className="flex items-center justify-center gap-2 py-3 px-5 text-white text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#ef4444,#f97316)" }}>
                    <Zap className="w-4 h-4 animate-pulse" />
                    OFFRE LIMITÉE : -{discount}% · Valable encore 2 jours
                  </div>
                )}

                <div className="p-6">
                  {/* Prix FCFA */}
                  <div className="mb-5">
                    {course.is_free ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-600">Gratuit</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-black text-gray-900">
                            {formatPrice(course.price, course.is_free)}
                          </span>
                        </div>
                        {course.original_price && Number(course.original_price) > Number(course.price) && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-gray-400 line-through text-lg">
                              {formatPrice(course.original_price, false)}
                            </span>
                            {discount && (
                              <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                                Économisez {formatPrice(course.original_price - course.price, false)}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Infos clés */}
                  <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                    {[
                      { icon: Clock,    label: "Durée",      val: formatDuration(course.duration_hours) },
                      { icon: BookOpen, label: "Leçons",     val: totalLessons || "N/A" },
                      { icon: Globe,    label: "Langue",     val: `${lang.flag} ${lang.name}` },
                      { icon: Award,    label: "Certificat", val: "Inclus", green: true },
                    ].map(({ icon: Icon, label, val, green }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5 text-gray-500">
                          <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {label}
                        </div>
                        <span className={`font-semibold ${green ? "text-emerald-600" : "text-gray-900"}`}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Boutons d'action selon statut */}
                  <div className="space-y-3">
                    {access.status === "approved" ? (
                      <>
                        <button onClick={() => navigate(`/courses/${course.id}/learn`)}
                          className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 text-base hover:shadow-xl hover:-translate-y-0.5 transition-all"
                          style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                          <PlayCircle className="w-5 h-5" /> Continuer l'apprentissage
                        </button>
                        <button onClick={() => navigate(`/courses/${course.id}/progress`)}
                          className="w-full py-3 rounded-2xl font-bold text-sm border-2 flex items-center justify-center gap-2 transition hover:bg-gray-50"
                          style={{ borderColor: "#2d287f", color: "#2d287f" }}>
                          <BarChart className="w-4 h-4" /> Voir ma progression
                        </button>
                      </>
                    ) : access.status === "pending" ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="font-bold text-amber-800 text-sm">Validation en cours</p>
                        <p className="text-xs text-amber-600 mt-1">Accès activé sous 24h ouvrées après vérification du paiement.</p>
                      </div>
                    ) : access.status === "rejected" ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                        <p className="font-bold text-red-700 text-sm mb-2">Paiement refusé</p>
                        <p className="text-xs text-red-600 mb-3">Veuillez renvoyer une preuve valide.</p>
                        <button onClick={() => navigate("/student")} className="text-xs font-bold text-red-600 underline">
                          Aller dans mon espace
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 text-base hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70"
                          style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                          {enrolling ? <><Loader className="w-5 h-5 animate-spin" /> Inscription…</> : <><GraduationCap className="w-5 h-5" /> S'inscrire maintenant</>}
                        </button>
                        <button onClick={() => setShowPayment(true)}
                          className="w-full py-3 rounded-2xl font-semibold text-sm border border-gray-200 text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                          <Info className="w-4 h-4" /> Voir les infos de paiement
                        </button>
                      </>
                    )}
                  </div>

                  {/* Garantie */}
                  <div className="mt-5 flex items-start gap-3 pt-5 border-t border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Garantie satisfait ou remboursé</p>
                      <p className="text-xs text-gray-500 mt-0.5">Sans risque pendant 30 jours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus d'inscription */}
              {access.status !== "approved" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-black text-gray-900 text-sm mb-4">Processus d'inscription</h4>
                  <ol className="space-y-3">
                    {[
                      { n:"1", t:"Inscription",   d:`Cliquez sur "S'inscrire"` },
                      { n:"2", t:"Paiement",       d:"En FCFA (MoMo/Wave/Orange)" },
                      { n:"3", t:"Validation",     d:"Admin vérifie la preuve" },
                      { n:"4", t:"Accès",          d:"Accès immédiat au cours" },
                    ].map(({ n, t, d }) => (
                      <li key={n} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>{n}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{t}</p>
                          <p className="text-xs text-gray-500">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Partager */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-gray-900 text-sm mb-3">Partager ce cours</h4>
                <div className="flex gap-2">
                  {[
                    { l:"Facebook",  bg:"#1877f2", href:`https://facebook.com/sharer/sharer.php?u=${window.location.href}` },
                    { l:"Twitter",   bg:"#1da1f2", href:`https://twitter.com/intent/tweet?url=${window.location.href}&text=${course.title}` },
                    { l:"LinkedIn",  bg:"#0a66c2", href:`https://linkedin.com/sharing/share-offsite/?url=${window.location.href}` },
                    { l:"WhatsApp",  bg:"#25d366", href:`https://wa.me/?text=${course.title} ${window.location.href}` },
                  ].map(({ l, bg, href }) => (
                    <a key={l} href={href} target="_blank" rel="noreferrer"
                      className="flex-1 py-2 rounded-xl text-white text-xs font-bold text-center hover:opacity-90 transition"
                      style={{ background: bg }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>{/* fin grid */}
      </div>
    </div>
  );
}