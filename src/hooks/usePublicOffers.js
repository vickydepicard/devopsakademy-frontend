// Offres publiques (codes promo « affichés sur le site ») + code reçu par lien (?promo=CODE).
import { useEffect, useState } from "react";
import api from "../api/api";

const KEY = "dak_promo";

// Un lien de partage …?promo=CODE mémorise le code pour l'appliquer automatiquement au paiement.
try {
  const p = new URLSearchParams(window.location.search).get("promo");
  if (p) sessionStorage.setItem(KEY, p.trim().toUpperCase().replace(/\s+/g, "").slice(0, 50));
} catch { /* stockage indisponible */ }

export const getStoredPromo = () => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } };

let cache = null;      // offres déjà chargées
let inflight = null;   // requête en cours (partagée par toutes les cartes)
let loadedAt = 0;

function load() {
  if (cache && Date.now() - loadedAt < 60_000) return Promise.resolve(cache);
  if (!inflight) {
    inflight = api.get("/marketing/offers")
      .then((r) => { cache = Array.isArray(r.data?.data) ? r.data.data : []; loadedAt = Date.now(); return cache; })
      .catch(() => cache || [])
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export default function usePublicOffers() {
  const [offers, setOffers] = useState(cache || []);
  useEffect(() => {
    let alive = true;
    load().then((o) => { if (alive) setOffers(o); });
    return () => { alive = false; };
  }, []);
  return offers;
}

/** Meilleure offre applicable à un cours : { code, percent, discount, final, base, expires_at, remaining } ou null. */
export function bestOfferFor(offers, course) {
  const base = Number(course?.price) || 0;
  if (!course || course.is_free === 1 || course.is_free === true || base <= 0) return null;
  // un cours déjà en promotion de prix n'accepte pas de code (pas de cumul)
  if (Number(course.original_price) > base) return null;
  let best = null;
  for (const o of offers || []) {
    if (o.applicable_to === "specific_courses" && !(o.course_ids || []).map(Number).includes(Number(course.id))) continue;
    if (o.applicable_to === "specific_categories" && !(o.category_ids || []).map(Number).includes(Number(course.category_id))) continue;
    if (Number(o.minimum_amount) > base) continue;
    const raw = o.discount_type === "fixed" ? Number(o.discount_value) : (base * Number(o.discount_value)) / 100;
    const discount = Math.min(Math.max(Math.round(raw), 0), base);
    if (discount <= 0) continue;
    if (!best || discount > best.discount) {
      best = { code: o.code, discount, final: base - discount, base, percent: Math.round((discount / base) * 100), expires_at: o.expires_at, remaining: o.remaining };
    }
  }
  return best;
}
