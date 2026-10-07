import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";
import {
  CreditCard, Search, CheckCircle, XCircle, Clock,
  Eye, Download, RefreshCw, Filter, X, ExternalLink,
  DollarSign, Users, TrendingUp, Calendar
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { getLocale } from "../../i18n";

const STATUS_CFG = () => ({
  active:    { label: i18n.t("adminSubscriptions:actif"),       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  pending:   { label: i18n.t("adminSubscriptions:en_attente"),  color: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-500" },
  cancelled: { label: i18n.t("adminSubscriptions:annule"),      color: "bg-gray-100 text-gray-500",       dot: "bg-gray-400" },
  expired:   { label: i18n.t("adminSubscriptions:expire"),      color: "bg-red-100 text-red-600",         dot: "bg-red-400" },
});

const PLAN_COLORS = {
  free:  "bg-gray-100 text-gray-600",
  pro:   "bg-blue-100 text-blue-700",
  elite: "bg-amber-100 text-amber-700",
};

const fmt = (n) => n != null ? new Intl.NumberFormat(getLocale()).format(n) + " FCFA" : "—";

const DetailModal = ({ sub, onClose, onValidate, onReject }) => {
  const { t } = useTranslation("adminSubscriptions");
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg my-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{t("detail_de_l_abonnement")}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
              {sub.first_name?.[0]}{sub.last_name?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{sub.first_name} {sub.last_name}</p>
              <p className="text-sm text-gray-400">{sub.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("plan"), value: sub.plan_name || sub.plan_slug },
              { label: t("facturation"), value: sub.billing_period === "yearly" ? i18n.t("adminSubscriptions:annuelle") : i18n.t("adminSubscriptions:mensuelle") },
              { label: t("montant"), value: fmt(sub.amount) },
              { label: t("debut"), value: sub.start_date ? new Date(sub.start_date).toLocaleDateString(getLocale()) : "—" },
              { label: t("fin"), value: sub.end_date ? new Date(sub.end_date).toLocaleDateString(getLocale()) : "—" },
              { label: t("soumis_le"), value: new Date(sub.created_at).toLocaleDateString(getLocale()) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800 text-sm capitalize">{value}</p>
              </div>
            ))}
          </div>
          {sub.payment_proof_url && (
            <a href={sub.payment_proof_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium bg-blue-50 rounded-xl p-3">
              <ExternalLink className="w-4 h-4" />{" "}{t("voir_la_preuve_de_paiement")}</a>
          )}
          {showReject && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-red-700">{t("motif_du_rejet")}</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2}
                placeholder={t("raison_du_rejet")}
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none resize-none bg-white" />
            </div>
          )}
        </div>
        {sub.status === "pending" && (
          <div className="flex gap-3 px-6 pb-6 justify-end">
            {!showReject ? (
              <>
                <button onClick={() => setShowReject(true)} className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                  <XCircle className="w-4 h-4" />{" "}{t("rejeter")}</button>
                <button onClick={async () => { setProcessing(true); await onValidate(sub.id); setProcessing(false); }} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:-translate-y-0.5 transition shadow-md disabled:opacity-60">
                  {processing ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}{t("valider")}</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowReject(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
                <button onClick={async () => { setProcessing(true); await onReject(sub.id, rejectReason); setProcessing(false); }} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:-translate-y-0.5 transition disabled:opacity-60">
                  <XCircle className="w-4 h-4" />{" "}{t("confirmer")}</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminSubscriptions() {
  const { t } = useTranslation("adminSubscriptions");
  const [searchParams] = useSearchParams();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = t("abonnements_admin");
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/subscriptions");
      setSubs(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleValidate = async (id) => {
    try {
      await api.patch(`/admin/subscriptions/${id}/activate`);
      await fetchSubs(); setSelected(null);
    } catch { alert(t("erreur")); }
  };

  const handleReject = async (id, reason) => {
    try {
      await api.patch(`/admin/subscriptions/${id}/reject`, { reason });
      await fetchSubs(); setSelected(null);
    } catch { alert(t("erreur")); }
  };

  const filtered = subs.filter((s) => {
    const name = `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (filter === "all" || s.status === filter);
  });

  const stats = {
    total: subs.length,
    active: subs.filter(s => s.status === "active").length,
    pending: subs.filter(s => s.status === "pending").length,
    revenue: subs.filter(s => s.status === "active").reduce((a, s) => a + (s.amount || 0), 0),
  };

  const exportCSV = () => {
    const rows = [[i18n.t("adminSubscriptions:nom"), i18n.t("adminSubscriptions:email"), i18n.t("adminSubscriptions:plan"), i18n.t("adminSubscriptions:facturation"), i18n.t("adminSubscriptions:montant"), i18n.t("adminSubscriptions:statut"), i18n.t("adminSubscriptions:debut"), i18n.t("adminSubscriptions:fin")]];
    subs.forEach(s => rows.push([
      `${s.first_name} ${s.last_name}`, s.email, s.plan_slug,
      s.billing_period, s.amount,
      s.status,
      s.start_date ? new Date(s.start_date).toLocaleDateString(getLocale()) : "",
      s.end_date ? new Date(s.end_date).toLocaleDateString(getLocale()) : "",
    ]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "abonnements.csv"; a.click();
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}</div>
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {selected && <DetailModal sub={selected} onClose={() => setSelected(null)} onValidate={handleValidate} onReject={handleReject} />}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("abonnements")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("gerez_les_abonnements_et_validez_les")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSubs} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("total"), value: stats.total, color: "text-gray-800", bg: "bg-gray-100" },
          { label: t("actifs"), value: stats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: t("en_attente"), value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: t("revenus_actifs"), value: fmt(stats.revenue), color: "text-blue-700", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl px-5 py-4`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("rechercher")}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
        </div>
        {["all", "pending", "active", "cancelled", "expired"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f === "all" ? t("tous") : STATUS_CFG()[f]?.label || f}
            <span className="ml-1 text-xs opacity-60">({subs.filter(s => f === "all" || s.status === f).length})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">{t("aucun_abonnement_trouve")}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[i18n.t("adminSubscriptions:utilisateur"), i18n.t("adminSubscriptions:plan"), i18n.t("adminSubscriptions:facturation"), i18n.t("adminSubscriptions:montant"), i18n.t("adminSubscriptions:statut"), i18n.t("adminSubscriptions:dates"), ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => {
                  const cfg = STATUS_CFG()[sub.status] || STATUS_CFG().pending;
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {sub.first_name?.[0]}{sub.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{sub.first_name} {sub.last_name}</p>
                            <p className="text-xs text-gray-400">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${PLAN_COLORS[sub.plan_slug] || "bg-gray-100 text-gray-600"}`}>
                          {sub.plan_name || sub.plan_slug}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{sub.billing_period === "yearly" ? t("annuelle") : t("mensuelle")}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{fmt(sub.amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {sub.start_date && <p>{new Date(sub.start_date).toLocaleDateString(getLocale())}</p>}
                        {sub.end_date && <p>→ {new Date(sub.end_date).toLocaleDateString(getLocale())}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 items-center">
                          <button onClick={() => setSelected(sub)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                          {sub.status === "pending" && (
                            <>
                              <button onClick={() => handleValidate(sub.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title={t("valider")}>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => setSelected(sub)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title={t("rejeter")}>
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}