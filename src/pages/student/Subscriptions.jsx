import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Crown, CheckCircle, Clock, XCircle, ArrowRight,
  CreditCard, Calendar, History, Upload, Shield,
  Star, Zap, AlertCircle, ExternalLink
} from "lucide-react";

const PLAN_COLORS = {
  free:  { gradient: "from-gray-400 to-gray-500",     badge: "bg-gray-100 text-gray-700" },
  pro:   { gradient: "from-primary to-primary-light", badge: "bg-primary/10 text-primary" },
  elite: { gradient: "from-accent to-yellow-500",     badge: "bg-accent/10 text-yellow-700" },
};

const STATUS_CONFIG = {
  active:    { label: "Actif",       color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, dot: "bg-emerald-500" },
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700",   icon: Clock,        dot: "bg-yellow-500" },
  cancelled: { label: "Annulé",      color: "bg-gray-100 text-gray-600",       icon: XCircle,      dot: "bg-gray-400"  },
  expired:   { label: "Expiré",      color: "bg-red-100 text-red-600",         icon: AlertCircle,  dot: "bg-red-500"   },
};

const plans = [
  {
    slug: "pro",
    name: "Pro",
    priceMonthly: 9900,
    priceYearly: 89000,
    features: ["Cours premium illimités", "Labs interactifs", "Certificats de complétion"],
    icon: Zap,
    color: "from-primary to-primary-light",
  },
  {
    slug: "elite",
    name: "Élite",
    priceMonthly: 19900,
    priceYearly: 179000,
    features: ["Tout du plan Pro", "Support prioritaire", "Téléchargement des ressources"],
    icon: Crown,
    color: "from-accent to-yellow-500",
    recommended: true,
  },
];

const fmt = (n) => n ? new Intl.NumberFormat("fr-FR").format(n) + " FCFA" : "Gratuit";

