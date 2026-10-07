// Avatars et visuels de secours générés localement (SVG) : aucun appel réseau, jamais d'image cassée.
const PALETTE = ["#2d287f", "#5653e1", "#0e7490", "#047857", "#b45309", "#9d174d", "#6d28d9"];

const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const initialsOf = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};
const uri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export function initialsAvatar(name) {
  const bg = PALETTE[hash(String(name || "")) % PALETTE.length];
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><text x="32" y="32" dy=".35em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="600" fill="#fff">${initialsOf(name).replace(/[<&>]/g, "")}</text></svg>`);
}

export function coverPlaceholder(title) {
  const a = PALETTE[hash(String(title || "")) % PALETTE.length];
  const b = PALETTE[(hash(String(title || "")) + 3) % PALETTE.length];
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><text x="160" y="90" dy=".35em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" fill="#fff" fill-opacity=".9">${initialsOf(title).replace(/[<&>]/g, "")}</text></svg>`);
}

// À brancher sur onError : remplace l'image par l'avatar de secours une seule fois.
export const onAvatarError = (name) => (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = initialsAvatar(name);
};
