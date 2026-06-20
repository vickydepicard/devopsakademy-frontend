import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Target, Users, Award, Zap, Globe, Shield,
  ArrowRight, CheckCircle, Star, TrendingUp, BookOpen
} from "lucide-react";

const STATS = [
  { value: "10",   label: "Apprenants inscrits",  icon: Users },
  { value: "803",  label: "Leçons disponibles",   icon: BookOpen },
  { value: "5/5",  label: "Note moyenne",         icon: Star },
  { value: "12",   label: "Pays représentés",     icon: Globe },
];

const VALUES = [
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
    color: "from-amber-400 to-orange-500",
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

const TEAM = [
  {
    name: "Vicky De Picard",
    role: "Fondateur & Lead DevOps",
    bio: "10 ans d'expérience en infrastructure cloud. Ex-SRE chez des scale-ups africaines.",
    initials: "VD",
    gradient: "from-violet-600 to-purple-700",
  },
  {
    name: "Équipe Pédagogique",
    role: "Ingénieurs & Formateurs certifiés",
    bio: "AWS, Kubernetes, Terraform, CI/CD — nos instructeurs cumulent des années de pratique en production.",
    initials: "EP",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Support Communauté",
    role: "Mentors & Community Managers",
    bio: "Disponibles sur le forum et en session live pour débloquer chaque apprenant.",
    initials: "SC",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const TECH = [
  { name: "Docker",         color: "#0db7ed", icon: "🐳" },
  { name: "Kubernetes",     color: "#326ce5", icon: "⚙️" },
  { name: "AWS",            color: "#ff9900", icon: "☁️" },
  { name: "Terraform",      color: "#7b42bc", icon: "🏗️" },
  { name: "GitHub Actions", color: "#2088ff", icon: "🔗" },
  { name: "Ansible",        color: "#e8e8e8", icon: "🔧" },
  { name: "Prometheus",     color: "#e6522c", icon: "📊" },
  { name: "Grafana",        color: "#f46800", icon: "📈" },
  { name: "Jenkins",        color: "#d24939", icon: "🚀" },
  { name: "Azure",          color: "#0089d6", icon: "🌐" },
  { name: "Linux",          color: "#fcc624", icon: "🐧" },
  { name: "Nginx",          color: "#009639", icon: "🛡️" },
];

const TERMINAL_LINES = [
  { delay: 0,    color: "text-green-400", prompt: true,  text: "kubectl get mission" },
  { delay: 500,  color: "text-gray-400",  prompt: false, text: "NAME              STATUS    AGE" },
  { delay: 600,  color: "text-white",     prompt: false, text: <>devopsakademy     <span className="text-green-400">Running</span>   2y</> },
  { delay: 1200, color: "text-green-400", prompt: true,  text: "describe apprenants" },
  { delay: 1700, color: "text-[#facc15]", prompt: false, text: "Enrolled:        10" },
  { delay: 1900, color: "text-[#facc15]", prompt: false, text: "Lessons:         803" },
  { delay: 2100, color: "text-[#facc15]", prompt: false, text: "Satisfaction:    5.0/5" },
  { delay: 2700, color: "text-green-400", prompt: true,  text: "deploy --env prod --region africa" },
  { delay: 3200, color: "text-sky-300",   prompt: false, text: <>Déploiement en cours<span className="inline-block w-2 h-4 bg-[#facc15] ml-1 animate-pulse align-middle rounded-sm" /></> },
];

export default function About() {
  const observerRef = useRef(null);

  useEffect(() => {
    document.title = "À propos — DevOpsAkademy";
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("opacity-100", "translate-y-0");
          e.target.classList.remove("opacity-0", "translate-y-8");
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".ri").forEach(el => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] text-white py-24 lg:py-32">
        <div className="absolute inset-0 pointer-events-none opacity-100"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[#facc15]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#5653e1]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15]/15 border border-[#facc15]/30 rounded-full text-[#facc15] text-sm font-bold mb-8">
              <Zap className="w-4 h-4" />
              La plateforme DevOps francophone de référence
            </span>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
              Former les ingénieurs{" "}
              <span className="text-[#facc15]">DevOps</span>{" "}
              de demain
            </h1>
            <p className="text-xl text-white/75 leading-relaxed mb-10 max-w-2xl">
              DevOpsAkademy est né d'un constat simple : les formations DevOps
              accessibles en français manquent de profondeur pratique.
              Nous avons changé ça.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses"
                className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-3.5 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                Explorer nos cours <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/become-instructor"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-semibold py-3.5 px-8 rounded-2xl transition-all duration-300">
                Devenir instructeur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="ri opacity-0 translate-y-8 transition-all duration-700 text-center">
                <div className="w-12 h-12 bg-[#2d287f]/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-[#2d287f]" />
                </div>
                <p className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="ri opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">Notre mission</span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-3 mb-6 leading-tight">
              Démocratiser les compétences DevOps en Afrique et dans le monde francophone
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
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
                "Certification numérique vérifiable",
                "Tarification adaptée aux marchés africains",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Terminal animé */}
          <div className="ri opacity-0 translate-y-8 transition-all duration-700">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "#0d1117" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8" style={{ background: "#161b22" }}>
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-white/35 text-xs font-mono">devopsakademy ~ mission</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-1.5 min-h-[260px]">
                {TERMINAL_LINES.map((line, i) => (
                  <p key={i} className={`flex items-start gap-2 ${line.color}`}>
                    {line.prompt && <span className="text-white/35 select-none shrink-0">$</span>}
                    <span>{line.text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 ri opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">Ce qui nous distingue</span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-3">Nos valeurs fondatrices</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title}
                className="ri opacity-0 translate-y-8 transition-all duration-700 bg-white rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:shadow-xl hover:-translate-y-1 p-6"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#1f1b5a] text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGIES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12 ri opacity-0 translate-y-8 transition-all duration-700">
          <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">Stack</span>
          <h2 className="text-2xl lg:text-3xl font-black text-[#1f1b5a] mt-2">
            Les technologies que vous maîtriserez
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Stack utilisée en production dans les meilleures équipes tech</p>
        </div>
        <div className="ri opacity-0 translate-y-8 transition-all duration-700 flex flex-wrap justify-center gap-3">
          {TECH.map(({ name, color, icon }) => (
            <div key={name}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-default"
              style={{ borderLeftColor: color, borderLeftWidth: "3px" }}>
              <span className="text-lg leading-none">{icon}</span>
              <span className="font-semibold text-sm text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÉQUIPE ── */}
      <section className="bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 ri opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-[#facc15] font-semibold text-sm uppercase tracking-wider">L'équipe</span>
            <h2 className="text-3xl lg:text-4xl font-black mt-3">Des praticiens, pas des théoriciens</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TEAM.map(({ name, role, bio, initials, gradient }, i) => (
              <div key={name}
                className="ri opacity-0 translate-y-8 transition-all duration-700 bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6 text-center hover:bg-white/12 transition-all"
                style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg`}>
                  {initials}
                </div>
                <h3 className="font-bold text-lg mb-1">{name}</h3>
                <p className="text-[#facc15] text-sm font-semibold mb-3">{role}</p>
                <p className="text-white/65 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center ri opacity-0 translate-y-8 transition-all duration-700">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mb-4">
            Prêt à démarrer votre parcours DevOps ?
          </h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Rejoignez les premiers apprenants qui construisent leur carrière DevOps avec DevOpsAkademy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-2 text-white font-black py-3.5 px-10 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 border-2 border-[#2d287f]/25 hover:border-[#2d287f] text-[#2d287f] font-semibold py-3.5 px-8 rounded-2xl transition-all duration-300">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}