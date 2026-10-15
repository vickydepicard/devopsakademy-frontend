// Centre de préférences email : accessible sans connexion grâce au jeton personnel présent dans chaque email.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Check, Loader, MailX } from "lucide-react";
import api from "../../api/api";

export default function EmailPreferences() {
  const { t } = useTranslation("marketing");
  const { token } = useParams();
  const [p, setP] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = `${t("prefs_title")} — DevOpsAkademy`;
    api.get(`/marketing/preferences/${token}`).then((r) => setP(r.data.data)).catch(() => setP(null));
  }, [token, t]);

  const save = async (next) => {
    setBusy(true); setSaved(false);
    try { await api.put(`/marketing/preferences/${token}`, next); setP((x) => ({ ...x, ...next })); setSaved(true); }
    catch { /* le message d'erreur générique suffit */ }
    finally { setBusy(false); }
  };
  const toggle = (k) => save({ newsletter: p.newsletter, promotions: p.promotions, events: p.events, unsubscribed_all: false, [k]: !p[k] });

  if (p === undefined) return <div className="flex justify-center py-24"><Loader className="w-7 h-7 animate-spin text-primary" /></div>;
  if (!p) return (
    <div className="max-w-md mx-auto py-24 px-6 text-center">
      <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
      <p className="font-bold text-gray-800">{t("prefs_invalid")}</p>
      <Link to="/" className="inline-block mt-4 text-sm font-bold text-primary">{t("prefs_home")}</Link>
    </div>
  );

  const rows = [["newsletter", t("pref_newsletter"), t("pref_newsletter_hint")], ["promotions", t("pref_promotions"), t("pref_promotions_hint")], ["events", t("pref_events"), t("pref_events_hint")]];
  return (
    <div className="max-w-lg mx-auto py-14 px-6 text-left">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-accent" />
        <div className="p-8 space-y-5">
          <div>
            <h1 className="text-xl font-black text-gray-900">{t("prefs_title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{p.email}</p>
          </div>
          {p.unsubscribed_all && <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2"><MailX className="w-4 h-4 mt-0.5 shrink-0" />{t("prefs_unsubscribed")}</div>}
          <ul className="divide-y divide-gray-100">
            {rows.map(([k, label, hint]) => (
              <li key={k} className="py-3 flex items-center justify-between gap-4">
                <div><p className="text-sm font-semibold text-gray-900">{label}</p><p className="text-xs text-gray-500">{hint}</p></div>
                <button type="button" role="switch" aria-checked={!!p[k] && !p.unsubscribed_all} disabled={busy || p.kind === "contact"} onClick={() => toggle(k)}
                  className={`relative w-11 h-6 rounded-full transition shrink-0 ${p[k] && !p.unsubscribed_all ? "bg-primary" : "bg-gray-300"} disabled:opacity-60`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${p[k] && !p.unsubscribed_all ? "translate-x-5" : ""}`} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 pt-2">
            {p.unsubscribed_all
              ? <button type="button" disabled={busy} onClick={() => save({ newsletter: true, promotions: true, events: true, unsubscribed_all: false })} className="text-sm font-bold text-primary bg-transparent hover:underline">{t("prefs_resubscribe")}</button>
              : <button type="button" disabled={busy} onClick={() => save({ newsletter: false, promotions: false, events: false, unsubscribed_all: true })} className="text-sm font-bold text-red-600 bg-transparent hover:underline">{t("prefs_unsubscribe_all")}</button>}
            {saved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" />{t("saved")}</span>}
          </div>
          <p className="text-[11px] text-gray-400">{t("prefs_transactional")}</p>
        </div>
      </div>
    </div>
  );
}
