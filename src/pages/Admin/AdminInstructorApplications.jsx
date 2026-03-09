import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Award, Search, CheckCircle, XCircle, Clock, Eye,
  User, Briefcase, Globe, Linkedin, BookOpen,
  ChevronDown, ChevronUp, X, Loader, RefreshCw
} from "lucide-react";

const STATUS_CFG = {
  pending:  { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  approved: { label: "Approuvée",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Rejetée",    color: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-500" },
};

const DetailModal = ({ app, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(app.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { alert("Veuillez indiquer un motif de refus."); return; }
    setProcessing(true);
    await onReject(app.id, rejectionReason);
    setProcessing(false);
  };

  const domains = typeof app.expertise_domains === "string"
    ? JSON.parse(app.expertise_domains || "[]")
    : (app.expertise_domains || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {app.first_name?.[0]}{app.last_name?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{app.first_name} {app.last_name}</p>
              <p className="text-sm text-gray-500">{app.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Statut */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_CFG[app.status]?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[app.status]?.dot}`} />
              {STATUS_CFG[app.status]?.label}
            </span>
            <span className="text-xs text-gray-400">
              Soumise le {new Date(app.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>

          {/* Motivation */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Motivation</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{app.motivation}</p>
          </div>

          {/* Domaines d'expertise */}
          {domains.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Domaines d'expertise</p>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <span key={d} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Infos clés */}
          <div className="grid sm:grid-cols-2 gap-4">
            {app.years_experience && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Expérience</p>
                <p className="font-semibold text-gray-800">{app.years_experience} an{app.years_experience > 1 ? "s" : ""}</p>
              </div>
            )}
            {app.proposed_course_title && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Cours proposé</p>
                <p className="font-semibold text-gray-800 text-sm">{app.proposed_course_title}</p>
              </div>
            )}
          </div>

          {/* Liens */}
          <div className="flex gap-3 flex-wrap">
            {app.linkedin_url && (
              <a href={app.linkedin_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {app.portfolio_url && (
              <a href={app.portfolio_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:underline font-medium">
                <Globe className="w-4 h-4" /> Portfolio
              </a>
            )}
          </div>

          {/* Description cours */}
          {app.course_description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description du cours proposé</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{app.course_description}</p>
            </div>
          )}

          {/* Zone de rejet */}
          {showReject && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">Motif du refus</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Expliquez pourquoi cette candidature est rejetée…"
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {app.status === "pending" && (
          <div className="flex gap-3 px-6 pb-6 justify-end">
            {!showReject ? (
              <>
                <button onClick={() => setShowReject(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                  <XCircle className="w-4 h-4" /> Rejeter
                </button>
                <button onClick={handleApprove} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:-translate-y-0.5 transition shadow-md disabled:opacity-60">
                  {processing ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approuver
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowReject(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button onClick={handleReject} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:-translate-y-0.5 transition shadow-md disabled:opacity-60">
                  {processing ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirmer le refus
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminInstructorApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = "Candidatures Instructeurs — Admin";
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/instructor-applications");
      setApps(res.data?.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/instructor-applications/${id}/approve`);
      await fetchApps();
      setSelected(null);
    } catch { alert("Erreur lors de l'approbation."); }
  };

  const handleReject = async (id, reason) => {
    try {
      await api.patch(`/admin/instructor-applications/${id}/reject`, { rejection_reason: reason });
      await fetchApps();
      setSelected(null);
    } catch { alert("Erreur lors du rejet."); }
  };

  const filtered = apps.filter((a) => {
    const name = `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (filter === "all" || a.status === filter);
  });

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {selected && (
        <DetailModal app={selected} onClose={() => setSelected(null)}
          onApprove={handleApprove} onReject={handleReject} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures Instructeurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Évaluez et validez les demandes de devenir instructeur</p>
        </div>
        <button onClick={fetchApps} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un candidat…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
        </div>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              filter === f ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f === "all" ? "Toutes" : f === "pending" ? "En attente" : f === "approved" ? "Approuvées" : "Rejetées"}
            <span className="ml-1.5 text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">
            {filter === "pending" ? "Aucune candidature en attente 🎉" : "Aucune candidature trouvée"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => {
              const cfg = STATUS_CFG[app.status] || STATUS_CFG.pending;
              const domains = typeof app.expertise_domains === "string"
                ? JSON.parse(app.expertise_domains || "[]")
                : (app.expertise_domains || []);
              return (
                <div key={app.id} className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition">
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {app.first_name?.[0]}{app.last_name?.[0]}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 text-sm">{app.first_name} {app.last_name}</p>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{app.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {domains.slice(0, 4).map((d) => (
                        <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{d}</span>
                      ))}
                      {domains.length > 4 && <span className="text-xs text-gray-400">+{domains.length - 4}</span>}
                    </div>
                  </div>

                  {/* Date + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-gray-400 hidden sm:block">
                      {new Date(app.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <button onClick={() => setSelected(app)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">
                      <Eye className="w-4 h-4" /> Voir
                    </button>
                    {app.status === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(app.id)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition" title="Approuver">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelected(app)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition" title="Rejeter">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}