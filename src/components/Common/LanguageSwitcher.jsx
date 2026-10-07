import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../../i18n";

/** Sélecteur de langue FR / EN. `variant="light"` pour fonds clairs. */
export default function LanguageSwitcher({ variant = "dark", className = "" }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2);

  const palette =
    variant === "light"
      ? { wrap: "border-gray-200 text-gray-600", on: "bg-primary text-white", off: "hover:bg-gray-100" }
      : { wrap: "border-white/25 text-gray-200", on: "bg-accent text-primary", off: "hover:bg-white/10" };

  return (
    <div
      role="group"
      aria-label={t("language.switchTo")}
      className={`inline-flex items-center gap-1 rounded-full border px-1 py-0.5 text-xs font-semibold ${palette.wrap} ${className}`}
    >
      <Globe className="w-3.5 h-3.5 ml-1 opacity-80" aria-hidden="true" />
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          lang={lng}
          title={t(`language.${lng}`)}
          className={`px-2 py-0.5 rounded-full uppercase transition ${current === lng ? palette.on : palette.off}`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}
