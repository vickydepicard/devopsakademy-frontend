// Styles partagés des annonces du site (barre supérieure, fenêtre d'annonce, encarts) : un seul langage visuel.
import { useEffect, useState } from "react";
import { Flame, Gift, Info, Sparkles } from "lucide-react";

export const TONES = {
  info:    { grad: "from-sky-700 via-sky-600 to-blue-600",           accent: "text-sky-700",     ring: "ring-sky-300",     Icon: Info },
  promo:   { grad: "from-indigo-800 via-indigo-700 to-violet-600",   accent: "text-indigo-700",  ring: "ring-indigo-300",  Icon: Sparkles },
  success: { grad: "from-emerald-700 via-emerald-600 to-teal-600",   accent: "text-emerald-700", ring: "ring-emerald-300", Icon: Gift },
  urgent:  { grad: "from-red-700 via-red-600 to-orange-500",         accent: "text-red-700",     ring: "ring-red-300",     Icon: Flame },
};
export const toneOf = (t) => TONES[t] || TONES.promo;

// Motif discret en diagonale + animations (respecte « réduire les animations »)
export const BannerCss = () => (
  <style>{`
    @keyframes bnr-in { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }
    @keyframes bnr-pop { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
    @keyframes bnr-shine { 0% { transform: translateX(-130%) skewX(-20deg); } 55%,100% { transform: translateX(260%) skewX(-20deg); } }
    @keyframes bnr-pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
    .bnr-in { animation: bnr-in .45s cubic-bezier(.22,1,.36,1) both; }
    .bnr-pop { animation: bnr-pop .35s cubic-bezier(.22,1,.36,1) both; }
    .bnr-stripes { background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 14px, transparent 14px 28px); }
    .bnr-cta { position: relative; overflow: hidden; }
    .bnr-cta::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent); animation: bnr-shine 3.2s ease-in-out infinite; }
    .bnr-dot { animation: bnr-pulse 1.6s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .bnr-in, .bnr-pop, .bnr-cta::after, .bnr-dot { animation: none !important; } }
  `}</style>
);

/** Temps restant avant `endsAt` ; null si absent, trop lointain (> 10 jours) ou dépassé. */
export function useCountdown(endsAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (!(ms > 0) || ms > 10 * 86400_000) return null;
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const two = (n) => String(n).padStart(2, "0");

/** Compte à rebours compact : « 2 j 04:12:33 ». */
export function Countdown({ endsAt, label, className = "" }) {
  const c = useCountdown(endsAt);
  if (!c) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className}`} role="timer" aria-live="off">
      <span className="bnr-dot w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {label && <span className="opacity-80">{label}</span>}
      <strong className="font-extrabold">{c.d > 0 ? `${c.d} j ` : ""}{two(c.h)}:{two(c.m)}:{two(c.s)}</strong>
    </span>
  );
}
