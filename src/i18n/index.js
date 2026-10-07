import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Chaque page possède son espace de noms : ajoutez simplement fr/<ns>.json et en/<ns>.json.
const modules = import.meta.glob("./locales/*/*.json", { eager: true });
const resources = { fr: {}, en: {} };
for (const [path, mod] of Object.entries(modules)) {
  const [, lng, file] = path.match(/\.\/locales\/(\w+)\/(.+)\.json$/);
  if (resources[lng]) resources[lng][file] = mod.default || mod;
}

/** Tag BCP 47 pour Intl / toLocale*String selon la langue active */
export const getLocale = () => ((i18n.resolvedLanguage || i18n.language || "fr").startsWith("en") ? "en-US" : "fr-FR");

export const SUPPORTED_LANGUAGES = ["fr", "en"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: Object.keys(resources.fr),
    defaultNS: "common",
    fallbackLng: "en", // visiteur dont la langue n'est ni FR ni EN → anglais
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false }, // React échappe déjà
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
  });

const syncHtmlLang = (lng) => {
  document.documentElement.lang = (lng || "fr").slice(0, 2);
};
syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
