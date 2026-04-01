// CourseDetails.jsx — DevOpsAkademy
// Page détail cours — 100% dynamique — Prix en FCFA
// Design cohérent avec les couleurs #2d287f / #facc15
import React, { useState, useEffect, useMemo } from "react";
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
import RealPaymentModal from "../../pages/payment/PaymentModal";


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
        className={`w-full ${h} object-contain`}
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
   MODAL PAIEMENT — Logos SVG inline fidèles
══════════════════════════════════════════════════════ */

// Orange Money — logo officiel via URL externe avec fallback SVG
const OrangeLogo = () => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    // Fallback si l'URL ne charge pas
    return (
      <div style={{
        width: 52, height: 52, borderRadius: 13, background: "#111111",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <polygon points="33,8 44,8 44,19" fill="#FF6900"/>
          <rect x="21.5" y="9" width="8" height="30" rx="4" fill="#FF6900"
            transform="rotate(45 26 26)"/>
          <polygon points="8,44 19,44 8,33" fill="white"/>
          <rect x="21.5" y="13" width="8" height="30" rx="4" fill="white"
            transform="rotate(45 26 26)"/>
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 13, background: "#111111",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", padding: 4,
    }}>
      <img
        src="https://www.logo.wine/a/logo/Orange_Money/Orange_Money-Logo.wine.svg"
        alt="Orange Money"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};

// MTN MoMo — fond jaune signature, 2 bandes noires, texte MTN + MoMo
const MtnLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="52" rx="13" fill="#FFCC00"/>
    {/* 2 bandes noires horizontales signature MTN */}
    <rect x="0" y="16" width="52" height="6" fill="#111111"/>
    <rect x="0" y="30" width="52" height="6" fill="#111111"/>
    {/* Masque coins arrondis */}
    <rect width="52" height="52" rx="13" fill="transparent"/>
    {/* Texte MTN en haut */}
    <text x="26" y="13.5" textAnchor="middle" fontSize="10.5" fontWeight="900"
      fill="#111111" fontFamily="Arial Black,Arial,sans-serif">MTN</text>
    {/* Texte MoMo en bas */}
    <text x="26" y="47" textAnchor="middle" fontSize="8.5" fontWeight="800"
      fill="#111111" fontFamily="Arial,sans-serif">MoMo</text>
  </svg>
);

// Wave — logo pingouin stylisé inline
const WaveLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="52" rx="14" fill="#00B2F0"/>
    {/* Corps pingouin */}
    <ellipse cx="26" cy="30" rx="10" ry="12" fill="#1a1a1a"/>
    {/* Ventre blanc */}
    <ellipse cx="26" cy="31" rx="6" ry="8" fill="white"/>
    {/* Tête */}
    <ellipse cx="26" cy="18" rx="8" ry="8" fill="#1a1a1a"/>
    {/* Yeux */}
    <circle cx="23" cy="16" r="2" fill="white"/>
    <circle cx="29" cy="16" r="2" fill="white"/>
    <circle cx="23.5" cy="16.5" r="1" fill="#1a1a1a"/>
    <circle cx="29.5" cy="16.5" r="1" fill="#1a1a1a"/>
    {/* Bec */}
    <path d="M24 20 L26 23 L28 20 Z" fill="#FF9900"/>
    {/* Ailes */}
    <ellipse cx="14" cy="29" rx="4" ry="7" fill="#1a1a1a" transform="rotate(-10 14 29)"/>
    <ellipse cx="38" cy="29" rx="4" ry="7" fill="#1a1a1a" transform="rotate(10 38 29)"/>
    {/* Pieds */}
    <ellipse cx="22" cy="42" rx="4" ry="2.5" fill="#FF9900"/>
    <ellipse cx="30" cy="42" rx="4" ry="2.5" fill="#FF9900"/>
  </svg>
);


