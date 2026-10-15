// Bloc d'inscription à la newsletter (accueil et page /newsletter) : double confirmation par email.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gift, Loader, Mail, Video } from "lucide-react";
import api from "../../api/api";

export function NewsletterCard({ source = "home" }) {
  const { t, i18n } = useTranslation("marketing");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setState("busy"); setMsg("");
    try {
      const r = await api.post("/marketing/subscribe", { email: email.trim(), first_name: name.trim(), website, source, lang: (i18n.resolvedLanguage || "fr").startsWith("en") ? "en" : "fr" });
      setState(r.data?.data?.status === "subscribed" ? "subscribed" : "pending");
    } catch (err) { setState("error"); setMsg(err?.response?.data?.message || t("nl_error")); }
  };

  if (state === "pending" || state === "subscribed") {
    return <p className="text-center text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-2xl p-5">{state === "pending" ? t("nl_pending") : t("nl_subscribed")}</p>;
  }
  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder={t("first_name")} aria-label={t("first_name")}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm text-gray-900 bg-white" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("nl_placeholder")} aria-label={t("nl_placeholder")}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm text-gray-900 bg-white" />
      </div>
      <button type="submit" disabled={state === "busy"} className="w-full py-3 rounded-xl text-white font-black bg-primary hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
        {state === "busy" ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}{t("nl_button")}
      </button>
      {state === "error" && <p className="text-sm text-red-600">{msg}</p>}
      <p className="text-[11px] text-gray-400 text-center">{t("nl_consent")} <Link to="/privacy-policy" className="underline">{t("nl_privacy")}</Link></p>
    </form>
  );
}

export default function NewsletterSection() {
  const { t } = useTranslation("marketing");
  return (
    <section className="py-16 bg-gradient-to-br from-primary-dark via-primary to-primary-700 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-black mb-3">{t("nl_section_title")}</h2>
        <p className="text-white/75 mb-8">{t("nl_section_subtitle")}</p>
        <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900"><NewsletterCard source="home" /></div>
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-white/80">
          <span className="inline-flex items-center gap-2"><Gift className="w-4 h-4" />{t("nl_perk_offers")}</span>
          <span className="inline-flex items-center gap-2"><Video className="w-4 h-4" />{t("nl_perk_webinars")}</span>
          <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4" />{t("nl_perk_news")}</span>
        </div>
      </div>
    </section>
  );
}
