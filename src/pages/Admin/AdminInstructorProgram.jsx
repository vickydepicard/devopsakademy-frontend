// Programme instructeurs : tableau de bord admin (surveillance, intégration, contrat, paliers,
// versements, messagerie, annonces, collaborations, journal).
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, BadgeCheck, FileSignature, Layers, MessageSquare, Megaphone, ScrollText, Users, Wallet } from "lucide-react";
import { OverviewTab, OnboardingTab } from "./program/OverviewTabs";
import AgreementTab from "./program/AgreementTab";
import { TiersTab, PayoutsTab } from "./program/FinanceTabs";
import { MessagesTab, AnnouncementsTab, CollabTab, JournalTab } from "./program/CommsTabs";

const TABS = [
  ["overview", Activity], ["onboarding", BadgeCheck], ["agreement", FileSignature], ["tiers", Layers],
  ["payouts", Wallet], ["messages", MessageSquare], ["announcements", Megaphone], ["collab", Users], ["journal", ScrollText],
];

export default function AdminInstructorProgram() {
  const { t } = useTranslation("instructorProgram");
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get("tab")) ? params.get("tab") : "overview";
  const [msgTarget, setMsgTarget] = useState(null);

  useEffect(() => { document.title = `${t("page_title")} — DevOpsAkademy`; }, [t]);
  const go = (k) => setParams({ tab: k }, { replace: true });
  const openInstructorMessages = (id) => { setMsgTarget(id); go("messages"); };

  return (
    <div className="space-y-6 text-left max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("page_title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("page_subtitle")}</p>
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto" role="tablist">
        {TABS.map(([k, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => go(k)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}>
            <Icon className="w-4 h-4" />{t(`tab_${k}`)}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab onOpenInstructor={openInstructorMessages} />}
      {tab === "onboarding" && <OnboardingTab onOpenInstructor={openInstructorMessages} />}
      {tab === "agreement" && <AgreementTab />}
      {tab === "tiers" && <TiersTab />}
      {tab === "payouts" && <PayoutsTab />}
      {tab === "messages" && <MessagesTab initialId={msgTarget} />}
      {tab === "announcements" && <AnnouncementsTab />}
      {tab === "collab" && <CollabTab />}
      {tab === "journal" && <JournalTab />}
    </div>
  );
}
