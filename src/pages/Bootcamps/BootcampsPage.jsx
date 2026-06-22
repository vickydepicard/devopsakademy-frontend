import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  Calendar, Clock, Users, Radio, Play, Zap,
  Lock, ChevronRight, Loader, AlertCircle,
  MapPin, Tag, ArrowRight, Filter, CheckCircle
} from "lucide-react";

// ─── Constantes ────────────────────────────────────────────
const STATUS_MAP = {
  live:      { label: "En direct",  color: "text-red-600",   bg: "bg-red-50 border-red-200",   dot: "bg-red-500",    pulse: true  },
  scheduled: { label: "Planifié",   color: "text-amber-600", bg: "bg-amber-50 border-amber-200",dot: "bg-amber-500",  pulse: false },
  ended:     { label: "Terminé",    color: "text-emerald-600",bg:"bg-emerald-50 border-emerald-200",dot:"bg-emerald-500",pulse:false},
  cancelled: { label: "Annulé",     color: "text-gray-400",  bg: "bg-gray-50 border-gray-200",  dot: "bg-gray-400",   pulse: false },
};

const LEVEL_MAP = {
  beginner:     { label: "Débutant",     cls: "bg-emerald-100 text-emerald-700" },
  intermediate: { label: "Intermédiaire",cls: "bg-blue-100 text-blue-700" },
  advanced:     { label: "Avancé",       cls: "bg-purple-100 text-purple-700" },
};

const FILTERS = [
  { value: "all",       label: "Tous" },
  { value: "live",      label: "🔴 En direct" },
  { value: "scheduled", label: "📅 Planifiés" },
  { value: "ended",     label: "▶ Replays" },
];

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

// ─── Skeleton card ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

