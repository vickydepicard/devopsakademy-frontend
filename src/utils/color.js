// Transparence d'une couleur CSS quelconque (hex, rgb(var(--c-…)), nom…) sans concaténer d'alpha hexadécimal.
// pct = opacité en pourcentage (0-100).
export const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
