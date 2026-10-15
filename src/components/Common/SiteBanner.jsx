// Bannières publicitaires du site (barre supérieure et fenêtre d'annonce), gérées depuis Admin → Marketing.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, X } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { BannerCss, Countdown, toneOf } from "./bannerStyles";

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
const dismissed = (id) => safe(() => localStorage.getItem(`banner_dismissed_${id}`) === "1", false);
const seen = (id) => safe(() => sessionStorage.getItem(`banner_seen_${id}`) === "1", false);

const Cta = ({ url, children, className, onClick }) =>
  /^https?:\/\//i.test(url || "")
    ? <a href={url} target="_blank" rel="noreferrer noopener" onClick={onClick} className={className}>{children}</a>
    : <Link to={url || "/"} onClick={onClick} className={className}>{children}</Link>;

export default function SiteBanner() {
  const { t, i18n } = useTranslation("marketing");
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [items, setItems] = useState([]);
  const [hidden, setHidden] = useState({});
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");
  const hide = /^\/(admin|instructor)(\/|$)/.test(pathname);

  useEffect(() => {
    if (hide) return;
    api.get("/marketing/banners/active").then((r) => setItems(r.data.data || [])).catch(() => setItems([]));
  }, [user?.id, hide]);

  const visible = items.filter((b) => !dismissed(b.id) && !hidden[b.id]);
  const bar = visible.find((b) => b.placement === "top_bar");
  const popup = visible.find((b) => b.placement === "popup" && !seen(b.id));

  // une impression par session et par bannière
  useEffect(() => {
    [bar, popup].filter(Boolean).forEach((b) => {
      if (seen(b.id)) return;
      safe(() => sessionStorage.setItem(`banner_seen_${b.id}`, "1"));
      api.post(`/marketing/banners/${b.id}/impression`).catch(() => {});
    });
  }, [bar?.id, popup?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = (b) => { safe(() => localStorage.setItem(`banner_dismissed_${b.id}`, "1")); setHidden((h) => ({ ...h, [b.id]: true })); };
  const click = (b) => api.post(`/marketing/banners/${b.id}/click`).catch(() => {});
  const txt = (b, k) => (en ? b[`${k}_en`] || b[`${k}_fr`] : b[`${k}_fr`] || b[`${k}_en`]);

  // fermeture de la fenêtre d'annonce au clavier
  useEffect(() => {
    if (!popup) return undefined;
    const onKey = (e) => e.key === "Escape" && close(popup);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (hide) return null;
  const barTone = bar && toneOf(bar.tone);
  const popTone = popup && toneOf(popup.tone);

  return (
    <>
      <BannerCss />
      {bar && (
        <div role="region" aria-label={t("banner_region")} className={`bnr-in relative bg-gradient-to-r ${barTone.grad} text-white`}>
          <div className="bnr-stripes absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto pl-4 pr-12 py-2.5 flex items-center justify-center gap-x-3 gap-y-1.5 flex-wrap text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
              <barTone.Icon className="w-3.5 h-3.5" aria-hidden="true" />{t(`tone_badge_${bar.tone}`, { defaultValue: t("tone_badge_promo") })}
            </span>
            <span className="min-w-0 text-center leading-snug">
              <strong className="font-extrabold">{txt(bar, "title")}</strong>
              {txt(bar, "body") && <span className="hidden sm:inline text-white/85"> — {txt(bar, "body")}</span>}
            </span>
            <Countdown endsAt={bar.ends_at} label={t("ends_in")} className="text-white/95 text-xs bg-black/20 rounded-full px-2.5 py-1" />
            {bar.cta_url && txt(bar, "cta_label") && (
              <Cta url={bar.cta_url} onClick={() => click(bar)}
                className={`bnr-cta inline-flex items-center gap-1.5 rounded-full bg-white ${barTone.accent} font-extrabold text-xs sm:text-sm px-4 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-px transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-white`}>
                {txt(bar, "cta_label")}<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Cta>
            )}
          </div>
          <button type="button" onClick={() => close(bar)} aria-label={t("banner_close")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-white/0 text-white/80 hover:bg-white/20 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onMouseDown={() => close(popup)}>
          <div onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={txt(popup, "title")}
            className="bnr-pop relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-left">
            <div className={`relative bg-gradient-to-br ${popTone.grad} text-white`}>
              <div className="bnr-stripes absolute inset-0" aria-hidden="true" />
              {popup.image_url
                ? <img src={popup.image_url} alt="" className="relative w-full max-h-48 object-cover" />
                : <div className="relative h-24 flex items-center justify-center"><popTone.Icon className="w-12 h-12 text-white/90" aria-hidden="true" /></div>}
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                <popTone.Icon className="w-3.5 h-3.5" aria-hidden="true" />{t(`tone_badge_${popup.tone}`, { defaultValue: t("tone_badge_promo") })}
              </span>
              <button type="button" onClick={() => close(popup)} aria-label={t("banner_close")}
                className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-900 leading-snug">{txt(popup, "title")}</h3>
              {txt(popup, "body") && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{txt(popup, "body")}</p>}
              <Countdown endsAt={popup.ends_at} label={t("ends_in")} className={`mt-4 text-sm ${popTone.accent} bg-gray-50 rounded-xl px-3 py-2`} />
              <div className="flex items-center justify-end gap-2 mt-5">
                <button type="button" onClick={() => close(popup)} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">{t("banner_later")}</button>
                {popup.cta_url && txt(popup, "cta_label") && (
                  <Cta url={popup.cta_url} onClick={() => { click(popup); close(popup); }}
                    className={`bnr-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r ${popTone.grad} shadow-md hover:shadow-lg hover:-translate-y-px transition`}>
                    {txt(popup, "cta_label")}<ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Cta>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
