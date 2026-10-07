import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import {
  ArrowRight, BookOpen, Star, Users, Clock,
  CheckCircle, Play, Award, Zap, Shield,
  MessageSquare, ChevronRight, Trophy,
  BarChart2, Terminal, Globe, Eye, Quote,
  TrendingUp, Layers
} from "lucide-react";
import { TechIcon } from "../../components/UI/Icons";
import { useTranslation } from "react-i18next";

// ─── Tech Stack ──────────────────────────────────────────────
const TECH_STACK = [
  { name: "Docker",         color: "#0db7ed" },
  { name: "Kubernetes",     color: "#326ce5" },
  { name: "AWS",            color: "#ff9900" },
  { name: "Terraform",      color: "#7b42bc" },
  { name: "GitHub Actions", color: "#2088ff" },
  { name: "Ansible",        color: "#ee0000" },
  { name: "Prometheus",     color: "#e6522c" },
  { name: "Grafana",        color: "#f46800" },
  { name: "Jenkins",        color: "#d24939" },
  { name: "Azure",          color: "#0089d6" },
  { name: "Linux",          color: "#fcc624" },
  { name: "Nginx",          color: "#009639" },
];

const FEATURES = [
  { icon: Terminal, key: "labs", color: "from-violet-500 to-purple-600", link: "/courses" },
  { icon: Award, key: "certs", color: "from-amber-400 to-orange-500", link: "/certificates/verify" },
  { icon: MessageSquare, key: "community", color: "from-emerald-400 to-teal-600", link: "/forum" },
  { icon: BarChart2, key: "progress", color: "from-sky-400 to-blue-600", link: "/leaderboard" },
];

