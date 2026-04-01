import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import {
  ArrowRight, BookOpen, Star, Users, Clock,
  CheckCircle, Play, Award, Zap, Shield,
  MessageSquare, ChevronRight, Trophy,
  BarChart2, Terminal, Globe, Eye
} from "lucide-react";

// ─── Données statiques ───────────────────────────────────────────

const TECH_STACK = [
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

const STATS = [
  { value: "20+", label: "Apprenants formés",   icon: Users },
  { value: "30+",    label: "Cours disponibles",    icon: BookOpen },
  { value: "95%",    label: "Taux de satisfaction", icon: Star },
  { value: "12+",    label: "Pays représentés",     icon: Globe },
];

const FEATURES = [
  {
    icon: Terminal,
    title: "Labs interactifs",
    desc: "Environnements Docker & K8s préconfigurés, directement dans votre navigateur. Zéro configuration.",
    color: "from-violet-500 to-purple-600",
    link: "/courses",
  },
  {
    icon: Award,
    title: "Certifications vérifiables",
    desc: "Chaque parcours aboutit à un certificat numérique authentifié, valorisé par les recruteurs tech.",
    color: "from-amber-400 to-orange-500",
    link: "/certificates/verify",
  },
  {
    icon: MessageSquare,
    title: "Communauté active",
    desc: "Forum, entraide et webinaires mensuels. Vous n'apprenez jamais seul chez DevOpsAkademy.",
    color: "from-emerald-400 to-teal-600",
    link: "/forum",
  },
  {
    icon: BarChart2,
    title: "Progression trackée",
    desc: "Tableau de bord personnel, classement, points. Chaque complétion vous fait progresser.",
    color: "from-sky-400 to-blue-600",
    link: "/leaderboard",
  },
];

const TESTIMONIALS = [
  {
    name: "Jean Dupont",
    role: "DevOps Engineer",
    company: "Scale-up Dakar",
    initials: "JD",
    gradient: "from-violet-600 to-purple-700",
    rating: 5,
    text: "Les cours DevOpsAkademy m'ont permis de décrocher ma première mission Cloud en moins de 3 mois. Le contenu est dense et 100% pratique.",
  },
  {
    name: "Amina Traoré",
    role: "SRE Junior",
    company: "Fintech Abidjan",
    initials: "AT",
    gradient: "from-emerald-500 to-teal-600",
    rating: 5,
    text: "Une plateforme claire, complète et très interactive. Les labs Kubernetes sont particulièrement bien faits. Je recommande sans hésitation.",
  },
  {
    name: "Lucas M.",
    role: "Cloud Architect",
    company: "Freelance",
    initials: "LM",
    gradient: "from-sky-500 to-blue-600",
    rating: 5,
    text: "J'ai adoré les projets pratiques sur Docker et Terraform. La communauté répond vite et les instructeurs sont de vrais praticiens.",
  },
];

const LEARNING_STEPS = [
  { num: "01", icon: BookOpen, title: "Choisissez votre parcours", desc: "Débutant à expert — trouvez le cours adapté à votre niveau.", link: "/courses", color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
  { num: "02", icon: Terminal, title: "Pratiquez en conditions réelles", desc: "Labs interactifs sur de vraies infrastructures Cloud & K8s.", link: "/courses", color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
  { num: "03", icon: Award, title: "Obtenez votre certificat", desc: "Certification numérique vérifiable, partageable sur LinkedIn.", link: "/certificates/verify", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { num: "04", icon: Trophy, title: "Progressez dans le classement", desc: "Montez dans le leaderboard et devenez un référent de la communauté.", link: "/leaderboard", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
];

// ─── Helpers ─────────────────────────────────────────────────────

const getLevelInfo = (level) => {
  const map = {
    beginner:     { label: "Débutant",      cls: "bg-emerald-100 text-emerald-700" },
    intermediate: { label: "Intermédiaire", cls: "bg-blue-100 text-blue-700" },
    advanced:     { label: "Avancé",        cls: "bg-purple-100 text-purple-700" },
  };
  return map[level?.toLowerCase()] || { label: "Tous niveaux", cls: "bg-gray-100 text-gray-600" };
};

// ─── Composant ligne terminal avec animation ──────────────────────
function TerminalLine({ children, delay = 0, prompt = false, color = "text-white" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return <div className="h-5" />;
  return (
    <p className={"flex items-start gap-2 " + color}>
      {prompt && <span className="text-white/35 shrink-0 select-none">$</span>}
      <span>{children}</span>
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION HERO
// ═══════════════════════════════════════════════════════════════
function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] text-white min-h-[90vh] flex items-center">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-100"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
      {/* Orbs décoratifs */}
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-[#facc15]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-[#5653e1]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* ── Left ── */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15]/15 border border-[#facc15]/30 rounded-full text-[#facc15] text-sm font-bold mb-8">
              <Zap className="w-4 h-4" />
              Plateforme DevOps francophone n°1
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.04] mb-6 tracking-tight">
              Maîtrisez{" "}
              <span className="text-[#facc15]">DevOps</span>
              <br />
              de A à Z
            </h1>

            <p className="text-xl text-white/72 leading-relaxed mb-10 max-w-xl">
              Formations pratiques en français — Cloud, Kubernetes, CI/CD, Terraform.
              Construites par des praticiens, pour aller directement en production.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link to="/my-courses" className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    Mes cours <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                    Explorer les cours
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    Commencer gratuitement <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                    Explorer les cours
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 flex-wrap">
              <div className="flex -space-x-2">
                {[["JD","#7c3aed"],["AT","#059669"],["LM","#0284c7"],["SR","#dc2626"],["KM","#d97706"]].map(([init, bg], i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#2d287f] flex items-center justify-center text-xs font-bold text-white" style={{ background: bg }}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />)}
                  <span className="text-white font-bold ml-1">4.9/5</span>
                </div>
                <p className="text-white/55 text-sm">+2 000 apprenants satisfaits</p>
              </div>
            </div>
          </div>

          {/* ── Right : Terminal animé ── */}
          <div className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "#0d1117" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8" style={{ background: "#161b22" }}>
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-white/35 text-xs font-mono">devopsakademy ~ lab-k8s</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-1.5 leading-relaxed min-h-[280px]">
                <TerminalLine delay={200}  prompt color="text-green-400">kubectl get pods -n production</TerminalLine>
                <TerminalLine delay={700}  color="text-gray-400">NAME                    READY   STATUS</TerminalLine>
                <TerminalLine delay={800}  color="text-white">api-deploy-7d9f         <span className="text-green-400">1/1</span>     Running</TerminalLine>
                <TerminalLine delay={900}  color="text-white">redis-cache-4k2p        <span className="text-green-400">1/1</span>     Running</TerminalLine>
                <div className="pt-2">
                  <TerminalLine delay={1400} prompt color="text-green-400">terraform apply -auto-approve</TerminalLine>
                  <TerminalLine delay={2000} color="text-yellow-300">Plan: 3 to add, 0 to change</TerminalLine>
                  <TerminalLine delay={2500} color="text-green-400">Apply complete! Resources: 3 added.</TerminalLine>
                </div>
                <div className="pt-2">
                  <TerminalLine delay={3000} prompt color="text-green-400">docker build -t app:v2.1 .</TerminalLine>
                  <TerminalLine delay={3600} color="text-sky-300">Successfully built <span className="text-[#facc15]">a3f8c12d</span></TerminalLine>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-white/35">$</span>
                  <span className="inline-block w-2 h-4 bg-[#facc15] animate-pulse rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════════════════════════
function StatsBar() {
  return (
    <section className="bg-white border-y border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={i} className="text-center">
              <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-black text-[#1f1b5a] leading-none">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// COURS POPULAIRES
// ═══════════════════════════════════════════════════════════════
function PopularCoursesSection() {
  const { isAuthenticated } = useAuth();
  const { getEnrollmentStatus } = usePermissions();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/popular")
      .then(r => setCourses((r.data?.data || []).slice(0, 3)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const getAction = (courseId) => {
    if (!isAuthenticated) return {
      label: "S'inscrire", icon: <BookOpen className="w-4 h-4" />,
      onClick: () => navigate("/login", { state: { from: `/courses/${courseId}` } }),
      cls: "bg-primary text-white hover:bg-primary-light"
    };
    const status = getEnrollmentStatus(courseId);
    if (status === "approved") return { label: "Continuer", icon: <Play className="w-4 h-4" />, onClick: () => navigate(`/courses/${courseId}/learn`), cls: "bg-emerald-600 text-white hover:bg-emerald-700" };
    if (status === "pending")  return { label: "En attente", icon: <Clock className="w-4 h-4" />, onClick: null, cls: "bg-amber-500 text-white cursor-not-allowed opacity-70" };
    return { label: "S'inscrire", icon: <BookOpen className="w-4 h-4" />, onClick: () => navigate(`/courses/${courseId}`), cls: "bg-primary text-white hover:bg-primary-light" };
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Formations</span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">Les plus populaires</h2>
            <p className="text-gray-500 mt-1.5">Plébiscitées par notre communauté d'apprenants</p>
          </div>
          <Link to="/courses" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200 text-sm">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grille */}
        <div className="grid md:grid-cols-3 gap-6">
          {loading
            ? [1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-10 bg-gray-200 rounded-xl flex-1" />
                      <div className="h-10 bg-gray-200 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              ))
            : courses.length === 0
              ? (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Aucune formation disponible pour l'instant</p>
                  <p className="text-sm mt-1">Revenez bientôt !</p>
                </div>
              )
              : courses.map(course => {
                  const action = getAction(course.id);
                  const level = getLevelInfo(course.level);
                  const isFree = course.is_free || !course.price || parseFloat(course.price) === 0;

                  return (
                    <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden">
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-[#2d287f] to-[#5653e1] overflow-hidden">
                        {course.thumbnail_url && (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        )}
                        {!course.thumbnail_url && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/70 text-7xl font-black">{course.title?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        {isFree && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">GRATUIT</span>
                          </div>
                        )}
                        {!isFree && (
                          <div className="absolute bottom-3 right-3 bg-[#1f1b5a]/85 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                            {parseFloat(course.price || 0).toLocaleString("fr-FR")} FCFA
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + level.cls}>{level.label}</span>
                          {course.duration_hours && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{course.duration_hours}h
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#1f1b5a] text-lg leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Par {course.first_name} {course.last_name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
                          {course.short_description || "Formation complète avec labs pratiques et certification incluse."}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <strong className="text-gray-600">{parseFloat(course.rating || 0).toFixed(1)}</strong>
                            <span>({course.review_count || 0})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {course.student_count || 0}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mt-auto">
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 border-2 border-primary/25 text-primary font-semibold rounded-xl text-sm hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Eye className="w-4 h-4" /> Détails
                          </button>
                          <button
                            onClick={action.onClick || undefined}
                            disabled={!action.onClick}
                            className={"flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold rounded-xl text-sm transition-all " + action.cls + (!action.onClick ? " cursor-not-allowed" : " hover:shadow-md hover:-translate-y-0.5")}
                          >
                            {action.icon} {action.label}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
          }
        </div>

        <div className="text-center mt-10">
          <Link to="/courses" className="inline-flex items-center gap-2 bg-[#1f1b5a] text-white font-bold py-3.5 px-8 rounded-2xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
            Voir toutes les formations <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════
function FeaturesSection() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("opacity-100","translate-y-0"); e.target.classList.remove("opacity-0","translate-y-8"); }
      }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".ri").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 ri opacity-0 translate-y-8 transition-all duration-700">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pourquoi nous</span>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">Tout pour progresser vite</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, link }, i) => (
            <Link
              key={i} to={link}
              className="ri opacity-0 translate-y-8 transition-all duration-700 group p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1.5 bg-white block"
              style={{ transitionDelay: i * 80 + "ms" }}
            >
              <div className={"w-12 h-12 rounded-2xl bg-gradient-to-br " + color + " flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300"}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-[#1f1b5a] text-lg mb-2 leading-snug">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-4 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                En savoir plus <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PARCOURS
// ═══════════════════════════════════════════════════════════════
function LearningPathSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Comment ça marche</span>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">De zéro à expert en 4 étapes</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEARNING_STEPS.map(({ num, icon: Icon, title, desc, link, color, bg }, i) => (
            <Link key={i} to={link} className={"group relative p-6 rounded-2xl border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white block " + bg}>
              <span className="absolute top-4 right-4 text-2xl font-black text-gray-100 group-hover:text-primary/15 transition-colors">{num}</span>
              <div className={"w-14 h-14 rounded-2xl bg-white border flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow " + bg}>
                <Icon className={"w-7 h-7 " + color} />
              </div>
              <h3 className="font-bold text-[#1f1b5a] mb-2 text-sm leading-snug">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TECH STACK
// ═══════════════════════════════════════════════════════════════
function TechStackSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1f1b5a]">Technologies que vous maîtriserez</h2>
          <p className="text-gray-500 mt-2 text-sm">Stack utilisée en production par les meilleures équipes DevOps</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TECH_STACK.map(({ name, color, icon }) => (
            <div
              key={name}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-default"
              style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="font-semibold text-sm text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TÉMOIGNAGES
// ═══════════════════════════════════════════════════════════════
function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[#facc15] font-semibold text-sm uppercase tracking-wider">Témoignages</span>
          <h2 className="text-3xl lg:text-4xl font-black mt-2">Ce que disent nos apprenants</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, company, initials, gradient, rating, text }, i) => (
            <div key={i} className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6 hover:bg-white/12 transition-all duration-300">
              <div className="flex gap-0.5 mb-4">
                {[...Array(rating)].map((_, s) => <Star key={s} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />)}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className={"w-10 h-10 rounded-full bg-gradient-to-br " + gradient + " flex items-center justify-center font-bold text-sm text-white shrink-0"}>
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-sm">{name}</p>
                  <p className="text-white/50 text-xs">{role} · {company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-3 px-7 rounded-2xl transition-all duration-300">
            En savoir plus sur nous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA FINAL
// ═══════════════════════════════════════════════════════════════
function CTASection() {
  const { user } = useAuth();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,40,127,0.05) 0%, transparent 70%)"
      }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/8 border border-primary/15 rounded-2xl mb-8">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-[#1f1b5a] mb-5 leading-tight">
          Prêt à booster<br />votre carrière{" "}
          <span className="text-primary">DevOps</span> ?
        </h2>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          Rejoignez +2 000 ingénieurs qui ont transformé leur carrière avec DevOpsAkademy.
          Commencez gratuitement dès aujourd'hui.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Link to="/courses" className="inline-flex items-center gap-2 bg-[#1f1b5a] hover:bg-[#2d287f] text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-primary/20">
                Explorer les cours <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/forum" className="inline-flex items-center gap-2 border-2 border-primary/25 hover:border-primary text-primary font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                Rejoindre le forum
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="inline-flex items-center gap-2 bg-[#1f1b5a] hover:bg-[#2d287f] text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-primary/20">
                Créer un compte gratuit <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 border-2 border-primary/25 hover:border-primary text-primary font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                Voir les tarifs
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-400">
          {[
            [Shield, "Aucune carte requise"],
            [CheckCircle, "Accès immédiat"],
            [Users, "Communauté active"],
          ].map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  useEffect(() => {
    document.title = "DevOpsAkademy — Formations DevOps & Cloud en français";
  }, []);

  return (
    <div className="bg-white w-full">
      <HeroSection />
      <StatsBar />
      <PopularCoursesSection />
      <FeaturesSection />
      <LearningPathSection />
      <TechStackSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}