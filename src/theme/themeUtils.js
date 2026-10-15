// Calculs de couleurs pour les thèmes d'événement (campagnes).
// Le site lit ses couleurs dans des variables CSS (--c-…, triplets RGB) : voir src/index.css.

export const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbToHex = (rgb) => "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const trip = (rgb) => rgb.map((v) => Math.round(v)).join(" ");

/** Variables CSS pilotées par un thème. */
export const THEME_VARS = [
  "--c-primary", "--c-primary-light", "--c-primary-dark", "--c-primary-mid", "--c-primary-700",
  "--c-primary-vibrant", "--c-primary-deep", "--c-accent", "--c-accent-light", "--c-accent-dark",
  "--c-btn", "--c-btn-hover", "--c-btn-soft", "--c-btn-text",
];

/** Texte lisible sur un fond donné (contraste WCAG ≥ 4,5) : blanc d'abord, sinon le bleu nuit de la charte, sinon le meilleur des trois. */
export function readableOn(bg, dark) {
  const lb = luminance(bg);
  const ratio = (c) => { const l = luminance(c); return (Math.max(lb, l) + 0.05) / (Math.min(lb, l) + 0.05); };
  if (ratio(WHITE) >= 4.5) return WHITE;
  if (ratio(dark) >= 4.5) return dark;
  return [WHITE, dark, BLACK].sort((x, y) => ratio(y) - ratio(x))[0];
}

/** theme = { primary, primary_light, primary_dark, accent } (#RRGGBB) → { "--c-…": "r g b" } ou null si invalide */
export function themeToVars(theme) {
  const p = hexToRgb(theme?.primary), pl = hexToRgb(theme?.primary_light), pd = hexToRgb(theme?.primary_dark), a = hexToRgb(theme?.accent);
  if (!p || !pl || !pd || !a) return null;
  return {
    // Boutons d'action : couleur d'accent de la campagne, texte choisi automatiquement pour rester lisible
    "--c-btn": trip(a),
    "--c-btn-hover": trip(mix(a, BLACK, 0.12)),
    "--c-btn-soft": trip(mix(a, WHITE, 0.22)),
    "--c-btn-text": trip(readableOn(a, pd)),
    "--c-primary": trip(p),
    "--c-primary-light": trip(pl),
    "--c-primary-dark": trip(pd),
    "--c-primary-mid": trip(mix(p, pl, 0.25)),
    "--c-primary-700": trip(mix(p, pl, 0.5)),
    "--c-primary-vibrant": trip(pl),
    "--c-primary-deep": trip(mix(pd, BLACK, 0.15)),
    "--c-accent": trip(a),
    "--c-accent-light": trip(mix(a, WHITE, 0.35)),
    "--c-accent-dark": trip(mix(a, BLACK, 0.25)),
  };
}

// ── Contraste (WCAG 2.x) ───────────────────────────────────────────────
const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
export const luminance = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
export function contrast(hexA, hexB) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  if (!a || !b) return 0;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Vérifie les associations réellement utilisées sur le site. Renvoie [{id, ratio, min, ok}] */
export function themeChecks(theme) {
  const rules = [
    { id: "white_on_primary", fg: "#ffffff", bg: theme?.primary, min: 4.5 },          // texte blanc sur fond principal (en-tête, boutons)
    { id: "white_on_dark", fg: "#ffffff", bg: theme?.primary_dark, min: 4.5 },         // texte blanc sur fond sombre (hero, pied de page)
    { id: "primary_on_accent", fg: theme?.primary, bg: theme?.accent, min: 4.5 },      // bouton accent : texte principal sur fond accent
    { id: "accent_on_primary", fg: theme?.accent, bg: theme?.primary, min: 3 },        // accent sur fond principal (titres mis en valeur)
  ];
  return rules.map((r) => { const ratio = contrast(r.fg, r.bg); return { id: r.id, ratio, min: r.min, ok: ratio >= r.min }; });
}