export default function Subscriptions() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("current"); // current | plans | history
  const [billing, setBilling] = useState("monthly");
  const [subscribing, setSubscribing] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    document.title = "Mes abonnements — DevOpsAkademy";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, histRes] = await Promise.allSettled([
        api.get("/subscriptions/my"),
        api.get("/subscriptions/history"),
      ]);
      if (subRes.status === "fulfilled") setSub(subRes.value.data?.data || null);
      if (histRes.status === "fulfilled") setHistory(histRes.value.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleSubscribe = async (planSlug) => {
    setSubscribing(planSlug);
    try {
      let proofUrl = null;
      if (proofFile) {
        const fd = new FormData();
        fd.append("proof", proofFile);
        const up = await api.post("/payments/upload-proof", fd, { headers: { "Content-Type": "multipart/form-data" } });
        proofUrl = up.data?.data?.url;
      }
      await api.post("/subscriptions/subscribe", {
        plan_slug: planSlug,
        billing_period: billing,
        payment_proof_url: proofUrl,
      });
      await fetchData();
      setTab("current");
      alert("✅ Souscription enregistrée ! Un administrateur validera votre paiement sous 24h.");
    } catch (err) {
      alert("❌ Erreur lors de la souscription. Veuillez réessayer.");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!sub || !window.confirm("Annuler votre abonnement ? L'accès reste actif jusqu'à la fin de la période.")) return;
    setCancelling(true);
    try {
      await api.post(`/subscriptions/${sub.id}/cancel`);
      await fetchData();
    } catch {
      alert("Erreur lors de l'annulation.");
    } finally {
      setCancelling(false);
    }
  };

  const statusCfg = sub ? (STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes abonnements</h1>
            <p className="text-gray-500 mt-1">Gérez votre plan et votre historique de paiements</p>
          </div>
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            Voir tous les tarifs <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-8 w-fit">
          {[
            { key: "current", label: "Mon plan" },
            { key: "plans", label: "Changer de plan" },
            { key: "history", label: "Historique" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === key ? "bg-white text-primary shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB : MON PLAN ── */}
        {tab === "current" && (
          <div className="space-y-5">
            {sub && sub.status !== "expired" ? (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
                {/* Banner plan */}
                <div className={`bg-gradient-to-r ${PLAN_COLORS[sub.plan_slug]?.gradient || "from-primary to-primary-light"} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Plan actuel</p>
                      <h2 className="text-2xl font-bold">{sub.plan_name || "Pro"}</h2>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg?.color || ""}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot || ""}`} />
                        {statusCfg?.label || "Inconnu"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails */}
                <div className="p-6 grid sm:grid-cols-3 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Début</p>
                    <p className="font-semibold text-gray-900">
                      {sub.start_date ? new Date(sub.start_date).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Fin</p>
                    <p className="font-semibold text-gray-900">
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Renouvellement</p>
                    <p className={`font-semibold ${sub.auto_renew ? "text-emerald-600" : "text-gray-400"}`}>
                      {sub.auto_renew ? "Automatique" : "Manuel"}
                    </p>
                  </div>
                </div>

                {/* Pending info */}
                {sub.status === "pending" && (
                  <div className="mx-6 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                    <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">Validation en cours</p>
                      <p className="text-xs text-yellow-600 mt-0.5">
                        Notre équipe vérifie votre paiement. Accès activé sous 24h.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3 flex-wrap">
                  <button
                    onClick={() => setTab("plans")}
                    className="flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition text-sm shadow-md"
                  >
                    <Crown className="w-4 h-4" /> Changer de plan
                  </button>
                  {sub.status === "active" && (
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 px-5 rounded-xl transition text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancelling ? "Annulation…" : "Annuler l'abonnement"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Pas d'abonnement actif */
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Gratuit</h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  Vous utilisez le plan gratuit. Passez à Pro ou Élite pour accéder aux cours premium.
                </p>
                <button
                  onClick={() => setTab("plans")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-3 px-8 rounded-full hover:-translate-y-0.5 transition shadow-md"
                >
                  <Crown className="w-4 h-4" /> Passer à Premium <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB : PLANS ── */}
        {tab === "plans" && (
          <div>
            {/* Toggle billing */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                {["monthly", "yearly"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition relative ${
                      billing === b ? "bg-white shadow-md text-primary" : "text-gray-500"
                    }`}
                  >
                    {b === "monthly" ? "Mensuel" : "Annuel"}
                    {b === "yearly" && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">-25%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload preuve */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">Preuve de paiement (optionnel)</p>
                <p className="text-xs text-blue-600 mb-2">Si vous avez déjà effectué un virement, joignez la capture ici.</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="text-xs text-blue-700"
                />
              </div>
            </div>

            {/* Cards plans */}
            <div className="grid sm:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
                const Icon = plan.icon;
                const isCurrent = sub?.plan_slug === plan.slug && sub?.status === "active";
                return (
                  <div
                    key={plan.slug}
                    className={`bg-white border-2 rounded-2xl p-6 relative transition hover:-translate-y-1 ${
                      plan.recommended ? "border-accent shadow-glow-accent" : "border-gray-200 shadow-soft"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark text-xs font-bold px-4 py-1 rounded-full">
                        ⭐ Recommandé
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">{fmt(price)}</span>
                      <span className="text-gray-400 text-sm ml-1">/ {billing === "yearly" ? "an" : "mois"}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.slug)}
                      disabled={!!subscribing || isCurrent}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : plan.recommended
                          ? "bg-gradient-to-r from-accent to-yellow-500 text-primary-dark hover:shadow-md hover:-translate-y-0.5"
                          : "bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {subscribing === plan.slug ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : isCurrent ? (
                        "Plan actuel"
                      ) : (
                        <><Crown className="w-4 h-4" /> Souscrire</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Paiement vérifié manuellement sous 24h · Accès annulable à tout moment
            </p>
          </div>
        )}

        {/* ── TAB : HISTORIQUE ── */}
        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun paiement enregistré</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Historique des paiements</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {history.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          payment.status === "verified" ? "bg-emerald-50" : payment.status === "pending" ? "bg-yellow-50" : "bg-gray-50"
                        }`}>
                          {payment.status === "verified"
                            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                            : payment.status === "pending"
                            ? <Clock className="w-5 h-5 text-yellow-500" />
                            : <XCircle className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{payment.plan_name || "Abonnement"}</p>
                          <p className="text-xs text-gray-400">
                            {payment.billing_period === "yearly" ? "Annuel" : "Mensuel"} ·{" "}
                            {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{fmt(payment.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          payment.status === "verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {payment.status === "verified" ? "Vérifié" : payment.status === "pending" ? "En attente" : "Rejeté"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}