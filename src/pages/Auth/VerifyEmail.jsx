import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/api";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    if (token) verify();
    else setStatus("error");
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center space-y-6">

        {status === "loading" && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <Loader className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Vérification en cours…</h2>
            <p className="text-gray-500 text-sm">Veuillez patienter quelques instants.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email vérifié !</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Votre adresse email a bien été confirmée. Vous pouvez maintenant accéder à toutes les fonctionnalités de DevOpsAkademy.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition text-sm"
            >
              Se connecter
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Lien invalide</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Ce lien de vérification est invalide ou a expiré. Reconnectez-vous pour recevoir un nouveau lien.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition text-sm"
              >
                Se connecter
              </Link>
              <Link
                to="/contact"
                className="w-full py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition text-sm"
              >
                Contacter le support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}