import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Award, Search, CheckCircle, XCircle, User,
  BookOpen, Calendar, ExternalLink, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CertificateVerify() {
  const { number } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(number || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | { found: true, cert } | { found: false }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/certificates/verify/${query.trim()}`);
      if (res.data?.success && res.data?.data) {
        setResult({ found: true, cert: res.data.data });
      } else {
        setResult({ found: false });
      }
    } catch {
      setResult({ found: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light">

      {/* ── Hero ── */}
      <div className="relative py-20 px-6 text-center text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-accent/20 border border-accent/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Award className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">
            Vérification de certificat
          </h1>
          <p className="text-white/75 text-lg mb-8">
            Entrez le numéro de certificat pour confirmer son authenticité.
          </p>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex : DAK-1717000000-abc123"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-accent focus:bg-white/20 transition text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-accent hover:bg-yellow-300 text-primary font-bold rounded-full transition flex items-center gap-2 shadow-md disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Vérifier
            </button>
          </form>
        </div>
      </div>

      {/* ── Résultat ── */}
      <div className="max-w-2xl mx-auto px-6 pb-20">

        {/* Certificat trouvé */}
        {result?.found && (
          <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
            {/* Header vert */}
            <div className="bg-emerald-500 text-white px-6 py-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Certificat authentique</p>
                <p className="text-emerald-100 text-sm">Ce certificat est valide et a été émis par DevOpsAkademy</p>
              </div>
            </div>

            {/* Détails */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {result.cert.first_name?.[0]}{result.cert.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {result.cert.first_name} {result.cert.last_name}
                  </h2>
                  <p className="text-gray-500 text-sm">a complété avec succès</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Formation</p>
                    <p className="font-semibold">{result.cert.course_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Délivré le</p>
                    <p className="font-semibold">
                      {new Date(result.cert.issued_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Numéro de certificat</p>
                    <p className="font-mono font-semibold text-primary">{result.cert.certificate_number}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50">
              <p className="text-xs text-gray-400">Émis par DevOpsAkademy — Plateforme de formation DevOps</p>
              <Link to="/courses" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                Voir nos cours <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Certificat non trouvé */}
        {result?.found === false && (
          <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
            <div className="bg-red-500 text-white px-6 py-4 flex items-center gap-3">
              <XCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Certificat introuvable</p>
                <p className="text-red-100 text-sm">Ce numéro ne correspond à aucun certificat valide</p>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Vérifiez que le numéro est correct et complet. Les certificats sont au format{" "}
                <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">DAK-XXXXXXXXXX-XXXXXX</code>.
              </p>
              <p className="text-sm text-gray-400">
                Un problème ?{" "}
                <Link to="/contact" className="text-primary font-medium hover:underline">
                  Contactez notre support
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* État initial */}
        {!result && !loading && (
          <div className="text-center text-white/50 text-sm mt-4">
            <p>Entrez un numéro de certificat pour commencer la vérification.</p>
          </div>
        )}
      </div>
    </div>
  );
}