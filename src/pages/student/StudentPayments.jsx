// src/pages/student/StudentPayments.jsx
// Page paiements de l'étudiant — historique + statuts + re-soumission
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PaymentModal from "../payment/PaymentModal";
import {
  CreditCard, Clock, CheckCircle, XCircle, Upload,
  RefreshCw, AlertCircle, FileText, Eye, ChevronDown
} from "lucide-react";
import { ProofButton } from "../payment/ProofViewer";

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" };

const STATUS = {
  free:     { label: "Gratuit",            bg: "bg-emerald-50",  tx: "text-emerald-700",  bd: "border-emerald-200",  icon: <CheckCircle className="w-4 h-4" /> },
  verified: { label: "Validé",             bg: "bg-emerald-50",  tx: "text-emerald-700",  bd: "border-emerald-200",  icon: <CheckCircle className="w-4 h-4" /> },
  pending:  { label: "En cours de vérif.", bg: "bg-amber-50",    tx: "text-amber-700",    bd: "border-amber-200",    icon: <Clock className="w-4 h-4" /> },
  rejected: { label: "Preuve rejetée",     bg: "bg-red-50",      tx: "text-red-700",      bd: "border-red-200",      icon: <XCircle className="w-4 h-4" /> },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtPrice = (p) => p ? Number(p).toLocaleString("fr-FR") + " XAF" : "Gratuit";

export default function StudentPayments() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [payModal,    setPayModal]    = useState(null); // course pour ré-soumettre
  const [uploading,   setUploading]   = useState(null);
  const [expanded,    setExpanded]    = useState(null);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) setEnrollments(data.data || []);
    } catch (err) {
      console.error("StudentPayments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtrer (uniquement les payants/en cours)
  const paid = enrollments.filter(e => e.payment_status !== "free" || e.price > 0);
  const filtered = filter === "all" ? paid
    : paid.filter(e => e.payment_status === filter);

  const stats = {
    all:      paid.length,
    pending:  paid.filter(e => e.payment_status === "pending").length,
    verified: paid.filter(e => e.payment_status === "verified").length,
    rejected: paid.filter(e => e.payment_status === "rejected").length,
    free:     enrollments.filter(e => e.payment_status === "free").length,
  };

  // ── Upload preuve ──────────────────────────────
  const handleResubmit = (enrollment) => {
    // Ouvrir le modal paiement complet pour re-soumettre
    setPayModal({
      id: enrollment.course_id,
      title: enrollment.title,
      price: enrollment.price,
      is_free: enrollment.is_free,
      thumbnail_url: enrollment.thumbnail_url,
      level: enrollment.level,
      duration_hours: enrollment.duration_hours,
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-8 h-8 animate-spin" style={{ color: C.light }} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: C.primary }}>
            Mes Paiements
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Historique et statuts de vos inscriptions payantes
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-600">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "all",      label: "Total",          val: stats.all,      color: C.primary },
          { key: "pending",  label: "En vérification",val: stats.pending,  color: "#d97706" },
          { key: "verified", label: "Validés",        val: stats.verified, color: "#059669" },
          { key: "rejected", label: "Refusés",        val: stats.rejected, color: "#dc2626" },
        ].map(s => (
          <button key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-2xl p-4 text-left border-2 transition-all hover:-translate-y-0.5
              ${filter === s.key ? "shadow-md" : "border-gray-100 bg-white hover:shadow-sm"}`}
            style={filter === s.key ? { borderColor: s.color, background: s.color + "10" } : {}}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Alerte preuve refusée */}
      {stats.rejected > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">
              {stats.rejected} preuve{stats.rejected > 1 ? "s" : ""} de paiement refusée{stats.rejected > 1 ? "s" : ""}
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              Cliquez sur "Renvoyer la preuve" pour re-soumettre avec une capture correcte.
            </p>
          </div>
        </div>
      )}

      {/* Alerte en attente */}
      {stats.pending > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">
              {stats.pending} paiement{stats.pending > 1 ? "s" : ""} en cours de vérification
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Délai habituel : 24 à 48h ouvrées. Vous serez notifié par email.
            </p>
          </div>
        </div>
      )}

      {/* Liste des paiements */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500">Aucun paiement dans cette catégorie</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === "all"
              ? "Inscrivez-vous à un cours payant pour voir vos paiements ici."
              : "Essayez un autre filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => {
            const st = STATUS[e.payment_status] || STATUS.pending;
            const isOpen = expanded === e.id;
            return (
              <div key={e.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">

                {/* Header carte */}
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-50">
                    {e.thumbnail_url
                      ? <img src={e.thumbnail_url} alt="" className="w-full h-full object-contain"
                          onError={ev => ev.target.style.display = "none"} />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-black text-indigo-300">
                            {(e.title || "?").slice(0,2).toUpperCase()}
                          </span>
                        </div>
                    }
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{e.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${st.bg} ${st.tx} ${st.bd}`}>
                        {st.icon} {st.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        Inscrit le {fmtDate(e.enrolled_at)}
                      </span>
                    </div>
                  </div>

                  {/* Prix + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-black text-sm" style={{ color: C.primary }}>
                      {fmtPrice(e.price)}
                    </span>

                    {/* Bouton selon statut */}
                    {e.payment_status === "rejected" && (
                      <button onClick={() => handleResubmit(e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                        <Upload className="w-3 h-3" /> Renvoyer la preuve
                      </button>
                    )}
                    {e.payment_status === "pending" && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                        <Clock className="w-3 h-3" /> En vérification
                      </span>
                    )}
                    {(e.payment_status === "verified" || e.payment_status === "free") && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle className="w-3 h-3" /> Accès actif
                      </span>
                    )}

                    {/* Toggle détails */}
                    <button onClick={() => setExpanded(isOpen ? null : e.id)}
                      className="text-gray-400 hover:text-gray-600 transition">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Détails dépliables */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Montant</p>
                        <p className="font-bold" style={{ color: C.primary }}>{fmtPrice(e.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Statut</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${st.bg} ${st.tx} ${st.bd}`}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Date d'inscription</p>
                        <p className="font-semibold text-gray-700">{fmtDate(e.enrolled_at)}</p>
                      </div>
                      {e.approved_at && (
                        <div>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Date de validation</p>
                          <p className="font-semibold text-gray-700">{fmtDate(e.approved_at)}</p>
                        </div>
                      )}
                      {e.payment_proof_url && (
                        <div className="col-span-2">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Preuve soumise</p>
                          <div className="flex gap-2 flex-wrap">
                            <ProofButton
                              url={e.payment_proof_url}
                              label="Voir la preuve"
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {e.payment_status === "rejected" && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-xs text-red-700 font-semibold mb-1">⚠️ Pourquoi c'est refusé ?</p>
                        <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                          <li>Montant incorrect ou non visible</li>
                          <li>Destinataire différent de DevOpsAkademy</li>
                          <li>Image floue ou tronquée</li>
                          <li>Transaction trop ancienne</li>
                        </ul>
                        <button onClick={() => handleResubmit(e)}
                          className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
                          style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                          <Upload className="w-3.5 h-3.5" /> Renvoyer une preuve correcte
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cours gratuits */}
      {filter === "all" && stats.free > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-emerald-800 mb-1">
            🎁 {stats.free} cours gratuit{stats.free > 1 ? "s" : ""} actif{stats.free > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-emerald-600">
            Ces cours ne nécessitent aucun paiement — accès immédiat.
          </p>
        </div>
      )}

      {/* Modal paiement pour re-soumission */}
      {payModal && (
        <PaymentModal
          course={payModal}
          onClose={() => setPayModal(null)}
          onSuccess={() => { setPayModal(null); load(); }}
        />
      )}
    </div>
  );
}