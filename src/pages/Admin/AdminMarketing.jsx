// Marketing : campagnes email (newsletter, offres, webinaires), promotions de prix, bannières, réseaux sociaux, abonnés.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Megaphone, Percent, Share2, Ticket, Users, Workflow } from "lucide-react";
import api from "../../api/api";
import CampaignsTab from "./marketing/CampaignsTab";
import { BannersTab, PromotionsTab, SocialTab, SubscribersTab } from "./marketing/OtherTabs";
import { AutomationsTab, CouponsTab } from "./marketing/GrowthTabs";

const TABS = [["campaigns", Mail], ["automations", Workflow], ["promotions", Percent], ["coupons", Ticket], ["banners", Megaphone], ["social", Share2], ["subscribers", Users]];

export default function AdminMarketing() {
  const { t } = useTranslation("marketing");
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get("tab")) ? params.get("tab") : "campaigns";
  const [meta, setMeta] = useState(null);
  const [pickers, setPickers] = useState(null);

  useEffect(() => {
    document.title = `${t("page_title")} — DevOpsAkademy`;
    api.get("/marketing/admin/meta").then((r) => setMeta(r.data.data)).catch(() => {});
    api.get("/marketing/admin/pickers").then((r) => setPickers(r.data.data)).catch(() => {});
  }, [t]);

  return (
    <div className="space-y-6 text-left max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("page_title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("page_subtitle")}</p>
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto" role="tablist">
        {TABS.map(([k, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setParams({ tab: k }, { replace: true })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}>
            <Icon className="w-4 h-4" />{t(`tab_${k}`)}
          </button>
        ))}
      </div>
      {tab === "campaigns" && <CampaignsTab meta={meta} pickers={pickers} />}
      {tab === "automations" && <AutomationsTab pickers={pickers} />}
      {tab === "promotions" && <PromotionsTab pickers={pickers} />}
      {tab === "coupons" && <CouponsTab pickers={pickers} />}
      {tab === "banners" && <BannersTab />}
      {tab === "social" && <SocialTab meta={meta} />}
      {tab === "subscribers" && <SubscribersTab />}
    </div>
  );
}