// ─── Carte bootcamp ────────────────────────────────────────
function BootcampCard({ b, onRegister, registering, isRegistered = false }) {
  const st  = STATUS_MAP[b.status]  || STATUS_MAP.scheduled;
  const lvl = LEVEL_MAP[b.level]    || LEVEL_MAP.beginner;
  // Formatage date sécurisé
  const rawDate = b.scheduled_at ? new Date(b.scheduled_at) : null;
  const validDate = rawDate && !isNaN(rawDate.getTime()) ? rawDate : null;
  const isLive  = b.status === "live";
  const isEnded = b.status === "ended";
  const isFull  = b.max_participants && b.registered_count >= b.max_participants;
  const spotsLeft = b.max_participants ? b.max_participants - (b.registered_count || 0) : null;

  return (
    <div className={`group bg-white rounded-2xl border overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col ${isLive ? "border-red-300 shadow-red-100 shadow-md" : "border-gray-100"}`}>

      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-[#1f1b5a] to-[#5653e1] overflow-hidden shrink-0">
        {b.thumbnail_url ? (
          <img src={b.thumbnail_url} alt={b.title}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="w-14 h-14 text-white/20" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${st.bg} ${st.color}`}>
          {st.pulse ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${st.dot}`} />
            </span>
          ) : (
            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          )}
          {st.label}
        </div>

        {/* Prix */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {b.is_free ? "Gratuit 🎉" : `${fmt(b.price)} FCFA`}
        </div>

        {/* Replay overlay */}
        {isEnded && b.replay_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 text-[#2d287f]" fill="#2d287f" />
            </div>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE MAINTENANT
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
        {b.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {b.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-[#2d287f]/8 text-[#2d287f] px-2 py-0.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-bold text-[#1f1b5a] text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[#2d287f] transition-colors">
          {b.title}
        </h3>

        <p className="text-xs text-[#5653e1] font-semibold mb-3">
          Par {b.instructor_name}
        </p>

        {/* Méta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {validDate
              ? validDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                + " à " + validDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : "Date à confirmer"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {b.duration_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {fmt(b.registered_count)} inscrit{b.registered_count > 1 ? "s" : ""}
            {b.max_participants && <span className="text-gray-300"> / {fmt(b.max_participants)}</span>}
          </span>
        </div>

        {/* Places restantes */}
        {spotsLeft !== null && spotsLeft <= 10 && !isEnded && (
          <div className={`text-xs font-semibold mb-3 px-2.5 py-1.5 rounded-lg ${isFull ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
            {isFull ? "🔴 Complet" : `⚠️ Plus que ${spotsLeft} place${spotsLeft > 1 ? "s" : ""} !`}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lvl.cls}`}>
            {lvl.label}
          </span>

          {isEnded ? (
            b.replay_url ? (
              <a href={b.replay_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-[#2d287f] hover:gap-2.5 transition-all">
                <Play className="w-3.5 h-3.5" /> Voir le replay
              </a>
            ) : (
              <span className="text-xs text-gray-400 font-medium">Replay indisponible</span>
            )
          ) : isFull ? (
            <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Complet
            </span>
          ) : isLive && b.stream_url ? (
            /* Live actif → ouvrir le stream directement sans re-s'inscrire */
            <a href={b.stream_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 bg-red-600 hover:bg-red-500">
              <Play className="w-3.5 h-3.5" /> Rejoindre le live
            </a>
          ) : isRegistered ? (
            /* Inscrit → selon statut : rejoindre si live, badge sinon */
            isLive && b.stream_url ? (
              <a href={b.stream_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 transition">
                <Play className="w-3.5 h-3.5" /> Rejoindre le live
              </a>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <Radio className="w-3.5 h-3.5" /> En cours — lien indisponible
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" /> Inscrit
              </span>
            )
          ) : (
            <button
              onClick={() => onRegister(b)}
              disabled={registering === b.id}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              {registering === b.id
                ? <Loader className="w-3.5 h-3.5 animate-spin" />
                : "S'inscrire"
              }
              {registering !== b.id && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────
export default function BootcampsPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bootcamps,  setBootcamps]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [registering, setRegistering] = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBootcamps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`/bootcamps${params}`);
      setBootcamps(res.data?.data || []);
    } catch {
      setError("Impossible de charger les bootcamps. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchBootcamps(); }, [fetchBootcamps]);

  const handleRegister = async (b) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/bootcamps" } });
      return;
    }
    setRegistering(b.id);
    try {
      await api.post(`/bootcamps/${b.id}/register`);
      // Marquer localement sans attendre le rechargement
      setBootcamps(prev => prev.map(bc => bc.id === b.id ? {...bc, is_registered: true} : bc));
      showToast(b.is_free ? `✅ Inscrit à "${b.title}" !` : `✅ Inscription enregistrée — paiement en attente`);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'inscription.";
      if (err.response?.status === 409) {
        // Déjà inscrit → marquer localement + ouvrir stream si live
        setBootcamps(prev => prev.map(bc => bc.id === b.id ? {...bc, is_registered: true} : bc));
        if (b.stream_url && b.status === "live") {
          window.open(b.stream_url, "_blank");
        } else {
          showToast("Vous êtes déjà inscrit.", "info");
        }
      } else {
        showToast(msg, "error");
      }
    } finally {
      setRegistering(null);
    }
  };

  const counts = {
    all:       bootcamps.length,
    live:      bootcamps.filter(b => b.status === "live").length,
    scheduled: bootcamps.filter(b => b.status === "scheduled").length,
    ended:     bootcamps.filter(b => b.status === "ended").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-right-4 transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" :
          toast.type === "info"  ? "bg-[#2d287f] text-white" :
          "bg-emerald-600 text-white"
        }`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] text-white py-20">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#facc15]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15]/15 border border-[#facc15]/30 rounded-full text-[#facc15] text-sm font-bold mb-6">
            <Radio className="w-4 h-4" /> Sessions live & formations intensives
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            Bootcamps <span className="text-[#facc15]">&amp; Lives</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Rejoignez des sessions live animées par des experts, suivez des bootcamps intensifs
            et accédez aux replays à la demande.
          </p>

          {/* Stats rapides */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { val: counts.live,      label: "En direct",  color: "text-red-400" },
              { val: counts.scheduled, label: "Planifiés",  color: "text-amber-400" },
              { val: counts.ended,     label: "Replays",    color: "text-emerald-400" },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-black ${color}`}>{val}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {FILTERS.map(({ value, label }) => (
            <button key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filter === value
                  ? "bg-[#2d287f] text-white border-[#2d287f] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2d287f]/40"
              }`}>
              {label}
              {counts[value] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {counts[value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-8 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
            <button onClick={fetchBootcamps} className="ml-auto text-xs font-bold underline">Réessayer</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : bootcamps.length === 0 ? (
          /* Vide */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Radio className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">
              {filter === "live"      ? "Aucun live en cours"
               : filter === "scheduled" ? "Aucun bootcamp planifié"
               : filter === "ended"     ? "Aucun replay disponible"
               : "Aucun bootcamp disponible"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {filter !== "all"
                ? "Essayez un autre filtre pour voir les autres sessions."
                : "Les prochains bootcamps seront annoncés bientôt. Revenez vite !"}
            </p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")}
                className="px-5 py-2.5 bg-[#2d287f] text-white font-semibold rounded-xl text-sm hover:bg-[#3b3aab] transition">
                Voir tous les bootcamps
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Live en tête si présents */}
            {filter === "all" && counts.live > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <h2 className="font-black text-red-600 text-lg">En direct maintenant</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {bootcamps.filter(b => b.status === "live").map(b => (
                    <BootcampCard key={b.id} b={b} onRegister={handleRegister} registering={registering} isRegistered={!!b.is_registered} />
                  ))}
                </div>
              </div>
            )}

            {/* Tous les autres */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filter === "all"
                ? bootcamps.filter(b => b.status !== "live")
                : bootcamps
              ).map(b => (
                <BootcampCard key={b.id} b={b} onRegister={handleRegister} registering={registering} />
              ))}
            </div>
          </>
        )}

        {/* CTA devenir instructeur */}
        {!loading && (
          <div className="mt-16 rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1f1b5a,#2d287f)" }}>
            <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-6">
              <div className="text-white flex-1">
                <p className="text-[#facc15] text-sm font-bold uppercase tracking-wider mb-2">
                  Vous êtes expert DevOps ?
                </p>
                <h3 className="text-2xl font-black mb-2">Animez votre propre bootcamp</h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  Partagez votre expertise avec notre communauté. Nous gérons la plateforme, vous vous concentrez sur le contenu.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link to="/become-instructor"
                  className="flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-3 px-6 rounded-2xl transition hover:-translate-y-0.5 text-sm shadow-lg">
                  Devenir instructeur <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact"
                  className="flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold py-3 px-5 rounded-2xl transition text-sm">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}