// Les logos techniques des cours sont servis depuis /logos (aucune dépendance à un CDN tiers).
// Les anciennes URLs de CDN enregistrées en base sont réécrites à la volée vers ces fichiers locaux.
const DEVICON = new Set(["amazonwebservices-original-wordmark.svg", "ansible-original.svg", "azure-original.svg", "bash-original.svg", "docker-original.svg", "git-original.svg", "github-original.svg", "gitlab-original.svg", "googlecloud-original.svg", "helm-original.svg", "jenkins-original.svg", "kubernetes-plain.svg", "linux-original.svg", "nginx-original.svg", "prometheus-original.svg", "python-original.svg", "terraform-original.svg"]);
const SIMPLE = new Set(["argo", "devdotto", "elastic", "owasp", "prometheus", "scrumalliance", "vault"]);

const DEVICON_RE = /^https:\/\/cdn\.jsdelivr\.net\/gh\/devicons\/devicon\/icons\/[^/]+\/([^/?#]+\.svg)$/;
const SIMPLE_RE = /^https:\/\/cdn\.simpleicons\.org\/([a-z0-9]+)(?:\/[0-9A-Fa-f]{3,6})?$/;

export function localLogo(url) {
  if (typeof url !== "string" || !url.startsWith("https://cdn.")) return url;
  const d = url.match(DEVICON_RE);
  if (d && DEVICON.has(d[1])) return `/logos/dv-${d[1]}`;
  const s = url.match(SIMPLE_RE);
  if (s && SIMPLE.has(s[1])) return `/logos/si-${s[1]}.svg`;
  return url;
}

export function localizeLogos(value) {
  if (typeof value === "string") return localLogo(value);
  if (Array.isArray(value)) { for (let i = 0; i < value.length; i++) value[i] = localizeLogos(value[i]); return value; }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    for (const k of Object.keys(value)) value[k] = localizeLogos(value[k]);
  }
  return value;
}
