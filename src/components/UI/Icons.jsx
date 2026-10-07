import i18n from "../../i18n";
import {
  Cloud, Container, Server, GitBranch, Wrench, BarChart3, LineChart, Rocket,
  Globe, Terminal, ShieldCheck, Lock, Layers, Cpu, Code2, Database, Boxes,
  File, FileText, FileSpreadsheet, FileArchive, FileVideo, Music, Paperclip,
  Link2, Presentation, Award, Medal, Trophy,
} from "lucide-react";
import {
  SiDocker, SiKubernetes, SiTerraform, SiGithubactions, SiAnsible,
  SiPrometheus, SiGrafana, SiJenkins, SiLinux, SiNginx,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

/* ── Logos technologies (marques officielles) ─────────────────────────── */
const TECH = {
  docker: SiDocker, kubernetes: SiKubernetes, aws: FaAws, terraform: SiTerraform,
  "github actions": SiGithubactions, githubactions: SiGithubactions, ansible: SiAnsible,
  prometheus: SiPrometheus, grafana: SiGrafana, jenkins: SiJenkins,
  azure: VscAzure, linux: SiLinux, nginx: SiNginx,
};

export function TechIcon({ name, className = "w-6 h-6", style }) {
  const Icon = TECH[String(name || "").toLowerCase()] || Server;
  return <Icon className={className} style={style} aria-hidden="true" />;
}

/* ── Icônes de catégories (clé stockée en base à la place d'un emoji) ──── */
export const CATEGORY_ICONS = {
  docker: { label: () => i18n.t("common:categoryIcons.docker"), Icon: Container },
  k8s: { label: () => i18n.t("common:categoryIcons.k8s"), Icon: Boxes },
  cloud: { label: () => i18n.t("common:categoryIcons.cloud"), Icon: Cloud },
  tools: { label: () => i18n.t("common:categoryIcons.tools"), Icon: Wrench },
  shield: { label: () => i18n.t("common:categoryIcons.shield"), Icon: ShieldCheck },
  chart: { label: () => i18n.t("common:categoryIcons.chart"), Icon: BarChart3 },
  cicd: { label: () => i18n.t("common:categoryIcons.cicd"), Icon: Rocket },
  git: { label: () => i18n.t("common:categoryIcons.git"), Icon: GitBranch },
  code: { label: () => i18n.t("common:categoryIcons.code"), Icon: Code2 },
  net: { label: () => i18n.t("common:categoryIcons.net"), Icon: Globe },
  infra: { label: () => i18n.t("common:categoryIcons.infra"), Icon: Server },
  db: { label: () => i18n.t("common:categoryIcons.db"), Icon: Database },
  term: { label: () => i18n.t("common:categoryIcons.term"), Icon: Terminal },
  lock: { label: () => i18n.t("common:categoryIcons.lock"), Icon: Lock },
};

/* Les anciennes valeurs (emoji) restent lisibles : on les relie à une clé. */
const LEGACY_EMOJI = {
  "🐳": "docker", "⚙️": "k8s", "☁️": "cloud", "🔧": "tools", "🛡️": "shield",
  "📊": "chart", "🚀": "cicd", "🔗": "git", "💻": "code", "🌐": "net",
  "🏗️": "infra", "🔐": "lock",
};

export function CategoryIcon({ value, className = "w-5 h-5" }) {
  const key = CATEGORY_ICONS[value] ? value : LEGACY_EMOJI[value];
  const Icon = (key && CATEGORY_ICONS[key]?.Icon) || Layers;
  return <Icon className={className} aria-hidden="true" />;
}

/* ── Types de fichiers ────────────────────────────────────────────────── */
const FILE = {
  pdf: FileText, doc: FileText, docx: FileText, txt: FileText,
  ppt: Presentation, pptx: Presentation, slides: Presentation,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  zip: FileArchive, rar: FileArchive, archive: FileArchive,
  mp4: FileVideo, video: FileVideo, mov: FileVideo, webm: FileVideo,
  mp3: Music, audio: Music,
  code: Code2, link: Link2, url: Link2,
};

export function FileTypeIcon({ type, className = "w-5 h-5" }) {
  const Icon = FILE[String(type || "").toLowerCase()] || File;
  return <Icon className={className} aria-hidden="true" />;
}

/* ── Niveau de difficulté : pastille colorée ─────────────────────────── */
const LEVEL_COLORS = {
  beginner: "bg-emerald-500", intermediate: "bg-blue-500", advanced: "bg-purple-500",
};
export function LevelDot({ level, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-2 h-2 rounded-full align-middle ${LEVEL_COLORS[level] || "bg-gray-400"} ${className}`}
    />
  );
}

/* ── Rangs du classement ──────────────────────────────────────────────── */
export function RankIcon({ rank, className = "w-5 h-5" }) {
  const color = { 1: "text-yellow-500", 2: "text-slate-400", 3: "text-amber-700" }[rank];
  if (!color) return null;
  const Icon = rank === 1 ? Trophy : rank === 2 ? Medal : Award;
  return <Icon className={`${className} ${color}`} aria-hidden="true" />;
}
