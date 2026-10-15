// Inscription à la newsletter (visiteurs sans compte) — double confirmation par email.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Mail } from "lucide-react";
import api from "../../api/api";

export default function NewsletterForm() {
  const { t, i18n } = useTranslation("marketing");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");   // champ piège pour les robots
  const [state, setState] = useState("idle");   // idle | busy | pending | subscribed | error
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy"); setMsg("");
    try {
      const r = await api.post("/marketing/subscribe", { email: email.trim(), website, lang: (i18n.resolvedLanguage || "fr").startsWith("en") ? "en" : "fr" });
      setState(r.data?.data?.status === "subscribed" ? "subscribed" : "pending");
      setEmail("");
    } catch (err) { setState("error"); setMsg(err?.response?.data?.message || t("nl_error")); }
  };

  return (
    <div className="mt-5 max-w-xs">
      <p className="text-white text-sm font-semibold mb-2 flex items-center gap-1.5"><Mail className="w-4 h-4 text-accent" />{t("nl_title")}</p>
      {state === "pending" && <p className="text-sm text-emerald-300">{t("nl_pending")}</p>}
      {state === "subscribed" && <p className="text-sm text-emerald-300">{t("nl_subscribed")}</p>}
      {state !== "pending" && state !== "subscribed" && (
        <form onSubmit={submit} className="flex gap-2">
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("nl_placeholder")} aria-label={t("nl_placeholder")}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent" />
          <button type="submit" disabled={state === "busy"} className="px-3 py-2 rounded-lg text-sm font-bold bg-accent text-primary-dark disabled:opacity-60">
            {state === "busy" ? <Loader className="w-4 h-4 animate-spin" /> : t("nl_button")}
          </button>
        </form>
      )}
      {state === "error" && <p className="text-xs text-red-300 mt-1">{msg}</p>}
      <p className="text-[11px] text-gray-400 mt-1.5">{t("nl_consent")}</p>
    </div>
  );
}
