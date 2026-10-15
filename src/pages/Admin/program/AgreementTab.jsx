// Contrat / charte : versions, signatures, publication d'une nouvelle version.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSignature, Plus } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatDateTime } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, btnGhost, btnPrimary, fullName, inp } from "./ui";

function Detail({ id, onBack }) {
  const { t } = useTranslation("instructorProgram");
  const [d, setD] = useState(null);
  const [lang, setLang] = useState("fr");
  useEffect(() => { api.get(`/instructor-program/admin/agreements/${id}`).then((r) => setD(r.data.data)); }, [id]);
  if (!d) return <Center><Spinner className="w-6 h-6" /></Center>;
  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-primary bg-transparent hover:underline">← {t("back")}</button>
      <Card title={`${d.title} — v${d.version}`} action={
        <div className="flex gap-1">{["fr", "en"].map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${lang === l ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{l.toUpperCase()}</button>)}</div>}>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed max-h-80 overflow-y-auto">{lang === "fr" ? d.body_fr : d.body_en}</pre>
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title={`${t("signed")} (${d.signed.length})`}>
          {d.signed.length === 0 ? <Empty>{t("nobody_signed")}</Empty> : (
            <ul className="divide-y divide-gray-100">
              {d.signed.map((s) => (
                <li key={s.id} className="py-2.5 text-sm">
                  <div className="flex justify-between gap-2"><span className="font-medium text-gray-900">{fullName(s)}</span><span className="text-xs text-gray-500">{formatDateTime(s.signed_at)}</span></div>
                  <p className="text-xs text-gray-400">{t("signed_as", { name: s.signed_name })} · IP {s.ip_address || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {d.is_current && (
          <Card title={`${t("not_signed")} (${d.pending.length})`}>
            {d.pending.length === 0 ? <Empty>{t("everybody_signed")}</Empty> : (
              <ul className="divide-y divide-gray-100">{d.pending.map((p) => <li key={p.id} className="py-2.5 text-sm"><span className="font-medium text-gray-900">{fullName(p)}</span> <span className="text-xs text-gray-400">{p.email}</span></li>)}</ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AgreementTab() {
  const { t } = useTranslation("instructorProgram");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get("/instructor-program/admin/agreements").then((r) => { setRows(r.data.data); setTotal(r.data.instructors_total); }).catch((e) => notify(apiError(e, t("error_generic"))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const startNew = async () => {
    const cur = rows?.find((r) => r.is_current);
    let prefill = { title: cur?.title || "", body_fr: "", body_en: "", notify: true };
    if (cur) { try { const r = await api.get(`/instructor-program/admin/agreements/${cur.id}`); prefill = { ...prefill, body_fr: r.data.data.body_fr, body_en: r.data.data.body_en }; } catch { /* formulaire vide */ } }
    setForm(prefill);
  };

  const publish = async () => {
    if (!(await confirm(t("publish_confirm"), { confirmLabel: t("publish"), danger: false }))) return;
    setBusy(true);
    try { await api.post("/instructor-program/admin/agreements", form); notify(t("published"), "success"); setForm(null); load(); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  if (open) return <Detail id={open} onBack={() => setOpen(null)} />;
  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;

  if (form) {
    return (
      <Card title={t("new_version")}>
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">{t("legal_notice")}</p>
          <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("agreement_title")}</span>
            <input className={inp} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
          <div className="grid lg:grid-cols-2 gap-4">
            {["fr", "en"].map((l) => (
              <label key={l} className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t(`text_${l}`)}</span>
                <textarea rows={14} className={`${inp} font-mono text-xs`} value={form[`body_${l}`]} onChange={(e) => setForm((p) => ({ ...p, [`body_${l}`]: e.target.value }))} /></label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="w-4 h-4" checked={form.notify} onChange={(e) => setForm((p) => ({ ...p, notify: e.target.checked }))} />{t("notify_resign")}</label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm(null)} className={btnGhost}>{t("cancel")}</button>
            <button type="button" onClick={publish} disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("publish")}</button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title={t("agreement_title_card")} action={<button type="button" onClick={startNew} className={btnPrimary}><Plus className="w-4 h-4" />{t("new_version")}</button>}>
      <p className="text-xs text-gray-500 mb-4">{t("agreement_hint")}</p>
      <ul className="divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileSignature className="w-5 h-5 text-gray-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">v{r.version} · {r.title} {r.is_current && <Pill tone="bg-emerald-100 text-emerald-700">{t("current")}</Pill>}</p>
                <p className="text-xs text-gray-400">{t("published_on", { date: formatDate(r.created_at) })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-600">{t("signatures_count", { n: r.signatures, total: r.is_current ? total : r.signatures })}</span>
              <button type="button" onClick={() => setOpen(r.id)} className={btnGhost}>{t("open")}</button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
