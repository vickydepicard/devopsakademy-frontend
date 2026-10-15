// Emplacement publicitaire intégré à une page (accueil, tableau de bord, catalogue).
// Les annonces sont créées depuis Admin → Marketing → Bannières ; une seule est affichée, tirée au sort.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, X } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { BannerCss, Countdown, toneOf } from "./bannerStyles";

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

export default function AdSlot({ placement, className = "" }) {
  const { t, i18n } = useTranslation("marketing");
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState(false);
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  useEffect(() => {
    let alive = true;
    api.get("/marketing/banners/active").then((r) => { if (alive) setItems((r.data.data || []).filter((b) => b.placement === placement)); }).catch(() => {});
    return () => { alive = false; };
  }, [placement, user?.id]);

  // une annonce tirée au sort, stable pendant la vie du composant
  const ad = useMemo(() => {
    const open = items.filter((b) => !safe(() => localStorage.getItem(`banner_dismissed_${b.id}`) === "1", false));
    return open.length ? open[Math.floor(Math.random() * open.length)] : null;
  }, [items]);

  useEffect(() => {
    if (!ad) return;
    const k = `banner_seen_${ad.id}`;
    if (safe(() => sessionStorage.getItem(k) === "1", false)) return;
    safe(() => sessionStorage.setItem(k, "1"));
    api.post(`/marketing/banners/${ad.id}/impression`).catch(() => {});
  }, [ad?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ad || closed) return null;
  const tone = toneOf(ad.tone);
  const txt = (k) => (en ? ad[`${k}_en`] || ad[`${k}_fr`] : ad[`${k}_fr`] || ad[`${k}_en`]);
  const click = () => api.post(`/marketing/banners/${ad.id}/click`).catch(() => {});
  const close = () => { safe(() => localStorage.setItem(`banner_dismissed_${ad.id}`, "1")); setClosed(true); };
  const url = ad.cta_url || "/";
  const hasCta = ad.cta_url && txt("cta_label");
  const ctaCls = `bnr-cta shrink-0 inline-flex items-center justify-center gap-2 bg-white ${tone.accent} font-extrabold text-sm rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-px transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white`;
  const label = <>{txt("cta_label")}<ArrowRight className="w-4 h-4" aria-hidden="true" /></>;

  return (
    <aside className={className} aria-label={t("banner_region")}>
      <BannerCss />
      <div className={`bnr-pop relative overflow-hidden rounded-2xl bg-gradient-to-r ${tone.grad} text-white shadow-lg`}>
        <div className="bnr-stripes absolute inset-0 pointer-events-none" aria-hidden="true" />
        <tone.Icon className="absolute -right-4 -bottom-6 w-36 h-36 text-white/10 pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-center gap-5 p-5 sm:p-6 pr-12 flex-wrap sm:flex-nowrap">
          {ad.image_url && <img src={ad.image_url} alt="" className="hidden sm:block w-24 h-24 rounded-xl object-cover shrink-0 ring-2 ring-white/30" />}
          <div className="flex-1 min-w-0 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <tone.Icon className="w-3 h-3" aria-hidden="true" />{t(`tone_badge_${ad.tone}`, { defaultValue: t("tone_badge_promo") })}
            </span>
            <p className="text-lg sm:text-xl font-black leading-snug">{txt("title")}</p>
            {txt("body") && <p className="text-sm text-white/85 mt-1 leading-relaxed">{txt("body")}</p>}
            <Countdown endsAt={ad.ends_at} label={t("ends_in")} className="mt-2 text-xs text-white/95 bg-black/20 rounded-full px-2.5 py-1" />
          </div>
          {hasCta && (/^https?:\/\//i.test(url)
            ? <a href={url} target="_blank" rel="noreferrer noopener" onClick={click} className={ctaCls}>{label}</a>
            : <Link to={url} onClick={click} className={ctaCls}>{label}</Link>)}
        </div>
        <button type="button" onClick={close} aria-label={t("banner_close")}
          className="absolute right-2.5 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white/75 hover:bg-white/20 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="w-4 h-4" /></button>
      </div>
    </aside>
  );
}
