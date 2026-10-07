import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  Mail, Phone, MapPin, Send, Loader, CheckCircle,
  AlertCircle, MessageSquare, Clock, ArrowRight,
  Github, Linkedin, Youtube
} from "lucide-react";
import { useTranslation } from "react-i18next";

// La valeur envoyée à l'API reste en français (lue par l'équipe) ; seul le libellé est traduit.
const SUBJECTS = [
  { key: "course", value: "Question sur un cours" },
  { key: "technical", value: "Problème technique" },
  { key: "partnership", value: "Partenariat / collaboration" },
  { key: "custom", value: "Demande de formation sur mesure" },
  { key: "billing", value: "Facturation / paiement" },
  { key: "instructor", value: "Devenir instructeur" },
  { key: "other", value: "Autre" },
];

const CONTACT_INFO = [
  { icon: Mail, key: "email", value: "contact@devopsakademy.cloud", href: "mailto:contact@devopsakademy.cloud", color: "bg-[#2d287f]/10 text-[#2d287f]" },
  { icon: Phone, key: "phone", value: "+237 6 20 33 53 34", href: "tel:+237620335334", color: "bg-emerald-100 text-emerald-700" },
  { icon: MapPin, key: "location", valueKey: "info.locationValue", href: null, color: "bg-amber-100 text-amber-700" },
  { icon: Clock, key: "response", valueKey: "info.responseValue", href: null, color: "bg-sky-100 text-sky-700" },
];

const SOCIALS = [
  { icon: Youtube,  label: "YouTube",  href: "https://youtube.com/@devopsakademy", color: "#FF0000" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/devopsakademy", color: "#0A66C2" },
  { icon: Github,   label: "GitHub",   href: "https://github.com/devopsakademy", color: "#333" },
];


export default function Contact() {
  const { t, i18n } = useTranslation("contact");
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [form, setForm] = useState({
    name:    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
    email:   user?.email || "",
    subject: "",
    message: "",
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [openFaq,  setOpenFaq]  = useState(null);

  useEffect(() => { document.title = t("meta.title"); }, [t, i18n.language]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/contacts", form);
      if (res.data?.success) {
        navigate("/contact/success");
      } else {
        throw new Error();
      }
    } catch {
      setError(t("form.error"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d287f]/30 focus:border-[#2d287f] transition bg-white";

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] text-white py-20">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-[#facc15]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15]/15 border border-[#facc15]/30 rounded-full text-[#facc15] text-sm font-bold mb-6">
            <MessageSquare className="w-4 h-4" /> {t("hero.badge")}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            {t("hero.titleStart")} <span className="text-[#facc15]">DevOpsAkademy</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            {t("hero.subtitle1")}<br />
            {t("hero.subtitle2")}
          </p>
        </div>
      </section>

      {/* ── Corps principal ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* ── Colonne gauche : infos + FAQ ── */}
          <div className="lg:col-span-2 space-y-8 min-w-0">

            {/* Infos contact */}
            <div>
              <h2 className="text-lg font-black text-[#1f1b5a] mb-5">{t("info.title")}</h2>
              <div className="space-y-3">
                {CONTACT_INFO.map(({ icon: Icon, key, value, valueKey, href, color }) => (
                  <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:bg-white hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{t(`info.${key}`)}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-[#1f1b5a] hover:text-[#2d287f] transition truncate block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-[#1f1b5a]">{valueKey ? t(valueKey) : value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h2 className="text-lg font-black text-[#1f1b5a] mb-4">{t("social.title")}</h2>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map(({ icon: Icon, label, href, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                    style={{ borderLeftColor: color, borderLeftWidth: "3px" }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-lg font-black text-[#1f1b5a] mb-4">{t("faq.title")}</h2>
              <div className="space-y-2">
                {t("faq.items", { returnObjects: true }).map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition">
                      <span className="text-sm font-semibold text-[#1f1b5a] pr-4">{item.q}</span>
                      <span className={`text-[#2d287f] transition-transform duration-200 shrink-0 ${openFaq === i ? "rotate-45" : ""}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-[#1f1b5a] mb-2">{t("form.title")}</h2>
              <p className="text-gray-400 text-sm mb-8">{t("form.subtitle")}</p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nom + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      {t("form.name")} *
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.namePlaceholder")}
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      {t("form.email")} *
                    </label>
                    <input
                      type="email"
                      placeholder={t("form.emailPlaceholder")}
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Sujet — select */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    {t("form.subject")} *
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => set("subject", e.target.value)}
                    required
                    className={inputCls + " cursor-pointer"}>
                    <option value="">{t("form.subjectPlaceholder")}</option>
                    {SUBJECTS.map(s => <option key={s.key} value={s.value}>{t(`subjects.${s.key}`)}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    {t("form.message")} *
                  </label>
                  <textarea
                    rows={6}
                    placeholder={t("form.messagePlaceholder")}
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    required
                    maxLength={2000}
                    className={inputCls + " resize-none"}
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{form.message.length}/2000</p>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.subject || !form.message}
                  className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                  {loading
                    ? <><Loader className="w-5 h-5 animate-spin" /> {t("form.sending")}</>
                    : <><Send className="w-5 h-5" /> {t("form.submit")}</>
                  }
                </button>

                <p className="text-xs text-gray-400 text-center">
                  {t("form.consent")}
                </p>
              </form>
            </div>

            {/* CTA secondaire */}
            <div className="mt-6 p-5 bg-[#2d287f]/5 border border-[#2d287f]/15 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="w-10 h-10 bg-[#2d287f]/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#2d287f]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1f1b5a]">{t("urgent.title")}</p>
                <p className="text-xs text-gray-500">{t("urgent.text")} <a href="mailto:contact@devopsakademy.cloud" className="text-[#2d287f] font-semibold hover:underline break-all">contact@devopsakademy.cloud</a></p>
              </div>
              <Link to="/courses"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#2d287f] hover:gap-2.5 transition-all">
                {t("urgent.seeCourses")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}