function PaymentModal({ onClose, price, isFree }) {
  const fmt = (p) => Number(p || 0).toLocaleString("fr-FR");
  const [copied, setCopied] = useState(null);

  const copyNum = (num, id) => {
    navigator.clipboard?.writeText(num).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // ══════════════════════════════════════════════════════
  // CONFIG PAIEMENT — tout depuis .env
  // Activer/désactiver : VITE_PAYMENT_xxx_ENABLED=true/false
  // Changer numéro    : VITE_PAYMENT_xxx_NUMBER=6xxxxxxxx
  // Changer nom       : VITE_PAYMENT_xxx_NAME=Nom Compte
  // ══════════════════════════════════════════════════════
  const formatPhone = (raw) => {
    const n = (raw || "").replace(/\D/g, "");
    return n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  };

  const ALL_METHODS = [
    {
      id:        "orange",
      Logo:      OrangeLogo,
      name:      "Orange Money",
      accountName: import.meta.env.VITE_PAYMENT_ORANGE_NAME    || "DevOpsAkademy",
      number:    formatPhone(import.meta.env.VITE_PAYMENT_ORANGE_NUMBER),
      rawNumber: import.meta.env.VITE_PAYMENT_ORANGE_NUMBER    || "",
      enabled:   import.meta.env.VITE_PAYMENT_ORANGE_ENABLED   !== "false",
      code:      "#150*1#",
      grad:      "linear-gradient(135deg,#FF6900,#FF8C00)",
      glow:      "rgba(255,105,0,0.25)",
      badge:     "#fff3e0",
      badgeText: "#e65100",
    },
    {
      id:        "mtn",
      Logo:      MtnLogo,
      name:      "MTN MoMo",
      accountName: import.meta.env.VITE_PAYMENT_MTN_NAME       || "DevOpsAkademy",
      number:    formatPhone(import.meta.env.VITE_PAYMENT_MTN_NUMBER),
      rawNumber: import.meta.env.VITE_PAYMENT_MTN_NUMBER       || "",
      enabled:   import.meta.env.VITE_PAYMENT_MTN_ENABLED      !== "false",
      code:      "*126#",
      grad:      "linear-gradient(135deg,#FFCB00,#FFD740)",
      glow:      "rgba(255,203,0,0.3)",
      badge:     "#fffde7",
      badgeText: "#f57f17",
    },
    {
      id:        "wave",
      Logo:      WaveLogo,
      name:      "Wave",
      accountName: import.meta.env.VITE_PAYMENT_WAVE_NAME      || "DevOpsAkademy",
      number:    formatPhone(import.meta.env.VITE_PAYMENT_WAVE_NUMBER),
      rawNumber: import.meta.env.VITE_PAYMENT_WAVE_NUMBER      || "",
      enabled:   import.meta.env.VITE_PAYMENT_WAVE_ENABLED     !== "false",
      code:      "App Wave",
      grad:      "linear-gradient(135deg,#00B2F0,#00D4FF)",
      glow:      "rgba(0,178,240,0.25)",
      badge:     "#e0f7fa",
      badgeText: "#006064",
    },
  ];

  // Filtre uniquement les méthodes activées dans .env
  const METHODS = ALL_METHODS.filter(m => m.enabled && m.rawNumber);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ background: "rgba(10,8,40,0.85)", backdropFilter: "blur(10px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full bg-white overflow-hidden flex flex-col"
        style={{
          maxWidth: 420,
          maxHeight: "90dvh",
          borderRadius: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "payIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="relative flex-shrink-0 px-6 pt-7 pb-6 text-center overflow-hidden"
          style={{ background: "linear-gradient(160deg,#0f0c2e 0%,#1e1b4b 40%,#2d287f 100%)" }}
        >
          {/* Glow décoratif */}
          <div style={{
            position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(250,204,21,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}/>
          {/* Close */}
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, width: 32, height: 32,
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X className="w-4 h-4 text-white" />
          </button>
          {/* Label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 12,
            background: "rgba(255,255,255,0.08)", borderRadius: 20,
            padding: "4px 12px 4px 6px", border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <span style={{
              width: 20, height: 20, background: "#facc15", borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, color: "#1e1b4b",
            }}>DA</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Paiement
            </span>
          </div>
          {/* Prix */}
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 4 }}>Montant à payer</p>
          <p style={{
            fontSize: isFree ? 32 : 42, fontWeight: 900, letterSpacing: "-0.02em",
            color: "#facc15",
            textShadow: "0 0 40px rgba(250,204,21,0.4)",
            lineHeight: 1,
          }}>
            {isFree ? "🎉 Gratuit" : `${fmt(price)} FCFA`}
          </p>
          {!isFree && (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 6 }}>
              Paiement unique · Accès à vie
            </p>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="overflow-y-auto flex-1" style={{ padding: "20px 20px 0" }}>

          {!isFree && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>
                Moyens de paiement
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {METHODS.map(({ id, Logo, name, accountName, number, rawNumber, code, grad, glow, badge, badgeText }) => (
                  <div key={id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "#fafafa", borderRadius: 18,
                    border: "1.5px solid #f0f0f0",
                    padding: "12px 14px",
                    transition: "all 0.2s",
                  }}>
                    {/* Logo */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      overflow: "hidden", boxShadow: `0 6px 20px ${glow}`,
                    }}>
                      <Logo />
                    </div>

                    {/* Infos */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: badgeText,
                          background: badge, borderRadius: 6, padding: "2px 7px",
                        }}>{code}</span>
                      </div>
                      <p style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                        {number}
                      </p>
                      <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontStyle: "italic" }}>
                        {accountName}
                      </p>
                    </div>

                    {/* Copier */}
                    <button
                      onClick={() => copyNum(rawNumber, id)}
                      style={{
                        flexShrink: 0, padding: "7px 14px", borderRadius: 10,
                        background: copied === id ? "linear-gradient(135deg,#10b981,#059669)" : grad,
                        border: "none", cursor: "pointer", color: copied === id ? "white" : (id === "mtn" ? "#1a1a1a" : "white"),
                        fontSize: 11, fontWeight: 800, transition: "all 0.2s",
                        boxShadow: `0 4px 12px ${glow}`,
                        minWidth: 64, textAlign: "center",
                      }}
                    >
                      {copied === id ? "✓ Copié" : "Copier"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processus */}
          <div style={{
            background: "linear-gradient(135deg,#f8f7ff,#f0f0ff)",
            border: "1px solid #e0e7ff", borderRadius: 18, padding: "14px 16px", marginBottom: 12,
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              📋 Comment payer
            </p>
            {[
              "Notez le numéro et composez le code USSD",
              "Entrez le montant exact et validez",
              "Photographiez le SMS de confirmation",
              "Cliquez « S'inscrire » et uploadez la preuve",
              "Accès activé sous 24h ✓",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 4 ? 8 : 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#2d287f,#5653e1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 900, color: "white",
                }}>{i + 1}</div>
                <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5, paddingTop: 3 }}>{t}</p>
              </div>
            ))}
          </div>

          {/* Garantie */}
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 14, padding: "10px 14px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#065f46" }}>Garantie satisfait ou remboursé 30 jours</p>
              <p style={{ fontSize: 11, color: "#059669" }}>{import.meta.env.VITE_PAYMENT_EMAIL || "support@devopsakademy.com"}</p>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding: "12px 20px 20px", flexShrink: 0 }}>
          <button onClick={onClose} style={{
            width: "100%", padding: "15px", borderRadius: 18,
            background: "linear-gradient(135deg,#2d287f,#5653e1)",
            border: "none", cursor: "pointer", color: "white",
            fontSize: 15, fontWeight: 900, letterSpacing: "0.01em",
            boxShadow: "0 8px 24px rgba(45,40,127,0.35)",
            transition: "opacity 0.2s",
          }}>
            Fermer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes payIn {
          from { opacity:0; transform:scale(0.88) translateY(24px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
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
  const [showRealPayment, setShowRealPayment] = useState(false);
  const [notif,           setNotif]          = useState(location.state?.message || null);

  /* ── Chargement ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        // Essai 1: Route enrichie (connecté)
        if (isAuthenticated) {
          try {
            const r = await api.get(`/courses/${id}/details`);
            if (r.data?.success) { setCourse(r.data.data); return; }
          } catch (detailsErr) {
            console.warn("CourseDetails /details err, fallback vers route publique:", detailsErr?.response?.status);
          }
        }
        // Essai 2: Route publique (fallback)
        try {
          const r = await api.get(`/courses/${id}`);
          if (r.data?.success) { setCourse(r.data.data); return; }
          setError("Ce cours est introuvable ou n'est plus disponible.");
        } catch (pubErr) {
          const status = pubErr?.response?.status;
          if (status === 404) {
            setError("Ce cours est introuvable (ID: " + id + "). Vérifiez le lien ou retournez au catalogue.");
          } else {
            setError("Erreur de connexion au serveur. Vérifiez que l'API est démarrée.");
          }
        }
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
    // Déjà inscrit et approuvé → accéder
    if (isUserEnrolled(cid) && isEnrollmentApproved(cid)) {
      navigate(`/courses/${course?.id || id}/learn`);
      return;
    }
    // Déjà inscrit mais en attente
    if (isUserEnrolled(cid)) {
      setNotif("⏳ Votre inscription est en attente de validation par l'admin.");
      return;
    }
    // Cours gratuit → inscription directe
    const isCourseFree = course?.is_free === 1 || Number(course?.price || 0) === 0;
    if (isCourseFree) {
      setEnrolling(true);
      try {
        await enrollInCourse(cid);
        setNotif("✅ Inscription confirmée ! Vous pouvez commencer le cours.");
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de l'inscription.");
      } finally { setEnrolling(false); }
      return;
    }
    // Cours payant → ouvrir le vrai modal paiement
    setShowRealPayment(true);
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
        <p className="text-gray-500 mb-5 text-sm leading-relaxed">
          {error || "Ce cours n'est pas accessible actuellement."}
        </p>
        {/* Si l'user est probablement inscrit, proposer d'aller directement au contenu */}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/courses/${id}/learn`)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
            ▶ Accéder directement au cours
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate("/student")}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              Mon espace
            </button>
            <button onClick={() => navigate("/courses")}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2"
              style={{ borderColor: "#2d287f", color: "#2d287f" }}>
              Catalogue
            </button>
            <button onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
              Réessayer
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Code cours: #{id} · Si le problème persiste, contactez le support.
        </p>
      </div>
    </div>
  );

  /* ══════════ RENDER PRINCIPAL ══════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} price={course.price} isFree={!!course.is_free} />
      )}

      {showRealPayment && course && (
        <RealPaymentModal
          course={course}
          onClose={() => setShowRealPayment(false)}
          onSuccess={() => {
            setShowRealPayment(false);
            setNotif("✅ Preuve soumise ! Accès activé après validation sous 24h.");
          }}
        />
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