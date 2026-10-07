// File de validation des cours : relecture, publication, renvoi à l'auteur, équipe pédagogique.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Loader, BookOpen, Users, CheckCircle2, Undo2, Ban } from "lucide-react";
import api from "../../api/api";
import useFeedback, { apiError } from "../../components/Common/useFeedback";
import { formatMoney, formatDate, formatNumber } from "../../utils/format";
import CourseTeamModal from "./CourseTeamModal";

const TABS = ["submitted", "approved", "rejected", "draft", "all"];
const BADGE = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};
const field = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary/30";
const btn = "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60";

export default function AdminCourseReviews() {
  const { t } = useTranslation("adminCourseReviews");
  const { ui, notify, confirm } = useFeedback();
  const [tab, setTab] = useState("submitted");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [defaultRate, setDefaultRate] = useState(70);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [approve, setApprove] = useState(null); // { rate, price, original }
  const [reject, setReject] = useState(null);   // string
  const [teamOpen, setTeamOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `${t("titre")} — DevOpsAkademy`; }, [t]);

  const load = useCallback(async () => {
    try {
      const r = await api.get("/admin/course-reviews", { params: { status: tab, search: q || undefined } });
      setRows(r.data.data || []); setStats(r.data.stats || {}); setDefaultRate(r.data.default_rate ?? 70);
    } catch (e) { notify(apiError(e, t("erreur_chargement"))); }
    finally { setLoading(false); }
  }, [tab, q]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const h = setTimeout(load, 200); return () => clearTimeout(h); }, [load]);

  const loadDetail = useCallback(async (id) => {
    try { const r = await api.get(`/admin/course-reviews/${id}`); setDetail(r.data.data); }
    catch (e) { notify(apiError(e, t("erreur_chargement"))); setOpenId(null); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setDetail(null); if (openId) loadDetail(openId); }, [openId, loadDetail]);

  const close = () => { setOpenId(null); setApprove(null); setReject(null); };
  const refresh = () => { load(); if (openId) loadDetail(openId); };

  const removeResource = async (r) => {
    if (!(await confirm(t("retirer_ressource_confirm", { name: r.title || r.file_url?.split("/").pop() }), { confirmLabel: t("retirer") }))) return;
    act(() => api.delete(`/admin/course-resources/${r.id}`), t("ressource_retiree"), () => loadDetail(openId));
  };

  const act = async (fn, okMsg, after) => {
    setBusy(true);
    try { await fn(); notify(okMsg, "success"); after?.(); load(); }
    catch (e) { notify(apiError(e, t("erreur_action"))); }
    finally { setBusy(false); }
  };

  const startApprove = () => setApprove({
    rate: String(detail.course.proposed_commission_rate ?? detail.course.instructor_commission_rate ?? defaultRate),
    price: detail.course.is_free ? "" : String(detail.course.price ?? ""),
    original: detail.course.original_price ? String(detail.course.original_price) : "",
  });

  const doApprove = () => {
    const rate = Number(String(approve.rate).replace(",", "."));
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return notify(t("taux_invalide"));
    const body = { commission_rate: rate };
    if (!detail.course.is_free && approve.price !== "") body.price = Number(approve.price);
    body.original_price = approve.original === "" ? null : Number(approve.original);
    act(() => api.post(`/admin/course-reviews/${openId}/approve`, body), t("cours_publie"), close);
  };

  const doReject = () => {
    if (reject.trim().length < 3) return notify(t("motif_obligatoire"));
    act(() => api.post(`/admin/course-reviews/${openId}/reject`, { reason: reject.trim() }), t("cours_renvoye"), close);
  };

  const doUnpublish = async () => {
    if (!(await confirm(t("depublier_confirmation"), { confirmLabel: t("depublier") }))) return;
    act(() => api.post(`/admin/course-reviews/${openId}/unpublish`, {}), t("cours_depublie"), close);
  };

  const c = detail?.course;
  const authorName = (r) => `${r.author_first_name} ${r.author_last_name}`;

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {ui}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("titre")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("sous_titre")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map((v) => (
            <button key={v} type="button" onClick={() => { setTab(v); setLoading(true); }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === v ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}>
              {t(`onglet_${v}`)}
              {v !== "all" && <span className="ml-1.5 text-xs text-gray-400">{formatNumber(stats[v] || 0)}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[12rem] max-w-xs ml-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("rechercher")} aria-label={t("rechercher")} className={`${field} !pl-9`} />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />{t("aucun_cours")}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {rows.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setOpenId(r.id)} className="w-full flex items-center gap-4 px-5 py-4 bg-transparent hover:bg-gray-50 text-left">
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-gradient-to-br from-primary-dark to-primary shrink-0 flex items-center justify-center">
                    {r.thumbnail_url ? <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <BookOpen className="w-5 h-5 text-white/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {authorName(r)} · {t("modules_lecons", { modules: r.module_count, lessons: r.lesson_count })}
                      {r.submitted_at ? ` · ${t("soumis_le", { date: formatDate(r.submitted_at) })}` : ""}
                    </p>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 shrink-0">{r.is_free ? t("gratuit") : formatMoney(r.price)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${BADGE[r.review_status]}`}>{t(`statut_${r.review_status}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openId && (
        <div className="fixed inset-0 z-[55] flex justify-end bg-black/40" onMouseDown={close}>
          <aside role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()} className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl text-left">
            <div className="sticky top-0 bg-white z-10 flex items-start justify-between gap-4 p-5 border-b border-gray-100">
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 truncate">{c?.title || "…"}</h2>
                {c && <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[c.review_status]}`}>{t(`statut_${c.review_status}`)}</span>}
              </div>
              <button type="button" onClick={close} aria-label={t("fermer")} className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            {!detail ? (
              <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : (
              <div className="p-5 space-y-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-xs text-gray-500">{t("auteur")}</dt><dd className="text-gray-900">{c.author.first_name} {c.author.last_name}</dd></div>
                  <div><dt className="text-xs text-gray-500">{t("categorie")}</dt><dd className="text-gray-900">{c.category_name || "—"}</dd></div>
                  <div><dt className="text-xs text-gray-500">{t("prix")}</dt><dd className="text-gray-900">{c.is_free ? t("gratuit") : formatMoney(c.price)}</dd></div>
                  <div><dt className="text-xs text-gray-500">{t("part_instructeurs")}</dt><dd className="text-gray-900">{detail.team.pool_rate} %{detail.team.pool_is_default ? ` (${t("par_defaut")})` : ""}</dd></div>
                </dl>

                {c.short_description && <p className="text-sm text-gray-700">{c.short_description}</p>}

                {c.review_status === "rejected" && c.review_note && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                    <p className="font-medium mb-0.5">{t("motif_du_renvoi")}</p>{c.review_note}
                  </div>
                )}

                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("contenu")}</h3>
                  {detail.modules.length === 0 ? <p className="text-sm text-gray-500">{t("aucun_module")}</p> : (
                    <ol className="space-y-3">
                      {detail.modules.map((m, i) => (
                        <li key={m.id}>
                          <p className="text-sm font-medium text-gray-900">{i + 1}. {m.title}</p>
                          <ul className="mt-1 ml-4 space-y-0.5">
                            {m.lessons.map((l) => (
                              <li key={l.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                <span className="truncate">{l.title}</span>
                                {l.duration_minutes ? <span className="text-gray-400 shrink-0">{l.duration_minutes} min</span> : null}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                {(detail.resources || []).length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("ressources")} <span className="text-gray-400 font-normal">({detail.resources.length})</span></h3>
                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                      {detail.resources.map((r) => (
                        <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <a href={r.file_url} target="_blank" rel="noreferrer" className="block text-sm text-gray-900 truncate hover:underline">{r.title || r.file_url?.split("/").pop()}</a>
                            <p className="text-xs text-gray-500 truncate">{r.lesson_title} · {t("telechargements", { count: r.download_count || 0 })}</p>
                          </div>
                          <button type="button" onClick={() => removeResource(r)} disabled={busy} className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">{t("retirer")}</button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{t("equipe")}</h3>
                    <button type="button" onClick={() => setTeamOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"><Users className="w-3.5 h-3.5" />{t("gerer_equipe")}</button>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex justify-between"><span>{detail.team.author?.first_name} {detail.team.author?.last_name} <span className="text-xs text-gray-400">· {t("auteur")}</span></span><span>{detail.team.author?.rate} %</span></li>
                    {detail.team.assigned.map((a) => <li key={a.id} className="flex justify-between"><span>{a.first_name} {a.last_name}</span><span>{Number(a.commission_rate)} %</span></li>)}
                  </ul>
                </section>

                {approve && (
                  <section className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t("publier_ce_cours")}</h3>
                    <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("part_instructeurs_pct")}</span>
                      <input inputMode="decimal" value={approve.rate} onChange={(e) => setApprove((p) => ({ ...p, rate: e.target.value }))} className={field} />
                      {c.proposed_commission_rate != null && <span className="block text-xs text-gray-500 mt-1">{t("proposee_par_instructeur", { rate: Number(c.proposed_commission_rate) })}</span>}</label>
                    {!c.is_free && (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("prix_devise")}</span>
                          <input type="number" min="0" value={approve.price} onChange={(e) => setApprove((p) => ({ ...p, price: e.target.value }))} className={field} /></label>
                        <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("prix_barre")}</span>
                          <input type="number" min="0" value={approve.original} onChange={(e) => setApprove((p) => ({ ...p, original: e.target.value }))} className={field} /></label>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setApprove(null)} className={`${btn} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`}>{t("annuler")}</button>
                      <button type="button" onClick={doApprove} disabled={busy} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>{busy && <Loader className="w-3.5 h-3.5 animate-spin" />}{t("valider_et_publier")}</button>
                    </div>
                  </section>
                )}

                {reject !== null && (
                  <section className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t("renvoyer_a_l_auteur")}</h3>
                    <textarea rows={3} value={reject} onChange={(e) => setReject(e.target.value)} placeholder={t("motif_placeholder")} aria-label={t("motif")} className={field} />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setReject(null)} className={`${btn} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`}>{t("annuler")}</button>
                      <button type="button" onClick={doReject} disabled={busy} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>{busy && <Loader className="w-3.5 h-3.5 animate-spin" />}{t("renvoyer")}</button>
                    </div>
                  </section>
                )}

                {!approve && reject === null && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {!c.is_published && (
                      <button type="button" onClick={startApprove} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}><CheckCircle2 className="w-4 h-4" />{t("valider_et_publier")}</button>
                    )}
                    {c.review_status === "submitted" && (
                      <button type="button" onClick={() => setReject("")} className={`${btn} bg-white border border-red-200 text-red-600 hover:bg-red-50`}><Undo2 className="w-4 h-4" />{t("renvoyer")}</button>
                    )}
                    {!!c.is_published && (
                      <button type="button" onClick={doUnpublish} className={`${btn} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}><Ban className="w-4 h-4" />{t("depublier")}</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {teamOpen && c && <CourseTeamModal courseId={c.id} courseTitle={c.title} onClose={() => setTeamOpen(false)} onChanged={refresh} />}
    </div>
  );
}
