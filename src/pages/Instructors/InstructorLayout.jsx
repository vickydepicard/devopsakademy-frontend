// src/pages/Instructors/InstructorLayout.jsx — DevOpsAkademy
// Vérifie le statut de candidature au chargement
// Affiche "En attente de validation" si candidature pending
// Donne accès complet seulement si candidature acceptée

import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Plus, BarChart2, Wallet,
  FileText, LogOut, User, GraduationCap, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight,
  ChevronLeft, Menu, X, Bell, Radio
} from "lucide-react";
import api from "../../api/api";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const C = { primary: "#2d287f", dark: "#1e1b4b", light: "#5653e1", accent: "#facc15" }

const navItems = () => ([
  { to: "/instructor",              label: i18n.t("instructorLayout:dashboard"),    icon: LayoutDashboard, exact: true },
  { to: "/instructor/courses",      label: i18n.t("instructorLayout:mes_cours"),    icon: BookOpen },
  { to: "/instructor/courses/new",  label: i18n.t("instructorLayout:creer_un_cours"), icon: Plus },
  { to: "/instructor/submissions",  label: i18n.t("instructorLayout:devoirs"),      icon: FileText },
  { to: "/instructor/bootcamps",  label: i18n.t("instructorLayout:mes_lives"),    icon: Radio },
  { to: "/instructor/analytics",    label: i18n.t("instructorLayout:analytics"),    icon: BarChart2 },
  { to: "/instructor/earnings",     label: i18n.t("instructorLayout:gains"),        icon: Wallet },
]);

