// Affichage d'un code promo sur les cours : pastille pour les cartes, encadré pour la page détail.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Gift } from "lucide-react";
import { formatDate, formatMoney } from "../../utils/format";

const copyText = (text) => navigator.clipboard?.writeText(text).catch(() => {});

/** Pastille « -20 % · code XXXX » (cartes de cours). */
export function OfferRibbon({ offer }) {
  const { t } = useTranslation("marketing");
  if (!offer) return null;
  return (
    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-primary-dark shadow-md">
      <Gift className="h-3.5 w-3.5" />
      {t("offer_off", { percent: offer.percent })}
      <span className="font-semibold opacity-80">· {t("offer_code_short", { code: offer.code })}</span>
    </span>
  );
}

/** Encadré de la page détail : prix avec le code, bouton « copier », date de fin. */
export function OfferBox({ offer }) {
  const { t } = useTranslation("marketing");
  const [copied, setCopied] = useState(false);
  if (!offer) return null;
  const copy = () => { copyText(offer.code); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 to-white p-4">
      <div className="flex items-center gap-2 text-sm font-extrabold text-primary-dark">
        <Gift className="h-4 w-4 text-primary" /> {t("offer_box_title", { percent: offer.percent })}
      </div>
      <p className="mt-1.5 text-sm text-gray-700">
        {t("offer_box_text", { price: formatMoney(offer.final), old: formatMoney(offer.base) })}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 truncate rounded-xl border border-dashed border-primary/40 bg-white px-3 py-2 text-center font-mono text-sm font-bold tracking-wider text-primary-dark">{offer.code}</span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? t("offer_copied") : t("offer_copy")}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-gray-500">
        {offer.expires_at ? t("offer_until", { date: formatDate(offer.expires_at) }) : t("offer_no_end")}
        {offer.remaining !== null && offer.remaining !== undefined ? ` · ${t("offer_remaining", { count: offer.remaining })}` : ""}
        {" · "}{t("offer_how")}
      </p>
    </div>
  );
}
