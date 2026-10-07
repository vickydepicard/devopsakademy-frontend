import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Check, X, Zap, Crown, Star, ArrowRight,
  Shield, Clock, Users, Award, ChevronDown
} from "lucide-react";
import { useTranslation } from "react-i18next";

const plans = [
  {
    id: "free",
    priceMonthly: 0,
    priceYearly: 0,
    color: "from-gray-400 to-gray-500",
    borderColor: "border-gray-200",
    features: [
      { key: "freeCourses", included: true },
      { key: "forum", included: true },
      { key: "certificates", included: false },
      { key: "premium", included: false },
      { key: "labs", included: false },
      { key: "support", included: false },
      { key: "downloads", included: false },
    ],
    ctaLink: "/register",
    ctaStyle: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
  },
  {
    id: "pro",
    badge: "popular",
    priceMonthly: 9900,
    priceYearly: 89000,
    color: "from-primary to-primary-light",
    borderColor: "border-primary",
    features: [
      { key: "freeCourses", included: true },
      { key: "forum", included: true },
      { key: "certificates", included: true },
      { key: "premium", included: true },
      { key: "labs", included: true },
      { key: "support", included: false },
      { key: "downloads", included: false },
    ],
    ctaLink: "/register",
    ctaStyle: "bg-gradient-primary text-white shadow-glow-primary hover:-translate-y-1",
  },
  {
    id: "elite",
    badge: "best",
    priceMonthly: 19900,
    priceYearly: 179000,
    color: "from-accent to-yellow-500",
    borderColor: "border-accent",
    features: [
      { key: "freeCourses", included: true },
      { key: "forum", included: true },
      { key: "certificates", included: true },
      { key: "premium", included: true },
      { key: "labs", included: true },
      { key: "support", included: true },
      { key: "downloads", included: true },
    ],
    ctaLink: "/register",
    ctaStyle: "bg-gradient-to-r from-accent to-yellow-500 text-primary-dark font-bold shadow-glow-accent hover:-translate-y-1",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation("pricing");
  const formatPrice = (price) =>
    price === 0 ? t("free") : `${new Intl.NumberFormat(i18n.language).format(price)} ${t("currency")}`;
  const [billing, setBilling] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = t("meta.title");
  }, [t, i18n.language]);

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm font-semibold mb-6">
            <Crown className="w-4 h-4" />
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t("hero.subtitle")}
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
              {t("hero.monthly")}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                billing === "yearly"
                  ? "bg-white text-primary-dark shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t("hero.yearly")}
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
            const isPopular = plan.badge === "popular";
            const isBest = plan.badge === "best";

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
                    {isBest ? <span className="flex items-center gap-1"><Crown className="w-3 h-3" />{t(`plans.${plan.id}.badge`)}</span> : t(`plans.${plan.id}.badge`)}
                  </div>
                )}

                {/* Plan header */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  {i === 0 ? <Shield className="w-6 h-6 text-white" /> :
                   i === 1 ? <Zap className="w-6 h-6 text-white" /> :
                   <Crown className="w-6 h-6 text-white" />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{t(`plans.${plan.id}.name`)}</h3>
                <p className="text-sm text-gray-500 mb-5">{t(`plans.${plan.id}.description`)}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </span>
                  </div>
                  {price > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {billing === "yearly" ? t("perYear") : t("perMonth")}
                    </p>
                  )}
                  {billing === "yearly" && plan.priceYearly > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {t("save", { amount: formatPrice(plan.priceMonthly * 12 - plan.priceYearly) })}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={user ? "/subscriptions" : plan.ctaLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm transition-all duration-300 mb-6 ${plan.ctaStyle}`}
                >
                  {t(`plans.${plan.id}.cta`)} <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map(({ key, included }) => (
                    <li key={key} className={`flex items-start gap-3 text-sm ${included ? "text-gray-700" : "text-gray-400"}`}>
                      {included
                        ? <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        : <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                      }
                      <span>{t(`features.${key}`)}</span>
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
              { icon: Shield, key: "secure" },
              { icon: Clock, key: "activation" },
              { icon: Users, key: "support" },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{t(`guarantees.${key}.title`)}</h4>
                <p className="text-sm text-gray-500">{t(`guarantees.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-display">{t("faq.title")}</h2>
          <p className="text-gray-500 mt-3">{t("faq.subtitle")}</p>
        </div>
        <div className="space-y-3">
          {t("faq.items", { returnObjects: true }).map((faq, i) => (
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
            {t("faq.moreQuestions")}{" "}
            <Link to="/contact" className="text-primary font-medium hover:underline">
              {t("faq.contactUs")}
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}