// ── Page de statut "En attente" ─────────────────────────────
function PendingApplicationScreen({ status, reviewNote }) {
  const { t } = useTranslation("instructorLayout");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg,${C.primary},${C.light},${C.accent})` }} />
        <div className="p-8 text-center">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: C.accent }}>
              <span className="text-indigo-900 font-black text-sm">DA</span>
            </div>
            <span className="font-black text-gray-900">DevOps Akademy</span>
          </div>

          {/* Icône statut */}
          {status === "pending" || status === "under_review" ? (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#fef3c7", border: "3px solid #f59e0b" }}>
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "#fef3c7", color: "#92400e" }}>
                <Clock className="w-3.5 h-3.5" />
                {status === "under_review" ? t("en_cours_d_examen") : t("en_attente_de_validation")}
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">{t("candidature_recue")}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{t("votre_dossier_est_entre_les_mains")}{" "}<strong>{t("3_a_5_jours_ouvres")}</strong>.
              </p>
              <div className="rounded-xl p-4 text-left space-y-2 mb-5"
                style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <p className="text-xs font-bold text-blue-700">{t("etapes_suivantes")}</p>
                {[
                  { done: true,  text: t("compte_cree") },
                  { done: true,  text: t("candidature_soumise") },
                  { done: false, text: t("examen_du_dossier_par_l_equipe") },
                  { done: false, text: t("validation_et_acces_a_l_espace") },
                ].map(({ done, text }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500" : "bg-gray-200"}`}>
                      {done ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-gray-400">{i + 1}</span>}
                    </div>
                    <p className={`text-xs ${done ? "text-emerald-700 font-semibold" : "text-gray-500"}`}>{text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#fef2f2", border: "3px solid #ef4444" }}>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "#fee2e2", color: "#991b1b" }}>
                <XCircle className="w-3.5 h-3.5" />{" "}{t("candidature_refusee")}</div>
              <h2 className="text-xl font-black text-gray-900 mb-2">{t("candidature_non_retenue")}</h2>
              {reviewNote && (
                <div className="rounded-xl p-3 text-left mb-4" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <p className="text-xs font-bold text-red-700 mb-1">{t("motif_communique")}</p>
                  <p className="text-xs text-red-600 leading-relaxed">{reviewNote}</p>
                </div>
              )}
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{t("vous_pouvez_soumettre_une_nouvelle_candidature")}{" "}<strong>{t("3_mois")}</strong>{" "}{t("avec_un_dossier_renforce")}</p>
              <Link to="/become-instructor"
                className="block w-full py-3 rounded-xl text-sm font-black text-white text-center mb-2 hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>{t("soumettre_une_nouvelle_candidature")}</Link>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Link to="/"
              className="flex-1 py-2.5 rounded-xl border-2 text-xs font-bold text-center transition hover:bg-gray-50"
              style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>{t("accueil")}</Link>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition hover:bg-red-50"
              style={{ borderColor: "#fecaca", color: "#ef4444" }}>{t("se_deconnecter")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page "Pas de candidature" ───────────────────────────────
function NoApplicationScreen() {
  const { t } = useTranslation("instructorLayout");
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg,${C.primary},${C.light},${C.accent})` }} />
        <div className="p-7 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#f5f3ff", border: "2px solid #ddd6fe" }}>
            <AlertCircle className="w-8 h-8" style={{ color: C.light }} />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">{t("candidature_requise")}</h2>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">{t("pour_acceder_a_l_espace_instructeur")}</p>
          <Link to="/become-instructor"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition mb-3"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>{t("soumettre_ma_candidature")}{" "}<ChevronRight className="w-4 h-4" />
          </Link>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition">{t("se_deconnecter")}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LAYOUT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function InstructorLayout() {
  const { t } = useTranslation("instructorLayout");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [appStatus, setAppStatus]       = useState(null); // null=loading, "accepted", "pending", etc.
  const [appNote, setAppNote]           = useState("");
  const [checkDone, setCheckDone]       = useState(false);

  // ── Vérification du statut de candidature ─────────────────
  // Les administrateurs accèdent directement ; les autres doivent avoir une candidature acceptée.
  const isStaff = user?.role === "admin" || user?.role === "superadmin";
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (isStaff) { setAppStatus("accepted"); setCheckDone(true); return; }
    let cancelled = false;
    setCheckDone(false); setLoadError(false);
    (async () => {
      try {
        const res = await api.get("/instructor-applications/my");
        if (cancelled) return;
        const app = res.data?.data;
        setAppStatus(app ? app.status : "none");
        setAppNote(app?.review_note || "");
      } catch {
        // Accès refusé par défaut : on n'ouvre jamais l'espace si la vérification échoue.
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setCheckDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, isStaff, attempt]);

  // ── Loading ────────────────────────────────────────────────
  if (!checkDone) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#1e1b4b,#2d287f)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-sm font-medium">{t("verification_de_votre_acces")}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">{t("verification_impossible")}</h2>
          <p className="text-sm text-gray-500 mb-5">{t("verification_impossible_texte")}</p>
          <button onClick={() => setAttempt((n) => n + 1)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: C.primary }}>{t("reessayer")}</button>
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full py-2.5 mt-1 text-xs text-gray-400 hover:text-gray-600">{t("se_deconnecter")}</button>
        </div>
      </div>
    );
  }

  // ── Pas de candidature ─────────────────────────────────────
  if (appStatus === "none") return <NoApplicationScreen />;

  // ── Candidature en attente ou refusée ─────────────────────
  if (appStatus === "pending" || appStatus === "under_review" || appStatus === "rejected") {
    return <PendingApplicationScreen status={appStatus} reviewNote={appNote} />;
  }

  // ── Candidature acceptée → layout complet ─────────────────
  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to) && item.to !== "/instructor";
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: C.accent }}>
          <GraduationCap className="w-5 h-5" style={{ color: C.primary }} />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">{t("espace")}</p>
            <p className="font-bold text-sm" style={{ color: C.accent }}>{t("instructeur")}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems().map(({ to, label, icon: Icon, exact }) => {
          const active = isActive({ to, exact });
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                active ? "font-semibold shadow-md" : "text-white/70 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              style={active ? { background: C.accent, color: C.primary } : {}}
              title={collapsed ? label : ""}>
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profil bas */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition ${collapsed ? "justify-center" : ""}`}>
          <User className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">{t("mon_profil")}</span>}
        </Link>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition ${collapsed ? "justify-center" : ""}`}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">{t("deconnexion")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex flex-col relative transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-64"}`}
        style={{ background: `linear-gradient(180deg,${C.dark},${C.primary})` }}>
        <SidebarContent />
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 z-10"
          style={{ zIndex: 10 }}>
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-gray-600" /> : <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />}
        </button>
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col"
            style={{ background: `linear-gradient(180deg,${C.dark},${C.primary})` }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition">
              <Bell className="w-4.5 h-4.5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400">{isStaff ? t("administrateur") : t("role_instructeur")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu page */}
        <main className="flex-1 overflow-y-auto p-6 text-left">
          <Outlet />
        </main>
      </div>
    </div>
  );
}