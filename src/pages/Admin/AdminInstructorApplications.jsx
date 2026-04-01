// src/pages/Admin/AdminInstructorApplications.jsx — DevOpsAkademy FINAL
// ✅ Interface complète : voir, approuver, rejeter, filtrer, stats
// ✅ Modal détail complet avec tous les champs
// ✅ Refus avec motif (min 3 chars)
// ✅ Gestion statuts : pending / under_review / accepted / rejected

import { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import {
  Award, Search, CheckCircle, XCircle, Clock, Eye,
  User, Briefcase, Globe, Linkedin, BookOpen, Mail,
  X, Loader, RefreshCw, AlertCircle, Filter, ChevronDown,
  Calendar, Star, Video, Timer
} from "lucide-react";

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" };

const STATUS = {
  pending:      { label: "En attente",  cls: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-500",   icon: Clock },
  under_review: { label: "En révision", cls: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500",    icon: Eye },
  accepted:     { label: "Approuvée",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  rejected:     { label: "Rejetée",     cls: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-500",     icon: XCircle },
};

function Badge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
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

// ── Modal détail candidature ──────────────────────────────────
function DetailModal({ app, onClose, onApprove, onReject, onReview }) {
  const [reason, setReason]       = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [err, setErr]             = useState("");

  const handleApprove = async () => {
    setProcessing(true); setErr("");
    try { await onApprove(app.id); onClose(); }
    catch (e) { setErr(e?.response?.data?.message || "Erreur lors de l'approbation"); }
    finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 3) { setErr("Motif requis (min 3 caractères)"); return; }
    setProcessing(true); setErr("");
    try { await onReject(app.id, reason.trim()); onClose(); }
    catch (e) { setErr(e?.response?.data?.message || "Erreur lors du rejet"); }
    finally { setProcessing(false); }
  };

  const handleReview = async () => {
    setProcessing(true);
    try { await onReview(app.id); }
    catch {}
    finally { setProcessing(false); }
  };

  const domains = (() => {
    try {
      const d = app.expertise_areas;
      if (Array.isArray(d)) return d;
      if (typeof d === "string") return JSON.parse(d);
      return [];
    } catch { return []; }
  })();

  const isPending  = app.status === "pending" || app.status === "under_review";
  const isAccepted = app.status === "accepted";
  const isRejected = app.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm">
              {app.first_name?.[0]}{app.last_name?.[0]}
            </div>
            <div>
              <p className="font-black text-white">{app.first_name} {app.last_name}</p>
              <p className="text-white/70 text-xs">{app.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={app.status} />
            <button onClick={onClose} className="text-white/70 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {err && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{err}</p>
            </div>
          )}

          {/* Infos rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Briefcase, label: "Expérience",    value: app.years_experience ? `${app.years_experience} an(s)` : "—" },
              { icon: Timer,     label: "Heures/sem",    value: app.weekly_hours     ? `${app.weekly_hours}h`            : "—" },
              { icon: Calendar,  label: "Soumis le",     value: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("fr-FR") : "—" },
              { icon: BookOpen,  label: "Cours proposé", value: app.sample_course_topic || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* Domaines */}
          {domains.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Domaines d'expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {domains.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: "#f0f0ff", color: C.light, borderColor: "#e0e7ff" }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Motivation</p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{app.motivation || "—"}</p>
            </div>
          </div>

          {/* Expérience */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Parcours professionnel</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{app.experience || "—"}</p>
            </div>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-3">
            {app.linkedin_url && (
              <a href={app.linkedin_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50 transition"
                style={{ borderColor: "#e5e7eb", color: C.light }}>
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {app.cv_url && (
              <a href={app.cv_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50 transition"
                style={{ borderColor: "#e5e7eb", color: C.light }}>
                <Globe className="w-4 h-4" /> Portfolio
              </a>
            )}
            {app.video_url && (
              <a href={app.video_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50 transition col-span-2"
                style={{ borderColor: "#e5e7eb", color: C.light }}>
                <Video className="w-4 h-4" /> Vidéo de présentation
              </a>
            )}
          </div>

          {/* Note de révision si rejeté */}
          {isRejected && app.review_note && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-700 mb-1">Motif du refus :</p>
              <p className="text-sm text-red-600">{app.review_note}</p>
            </div>
          )}

          {/* Zone rejet */}
          {isPending && showReject && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-red-700">Motif du refus <span className="text-red-500">*</span></p>
              <textarea
                value={reason} onChange={e => { setReason(e.target.value); setErr(""); }}
                rows={3} placeholder="Expliquez pourquoi cette candidature est refusée..."
                className="w-full px-3 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 bg-white resize-none"
              />
              <p className="text-xs text-gray-400">{reason.length} car. (min 3)</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {isPending && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50">

            {app.status === "pending" && (
              <button onClick={handleReview} disabled={processing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition hover:bg-blue-50 disabled:opacity-60"
                style={{ borderColor: "#bfdbfe", color: "#2563eb" }}>
                <Eye className="w-4 h-4" /> Mettre en révision
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              {!showReject ? (
                <button onClick={() => setShowReject(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-red-50"
                  style={{ borderColor: "#fecaca", color: "#dc2626" }}>
                  <XCircle className="w-4 h-4" /> Refuser
                </button>
              ) : (
                <>
                  <button onClick={() => { setShowReject(false); setReason(""); setErr(""); }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
                    Annuler
                  </button>
                  <button onClick={handleReject} disabled={processing || reason.trim().length < 3}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#dc2626" }}>
                    {processing ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Confirmer le refus
                  </button>
                </>
              )}

              {!showReject && (
                <button onClick={handleApprove} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg,#059669,#10b981)` }}>
                  {processing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approuver
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function AdminInstructorApplications() {
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
      setStats(res.data?.stats || {});
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    document.title = "Candidatures instructeurs — Admin DevOpsAkademy";
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
    { key: "all",          label: "Toutes",       count: Object.values(stats).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) },
    { key: "pending",      label: "En attente",   count: stats.pending || 0 },
    { key: "under_review", label: "En révision",  count: stats.under_review || 0 },
    { key: "accepted",     label: "Approuvées",   count: stats.accepted || 0 },
    { key: "rejected",     label: "Rejetées",     count: stats.rejected || 0 },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: C.light }} /> Candidatures instructeurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Examinez et validez les dossiers des futurs instructeurs</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="En attente"  value={stats.pending || 0}      color="#f59e0b" />
        <StatBox label="En révision" value={stats.under_review || 0} color="#3b82f6" />
        <StatBox label="Approuvées"  value={stats.accepted || 0}     color="#10b981" />
        <StatBox label="Rejetées"    value={stats.rejected || 0}     color="#ef4444" />
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
            placeholder="Nom, email, cours..." className="bg-transparent text-sm focus:outline-none text-gray-700 w-full placeholder-gray-400" />
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
            <p className="text-gray-400 text-sm">Chargement des candidatures...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-500">Aucune candidature{filter !== "all" ? " dans cette catégorie" : ""}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Candidat</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Cours proposé</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Exp.</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
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
                    <span className="text-sm text-gray-600">{app.years_experience ? `${app.years_experience} an(s)` : "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={app.status} />
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Actions rapides */}
                      {(app.status === "pending" || app.status === "under_review") && (
                        <>
                          <button onClick={() => { setSelected(app); }}
                            title="Voir le dossier"
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={async () => { await handleApprove(app.id); }}
                            title="Approuver"
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
        <DetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onReview={handleReview}
        />
      )}
    </div>
  );
}