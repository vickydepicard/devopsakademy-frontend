import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  BookOpen, Users, Award, DollarSign, ArrowRight,
  CheckCircle, Star, Send, ChevronDown, ChevronUp,
  Zap, Target, Globe
} from "lucide-react";

const benefits = [
  { icon: Users, title: "Touchez des milliers d'apprenants", desc: "Votre expertise atteint des ingénieurs à travers toute l'Afrique francophone et au-delà." },
  { icon: DollarSign, title: "Générez des revenus passifs", desc: "Publiez un cours une fois, soyez rémunéré à chaque inscription sur le long terme." },
  { icon: Award, title: "Renforcez votre crédibilité", desc: "Être instructeur sur DevOpsAkademy est un signal fort de votre expertise dans la communauté." },
  { icon: Globe, title: "Réseau professionnel actif", desc: "Rejoignez une communauté d'experts DevOps et échangez avec d'autres instructeurs." },
];

const steps = [
  { n: "01", title: "Candidature", desc: "Remplissez le formulaire ci-dessous avec votre parcours et votre projet de cours." },
  { n: "02", title: "Revue", desc: "Notre équipe étudie votre dossier sous 3 à 5 jours ouvrés." },
  { n: "03", title: "Onboarding", desc: "Si votre candidature est acceptée, vous recevrez un guide de création de cours." },
  { n: "04", title: "Publication", desc: "Créez et publiez votre premier cours. Commencez à toucher vos apprenants !" },
];

const expertiseOptions = [
  "Docker & Conteneurisation", "Kubernetes", "CI/CD (GitHub Actions, GitLab CI, Jenkins)",
  "Infrastructure as Code (Terraform, Ansible)", "AWS", "Azure", "Google Cloud Platform",
  "Monitoring (Prometheus, Grafana)", "Linux & Administration système", "Sécurité DevSecOps",
  "Python / Scripting", "Réseaux & Protocoles"
];

export default function BecomeInstructor() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    motivation: "",
    expertise_areas: [],
    years_experience: "",
    linkedin_url: "",
    portfolio_url: "",
    proposed_course_title: "",
    proposed_course_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Devenir instructeur — DevOpsAkademy";
  }, []);

  const toggleExpertise = (item) => {
    setForm((prev) => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(item)
        ? prev.expertise_areas.filter((x) => x !== item)
        : [...prev.expertise_areas, item],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!form.motivation || form.expertise_areas.length === 0 || !form.years_experience || !form.proposed_course_title) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/instructor-applications", {
        ...form,
        years_experience: parseInt(form.years_experience),
      });
      setSuccess(true);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm font-semibold mb-6">
            <Star className="w-4 h-4" />
            Rejoignez nos instructeurs experts
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
            Partagez votre expertise.<br />
            <span className="text-accent">Impactez des carrières.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Vous êtes un praticien DevOps expérimenté ? Devenez instructeur sur DevOpsAkademy et transmettez vos compétences à la prochaine génération d'ingénieurs africains.
          </p>
          <a href="#formulaire" className="inline-flex items-center gap-2 bg-accent hover:bg-yellow-300 text-primary font-bold py-3 px-8 rounded-full transition shadow-md">
            Candidater maintenant <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ── BÉNÉFICES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Pourquoi enseigner chez nous ?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="devops-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESSUS ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light text-white font-bold text-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  {n}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE ── */}
      <section id="formulaire" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Formulaire de candidature</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {user
              ? "Remplissez ce formulaire pour soumettre votre candidature."
              : <>Vous devez être <Link to="/login" className="text-primary font-medium hover:underline">connecté</Link> pour candidater.</>
            }
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Candidature envoyée !</h3>
            <p className="text-gray-600 text-sm mb-6">
              Merci ! Notre équipe examinera votre dossier sous 3 à 5 jours ouvrés.<br />
              Vous recevrez une réponse par email.
            </p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2 px-6 rounded-full hover:-translate-y-0.5 transition">
              Retour au tableau de bord
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Motivation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.motivation}
                  onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                  rows={4}
                  placeholder="Pourquoi souhaitez-vous enseigner sur DevOpsAkademy ? Quelle valeur apportez-vous ?"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm resize-none"
                />
              </div>

              {/* Domaines d'expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Domaines d'expertise <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400 ml-1">(sélectionnez au moins 1)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {expertiseOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleExpertise(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        form.expertise_areas.includes(opt)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Années d'expérience + LinkedIn */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Années d'expérience <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.years_experience}
                    onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm"
                  >
                    <option value="">Sélectionnez</option>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <option key={n} value={n}>{n < 10 ? `${n} an${n > 1 ? "s" : ""}` : "10 ans ou plus"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/votre-profil"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm"
                  />
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio / GitHub / Site web</label>
                <input
                  type="url"
                  value={form.portfolio_url}
                  onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  placeholder="https://github.com/votre-profil"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm"
                />
              </div>

              {/* Cours proposé */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du cours envisagé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.proposed_course_title}
                  onChange={(e) => setForm({ ...form, proposed_course_title: e.target.value })}
                  placeholder="Ex : Kubernetes de zéro à la production"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description du cours</label>
                <textarea
                  value={form.proposed_course_description}
                  onChange={(e) => setForm({ ...form, proposed_course_description: e.target.value })}
                  rows={3}
                  placeholder="Décrivez brièvement le contenu et les objectifs pédagogiques de votre cours."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !user}
                className="w-full py-3 bg-accent hover:bg-yellow-300 text-indigo-900 font-bold rounded-full shadow transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {loading ? "Envoi en cours…" : "Envoyer ma candidature"}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-500">
                  <Link to="/login" className="text-primary font-medium hover:underline">Connectez-vous</Link>{" "}
                  pour pouvoir soumettre votre candidature.
                </p>
              )}
            </form>
          </div>
        )}
      </section>
    </div>
  );
}