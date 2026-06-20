import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  Mail, Phone, MapPin, Send, Loader, CheckCircle,
  AlertCircle, MessageSquare, Clock, ArrowRight,
  Github, Linkedin, Youtube
} from "lucide-react";

const SUBJECTS = [
  "Question sur un cours",
  "Problème technique",
  "Partenariat / collaboration",
  "Demande de formation sur mesure",
  "Facturation / paiement",
  "Devenir instructeur",
  "Autre",
];

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "devopseduque@gmail.com",
    href: "mailto:devopseduque@gmail.com",
    color: "bg-[#2d287f]/10 text-[#2d287f]",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+237 6 20 33 53 34",
    href: "tel:+237620335334",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: MapPin,
    label: "Localisation",
    value: "Douala, Cameroun",
    href: null,
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Clock,
    label: "Délai de réponse",
    value: "Sous 24 à 48h ouvrées",
    href: null,
    color: "bg-sky-100 text-sky-700",
  },
];

const SOCIALS = [
  { icon: Youtube,  label: "YouTube",  href: "https://youtube.com/@devopsakademy", color: "#FF0000" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/devopsakademy", color: "#0A66C2" },
  { icon: Github,   label: "GitHub",   href: "https://github.com/devopsakademy", color: "#333" },
];

const FAQ = [
  {
    q: "Les cours sont-ils accessibles à vie ?",
    a: "Oui — une fois inscrit, vous avez un accès illimité au cours, y compris aux futures mises à jour.",
  },
  {
    q: "Les certificats sont-ils reconnus ?",
    a: "Nos certificats sont numériques et vérifiables via un lien unique. Ils sont valorisés par de nombreux recruteurs tech.",
  },
  {
    q: "Puis-je payer en Mobile Money ?",
    a: "Oui — nous acceptons MTN Mobile Money, Orange Money et Wave. Vous uploadez votre preuve de paiement depuis la plateforme.",
  },
];

export default function Contact() {
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
      setError("Une erreur est survenue. Veuillez réessayer ou nous écrire directement par email.");
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
            <MessageSquare className="w-4 h-4" /> Nous sommes à votre écoute
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            Contactez <span className="text-[#facc15]">DevOpsAkademy</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Question, partenariat ou besoin spécifique ?<br />
            Notre équipe vous répond sous 24 à 48h.
          </p>
        </div>
      </section>

      {/* ── Corps principal ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* ── Colonne gauche : infos + FAQ ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Infos contact */}
            <div>
              <h2 className="text-lg font-black text-[#1f1b5a] mb-5">Nos coordonnées</h2>
              <div className="space-y-3">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:bg-white hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-[#1f1b5a] hover:text-[#2d287f] transition truncate block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-[#1f1b5a]">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h2 className="text-lg font-black text-[#1f1b5a] mb-4">Suivez-nous</h2>
              <div className="flex gap-3">
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
              <h2 className="text-lg font-black text-[#1f1b5a] mb-4">Questions fréquentes</h2>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
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
              <h2 className="text-2xl font-black text-[#1f1b5a] mb-2">Envoyez-nous un message</h2>
              <p className="text-gray-400 text-sm mb-8">Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nom + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      placeholder="jean@example.com"
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
                    Sujet *
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => set("subject", e.target.value)}
                    required
                    className={inputCls + " cursor-pointer"}>
                    <option value="">Sélectionnez un sujet…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Décrivez votre demande en détail…"
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
                    ? <><Loader className="w-5 h-5 animate-spin" /> Envoi en cours…</>
                    : <><Send className="w-5 h-5" /> Envoyer le message</>
                  }
                </button>

                <p className="text-xs text-gray-400 text-center">
                  En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour vous répondre.
                </p>
              </form>
            </div>

            {/* CTA secondaire */}
            <div className="mt-6 p-5 bg-[#2d287f]/5 border border-[#2d287f]/15 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2d287f]/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#2d287f]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1f1b5a]">Vous avez une urgence ?</p>
                <p className="text-xs text-gray-500">Écrivez-nous directement sur <a href="mailto:devopseduque@gmail.com" className="text-[#2d287f] font-semibold hover:underline">devopseduque@gmail.com</a></p>
              </div>
              <Link to="/courses"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#2d287f] hover:gap-2.5 transition-all">
                Voir nos cours <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}