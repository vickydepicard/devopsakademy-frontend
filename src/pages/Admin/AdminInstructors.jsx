// Gestion des instructeurs (espace admin) : liste, fiche détaillée, commissions, versements, statut.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, Plus, RefreshCw, X, Loader, ChevronLeft, ChevronRight, Users, UserCheck, UserX, Clock, Wallet,
} from "lucide-react";
import api from "../../api/api";
import { formatMoney, formatNumber, formatDate, formatDateTime } from "../../utils/format";

const DEFAULT_RATE = 70;
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

function Spinner({ className = "w-5 h-5" }) {
  return <Loader className={`${className} animate-spin text-primary`} />;
}

function Modal({ title, onClose, children, wide }) {
  const { t } = useTranslation("adminInstructors");
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className={`bg-white text-left rounded-2xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label={t("fermer")} className="p-1.5 bg-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ row }) {
  const { t } = useTranslation("adminInstructors");
  let cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let label = t("statut_actif");
  if (!row.is_active) { cls = "bg-red-50 text-red-700 border-red-200"; label = row.email_verified ? t("statut_suspendu") : t("statut_non_verifie"); }
  else if (["pending", "under_review"].includes(row.application_status)) { cls = "bg-amber-50 text-amber-700 border-amber-200"; label = t("statut_en_attente"); }
  else if (row.application_status !== "accepted") { cls = "bg-gray-100 text-gray-600 border-gray-200"; label = t("statut_sans_candidature"); }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>;
}

function Avatar({ row, size = "w-9 h-9" }) {
  const initials = `${row.first_name?.[0] || ""}${row.last_name?.[0] || ""}`.toUpperCase();
  return row.avatar_url
    ? <img src={row.avatar_url} alt="" className={`${size} rounded-full object-cover`} />
    : <span className={`${size} rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center`}>{initials}</span>;
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
const btnPrimary = "px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2";
const btnGhost = "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50";

// ── Création ─────────────────────────────────────────────────
function CreateModal({ onClose, onDone }) {
  const { t } = useTranslation("adminInstructors");
  const [f, setF] = useState({ first_name: "", last_name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.first_name.trim()) er.first_name = t("champ_requis");
    if (!f.last_name.trim()) er.last_name = t("champ_requis");
    if (!f.email.trim()) er.email = t("champ_requis");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = t("email_invalide");
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true); setApiErr("");
    try {
      const res = await api.post("/admin/instructor-management", f);
      onDone(res.data?.message || t("instructeur_cree"));
    } catch (e2) {
      const fe = e2?.response?.data?.errors || {};
      if (fe.email === "duplicate") setErrors({ email: t("email_existe") });
      else setApiErr(errMsg(e2, t("action_impossible")));
    } finally { setBusy(false); }
  };

  return (
    <Modal title={t("creer_titre")} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-sm text-gray-500">{t("creer_texte")}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("prenom")} error={errors.first_name}>
            <input className={inputCls} value={f.first_name} maxLength={100} autoFocus autoComplete="off"
              onChange={(e) => setF({ ...f, first_name: e.target.value })} />
          </Field>
          <Field label={t("nom")} error={errors.last_name}>
            <input className={inputCls} value={f.last_name} maxLength={100} autoComplete="off"
              onChange={(e) => setF({ ...f, last_name: e.target.value })} />
          </Field>
        </div>
        <Field label={t("email_pro")} error={errors.email}>
          <input type="email" className={inputCls} value={f.email} maxLength={150} autoComplete="off"
            onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        {apiErr && <p className="text-sm text-red-600">{apiErr}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>{t("annuler")}</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4 !text-white" />}{t("creer")}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Suspension / réactivation ────────────────────────────────
function StatusModal({ target, activate, onClose, onDone }) {
  const { t } = useTranslation("adminInstructors");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!activate && reason.trim().length < 3) { setErr(t("motif_requis")); return; }
    setBusy(true); setErr("");
    try {
      await api.patch(`/admin/instructor-management/${target.id}/status`, { is_active: activate, reason: reason.trim() || undefined });
      onDone(t("statut_mis_a_jour"));
    } catch (e) { setErr(errMsg(e, t("action_impossible"))); setBusy(false); }
  };
  return (
    <Modal title={activate ? t("reactiver_titre") : t("suspendre_titre")} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{activate ? t("reactiver_texte") : t("suspendre_texte")}</p>
        <Field label={activate ? t("motif_optionnel") : t("motif_obligatoire")} error={err}>
          <textarea rows={3} maxLength={500} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btnGhost}>{t("annuler")}</button>
          <button onClick={submit} disabled={busy}
            className={`${btnPrimary} ${activate ? "" : "!bg-red-600"}`}>
            {busy && <Spinner className="w-4 h-4 !text-white" />}{activate ? t("confirmer_reactivation") : t("confirmer_suspension")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Retrait du statut ────────────────────────────────────────
function RevokeModal({ target, others, onClose, onDone }) {
  const { t } = useTranslation("adminInstructors");
  const [reassign, setReassign] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [needsTransfer, setNeedsTransfer] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr("");
    try {
      await api.post(`/admin/instructor-management/${target.id}/revoke`, {
        reassign_to: reassign ? Number(reassign) : undefined, reason: reason.trim() || undefined,
      });
      onDone(t("statut_retire"));
    } catch (e) {
      if (e?.response?.data?.code === "HAS_COURSES") setNeedsTransfer(true);
      setErr(errMsg(e, t("action_impossible"))); setBusy(false);
    }
  };
  return (
    <Modal title={t("retirer_titre")} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{t("retirer_texte")}</p>
        <Field label={t("transferer_a")}>
          <select className={inputCls} value={reassign} onChange={(e) => setReassign(e.target.value)}>
            <option value="">{t("aucun_transfert")}</option>
            {others.map((o) => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
          </select>
        </Field>
        <Field label={t("motif_optionnel")}>
          <textarea rows={2} maxLength={500} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {err && <p className="text-sm text-red-600">{needsTransfer ? t("a_des_cours") : err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btnGhost}>{t("annuler")}</button>
          <button onClick={submit} disabled={busy} className={`${btnPrimary} !bg-red-600`}>
            {busy && <Spinner className="w-4 h-4 !text-white" />}{t("confirmer_retrait")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Taux de commission par cours ─────────────────────────────
function RateCell({ instructorId, course, onSaved, notify }) {
  const { t } = useTranslation("adminInstructors");
  const initial = course.instructor_commission_rate == null ? "" : String(Number(course.instructor_commission_rate));
  const [val, setVal] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => setVal(initial), [initial]);
  const dirty = val !== initial;
  const save = async () => {
    const raw = val.trim().replace(",", ".");
    let rate = null;
    if (raw !== "") {
      rate = Number(raw);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) { setErr(t("taux_invalide")); return; }
    }
    setBusy(true); setErr("");
    try {
      await api.patch(`/admin/instructor-management/${instructorId}/commission`, { course_id: course.id, rate });
      notify(t("taux_enregistre")); onSaved();
    } catch (e) { setErr(errMsg(e, t("action_impossible"))); }
    finally { setBusy(false); }
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative w-24">
          <input inputMode="decimal" className={`${inputCls} pr-6`} value={val} placeholder={String(DEFAULT_RATE)}
            aria-label={t("taux_commission")} onChange={(e) => setVal(e.target.value)} />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
        </div>
        {dirty && <button onClick={save} disabled={busy} className="text-sm text-primary font-medium bg-transparent !px-2 !py-1 disabled:opacity-50">{t("enregistrer")}</button>}
      </div>
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  );
}

// ── Fiche instructeur ────────────────────────────────────────
function DetailModal({ id, others, onClose, onChanged, notify }) {
  const { t } = useTranslation("adminInstructors");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("apercu");
  const [dialog, setDialog] = useState(null); // 'suspend' | 'activate' | 'revoke'
  const [ref, setRef] = useState("");
  const [refErr, setRefErr] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/admin/instructor-management/${id}`);
      setData(res.data.data); setError(false);
    } catch { setError(true); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const pay = async () => {
    if (ref.trim().length < 3) { setRefErr(t("reference_invalide")); return; }
    setPaying(true); setRefErr("");
    try {
      const res = await api.post(`/admin/instructor-management/${id}/payouts`, { reference: ref.trim() });
      notify(t("versement_enregistre", { amount: formatMoney(res.data.data.amount), count: res.data.data.count }));
      setRef(""); await load(); onChanged();
    } catch (e) {
      setRefErr(e?.response?.data?.code === "NOTHING_DUE" ? t("rien_a_verser") : errMsg(e, t("action_impossible")));
    } finally { setPaying(false); }
  };

  const tabs = [["apercu", t("onglet_apercu")], ["cours", t("onglet_cours")], ["gains", t("onglet_gains")], ["historique", t("onglet_historique")]];
  const u = data?.user;
  const appLabel = (s) => t(`app_${s}`, { defaultValue: s });
  const actionLabel = (a) => {
    const map = {
      "instructor.created": "action_created", "instructor.updated": "action_updated", "instructor.suspended": "action_suspended",
      "instructor.reactivated": "action_reactivated", "instructor.revoked": "action_revoked",
      "instructor.commission": "action_commission", "instructor.commission_rate": "action_commission", "instructor.payout": "action_payout",
    };
    return t(map[a] || "action_autre");
  };

  return (
    <>
      <Modal title={u ? `${u.first_name} ${u.last_name}` : t("chargement")} onClose={onClose} wide>
        {error && <p className="text-sm text-red-600 py-6 text-center">{t("chargement_impossible")}</p>}
        {!data && !error && <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>}
        {data && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar row={u} size="w-12 h-12" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                  <StatusBadge row={{ ...u, application_status: data.applications[0]?.status }} />
                </div>
              </div>
              <div className="flex gap-2">
                {u.is_active
                  ? <button onClick={() => setDialog("suspend")} className={btnGhost}>{t("suspendre")}</button>
                  : <button onClick={() => setDialog("activate")} className={btnGhost}>{t("reactiver")}</button>}
                <button onClick={() => setDialog("revoke")} className={`${btnGhost} !text-red-600 !border-red-200 hover:!bg-red-50`}>{t("retirer_statut")}</button>
              </div>
            </div>

            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto" role="tablist">
              {tabs.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 border-x-0 border-t-0 rounded-none bg-transparent -mb-px ${tab === k ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "apercu" && (
              <div className="space-y-5">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    [t("poste"), u.job_title], [t("pays"), u.country],
                    [t("inscrit_le"), formatDate(u.created_at)], [t("col_derniere_connexion"), u.last_login ? formatDateTime(u.last_login) : t("jamais")],
                    [t("email_verifie"), u.email_verified ? t("oui") : t("non")],
                  ].map(([k, v]) => (
                    <div key={k}><dt className="text-gray-500">{k}</dt><dd className="text-gray-900">{v || "—"}</dd></div>
                  ))}
                </dl>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("candidatures")}</h3>
                  {data.applications.length === 0 && <p className="text-sm text-gray-500">{t("aucune_candidature")}</p>}
                  <ul className="space-y-2">
                    {data.applications.map((a) => (
                      <li key={a.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-gray-900">{appLabel(a.status)}</span>
                          <span className="text-gray-500">{t("soumise_le", { date: formatDate(a.submitted_at) })}</span>
                        </div>
                        {a.reviewed_at && (
                          <p className="text-gray-500 mt-1">
                            {t("traitee_par", { name: [a.reviewer_first_name, a.reviewer_last_name].filter(Boolean).join(" ") || "—", date: formatDate(a.reviewed_at) })}
                          </p>
                        )}
                        {a.review_note && <p className="text-gray-700 mt-1"><span className="text-gray-500">{t("motif")} : </span>{a.review_note}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "cours" && (
              <div className="space-y-5">
                <p className="text-xs text-gray-500">{t("taux_aide")}</p>
                <h3 className="text-sm font-semibold text-gray-900">{t("cours_propres")}</h3>
                {data.courses.length === 0 && <p className="text-sm text-gray-500">{t("aucun_cours")}</p>}
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {data.courses.map((c) => (
                    <li key={c.id} className="p-3 flex flex-wrap items-center gap-3 justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-500">
                          {c.is_published ? t("publie") : t("brouillon")} · {formatNumber(c.student_count)} {t("col_etudiants").toLowerCase()} · {t("ventes")} {formatMoney(c.sales)} · {t("gagne")} {formatMoney(c.earned)}
                        </p>
                      </div>
                      <RateCell instructorId={id} course={c} onSaved={() => { load(); onChanged(); }} notify={notify} />
                    </li>
                  ))}
                </ul>
                {data.co_courses.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900">{t("cours_collaboration")}</h3>
                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                      {data.co_courses.map((c) => (
                        <li key={c.id} className="p-3 flex justify-between gap-3 text-sm">
                          <span className="truncate text-gray-900">{c.title}</span>
                          <span className="text-gray-500 shrink-0">{c.commission_rate != null ? `${Number(c.commission_rate)} %` : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {tab === "gains" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[[t("total_gagne"), data.earnings.total], [t("total_verse"), data.earnings.paid], [t("total_a_verser"), data.earnings.unpaid]].map(([k, v]) => (
                    <div key={k} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{k}</p>
                      <p className="text-base font-semibold text-gray-900">{formatMoney(v, data.earnings.currency)}</p>
                    </div>
                  ))}
                </div>
                {data.earnings.unpaid > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t("enregistrer_versement")}</h3>
                    <p className="text-xs text-gray-500">{t("versement_aide")}</p>
                    <Field label={t("reference_versement")} error={refErr}>
                      <input className={inputCls} value={ref} maxLength={150} placeholder={t("reference_placeholder")} onChange={(e) => setRef(e.target.value)} />
                    </Field>
                    <button onClick={pay} disabled={paying} className={btnPrimary}>
                      {paying && <Spinner className="w-4 h-4 !text-white" />}{t("enregistrer_versement")}
                    </button>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-gray-900">{t("commissions_recentes")}</h3>
                {data.commissions.length === 0 ? <p className="text-sm text-gray-500">{t("aucune_commission")}</p> : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500">
                        <tr>{["col_date", "col_cours", "col_vente", "col_taux", "col_commission", "col_statut"].map((k) => <th key={k} className="text-left font-medium px-3 py-2">{t(k)}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.commissions.map((c) => (
                          <tr key={c.id}>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(c.earned_at)}</td>
                            <td className="px-3 py-2 max-w-[180px] truncate">{c.course_title}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatMoney(c.sale_amount)}</td>
                            <td className="px-3 py-2">{Number(c.commission_rate)} %</td>
                            <td className="px-3 py-2 whitespace-nowrap font-medium">{formatMoney(c.commission_amount)}</td>
                            <td className="px-3 py-2">{t(`commission_${c.status}`, { defaultValue: c.status })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "historique" && (
              data.history.length === 0 ? <p className="text-sm text-gray-500">{t("historique_vide")}</p> : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {data.history.map((h) => (
                    <li key={h.id} className="p-3 flex justify-between gap-3 text-sm">
                      <span className="text-gray-900">
                        {actionLabel(h.action)}
                        {h.first_name && <span className="text-gray-500"> · {t("par", { name: `${h.first_name} ${h.last_name || ""}`.trim() })}</span>}
                      </span>
                      <span className="text-gray-500 shrink-0">{formatDateTime(h.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </Modal>
      {dialog === "suspend" && <StatusModal target={u} activate={false} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); notify(m); load(); onChanged(); }} />}
      {dialog === "activate" && <StatusModal target={u} activate onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); notify(m); load(); onChanged(); }} />}
      {dialog === "revoke" && <RevokeModal target={u} others={others.filter((o) => o.id !== id)} onClose={() => setDialog(null)} onDone={(m) => { setDialog(null); notify(m); onChanged(); onClose(); }} />}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AdminInstructors() {
  const { t } = useTranslation("adminInstructors");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("joined");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");
  const limit = 20;

  useEffect(() => { document.title = t("document_title"); }, [t]);
  useEffect(() => { const h = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300); return () => clearTimeout(h); }, [search]);
  useEffect(() => { if (!toast) return; const h = setTimeout(() => setToast(""), 4500); return () => clearTimeout(h); }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/instructor-management", { params: { search: q || undefined, status, sort, page, limit, dir: sort === "name" ? "asc" : "desc" } });
      setRows(res.data.data || []); setStats(res.data.stats || null); setTotal(res.data.pagination?.total || 0); setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [q, status, sort, page]);
  useEffect(() => { load(); }, [load]);

  const pages = Math.max(Math.ceil(total / limit), 1);
  const activeOthers = useMemo(() => rows.filter((r) => r.is_active && r.application_status === "accepted"), [rows]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">{t("titre")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("sous_titre")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className={btnGhost} aria-label={t("actualiser")}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => setCreating(true)} className={btnPrimary}><Plus className="w-4 h-4" />{t("nouvel_instructeur")}</button>
        </div>
      </div>

      {toast && <div role="status" className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">{toast}</div>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat icon={Users} label={t("stat_total")} value={formatNumber(stats.total)} />
          <Stat icon={UserCheck} label={t("stat_actifs")} value={formatNumber(stats.active)} />
          <Stat icon={UserX} label={t("stat_suspendus")} value={formatNumber(stats.suspended)} />
          <Stat icon={Clock} label={t("stat_candidatures")} value={formatNumber(stats.pending)} />
          <Stat icon={Wallet} label={t("stat_a_verser")} value={formatMoney(stats.unpaid_total, stats.currency)} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("recherche")} aria-label={t("recherche")} className={`${inputCls} pl-9`} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label={t("col_statut")} className={`${inputCls} !w-auto`}>
          <option value="all">{t("filtre_tous")}</option>
          <option value="active">{t("filtre_actifs")}</option>
          <option value="suspended">{t("filtre_suspendus")}</option>
          <option value="pending">{t("filtre_en_attente")}</option>
          <option value="no_application">{t("filtre_sans_candidature")}</option>
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={`${inputCls} !w-auto`} aria-label="Sort">
          <option value="joined">{t("tri_recents")}</option>
          <option value="name">{t("tri_nom")}</option>
          <option value="courses">{t("tri_cours")}</option>
          <option value="students">{t("tri_etudiants")}</option>
          <option value="earnings">{t("tri_gains")}</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {error ? (
          <div className="py-14 text-center space-y-3">
            <p className="text-sm text-gray-600">{t("chargement_impossible")}</p>
            <button onClick={load} className={btnGhost}>{t("reessayer")}</button>
          </div>
        ) : loading && rows.length === 0 ? (
          <div className="flex justify-center py-14"><Spinner className="w-6 h-6" /></div>
        ) : rows.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-500">{t("aucun_resultat")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {["col_instructeur", "col_statut", "col_cours", "col_etudiants", "col_gains", "col_a_verser", "col_derniere_connexion"].map((k) => (
                    <th key={k} className="text-left font-medium px-4 py-3 whitespace-nowrap">{t(k)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-3 text-left bg-transparent !p-0 border-0" onClick={(e) => { e.stopPropagation(); setOpenId(r.id); }} aria-label={`${t("ouvrir")} ${r.first_name} ${r.last_name}`}>
                        <Avatar row={r} />
                        <span className="min-w-0">
                          <span className="block font-medium text-gray-900 truncate">{r.first_name} {r.last_name}</span>
                          <span className="block text-xs text-gray-500 truncate">{r.email}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><StatusBadge row={r} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatNumber(r.published_count)} / {formatNumber(r.course_count)}</td>
                    <td className="px-4 py-3">{formatNumber(r.student_count)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatMoney(r.total_earned)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.unpaid > 0 ? <span className="font-medium text-amber-700">{formatMoney(r.unpaid)}</span> : "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{r.last_login ? formatDate(r.last_login) : t("jamais")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!error && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{t("page_x_sur_y", { page, pages, total: formatNumber(total) })}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btnGhost} !px-2.5 !py-1.5`} aria-label={t("page_precedente")}><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${btnGhost} !px-2.5 !py-1.5`} aria-label={t("page_suivante")}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onDone={(m) => { setCreating(false); setToast(m); load(); }} />}
      {openId && <DetailModal id={openId} others={activeOthers} onClose={() => setOpenId(null)} onChanged={load} notify={setToast} />}
    </div>
  );
}
