// Bus d'événements pour les modales (alerte, confirmation, saisie). Rendu par <DialogHost />.
const listeners = new Set();
const emit = (d) => new Promise((resolve) => listeners.forEach((l) => l({ ...d, resolve })));

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// Heuristique : classe le message (succès / erreur / info) pour choisir l'icône.
const guess = (m) => /succ[eè]s|success|envoy[ée]|enregistr|valid[ée]|publi[ée]|r[ée]ussi|cr[ée][ée]|saved|sent|done/i.test(m) && !/erreur|error|impossible|échec|failed/i.test(m)
  ? "success" : /erreur|error|impossible|échec|failed|invalide|refus|interdit/i.test(m) ? "error" : "info";

export const showAlert = (message, type) => emit({ kind: "alert", message: String(message ?? ""), type: type || guess(String(message ?? "")) });
export const askConfirm = (message, opts = {}) => emit({ kind: "confirm", message: String(message ?? ""), ...opts });
export const askPrompt = (message, opts = {}) => emit({ kind: "prompt", message: String(message ?? ""), ...opts });

// Toute alerte native est remplacée par une modale.
export const installNativeAlert = () => { window.alert = (m) => { showAlert(m); }; };
