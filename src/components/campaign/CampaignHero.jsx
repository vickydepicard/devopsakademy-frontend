// Héros d'accueil en mode campagne : les slides de l'événement ET la présentation habituelle
// (« Maîtrisez DevOps… ») partagent la même section, qui défile automatiquement.
// Aucune campagne active → ce composant n'est pas utilisé et l'accueil reste inchangé.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from "lucide-react";
import { useCampaigns } from "../../theme/ThemeProvider";

const AUTOPLAY_MS = 7000;

const mediaUrl = (u) => {
  if (!u) return u;
  if (u.startsWith("/uploads/")) return `${(import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/?$/, "")}${u}`;
  return u;
};
const linkedinPostUrl = (embed) => {
  const m = /urn:li:(share|ugcPost|activity):\d+/i.exec(embed || "");
  return m ? `https://www.linkedin.com/feed/update/${m[0]}/` : "https://www.linkedin.com/";
};

// Même bouton que ceux du héros habituel : il suit donc les couleurs de la campagne.
function Cta({ slide }) {
  if (!slide.cta_url || !slide.cta_label) return null;
  const cls = "inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-black py-3.5 px-7 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  const inner = <>{slide.cta_label}{/^https?:\/\//i.test(slide.cta_url) ? <ExternalLink className="w-5 h-5" aria-hidden="true" /> : <ArrowRight className="w-5 h-5" aria-hidden="true" />}</>;
  return /^https?:\/\//i.test(slide.cta_url)
    ? <a href={slide.cta_url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <Link to={slide.cta_url} className={cls}>{inner}</Link>;
}

function Media({ slide, active, visited, t }) {
  const hasImg = !!slide.image_url, hasIn = !!slide.linkedin_url;
  const [tab, setTab] = useState(hasImg ? "image" : "linkedin");
  if (!hasImg && !hasIn) return null;
  const showImg = hasImg && (tab === "image" || !hasIn);
  const title = slide.title || slide.campaign_title || "";
  return (
    <div className="dok-media mx-auto flex w-full max-w-[460px] flex-col gap-2.5 lg:ml-auto lg:mr-0">
      {hasImg && hasIn && (
        <div role="tablist" className="mx-auto inline-flex rounded-full bg-white/10 p-1 text-xs font-semibold text-white">
          {[["image", t("carousel.show_image")], ["linkedin", t("carousel.show_linkedin")]].map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} tabIndex={active ? 0 : -1} onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 transition ${tab === k ? "bg-white text-primary-dark" : "hover:bg-white/10"}`}>{label}</button>
          ))}
        </div>
      )}
      {showImg ? (
        <img src={mediaUrl(slide.image_url)} alt={t("carousel.image_alt", { title })} loading="lazy"
          className="mx-auto h-auto max-h-[290px] w-auto max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/20 lg:max-h-[330px]" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/20">
          {visited ? (
            <iframe src={slide.linkedin_url} title={t("carousel.linkedin_title", { title })} loading="lazy" allowFullScreen
              className="block h-[300px] w-full border-0 lg:h-[320px]" />
          ) : <div className="h-[300px] lg:h-[320px]" />}
          <a href={linkedinPostUrl(slide.linkedin_url)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 border-t border-gray-100 py-2 text-xs font-semibold text-primary hover:bg-gray-50">
            {t("carousel.open_linkedin")}<ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

function CampaignSlide({ slide, active, visited, t }) {
  const hasMedia = !!(slide.image_url || slide.linkedin_url);
  return (
    <div className={`grid items-center gap-8 ${hasMedia ? "lg:grid-cols-2 lg:gap-12" : "lg:grid-cols-1 lg:text-center"}`}>
      <div className={`flex flex-col gap-4 ${hasMedia ? "" : "mx-auto max-w-3xl items-center"}`}>
        {slide.label && (
          <span className="dok-rise inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-bold text-accent" style={{ "--d": "0ms" }}>{slide.label}</span>
        )}
        {slide.title && (
          <h2 className="dok-rise text-balance text-4xl font-black leading-[1.05] tracking-tight lg:text-5xl xl:text-6xl" style={{ "--d": "120ms" }}>{slide.title}</h2>
        )}
        {slide.body && (
          <p className="dok-rise max-w-xl whitespace-pre-line text-lg leading-relaxed text-white/75" style={{ "--d": "240ms" }}>{slide.body}</p>
        )}
        {slide.cta_url && slide.cta_label && (
          <div className="dok-rise pt-1" style={{ "--d": "360ms" }}>{active ? <Cta slide={slide} /> : null}</div>
        )}
      </div>
      <Media slide={slide} active={active} visited={visited} t={t} />
    </div>
  );
}

export default function CampaignHero({ baseSlide }) {
  const { t } = useTranslation("campaigns");
  const { slides } = useCampaigns();
  const items = useMemo(() => [...slides.map((s) => ({ kind: "campaign", key: `c${s.id}`, slide: s })), { kind: "base", key: "base" }], [slides]);
  const total = items.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [visited, setVisited] = useState(() => new Set([0]));
  const touch = useRef(null);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, []);

  const go = useCallback((i, d) => {
    const n = (i + total) % total;
    setDir(d ?? (n >= index ? 1 : -1));
    setIndex(n);
    setVisited((v) => (v.has(n) ? v : new Set(v).add(n)));
  }, [total, index]);

  useEffect(() => { if (index >= total) setIndex(0); }, [total, index]);
  const stopped = paused || hover || reduced;
  useEffect(() => {
    if (total < 2 || stopped) return undefined;
    const id = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, total, stopped, go]);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, -1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, 1); }
  };

  return (
    <section aria-roledescription="carousel" aria-label={t("carousel.region")} data-campaign-carousel
      className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-700 text-white"
      onKeyDown={onKey} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="dok-drift pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
      <div className="dok-drift pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-primary-light/15 blur-3xl" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:pb-[4.5rem] lg:pt-12"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }}>
        <div className="grid" aria-live={stopped ? "polite" : "off"}>
          {items.map((it, i) => {
            const active = i === index;
            const pos = active ? "translate-x-0 opacity-100" : (i < index || (index === 0 && i === total - 1 && dir < 0) ? "-translate-x-10" : "translate-x-10") + " pointer-events-none invisible opacity-0";
            return (
              <article key={it.key} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${total}`} aria-hidden={!active}
                data-active={active || undefined}
                className={`col-start-1 row-start-1 flex items-center transition-all duration-700 ease-out ${pos}`}>
                <div className="w-full">
                  {it.kind === "base"
                    ? <div key={active ? "on" : "off"}>{baseSlide}</div>
                    : <CampaignSlide slide={it.slide} active={active} visited={visited.has(i)} t={t} />}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 pb-4">
            <div className="flex items-center gap-2">
              {items.map((it, i) => (
                <button key={it.key} type="button" onClick={() => go(i)} aria-label={t("carousel.go_to", { n: i + 1, total })} aria-current={i === index}
                  className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-500 ${i === index ? "w-10 bg-white/25" : "w-2.5 bg-white/40 hover:bg-white/70"}`}>
                  {i === index && (
                    <span key={`${index}-${paused}`} className="dok-progress absolute inset-y-0 left-0 rounded-full bg-accent"
                      style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: stopped ? "paused" : "running" }} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white">
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? t("carousel.play") : t("carousel.pause")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => go(index - 1, -1)} aria-label={t("carousel.previous")} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><ChevronLeft size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => go(index + 1, 1)} aria-label={t("carousel.next")} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
