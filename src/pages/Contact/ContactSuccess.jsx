import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white px-6">
      <div className="text-center bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-lg w-full">
        <CheckCircle size={72} className="text-green-400 mx-auto mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold mb-4">Message envoyé avec succès !</h1>
        <p className="text-gray-200 text-lg mb-6">
          Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-accent text-primary font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-accent-light transition"
        >
          Retour à l'accueil
        </button>
        <p className="text-sm text-gray-300 mt-4">Redirection automatique dans 5 secondes...</p>
      </div>
    </section>
  );
}