const LEARNING_STEPS = [
  { num: "01", icon: BookOpen, key: "choose", link: "/courses", color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
  { num: "02", icon: Terminal, key: "practice", link: "/courses", color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
  { num: "03", icon: Award, key: "certify", link: "/certificates/verify", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { num: "04", icon: Trophy, key: "rank", link: "/leaderboard", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
];

const GRADIENT_AVATARS = [
  "from-violet-600 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-violet-600",
];

const getLevelInfo = (level) => {
  const map = {
    beginner:     { key: "beginner",     cls: "bg-emerald-100 text-emerald-700" },
    intermediate: { key: "intermediate", cls: "bg-blue-100 text-blue-700" },
    advanced:     { key: "advanced",     cls: "bg-purple-100 text-purple-700" },
  };
  return map[level?.toLowerCase()] || { key: "all", cls: "bg-gray-100 text-gray-600" };
};

const getInitials = (first, last) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

// ─── Terminal animé ───────────────────────────────────────────
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
// HERO
// ═══════════════════════════════════════════════════════════════
function HeroSection() {
  const { user } = useAuth();
  const { t } = useTranslation("home");
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] text-white min-h-[90vh] flex items-center">
      <div className="absolute inset-0 pointer-events-none opacity-100" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)`, backgroundSize: "56px 56px" }} />
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-[#facc15]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-[#5653e1]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15]/15 border border-[#facc15]/30 rounded-full text-[#facc15] text-sm font-bold mb-8">
              <Zap className="w-4 h-4" />
              {t("hero.badge")}
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.04] mb-6 tracking-tight">
              {t("hero.titleStart")}{" "}<span className="text-[#facc15]">DevOps</span><br />{t("hero.titleEnd")}
            </h1>
            <p className="text-xl text-white/72 leading-relaxed mb-10 max-w-xl">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link to="/my-courses" className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    {t("hero.myCourses")} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                    {t("hero.explore")}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#fde047] text-[#1f1b5a] font-black py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    {t("hero.signUp")} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                    {t("hero.explore")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Terminal */}
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
// STATS BAR — DYNAMIQUE
// ═══════════════════════════════════════════════════════════════
function StatsBar() {
  const { t } = useTranslation("home");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/public-stats")
      .then(r => setStats(r.data?.data || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Uniquement des chiffres réels renvoyés par l'API (aucune valeur de repli inventée)
  const items = stats
    ? [
        { value: stats.learners > 0 ? `${stats.learners}+` : null, label: t("stats.learners"), icon: Users },
        { value: stats.courses > 0 ? `${stats.courses}+` : null, label: t("stats.courses"), icon: BookOpen },
        { value: stats.avg_rating > 0 ? `${stats.avg_rating}/5` : null, label: t("stats.rating"), icon: Star },
        { value: stats.countries > 0 ? `${stats.countries}+` : null, label: t("stats.countries"), icon: Globe },
      ].filter(i => i.value)
    : [];

  if (!loading && items.length < 2) return null;

  return (
    <section className="bg-white border-y border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {(loading ? [1, 2, 3, 4] : items).map((item, i) => (
            <div key={i} className="text-center">
              {loading ? (
                <div className="animate-pulse">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl mx-auto mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 bg-[#2d287f]/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-[#2d287f]" />
                  </div>
                  <p className="text-3xl font-black text-[#1f1b5a] leading-none">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                </>
              )}
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
  const { t, i18n } = useTranslation("home");
  const nf = new Intl.NumberFormat(i18n.language);
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
    if (!isAuthenticated) return { label: t("popular.enroll"), icon: <BookOpen className="w-4 h-4" />, onClick: () => navigate("/login", { state: { from: `/courses/${courseId}` } }), cls: "bg-[#2d287f] text-white hover:bg-[#3b3aab]" };
    const status = getEnrollmentStatus(courseId);
    if (status === "approved") return { label: t("popular.continue"), icon: <Play className="w-4 h-4" />, onClick: () => navigate(`/courses/${courseId}/learn`), cls: "bg-emerald-600 text-white hover:bg-emerald-700" };
    if (status === "pending")  return { label: t("popular.pending"), icon: <Clock className="w-4 h-4" />, onClick: null, cls: "bg-amber-500 text-white cursor-not-allowed opacity-70" };
    return { label: t("popular.enroll"), icon: <BookOpen className="w-4 h-4" />, onClick: () => navigate(`/courses/${courseId}`), cls: "bg-[#2d287f] text-white hover:bg-[#3b3aab]" };
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">{t("popular.eyebrow")}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">{t("popular.title")}</h2>
            <p className="text-gray-500 mt-1.5">{t("popular.subtitle")}</p>
          </div>
          <Link to="/courses" className="hidden md:inline-flex items-center gap-2 text-[#2d287f] font-bold hover:gap-3 transition-all duration-200 text-sm">
            {t("popular.seeAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
                  <p className="font-semibold">{t("popular.empty")}</p>
                  <p className="text-sm mt-1">{t("popular.emptyHint")}</p>
                </div>
              )
              : courses.map(course => {
                  const action = getAction(course.id);
                  const level = getLevelInfo(course.level);
                  const isFree = course.is_free || !course.price || parseFloat(course.price) === 0;
                  return (
                    <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-[#2d287f] to-[#5653e1] overflow-hidden">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display = "none"; }} />
                        )}
                        {!course.thumbnail_url && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/70 text-7xl font-black">{course.title?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        {isFree && <div className="absolute top-3 left-3"><span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{t("popular.free")}</span></div>}
                        {!isFree && <div className="absolute bottom-3 right-3 bg-[#1f1b5a]/85 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">{t("popular.price", { amount: nf.format(parseFloat(course.price || 0)) })}</div>}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + level.cls}>{t(`levels.${level.key}`)}</span>
                          {course.duration_hours && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_hours}h</span>}
                        </div>
                        <h3 className="font-bold text-[#1f1b5a] text-lg leading-snug mb-1 group-hover:text-[#2d287f] transition-colors line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{t("popular.by", { name: `${course.first_name} ${course.last_name}` })}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">{course.short_description || t("popular.defaultDescription")}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><strong className="text-gray-600">{parseFloat(course.rating || 0).toFixed(1)}</strong><span>({course.review_count || 0})</span></span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.student_count || 0}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 mt-auto">
                          <button onClick={() => navigate(`/courses/${course.id}`)} className="flex items-center justify-center gap-1.5 py-2.5 px-3 border-2 border-[#2d287f]/25 text-[#2d287f] font-semibold rounded-xl text-sm hover:border-[#2d287f] hover:bg-[#2d287f]/5 transition-all">
                            <Eye className="w-4 h-4" /> {t("popular.details")}
                          </button>
                          <button onClick={action.onClick || undefined} disabled={!action.onClick} className={"flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold rounded-xl text-sm transition-all " + action.cls + (!action.onClick ? " cursor-not-allowed" : " hover:shadow-md hover:-translate-y-0.5")}>
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
            {t("popular.seeAllCourses")} <ArrowRight className="w-5 h-5" />
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
  const { t } = useTranslation("home");
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
          <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">{t("features.eyebrow")}</span>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">{t("features.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, key, color, link }, i) => (
            <Link key={i} to={link} className={"ri opacity-0 translate-y-8 transition-all duration-700 group p-6 rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:shadow-xl hover:-translate-y-1.5 bg-white block"} style={{ transitionDelay: i * 80 + "ms" }}>
              <div className={"w-12 h-12 rounded-2xl bg-gradient-to-br " + color + " flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300"}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-[#1f1b5a] text-lg mb-2 leading-snug">{t(`features.${key}.title`)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              <div className="flex items-center gap-1 mt-4 text-[#2d287f] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                {t("features.learnMore")} <ChevronRight className="w-4 h-4" />
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
  const { t } = useTranslation("home");
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[#2d287f] font-semibold text-sm uppercase tracking-wider">{t("steps.eyebrow")}</span>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1f1b5a] mt-1.5">{t("steps.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEARNING_STEPS.map(({ num, icon: Icon, key, link, color, bg }, i) => (
            <Link key={i} to={link} className={"group relative p-6 rounded-2xl border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white block " + bg}>
              <span className="absolute top-4 right-4 text-2xl font-black text-gray-100 group-hover:text-[#2d287f]/15 transition-colors">{num}</span>
              <div className={"w-14 h-14 rounded-2xl bg-white border flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow " + bg}>
                <Icon className={"w-7 h-7 " + color} />
              </div>
              <h3 className="font-bold text-[#1f1b5a] mb-2 text-sm leading-snug">{t(`steps.${key}.title`)}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t(`steps.${key}.desc`)}</p>
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
  const { t } = useTranslation("home");
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1f1b5a]">{t("tech.title")}</h2>
          <p className="text-gray-500 mt-2 text-sm">{t("tech.subtitle")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TECH_STACK.map(({ name, color }) => (
            <div key={name} className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-default" style={{ borderLeftColor: color, borderLeftWidth: "3px" }}>
              <TechIcon name={name} className="w-5 h-5 shrink-0" style={{ color }} />
              <span className="font-semibold text-sm text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TÉMOIGNAGES — DYNAMIQUES avec fallback
// ═══════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const { t } = useTranslation("home");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/courses/featured-reviews")
      .then(r => {
        const data = r.data?.data || [];
        setReviews(data.length >= 2 ? data.slice(0, 3) : []);
      })
      .catch(() => setReviews([]));
  }, []);

  // Aucun témoignage fictif : la section n'apparaît que s'il existe de vrais avis
  if (reviews.length === 0) return null;
  const displayed = reviews;
  const loading = false;

  return (
    <section className="py-20 bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[#facc15] font-semibold text-sm uppercase tracking-wider">{t("testimonials.eyebrow")}</span>
          <h2 className="text-3xl lg:text-4xl font-black mt-2">{t("testimonials.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {displayed.map((r, i) => (
            <div key={r.id || i} className={"bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6 hover:bg-white/12 transition-all duration-300" + (loading ? " animate-pulse" : "")}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(r.rating || 5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />)}
              </div>
              {r.course_title && (
                <p className="text-[#facc15]/70 text-xs font-semibold mb-2 uppercase tracking-wide">{r.course_title}</p>
              )}
              <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{r.comment}"</p>
              <div className="flex items-center gap-3">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt={r.first_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={"w-10 h-10 rounded-full bg-gradient-to-br " + GRADIENT_AVATARS[i % GRADIENT_AVATARS.length] + " flex items-center justify-center font-bold text-sm text-white shrink-0"}>
                    {getInitials(r.first_name, r.last_name)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{r.first_name} {r.last_name}</p>
                  <p className="text-white/50 text-xs">
                    {r.job_title || t("testimonials.learner")}{r.company ? ` · ${r.company}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white text-white font-semibold py-3 px-7 rounded-2xl transition-all duration-300">
            {t("testimonials.about")} <ArrowRight className="w-4 h-4" />
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
  const { t } = useTranslation("home");
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,40,127,0.05) 0%, transparent 70%)" }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2d287f]/8 border border-[#2d287f]/15 rounded-2xl mb-8">
          <Zap className="w-8 h-8 text-[#2d287f]" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-[#1f1b5a] mb-5 leading-tight">
          {t("cta.titleStart")}{" "}<span className="text-[#2d287f]">DevOps</span>{t("cta.titleEnd")}
        </h2>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          {t("cta.subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Link to="/courses" className="inline-flex items-center gap-2 bg-[#1f1b5a] hover:bg-[#2d287f] text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-[#2d287f]/20">
                {t("cta.explore")} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/forum" className="inline-flex items-center gap-2 border-2 border-[#2d287f]/25 hover:border-[#2d287f] text-[#2d287f] font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                {t("cta.forum")}
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="inline-flex items-center gap-2 bg-[#1f1b5a] hover:bg-[#2d287f] text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-[#2d287f]/20">
                {t("cta.createAccount")} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 border-2 border-[#2d287f]/25 hover:border-[#2d287f] text-[#2d287f] font-semibold py-4 px-8 rounded-2xl transition-all duration-300">
                {t("cta.pricing")}
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-400">
          {[
            [Shield, t("cta.trust1")],
            [CheckCircle, t("cta.trust2")],
            [Users, t("cta.trust3")],
          ].map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#2d287f]" />
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
  const { t, i18n } = useTranslation("home");
  useEffect(() => {
    document.title = t("meta.title");
  }, [t, i18n.language]);

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