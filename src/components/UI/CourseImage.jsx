// src/components/UI/CourseImage.jsx
// ✅ Logos officiels CDN (devicons / simpleicons) pour chaque cours tech
// ✅ Fallback dégradé + initiales si logo indisponible
// ✅ Détection par slug exact ET par mots-clés du titre

import { useState } from "react";

// ── Logo par slug exact ───────────────────────────────────────
const SLUG_LOGOS = {
  "docker-fondamentaux":                        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "docker-avance":                              "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "docker-dca":                                 "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "kubernetes-fondamentaux":                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "cka-certified-kubernetes-administrator":     "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "ckad-certified-kubernetes-application-developer": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "cks-certified-kubernetes-security-specialist": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "aws-eks-kubernetes-sur-amazon":              "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "terraform-fondamentaux":                     "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg",
  "terraform-avance":                           "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg",
  "ansible":                                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg",
  "linux-fondamentaux":                         "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  "linux-fondamentaux-devops":                  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  "bash-avance":                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  "cloud-aws":                                  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "aws-cloud-practitioner-clf-c02":             "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "cloud-azure":                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
  "azure-devops-az-400":                        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
  "azure-az900":                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
  "cloud-gcp":                                  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  "gcp-associate-cloud-engineer":               "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  "github-actions":                             "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "gitlab-cicd":                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
  "jenkins":                                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",
  "prometheus-grafana":                         "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg",
  "prometheus-grafana-monitoring":              "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg",
  "helm-kubernetes-package-manager":            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/helm/helm-original.svg",
  "argocd-gitops-kubernetes":                   "https://cdn.simpleicons.org/argo/EF7B4D",
  "python-devops":                              "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "python-pour-devops":                         "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "vault":                                      "https://cdn.simpleicons.org/vault/000000",
  "elk-stack":                                  "https://cdn.simpleicons.org/elastic/005571",
  "reseaux-devops-tcpip-dns-http":              "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  "reseaux-devops":                             "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  "devops-fondamentaux":                        "https://cdn.simpleicons.org/devdotto/0A0A0A",
  "devops-bootcamp":                            "https://cdn.simpleicons.org/devdotto/0A0A0A",
  "security-devsecops":                         "https://cdn.simpleicons.org/owasp/000000",
};

// ── Logo par mots-clés du titre ───────────────────────────────
const KEYWORD_LOGOS = [
  { keys: ["docker"],                  url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",      bg: "#E8F4FD", accent: "#2496ED" },
  { keys: ["kubernetes","k8s","cka","ckad","cks","eks"], url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg", bg: "#EBF3FD", accent: "#326CE5" },
  { keys: ["terraform"],               url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg", bg: "#F3EEF9", accent: "#7B42BC" },
  { keys: ["ansible"],                 url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg",    bg: "#FEE8E8", accent: "#EE0000" },
  { keys: ["linux","bash","shell"],    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",        bg: "#FFFBEB", accent: "#F59E0B" },
  { keys: ["aws","amazon","clf","saa"],url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", bg: "#FFF3E0", accent: "#FF9900" },
  { keys: ["azure","az-900","az-400"], url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",        bg: "#E3F2FD", accent: "#0078D4" },
  { keys: ["gcp","google cloud","gke"],url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg", bg: "#E8F0FE", accent: "#4285F4" },
  { keys: ["github action"],           url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",     bg: "#F0F0F0", accent: "#181717" },
  { keys: ["gitlab"],                  url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",     bg: "#FEF3E2", accent: "#FCA121" },
  { keys: ["jenkins"],                 url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",   bg: "#FEF0EF", accent: "#D33833" },
  { keys: ["prometheus","grafana"],    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg", bg: "#FEF0EA", accent: "#E6522C" },
  { keys: ["helm"],                    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/helm/helm-original.svg",          bg: "#ECEFFE", accent: "#0F1689" },
  { keys: ["argocd","gitops","argo"],  url: "https://cdn.simpleicons.org/argo/EF7B4D",                                            bg: "#FEF3ED", accent: "#EF7B4D" },
  { keys: ["python"],                  url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",     bg: "#EBF4FD", accent: "#3776AB" },
  { keys: ["vault","hashicorp"],       url: "https://cdn.simpleicons.org/vault/000000",                                           bg: "#F5F5F5", accent: "#000000" },
  { keys: ["elk","elasticsearch","kibana","logstash"], url: "https://cdn.simpleicons.org/elastic/005571",                        bg: "#E6F3F5", accent: "#005571" },
  { keys: ["réseau","réseau","réseau","tcp","dns","nginx","network"], url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg", bg: "#E8F5EE", accent: "#009639" },
  { keys: ["devsecops","owasp","sécurité","security"], url: "https://cdn.simpleicons.org/owasp/000000",                          bg: "#F0F0F0", accent: "#1F1F1F" },
  { keys: ["git","ci/cd","cicd","pipeline"], url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",    bg: "#FEF0EC", accent: "#F05032" },
];

// ── Dégradés fallback ─────────────────────────────────────────
const GRADIENTS = [
  ["#2d287f","#5653e1"], ["#0f766e","#14b8a6"], ["#7c3aed","#a855f7"],
  ["#b45309","#f59e0b"], ["#0369a1","#38bdf8"], ["#be185d","#ec4899"],
  ["#15803d","#4ade80"], ["#b91c1c","#f87171"],
];
const getGradient = (s = "") =>
  GRADIENTS[Math.abs((s.charCodeAt(0) || 65) - 65) % GRADIENTS.length];

const getInitials = (t = "") =>
  t.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "DA";

const findLogo = (title = "", slug = "") => {
  const s = (slug || "").toLowerCase().trim();
  if (s && SLUG_LOGOS[s]) return { url: SLUG_LOGOS[s], bg: null, accent: null };
  const t = title.toLowerCase();
  return KEYWORD_LOGOS.find(({ keys }) => keys.some(k => t.includes(k))) || null;
};

// ══════════════════════════════════════════════════════════════
export default function CourseImage({
  src, title = "", slug = "",
  className = "w-full h-full object-contain",
  wrapperClassName = "", wrapperStyle = {},
}) {
  const [srcFailed,  setSrcFailed]  = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const match    = findLogo(title, slug);
  const [g1, g2] = getGradient(title || slug);
  const initials = getInitials(title);

  // Cas 1 : thumbnail personnalisée OK
  if (src && !srcFailed) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <img src={src} alt={title} className={className}
          onError={() => setSrcFailed(true)} loading="lazy" />
      </div>
    );
  }

  // Cas 2 : logo tech officiel
  if (match && !logoFailed) {
    const bg = match.bg || "#f8f7ff";
    return (
      <div className={wrapperClassName}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", background: bg, ...wrapperStyle }}>
        <img
          src={match.url}
          alt={title}
          onError={() => setLogoFailed(true)}
          style={{ width:"58%", height:"58%", objectFit:"contain",
            filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.15))" }}
          loading="lazy"
        />
      </div>
    );
  }

  // Cas 3 : fallback dégradé + initiales
  return (
    <div className={wrapperClassName}
      style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", background:`linear-gradient(135deg,${g1},${g2})`,
        gap:4, ...wrapperStyle }}>
      <span style={{ color:"rgba(255,255,255,0.92)", fontWeight:900,
        fontSize:"clamp(16px,26%,38px)", letterSpacing:"0.03em", lineHeight:1,
        textShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
        {initials}
      </span>
      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"clamp(7px,11%,10px)",
        fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>
        DevOps Akademy
      </span>
    </div>
  );
}