// Moyen de paiement de l'instructeur + export de son relevé de commissions (CSV).
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader, Wallet } from "lucide-react";
import api from "../../../api/api";

const METHODS = ["mobile_money", "bank", "other"];
const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function PayoutProfileCard() {
  const { t } = useTranslation("instructorProgram");
  const [p, setP] = useState(undefined);
  const [f, setF] = useState({ method: "mobile_money", provider: "", account_name: "", account_number: "", country: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dl, setDl] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    api.get("/instructor-program/payout-profile").then((r) => { setP(r.data.data); if (r.data.data) setF((x) => ({ ...x, ...Object.fromEntries(Object.entries(r.data.data).map(([k, v]) => [k, v ?? ""])) })); }).catch(() => setP(null));
  }, []);

  const save = async () => {
    setBusy(true); setErrors({}); setSaved(false);
    try { await api.put("/instructor-program/payout-profile", f); setSaved(true); setP(f); }
    catch (e) { setErrors(e?.response?.data?.errors || {}); }
    finally { setBusy(false); }
  };

  const exportCsv = async () => {
    setDl(true);
    try {
      const res = await api.get("/instructor-program/statement", { params: { format: "csv", from: from || undefined, to: to || undefined }, responseType: "blob" });
      const href = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = href; a.download = `statement-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch { /* non bloquant */ } finally { setDl(false); }
  };

  if (p === undefined) return null;
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((x) => ({ ...x, [k]: "" })); setSaved(false); };
  const cls = (k) => `${inp} ${errors[k] ? "!border-red-300" : ""}`;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className={`bg-white border rounded-xl p-5 space-y-3 ${p ? "border-gray-200" : "border-amber-300"}`}>
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" />{t("payout_title")}</h2>
        {!p && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">{t("payout_missing_hint")}</p>}
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => <button key={m} type="button" onClick={() => set("method", m)} className={`px-2 py-2 rounded-lg text-xs font-bold border-2 ${f.method === m ? "border-primary text-primary bg-indigo-50/40" : "border-gray-200 text-gray-600 bg-white"}`}>{t(`method_${m}`)}</button>)}
        </div>
        <input className={inp} placeholder={f.method === "bank" ? t("provider_bank") : t("provider_mobile")} value={f.provider} onChange={(e) => set("provider", e.target.value)} maxLength={80} />
        <input className={cls("account_name")} placeholder={t("account_name")} value={f.account_name} onChange={(e) => set("account_name", e.target.value)} maxLength={120} />
        <input className={cls("account_number")} placeholder={f.method === "bank" ? t("account_number_bank") : t("account_number_mobile")} value={f.account_number} onChange={(e) => set("account_number", e.target.value)} maxLength={80} />
        <input className={inp} placeholder={t("country")} value={f.country} onChange={(e) => set("country", e.target.value)} maxLength={80} />
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-600 font-semibold">{t("saved")}</span>}
          <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary disabled:opacity-50">{busy && <Loader className="w-4 h-4 animate-spin" />}{t("save")}</button>
        </div>
      </section>
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 self-start">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Download className="w-4 h-4 text-primary" />{t("statement_title")}</h2>
        <p className="text-xs text-gray-500">{t("statement_hint")}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">{t("from")}<input type="date" className={inp} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="text-xs text-gray-500">{t("to")}<input type="date" className={inp} value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <button type="button" onClick={exportCsv} disabled={dl} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60">{dl ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{t("export_statement")}</button>
      </section>
    </div>
  );
}
