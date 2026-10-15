// Charte / contrat d'instructeur : lecture et signature en ligne.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, FileSignature, Loader } from "lucide-react";
import api from "../../api/api";
import { formatDateTime } from "../../utils/format";

export default function InstructorAgreement() {
  const { t, i18n } = useTranslation("instructorProgram");
  const [a, setA] = useState(undefined);
  const [name, setName] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api.get("/instructor-program/agreement").then((r) => setA(r.data.data)).catch(() => setA(null));
  useEffect(() => { document.title = `${t("agreement_page_title")} — DevOpsAkademy`; load(); }, [i18n.resolvedLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  const sign = async () => {
    setBusy(true); setErr("");
    try { await api.post("/instructor-program/agreement/sign", { accept: true, signed_name: name.trim() }); await load(); }
    catch (e) { setErr(e?.response?.data?.message || t("error_generic")); }
    finally { setBusy(false); }
  };

  if (a === undefined) return <div className="flex justify-center py-24"><Loader className="w-7 h-7 animate-spin text-primary" /></div>;
  if (!a) return <p className="text-sm text-gray-500 text-center py-24">{t("agreement_none")}</p>;

  return (
    <div className="max-w-3xl space-y-5 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileSignature className="w-6 h-6 text-primary" />{t("agreement_page_title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{a.title} · v{a.version}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed max-h-[28rem] overflow-y-auto">{a.body}</pre>
      </div>
      {a.signed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
          <div><p className="font-bold text-emerald-800">{t("agreement_signed_title")}</p><p className="text-sm text-emerald-700">{t("agreement_signed_info_me", { name: a.signed.signed_name, date: formatDateTime(a.signed.signed_at) })}</p></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <label className="flex items-start gap-3 text-sm text-gray-700"><input type="checkbox" className="w-4 h-4 mt-0.5" checked={accept} onChange={(e) => setAccept(e.target.checked)} />{t("agreement_accept")}</label>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">{t("agreement_type_name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm" />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-end">
            <button type="button" onClick={sign} disabled={busy || !accept || name.trim().length < 3}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-primary hover:opacity-90 disabled:opacity-50">
              {busy && <Loader className="w-4 h-4 animate-spin" />}{t("agreement_sign")}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">{t("agreement_legal_note")}</p>
        </div>
      )}
    </div>
  );
}
