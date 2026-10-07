// src/pages/Instructors/InstructorDashboard.jsx — DevOpsAkademy FINAL
// Stats réelles depuis /api/instructor/stats
// Cours filtrés de l'instructeur uniquement
// Panneau invitations co-instructeur
// Actions rapides

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen, Users, Star, Plus, ArrowRight,
  CheckCircle, BarChart2, FileText, ChevronRight,
  Clock, XCircle, Award, Bell, TrendingUp, DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { formatMoney, formatNumber } from "../../utils/format";

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" };

const StatCard = ({ label, value, icon: Icon, color, bg, sub }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <p className="text-xl sm:text-2xl font-black text-gray-900 break-words">{value ?? "—"}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Carte invitation co-instructeur ──────────────────────────
function InvitationCard({ inv, onRespond }) {
  const { t } = useTranslation("instructorDashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const respond = async (action) => {
    setLoading(true);
    try {
      await api.patch(`/instructor/invitations/${inv.id}/respond`, { action });
      onRespond();
    } catch (e) {
      setError(e?.response?.data?.message || t("erreur"));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{inv.title}</p>
        <p className="text-xs text-gray-500">{t("par_commission", { owner_first: inv.owner_first, owner_last: inv.owner_last })}{" "}<strong>{inv.commission_rate}%</strong>
        </p>
      </div>
      {error && <p className="text-xs text-red-600 basis-full" role="alert">{error}</p>}
      <div className="flex gap-2 shrink-0">
        <button onClick={() => respond("reject")} disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition disabled:opacity-50">{t("refuser")}</button>
        <button onClick={() => respond("accept")} disabled={loading}
          className="px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>{t("accepter")}</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function InstructorDashboard() {
  const { t } = useTranslation("instructorDashboard");
  const { user } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    document.title = t("dashboard_instructeur_devopsakademy");
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [coursesRes, statsRes, invRes] = await Promise.allSettled([
        api.get("/instructor/courses"),
        api.get("/instructor/stats"),
        api.get("/instructor/invitations"),
      ]);

      if (coursesRes.status === "fulfilled") {
        setCourses((coursesRes.value.data?.data || []).slice(0, 5));
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data?.data);
      } else if (coursesRes.status === "fulfilled") {
        // Fallback calculé depuis les cours
        const data = coursesRes.value.data?.data || [];
        setStats({
          total_courses:    data.length,
          published_courses: data.filter(c => c.is_published).length,
          total_students:   data.reduce((a, c) => a + (Number(c.student_count) || 0), 0),
          avg_rating:       0,
          total_earnings:   0,
        });
      }

      if (invRes.status === "fulfilled") {
        setInvitations((invRes.value.data?.data || []).filter(i => i.status === "pending"));
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{t("bonjour", { first_name: user?.first_name })}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t("voici_un_apercu_de_votre_activite")}</p>
        </div>
        <Link to="/instructor/courses/new"
          className="inline-flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl text-white text-sm hover:opacity-90 transition shadow-md"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <Plus className="w-4 h-4" />{" "}{t("nouveau_cours")}</Link>
      </div>

      {/* Invitations co-instructeur en attente */}
      {invitations.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-amber-500" />
            <h2 className="font-black text-gray-900 text-sm">{i18n.t("instructorDashboard:invitation", { length: invitations.length, s: invitations.length > 1 ? "s" : "" })}{" "}{t("co_instructeur_en_attente")}</h2>
          </div>
          <div className="space-y-3">
            {invitations.map(inv => (
              <InvitationCard key={inv.id} inv={inv} onRespond={fetchAll} />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label={t("cours_crees")}
          value={stats?.total_courses ?? courses.length}
          icon={BookOpen} color="text-indigo-600" bg="bg-indigo-50"
        />
        <StatCard
          label={t("cours_publies")}
          value={stats?.published_courses ?? 0}
          icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50"
        />
        <StatCard
          label={t("etudiants_inscrits")}
          value={formatNumber(stats?.total_students ?? 0)}
          icon={Users} color="text-blue-600" bg="bg-blue-50"
        />
        <StatCard
          label={t("note_moyenne")}
          value={stats?.avg_rating ? `${Number(stats.avg_rating).toFixed(1)}/5` : "—"}
          icon={Star} color="text-amber-500" bg="bg-amber-50"
        />
        <Link to="/instructor/earnings" className="block">
          <StatCard
            label={t("gains")}
            value={formatMoney(stats?.total_earnings ?? 0)}
            sub={stats?.pending_earnings > 0 ? t("a_verser", { amount: formatMoney(stats.pending_earnings) }) : undefined}
            icon={DollarSign} color="text-violet-600" bg="bg-violet-50"
          />
        </Link>
      </div>

      {/* Mes cours récents */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: C.light }} />
            <h2 className="font-black text-gray-900">{t("mes_cours_recents")}</h2>
          </div>
          <Link to="/instructor/courses"
            className="text-sm font-bold hover:underline flex items-center gap-1"
            style={{ color: C.light }}>{t("voir_tout")}{" "}<ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 mb-2">{t("aucun_cours_cree")}</h3>
            <p className="text-gray-400 text-sm mb-6">{t("commencez_par_creer_votre_premier_cours")}</p>
            <Link to="/instructor/courses/new"
              className="inline-flex items-center gap-2 font-bold py-2.5 px-6 rounded-xl text-white text-sm hover:opacity-90 transition"
              style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
              <Plus className="w-4 h-4" />{" "}{t("creer_un_cours")}</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {courses.map(course => (
              <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-contain" onError={e => e.target.style.display="none"} />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-white/50" /></div>
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {Number(course.student_count) || 0}{" "}{t("etudiant_p", { s: (Number(course.student_count) || 0) > 1 ? "s" : "" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${course.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {course.is_published ? t("publie") : t("brouillon")}
                    </span>
                    {course.rating > 0 && (
                      <span className="text-xs text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(course.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link to={`/instructor/courses/${course.id}/edit`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title={t("modifier")}>
                    <FileText className="w-4 h-4" />
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/students`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t("etudiants")}>
                    <Users className="w-4 h-4" />
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/analytics`}
                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition" title={t("analytics")}>
                    <BarChart2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/instructor/courses/new", icon: Plus,      label: t("creer_un_cours"),    desc: t("publiez_une_nouvelle_formation") },
          { to: "/instructor/submissions", icon: FileText,  label: t("corriger_devoirs"),  desc: t("devoirs_en_attente_de_correction") },
          { to: "/instructor/analytics",   icon: BarChart2, label: t("voir_les_analytics"), desc: t("performances_et_statistiques")},
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition flex items-start gap-4">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            <span>
              <span className="block font-semibold text-gray-900 text-sm">{label}</span>
              <span className="block text-gray-500 text-xs mt-0.5">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}