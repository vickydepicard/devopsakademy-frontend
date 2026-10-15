// Aperçu fidèle d'un thème : les variables CSS du thème sont posées sur ce bloc uniquement.
import { useTranslation } from "react-i18next";
import { themeToVars } from "../../../theme/themeUtils";

export default function ThemePreview({ theme, className = "" }) {
  const { t } = useTranslation("adminCampaigns");
  const vars = themeToVars(theme);
  if (!vars) return <div className={`grid h-40 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400 ${className}`}>#RRGGBB</div>;
  return (
    <div style={vars} className={`overflow-hidden rounded-xl border border-slate-200 text-left shadow-sm ${className}`} aria-label={t("themes.preview")} role="img">
      <div className="flex items-center justify-between bg-primary px-3 py-2">
        <span className="text-[11px] font-bold text-white">{t("themes.preview_brand")} <span className="text-accent">{t("themes.preview_brand_b")}</span></span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-white/80">{t("themes.preview_menu")}</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">{t("themes.preview_cta")}</span>
        </span>
      </div>
      <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4 py-5">
        <p className="text-base font-extrabold leading-tight text-white">{t("themes.preview_title").split(" ")[0]} <span className="text-accent">{t("themes.preview_title").split(" ").slice(1).join(" ")}</span></p>
        <p className="mt-1 text-[11px] text-white/80">{t("themes.preview_text")}</p>
        <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-primary">{t("themes.preview_button")}</span>
      </div>
      <div className="flex items-center gap-2 bg-white px-3 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("themes.preview_buttons")}</span>
        <span className="rounded-lg px-3 py-1 text-[11px] font-bold shadow-sm" style={{ background: "rgb(var(--c-btn))", color: "rgb(var(--c-btn-text))" }}>{t("themes.preview_enroll")}</span>
        <span className="rounded-lg border-2 px-3 py-1 text-[11px] font-bold" style={{ borderColor: "rgb(var(--c-primary))", color: "rgb(var(--c-primary))" }}>{t("themes.preview_details")}</span>
      </div>
    </div>
  );
}
