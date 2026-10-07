import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

// Chat en direct Tawk.to. Les identifiants viennent de l'admin (Paramètres > Chat en direct)
// ou, à défaut, des variables VITE_TAWKTO_PROPERTY_ID / VITE_TAWKTO_WIDGET_ID.
// Le widget est masqué dans les espaces de travail (admin, instructeur) et dans le lecteur de cours.
const HIDDEN = [/^\/admin(\/|$)/, /^\/instructor(\/|$)/, /^\/courses\/[^/]+\/learn/];

export default function TawkTo() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const cfg = useRef(null);
  const loaded = useRef(false);

  const hidden = HIDDEN.some((re) => re.test(pathname));

  // 1) Charger la configuration et injecter le script (une seule fois)
  useEffect(() => {
    let cancelled = false;
    const inject = (c) => {
      if (cancelled || loaded.current || !c?.property_id) return;
      loaded.current = true;
      cfg.current = c;
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      window.Tawk_API.onLoad = () => {
        const h = HIDDEN.some((re) => re.test(window.location.pathname));
        if (h) window.Tawk_API.hideWidget?.();
      };
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://embed.tawk.to/${c.property_id}/${c.widget_id || "default"}`;
      s.charset = "UTF-8";
      s.setAttribute("crossorigin", "*");
      document.head.appendChild(s);
    };

    const envCfg = import.meta.env.VITE_TAWKTO_PROPERTY_ID
      ? { property_id: import.meta.env.VITE_TAWKTO_PROPERTY_ID, widget_id: import.meta.env.VITE_TAWKTO_WIDGET_ID }
      : null;
    api.get("/settings/public")
      .then((r) => inject(r.data?.data?.tawk || envCfg))
      .catch(() => inject(envCfg));
    return () => { cancelled = true; };
  }, []);

  // 2) Afficher / masquer selon la page
  useEffect(() => {
    const api_ = window.Tawk_API;
    if (!api_) return;
    if (hidden) api_.hideWidget?.(); else api_.showWidget?.();
  }, [hidden, pathname]);

  // 3) Identifier le visiteur connecté pour l'équipe support
  useEffect(() => {
    const api_ = window.Tawk_API;
    if (!api_ || !user) return;
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const apply = () => api_.setAttributes?.({ name: name || undefined, email: user.email }, () => {});
    if (typeof api_.setAttributes === "function") apply();
    else { const prev = api_.onLoad; api_.onLoad = () => { prev?.(); apply(); }; }
  }, [user?.id]);

  return null;
}
