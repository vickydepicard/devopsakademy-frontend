import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Target, Users, Award, Zap, Globe, Shield,
  ArrowRight, CheckCircle, Star, TrendingUp
} from "lucide-react";

const stats = [
  { value: "2 000+", label: "Apprenants formés", icon: Users },
  { value: "30+", label: "Modules de formation", icon: Award },
  { value: "95%", label: "Taux de satisfaction", icon: Star },
  { value: "12+", label: "Pays représentés", icon: Globe },
];

const values = [
  {
    icon: Target,
    title: "Expertise terrain",
    desc: "Nos formateurs sont des praticiens actifs. Chaque cours reflète des défis réels rencontrés en production.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Apprentissage accéléré",
    desc: "Méthode learn-by-doing : labs interactifs, projets fil rouge, quizzes à chaque étape pour ancrer les acquis.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Certification reconnue",
    desc: "Chaque parcours débouche sur un certificat numérique vérifiable, valorisé par les recruteurs tech.",
    color: "from-emerald-400 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Communauté active",
    desc: "Forum, entraide, webinaires mensuels. Vous n'apprenez jamais seul chez DevOpsAkademy.",
    color: "from-sky-400 to-blue-600",
  },
];

const team = [
  {
    name: "Vicky De Picard",
    role: "Fondateur & Lead DevOps",
    bio: "10 ans d'expérience en infrastructure cloud. Ex-SRE chez des scale-ups africaines.",
    avatar: null,
    initials: "VD",
    gradient: "from-violet-600 to-purple-700",
  },
  {
    name: "Équipe Pédagogique",
    role: "Ingénieurs & Formateurs certifiés",
    bio: "AWS, Kubernetes, Terraform, CI/CD — nos instructeurs cumulent des années de pratique en production.",
    avatar: null,
    initials: "EP",
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    name: "Support Communauté",
    role: "Mentors & Community Managers",
    bio: "Disponibles sur le forum et en session live pour débloquer chaque apprenant.",
    avatar: null,
    initials: "SC",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const techStack = [
  { name: "Docker", color: "#0db7ed" },
  { name: "Kubernetes", color: "#326ce5" },
  { name: "AWS", color: "#ff9900" },
  { name: "Terraform", color: "#7b42bc" },
  { name: "GitHub Actions", color: "#2088ff" },
  { name: "Ansible", color: "#1a1a1a" },
  { name: "Prometheus", color: "#e6522c" },
  { name: "Grafana", color: "#f46800" },
  { name: "Jenkins", color: "#d24939" },
  { name: "Azure", color: "#0089d6" },
];

export default function About() {
  const observerRef = useRef(null);

  useEffect(() => {
    document.title = "À propos — DevOpsAkademy";
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("opacity-100", "translate-y-0");
          e.target.classList.remove("opacity-0", "translate-y-8");
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-light/30 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              La plateforme DevOps francophone de référence
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 font-display">
              Former les ingénieurs{" "}
              <span className="text-accent">DevOps</span>{" "}
              de demain
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
              DevOpsAkademy est né d'un constat simple : les formations DevOps
              accessibles en français manquent de profondeur pratique.
              Nous avons changé ça.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold py-3 px-8 rounded-full transition duration-300 shadow-glow-accent"
              >
                Explorer nos cours <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/become-instructor"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold py-3 px-8 rounded-full transition duration-300"
              >
                Devenir instructeur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="reveal opacity-0 translate-y-8 transition-all duration-700 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary-dark mb-1">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Notre mission</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-6 leading-tight font-display">
              Démocratiser les compétences DevOps en Afrique et dans le monde francophone
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Trop souvent, les meilleures ressources DevOps sont en anglais, derrière des paywalls
              inaccessibles ou déconnectées de la réalité des équipes tech africaines.
              DevOpsAkademy comble ce fossé.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Nous proposons des formations en français, construites par des praticiens,
              avec des labs pratiques et une communauté engagée — à un tarif adapté aux marchés locaux.
            </p>
            <ul className="space-y-3">
              {[
                "Cours 100% en français avec terminologie internationale",
                "Labs pratiques sur environnements réels",
                "Certification vérifiable sur blockchain",
                "Tarification adaptée aux marchés africains",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual terminal */}
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <div className="terminal-window shadow-hard">
              <div className="terminal-header">
                <span className="terminal-button terminal-button-close"></span>
                <span className="terminal-button terminal-button-minimize"></span>
                <span className="terminal-button terminal-button-maximize"></span>
                <span className="text-gray-400 text-xs ml-3 font-mono">devopsakademy ~ mission</span>
              </div>
              <div className="terminal-content p-6 font-mono text-sm space-y-2">
                <p><span className="text-gray-500">$</span> <span className="text-green-400">kubectl get mission</span></p>
                <p className="text-gray-300">NAME              STATUS    AGE</p>
                <p className="text-white">devopsakademy     <span className="text-green-400">Running</span>   2y</p>
                <br/>
                <p><span className="text-gray-500">$</span> <span className="text-green-400">describe apprenants</span></p>
                <p className="text-yellow-300">Enrolled:        2,000+</p>
                <p className="text-yellow-300">Completions:     1,400+</p>
                <p className="text-yellow-300">Satisfaction:    4.8/5</p>
                <br/>
                <p><span className="text-gray-500">$</span> <span className="text-green-400">deploy --env prod --region africa</span></p>
                <p className="text-blue-300">Déploiement en cours<span className="animate-terminal-blink">▋</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Ce qui nous distingue</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 font-display">
              Nos valeurs fondatrices
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 devops-card p-6"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGIES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10 reveal opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-display">
            Les technologies que vous maîtriserez
          </h2>
          <p className="text-gray-500 mt-3">Stack utilisée en production dans les meilleures équipes tech</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 reveal opacity-0 translate-y-8 transition-all duration-700">
          {techStack.map(({ name, color }) => (
            <span
              key={name}
              className="tech-chip font-semibold"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── ÉQUIPE ── */}
      <section className="bg-gradient-to-br from-primary-dark to-primary text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">L'équipe</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-3 font-display">
              Des praticiens, pas des théoriciens
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {team.map(({ name, role, bio, initials, gradient }, i) => (
              <div
                key={name}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 glass rounded-2xl p-6 text-center"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-glow-primary`}>
                  {initials}
                </div>
                <h3 className="font-bold text-lg mb-1">{name}</h3>
                <p className="text-accent text-sm font-medium mb-3">{role}</p>
                <p className="text-white/70 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center reveal opacity-0 translate-y-8 transition-all duration-700">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-display">
            Prêt à démarrer votre parcours DevOps ?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Rejoignez des milliers d'ingénieurs qui ont transformé leur carrière avec DevOpsAkademy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white font-bold py-3 px-8 rounded-full shadow-glow-primary hover:-translate-y-1 transition duration-300"
            >
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-semibold py-3 px-8 rounded-full hover:bg-primary hover:text-white transition duration-300"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}