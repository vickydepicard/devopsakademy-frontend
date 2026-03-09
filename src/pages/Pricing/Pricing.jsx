import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Check, X, Zap, Crown, Star, ArrowRight,
  Shield, Clock, Users, Award, ChevronDown
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    slug: "free",
    badge: null,
    priceMonthly: 0,
    priceYearly: 0,
    description: "Pour découvrir DevOpsAkademy et débuter votre parcours DevOps.",
    color: "from-gray-400 to-gray-500",
    borderColor: "border-gray-200",
    features: [
      { text: "Accès aux cours gratuits", included: true },
      { text: "Forum communautaire", included: true },
      { text: "Certificats de complétion", included: false },
      { text: "Cours premium illimités", included: false },
      { text: "Labs interactifs", included: false },
      { text: "Support prioritaire", included: false },
      { text: "Téléchargement des ressources", included: false },
    ],
    cta: "Commencer gratuitement",
    ctaLink: "/register",
    ctaStyle: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    badge: "Populaire",
    priceMonthly: 9900,
    priceYearly: 89000,
    description: "L'essentiel pour progresser rapidement et obtenir vos certifications.",
    color: "from-primary to-primary-light",
    borderColor: "border-primary",
    features: [
      { text: "Accès aux cours gratuits", included: true },
      { text: "Forum communautaire", included: true },
      { text: "Certificats de complétion", included: true },
      { text: "Cours premium illimités", included: true },
      { text: "Labs interactifs", included: true },
      { text: "Support prioritaire", included: false },
      { text: "Téléchargement des ressources", included: false },
    ],
    cta: "Démarrer avec Pro",
    ctaLink: "/register",
    ctaStyle: "bg-gradient-primary text-white shadow-glow-primary hover:-translate-y-1",
  },
  {
    id: "elite",
    name: "Élite",
    slug: "elite",
    badge: "Meilleure valeur",
    priceMonthly: 19900,
    priceYearly: 179000,
    description: "Accès total, support dédié et ressources exclusives pour aller le plus loin.",
    color: "from-accent to-yellow-500",
    borderColor: "border-accent",
    features: [
      { text: "Accès aux cours gratuits", included: true },
      { text: "Forum communautaire", included: true },
      { text: "Certificats de complétion", included: true },
      { text: "Cours premium illimités", included: true },
      { text: "Labs interactifs", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Téléchargement des ressources", included: true },
    ],
    cta: "Passer en Élite",
    ctaLink: "/register",
    ctaStyle: "bg-gradient-to-r from-accent to-yellow-500 text-primary-dark font-bold shadow-glow-accent hover:-translate-y-1",
  },
];

const faqs = [
  {
    q: "Comment fonctionne le paiement ?",
    a: "Nous acceptons les paiements via Mobile Money (Orange Money, MTN MoMo), virement bancaire et d'autres méthodes locales. Après soumission de votre preuve de paiement, un administrateur valide votre accès sous 24h.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui. Vous pouvez annuler votre abonnement depuis votre espace personnel. L'accès reste actif jusqu'à la fin de la période déjà payée.",
  },
  {
    q: "Les prix sont-ils en FCFA ?",
    a: "Oui, tous les prix sont affichés en Francs CFA (XAF). Nous adaptons nos tarifs aux marchés d'Afrique centrale et de l'Ouest.",
  },
  {
    q: "Y a-t-il un essai gratuit ?",
    a: "Le plan Gratuit est permanent. Il vous donne accès aux cours gratuits sans limite de temps pour tester la plateforme.",
  },
  {
    q: "Que contient un 'lab interactif' ?",
    a: "Ce sont des environnements Docker/K8s préconfigurés accessibles directement depuis votre navigateur. Vous exécutez de vrais commandes sur de vraies infrastructures.",
  },
];

const formatPrice = (price) => {
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
};

export default function Pricing() {
  const { user } = useAuth();
  const [billing, setBilling] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = "Tarifs — DevOpsAkademy";
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm font-semibold mb-6">
            <Crown className="w-4 h-4" />
            Tarifs adaptés au marché africain
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4">
            Investissez dans votre carrière
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Des plans flexibles, des prix locaux, un accès mondial aux meilleures formations DevOps.
          </p>

          {/* Toggle billing */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                billing === "monthly"
                  ? "bg-white text-primary-dark shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                billing === "yearly"
                  ? "bg-white text-primary-dark shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-accent text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => {
            const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isPopular = plan.badge === "Populaire";
            const isBest = plan.badge === "Meilleure valeur";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 ${plan.borderColor} p-8 transition-all duration-300 hover:-translate-y-2 ${
                  isPopular ? "shadow-glow-primary scale-105" : isBest ? "shadow-glow-accent" : "shadow-soft"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    isBest ? "bg-accent text-primary-dark" : "bg-gradient-primary text-white"
                  }`}>
                    {isBest ? <span className="flex items-center gap-1"><Crown className="w-3 h-3" />{plan.badge}</span> : plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  {i === 0 ? <Shield className="w-6 h-6 text-white" /> :
                   i === 1 ? <Zap className="w-6 h-6 text-white" /> :
                   <Crown className="w-6 h-6 text-white" />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </span>
                  </div>
                  {price > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {billing === "yearly" ? "par an, facturé annuellement" : "par mois"}
                    </p>
                  )}
                  {billing === "yearly" && plan.priceYearly > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Économisez {formatPrice(plan.priceMonthly * 12 - plan.priceYearly)} vs mensuel
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={user ? "/subscriptions" : plan.ctaLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm transition-all duration-300 mb-6 ${plan.ctaStyle}`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map(({ text, included }) => (
                    <li key={text} className={`flex items-start gap-3 text-sm ${included ? "text-gray-700" : "text-gray-400"}`}>
                      {included
                        ? <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        : <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                      }
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GARANTIES ── */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: "Paiement sécurisé", desc: "Vos transactions sont protégées. Validation manuelle par notre équipe." },
              { icon: Clock, title: "Activation sous 24h", desc: "Votre accès est activé après vérification de votre preuve de paiement." },
              { icon: Users, title: "Support humain", desc: "Un vrai humain répond à vos questions. Pas un chatbot." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-display">Questions fréquentes</h2>
          <p className="text-gray-500 mt-3">Tout ce que vous devez savoir avant de vous abonner.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  <p className="pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            D'autres questions ?{" "}
            <Link to="/contact" className="text-primary font-medium hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}