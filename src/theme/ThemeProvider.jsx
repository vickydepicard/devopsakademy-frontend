// Campagnes / événements : récupère les campagnes actives, applique le thème de couleurs au site public
// et expose les slides au carrousel de l'accueil. Le panneau admin garde toujours la charte normale.
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { THEME_VARS, themeToVars } from "./themeUtils";

const STORAGE_KEY = "dok_campaign_theme";
const DEFAULT_META_COLOR = "#2d287f";
const REFRESH_MS = 5 * 60 * 1000;

const setMetaThemeColor = (hex) => {
  try { document.querySelector('meta[name="theme-color"]')?.setAttribute("content", hex); } catch { /* ignore */ }
};

/** Applique (ou retire, si theme = null) les variables de couleur sur <html>. */
export function applyTheme(theme) {
  const root = document.documentElement;
  const vars = theme ? themeToVars(theme) : null;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.campaignTheme = theme.slug || "custom";
    setMetaThemeColor(theme.primary);
  } else {
    THEME_VARS.forEach((k) => root.style.removeProperty(k));
    delete root.dataset.campaignTheme;
    setMetaThemeColor(DEFAULT_META_COLOR);
  }
}

/** Avant le premier rendu : réapplique le dernier thème connu pour éviter un flash de la charte normale. */
export function bootTheme() {
  try {
    if (window.location.pathname.startsWith("/admin")) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) applyTheme(JSON.parse(raw));
  } catch { /* stockage indisponible : on garde la charte normale */ }
}

const Ctx = createContext({ campaigns: [], slides: [], theme: null, ready: false, refresh: () => {} });
export const useCampaigns = () => useContext(Ctx);

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export default function ThemeProvider({ children }) {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith("/admin");
  const [state, setState] = useState({ campaigns: [], theme: null, ready: false });

  const refresh = useCallback(async () => {
    try {
      // Appel public sans jeton : un jeton expiré ne doit jamais empêcher l'affichage des campagnes.
      const res = await fetch(`${API}/campaigns/active`, { headers: { Accept: "application/json" }, cache: "no-store" });
      const json = await res.json();
      const data = json?.data || {};
      const theme = data.theme && themeToVars(data.theme) ? data.theme : null;
      setState({ campaigns: Array.isArray(data.campaigns) ? data.campaigns : [], theme, ready: true });
      try { theme ? localStorage.setItem(STORAGE_KEY, JSON.stringify(theme)) : localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    } catch {
      setState((s) => ({ ...s, ready: true })); // API injoignable : on garde l'état précédent
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  // Le thème ne s'applique pas au panneau admin
  useEffect(() => { applyTheme(inAdmin ? null : state.theme); }, [state.theme, inAdmin]);

  const slides = useMemo(
    () => state.campaigns.flatMap((c) => (c.slides || []).map((s) => ({ ...s, campaign_title: c.title }))),
    [state.campaigns]
  );
  const value = useMemo(() => ({ ...state, slides, refresh }), [state, slides, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
