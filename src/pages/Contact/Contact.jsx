import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // 🔁 Gestion des champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📤 Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await api.post("/contacts", formData);

      if (res.data?.success) {
        // ✅ Redirection automatique vers la page de succès
        navigate("/contact/success");
      } else {
        throw new Error("Erreur d'enregistrement du message.");
      }
    } catch (err) {
      console.error("❌ Erreur d’envoi :", err);
      setStatus({
        type: "error",
        message: "❌ Une erreur est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-primary-dark via-primary to-primary-light text-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* --- 🧭 Informations Contact --- */}
        <div className="space-y-6 md:pr-6">
          <h2 className="text-4xl font-extrabold mb-4">
            Contactez <span className="text-accent">DevOps Akademy</span>
          </h2>

          <p className="text-gray-200 text-lg leading-relaxed">
            Une question, un partenariat ou un besoin spécifique ?  
            Notre équipe est à votre écoute pour vous accompagner.
          </p>

          <ul className="space-y-4 mt-8">
            <li className="flex items-center gap-3">
              <Mail className="text-accent" size={20} />
              <a
                href="mailto:contact@devops-akademy.com"
                className="hover:text-accent transition"
              >
                contact@devops-akademy.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-accent" size={20} />
              <a
                href="tel:+237690123456"
                className="hover:text-accent transition"
              >
                +237 6 20 33 53 34
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="text-accent" size={20} />
              <span>Douala, Cameroun</span>
            </li>
          </ul>
        </div>

        {/* --- ✉️ Formulaire --- */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-800 transform transition hover:-translate-y-1 hover:shadow-accent/30">
          <h3 className="text-2xl font-bold mb-6 text-primary-dark text-center">
            Envoyez-nous un message
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nom complet"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <input
              type="text"
              name="subject"
              placeholder="Sujet"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
            />

            <textarea
              name="message"
              rows="5"
              placeholder="Votre message..."
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none resize-none"
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-accent hover:bg-accent-light text-primary"
                }`}
            >
              <Send size={18} />
              {loading ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>

          {status.message && (
            <p
              className={`mt-4 text-sm font-semibold text-center ${
                status.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
