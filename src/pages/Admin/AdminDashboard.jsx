import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import {
  Users, BookOpen, ClipboardList, TrendingUp,
  Award, CreditCard, Clock, CheckCircle,
  ArrowRight, ChevronRight, AlertCircle, BarChart2,
  UserCheck, DollarSign, Radio
} from "lucide-react";

const KPI = ({ label, value, sub, icon: Icon, color, bg, to }) => (
  <Link to={to || "#"} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 block">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
    <p className="text-sm text-gray-600 font-medium mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [pendingItems, setPendingItems] = useState({ enrollments: 0, applications: 0, subscriptions: 0, liveBootcamps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard Admin — DevOpsAkademy";
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, enrollRes, bootRes] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/enrollments?limit=5&status=pending"),
        api.get("/bootcamps/admin/all"),
      ]);
      if (statsRes.status === "fulfilled") {
        const d = statsRes.value.data?.data;
        setStats(d);
        setPendingItems(prev => ({
          ...prev,
          enrollments:  d?.pending_enrollments  ?? 0,
          applications: d?.pending_applications ?? 0,
          subscriptions: d?.pending_subscriptions ?? 0,
        }));
      }
      if (enrollRes.status === "fulfilled") {
        setRecentEnrollments(enrollRes.value.data?.data?.slice(0, 5) || []);
      }
      if (bootRes.status === "fulfilled") {
        const lives = (bootRes.value.data?.data || []).filter(b => b.status === "live").length;
        setPendingItems(prev => ({ ...prev, liveBootcamps: lives }));
      }
    } catch (err) {
      console.error("Erreur dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPending = pendingItems.enrollments + pendingItems.applications + pendingItems.subscriptions;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme DevOpsAkademy</p>
        </div>
        <Link to="/admin/stats"
          className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
          <BarChart2 className="w-4 h-4" /> Statistiques détaillées
        </Link>
      </div>

      {/* Alertes en attente */}
      {(totalPending > 0 || pendingItems.liveBootcamps > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 font-medium flex-1">
            <strong>{totalPending} action{totalPending > 1 ? "s" : ""}</strong> en attente de votre validation
          </p>
          <div className="flex gap-2 flex-wrap">
            {pendingItems.enrollments > 0 && (
              <Link to="/admin/enrollments" className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-amber-600 transition">
                {pendingItems.enrollments} inscription{pendingItems.enrollments > 1 ? "s" : ""}
              </Link>
            )}
            {pendingItems.applications > 0 && (
              <Link to="/admin/instructor-applications" className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-blue-600 transition">
                {pendingItems.applications} candidature{pendingItems.applications > 1 ? "s" : ""}
              </Link>
            )}
            {pendingItems.subscriptions > 0 && (
              <Link to="/admin/subscriptions" className="text-xs bg-violet-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-violet-600 transition">
                {pendingItems.subscriptions} abonnement{pendingItems.subscriptions > 1 ? "s" : ""}
              </Link>
            )}
            {pendingItems.liveBootcamps > 0 && (
              <Link to="/admin/bootcamps" className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-red-600 transition animate-pulse">
                🔴 {pendingItems.liveBootcamps} live en cours
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Utilisateurs" value={stats?.users ?? stats?.total_users} sub="Total inscrits"
          icon={Users} color="text-blue-600" bg="bg-blue-50" to="/admin/users" />
        <KPI label="Cours" value={stats?.courses ?? stats?.total_courses} sub={`${stats?.published_courses ?? 0} publiés`}
          icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" to="/admin/courses" />
        <KPI label="Inscriptions" value={stats?.enrollments ?? stats?.total_enrollments} sub={`${pendingItems.enrollments} en attente`}
          icon={ClipboardList} color="text-violet-600" bg="bg-violet-50" to="/admin/enrollments" />
        <KPI label="Completion moy." value={stats?.avgCompletion ? `${Math.round(stats.avgCompletion)}%` : "—"}
          icon={TrendingUp} color="text-orange-500" bg="bg-orange-50" to="/admin/stats" />
      </div>

      {/* KPIs secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Instructeurs" value={stats?.instructors ?? stats?.total_instructors}
          icon={UserCheck} color="text-teal-600" bg="bg-teal-50" to="/admin/users" />
        <KPI label="Certificats" value={stats?.certificates ?? stats?.total_certificates}
          icon={Award} color="text-yellow-600" bg="bg-yellow-50" to="/admin/certificates" />
        <KPI label="Abonnements actifs" value={stats?.active_subscriptions}
          icon={CreditCard} color="text-indigo-600" bg="bg-indigo-50" to="/admin/subscriptions" />
        <KPI label="Bootcamps & Lives" value={pendingItems.liveBootcamps > 0 ? `🔴 ${pendingItems.liveBootcamps} live` : stats?.bootcamps_count ?? "—"}
          icon={Radio} color="text-rose-500" bg="bg-rose-50" to="/admin/bootcamps" />
      </div>

      {/* Tableaux rapides */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Inscriptions récentes */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-gray-900 text-sm">Inscriptions récentes</h3>
            </div>
            <Link to="/admin/enrollments" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              Tout voir <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentEnrollments.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">Aucune inscription récente</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentEnrollments.map((enr) => (
                <div key={enr.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/50 transition">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {enr.first_name?.[0]}{enr.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{enr.first_name} {enr.last_name}</p>
                    <p className="text-xs text-gray-400 truncate">{enr.course_title || enr.title}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    enr.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {enr.is_approved ? "Actif" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Actions rapides</h3>
          <div className="space-y-2">
            {[
              { to: "/admin/enrollments?filter=pending",    label: "Valider les paiements en attente",       color: "text-amber-600",  bg: "hover:bg-amber-50",  count: pendingItems.enrollments },
              { to: "/admin/instructor-applications",       label: "Traiter les candidatures instructeurs",  color: "text-blue-600",   bg: "hover:bg-blue-50",   count: pendingItems.applications },
              { to: "/admin/subscriptions?filter=pending",  label: "Valider les abonnements",                color: "text-violet-600", bg: "hover:bg-violet-50", count: pendingItems.subscriptions },
              { to: "/admin/bootcamps",                     label: "🎙️ Gérer les bootcamps & lives",         color: "text-indigo-600", bg: "hover:bg-indigo-50", count: pendingItems.liveBootcamps },
              { to: "/admin/courses",                       label: "Gérer le catalogue de cours",            color: "text-emerald-600",bg: "hover:bg-emerald-50" },
              { to: "/admin/certificates",                  label: "Émettre des certificats",                color: "text-yellow-600", bg: "hover:bg-yellow-50" },
              { to: "/admin/settings",                      label: "Paramètres de la plateforme",            color: "text-gray-600",   bg: "hover:bg-gray-50" },
            ].map(({ to, label, color, bg, count }) => (
              <Link key={to} to={to}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border border-transparent ${bg} transition group`}>
                <span className={`text-sm font-medium ${color}`}>{label}</span>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{count}</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}