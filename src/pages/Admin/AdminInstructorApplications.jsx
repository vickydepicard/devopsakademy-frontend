// src/pages/Admin/AdminInstructorApplications.jsx — DevOpsAkademy FINAL
// Interface complète : voir, approuver, rejeter, filtrer, stats
// Modal détail complet avec tous les champs
// Refus avec motif (min 3 chars)
// Gestion statuts : pending / under_review / accepted / rejected

import { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import {
  Award, Search, CheckCircle, XCircle, Clock, Eye,
  User, Briefcase, Globe, Linkedin, BookOpen, Mail,
  X, Loader, RefreshCw, AlertCircle, Filter, ChevronDown,
  Calendar, Star, Video, Timer, MessageSquare
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ApplicationDetailModal from "./ApplicationDetailModal";
import i18n from "../../i18n";
import { getLocale } from "../../i18n";

const C = { primary: "rgb(var(--c-primary))", light: "rgb(var(--c-primary-light))", accent: "rgb(var(--c-accent))" };

const STATUS = () => ({
  pending:      { label: i18n.t("adminInstructorApplications:en_attente"),  cls: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-500",   icon: Clock },
  under_review: { label: i18n.t("adminInstructorApplications:en_revision"), cls: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500",    icon: Eye },
  accepted:     { label: i18n.t("adminInstructorApplications:approuvee"),   cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  rejected:     { label: i18n.t("adminInstructorApplications:rejetee"),     cls: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-500",     icon: XCircle },
});

function Badge({ status }) {
  const cfg = STATUS()[status] || STATUS().pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function AdminInstructorApplications() {
  const { t } = useTranslation("adminInstructorApplications");
  const [apps,     setApps]     = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`/instructor-applications${params}`);
      setApps(res.data?.data || []);
      // Use API stats if available, otherwise calculate locally
      const apiStats = res.data?.stats || {};
      const localApps = res.data?.data || [];
      const localStats = {
        pending:      localApps.filter(a => a.status === 'pending').length,
        under_review: localApps.filter(a => a.status === 'under_review').length,
        accepted:     localApps.filter(a => a.status === 'accepted').length,
        rejected:     localApps.filter(a => a.status === 'rejected').length,
      };
      setStats(Object.keys(apiStats).length > 0 ? apiStats : localStats);
    } catch (e) {
      setError(e?.response?.data?.message || t("erreur_de_chargement"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    document.title = t("candidatures_instructeurs_admin_devopsakademy");
    load();
  }, [load]);

  const handleApprove = async (id) => {
    await api.patch(`/instructor-applications/${id}/approve`);
    load();
  };

  const handleReject = async (id, reason) => {
    await api.patch(`/instructor-applications/${id}/reject`, { rejection_reason: reason });
    load();
  };

  const handleReview = async (id) => {
    try {
      await api.patch(`/instructor-applications/${id}/review`);
      load();
    } catch {}
  };

  const filtered = apps.filter(a =>
    `${a.first_name} ${a.last_name} ${a.email} ${a.sample_course_topic || ""}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const FILTERS = [
    { key: "all",          label: t("toutes"),       count: Object.values(stats).reduce((acc, v) => acc + (Number(v) || 0), 0) },
    { key: "pending",      label: t("en_attente"),   count: stats.pending || 0 },
    { key: "under_review", label: t("en_revision"),  count: stats.under_review || 0 },
    { key: "accepted",     label: t("approuvees"),   count: stats.accepted || 0 },
    { key: "rejected",     label: t("rejetees"),     count: stats.rejected || 0 },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: C.light }} />{" "}{t("candidatures_instructeurs")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("examinez_et_validez_les_dossiers_des")}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4" />{" "}{t("actualiser")}</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label={t("en_attente")}  value={stats.pending || 0}      color="#f59e0b" />
        <StatBox label={t("en_revision")} value={stats.under_review || 0} color="#3b82f6" />
        <StatBox label={t("approuvees")}  value={stats.accepted || 0}     color="#10b981" />
        <StatBox label={t("rejetees")}    value={stats.rejected || 0}     color="#ef4444" />
      </div>

      {/* Barre filtres + recherche */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === key ? "text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
              style={filter === key ? { background: `linear-gradient(135deg,${C.primary},${C.light})` } : {}}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 min-w-48">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("nom_email_cours")} className="bg-transparent text-sm focus:outline-none text-gray-700 w-full placeholder-gray-400" />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: C.light }} />
            <p className="text-gray-400 text-sm">{t("chargement_des_candidatures")}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-500">{t("aucune_candidature")}{filter !== "all" ? t("dans_cette_categorie") : ""}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t("candidat")}</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("cours_propose")}</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("exp")}</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t("statut")}</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("date")}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                        {app.first_name?.[0]}{app.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{app.first_name} {app.last_name}</p>
                        <p className="text-gray-400 text-xs">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-700 font-medium max-w-48 truncate">{app.sample_course_topic || "—"}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{app.years_experience ? t("an_s", { years_experience: app.years_experience }) : "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={app.status} />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {app.next_interview_at && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${app.next_interview_status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(app.next_interview_at).toLocaleString(getLocale(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      {app.comment_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          <MessageSquare className="w-3 h-3" />{app.comment_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString(getLocale()) : "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Actions rapides */}
                      {(app.status === "pending" || app.status === "under_review") && (
                        <>
                          <button onClick={() => { setSelected(app); }}
                            title={t("voir_le_dossier")}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={async () => { await handleApprove(app.id); }}
                            title={t("approuver")}
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {(app.status === "accepted" || app.status === "rejected") && (
                        <button onClick={() => setSelected(app)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ApplicationDetailModal
          appId={selected.id}
          onChanged={load}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onReview={handleReview}
        />
      )}
    </div>
  );
}