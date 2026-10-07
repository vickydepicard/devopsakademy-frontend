// Gains de l'instructeur : totaux, répartition par cours, historique des commissions.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/api";
import { formatMoney, formatDate } from "../../utils/format";

const FILTERS = ["all", "pending", "earned", "paid"];
const BADGE = { pending: "bg-gray-100 text-gray-600", earned: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700" };

export default function InstructorEarnings() {
  const { t } = useTranslation("instructorEarnings");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const limit = 20;

  useEffect(() => { document.title = t("document_title"); }, [t]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/instructor/earnings", { params: { page, limit, status: status === "all" ? undefined : status } });
      setData(res.data); setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [page, status]);
  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>;
  if (error && !data) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-sm text-gray-600">{t("erreur")}</p>
        <button onClick={load} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">{t("reessayer")}</button>
      </div>
    );
  }

  const cur = data?.totals?.currency || "XAF";
  const rows = data?.data || [];
  const total = data?.pagination?.total || 0;
  const pages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="max-w-5xl space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold leading-tight text-gray-900">{t("titre")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("sous_titre")}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[["total", data.totals.total], ["verse", data.totals.paid], ["a_verser", data.totals.pending]].map(([k, v]) => (
          <div key={k} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">{t(k)}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{formatMoney(v, cur)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">{t("note_versements")}</p>

      {data.by_course.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl">
          <h2 className="px-5 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">{t("par_cours")}</h2>
          <ul className="divide-y divide-gray-100">
            {data.by_course.map((c) => (
              <li key={c.course_id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-gray-900">{c.course_title}</span>
                <span className="shrink-0 text-gray-500">{t("ventes", { count: Number(c.sales) })} · <span className="font-medium text-gray-900">{formatMoney(c.amount, cur)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{t("historique")}</h2>
          <div className="flex gap-1" role="tablist">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={status === f} onClick={() => { setStatus(f); setPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${status === f ? "bg-primary text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                {t(`filtre_${f === "all" ? "tous" : f}`)}
              </button>
            ))}
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">{t("aucune")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>{["col_date", "col_cours", "col_vente", "col_taux", "col_commission", "col_statut"].map((k) => <th key={k} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{t(k)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.earned_at || r.created_at)}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate">{r.course_title}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatMoney(r.sale_amount, cur)}</td>
                    <td className="px-4 py-3">{Number(r.commission_rate)} %</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{formatMoney(r.commission_amount, cur)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[r.status] || BADGE.pending}`}>{t(`statut_${r.status}`, { defaultValue: r.status })}</span>
                      {r.paid_at && <p className="text-xs text-gray-400 mt-1">{t("paye_le", { date: formatDate(r.paid_at) })}{r.payout_reference ? ` · ${t("reference", { ref: r.payout_reference })}` : ""}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > limit && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{t("page_x_sur_y", { page, pages })}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label={t("precedent")} className="p-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label={t("suivant")} className="p-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
