// Page publique /newsletter : inscription sans compte (partageable sur les réseaux, en signature d'email, etc.).
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gift, Mail, Video } from "lucide-react";
import { NewsletterCard } from "../../components/Common/NewsletterSection";

export default function NewsletterPage() {
  const { t } = useTranslation("marketing");
  const [params] = useSearchParams();
  const source = (params.get("src") || "newsletter-page").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "newsletter-page";
  useEffect(() => { document.title = `${t("nl_page_title")} — DevOpsAkademy`; }, [t]);

  const perks = [[Gift, t("nl_perk_offers"), t("nl_perk_offers_text")], [Video, t("nl_perk_webinars"), t("nl_perk_webinars_text")], [Mail, t("nl_perk_news"), t("nl_perk_news_text")]];
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 text-center">
      <h1 className="text-4xl font-black text-gray-900">{t("nl_page_title")}</h1>
      <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t("nl_section_subtitle")}</p>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mt-8 max-w-xl mx-auto"><NewsletterCard source={source} /></div>
      <div className="grid sm:grid-cols-3 gap-4 mt-10 text-left">
        {perks.map(([Icon, title, text]) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center mb-3"><Icon className="w-5 h-5" /></span>
            <p className="font-bold text-gray-900">{title}</p><p className="text-sm text-gray-500 mt-1">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
