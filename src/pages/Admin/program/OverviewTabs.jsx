// Aperçu (liste de surveillance) et suivi de l'intégration des instructeurs.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Circle, Send } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate } from "../../../utils/format";
import { Card, Center, Empty, Pill, Progress, Spinner, Stat, btnGhost, fullName } from "./ui";

export const TASK_KEYS = ["profile", "agreement", "payout", "first_course", "course_submitted"];

export function TaskChecklist({ tasks, compact }) {
  const { t } = useTranslation("instructorProgram");
  return (
    <ul className={compact ? "flex flex-wrap gap-1.5" : "space-y-1.5"}>
      {tasks.map((k) => compact ? (
        <li key={k.key}><Pill tone={k.done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>{k.done ? "✓ " : ""}{t(`task_${k.key}`)}</Pill></li>
      ) : (
        <li key={k.key} className="flex items-center gap-2 text-sm">
          {k.done ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
          <span className={k.done ? "text-gray-500 line-through" : "text-gray-800"}>{t(`task_${k.key}`)}</span>
        </li>
      ))}
    </ul>
  );
}

const PersonRow = ({ u, right, onOpen }) => (
  <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
    <button type="button" onClick={() => onOpen?.(u.id)} className="min-w-0 text-left bg-transparent hover:underline">
      <span className="font-medium text-gray-900">{fullName(u)}</span>
      <span className="block text-xs text-gray-400 truncate">{u.email}</span>
    </button>
    <span className="text-xs text-gray-500 shrink-0 text-right">{right}</span>
  </li>
);

export function OverviewTab({ onOpenInstructor }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [data, setData] = useState(null);
  const [ob, setOb] = useState(null);

  useEffect(() => {
    api.get("/instructor-program/admin/watchlist").then((r) => setData(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
    api.get("/instructor-program/admin/onboarding").then((r) => setOb(r.data)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <Center><Spinner className="w-6 h-6" /></Center>;
  const blocks = [
    ["stalled_onboarding", t("watch_stalled"), (u) => t("watch_stalled_row", { percent: u.percent, days: u.days })],
    ["inactive", t("watch_inactive"), (u) => u.last_login ? t("watch_last_login", { date: formatDate(u.last_login) }) : t("watch_never_logged")],
    ["low_rated", t("watch_low_rated"), (u) => t("watch_low_rated_row", { rating: u.avg_rating, count: u.review_count, neg: u.negative_90d })],
    ["no_published_course", t("watch_no_course"), (u) => t("watch_joined", { date: formatDate(u.joined) })],
  ];
  const total = blocks.reduce((s, [k]) => s + data[k].length, 0);

  return (
    <div className="space-y-5">
      {ob && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label={t("stat_instructors")} value={ob.stats.total} />
          <Stat label={t("stat_onboarding_done")} value={ob.stats.complete} tone="text-emerald-600" />
          <Stat label={t("stat_onboarding_stalled")} value={ob.stats.stalled} tone={ob.stats.stalled ? "text-amber-600" : "text-gray-900"} />
          <Stat label={t("stat_to_watch")} value={total} tone={total ? "text-red-600" : "text-gray-900"} />
        </div>
      )}
      {total === 0 && <Card><Empty>{t("watch_all_good")}</Empty></Card>}
      <div className="grid lg:grid-cols-2 gap-5">
        {blocks.filter(([k]) => data[k].length > 0).map(([k, title, right]) => (
          <Card key={k} title={`${title} (${data[k].length})`}>
            <ul className="divide-y divide-gray-100">{data[k].map((u) => <PersonRow key={u.id} u={u} right={right(u)} onOpen={onOpenInstructor} />)}</ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OnboardingTab({ onOpenInstructor }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    api.get("/instructor-program/admin/onboarding").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const remind = async (u) => {
    setBusy(u.id);
    try { await api.post(`/instructor-program/admin/instructors/${u.id}/onboarding/remind`); notify(t("reminder_sent"), "success"); load(); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(null); }
  };

  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;
  if (!rows.length) return <Card><Empty>{t("no_instructors")}</Empty></Card>;
  return (
    <Card title={t("onboarding_title")}>
      <p className="text-xs text-gray-500 mb-4">{t("onboarding_hint")}</p>
      <ul className="divide-y divide-gray-100">
        {rows.map((u) => (
          <li key={u.id} className="py-3 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
            <div className="min-w-0">
              <button type="button" onClick={() => onOpenInstructor?.(u.id)} className="text-left bg-transparent hover:underline">
                <span className="text-sm font-semibold text-gray-900">{fullName(u)}</span>
                <span className="text-xs text-gray-400 ml-2">{u.email}</span>
              </button>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="w-40"><Progress percent={u.percent} /></div>
                <span className="text-xs font-bold text-gray-600">{u.percent}%</span>
                <span className="text-xs text-gray-400">{t("days_since", { count: u.days_since_start })}</span>
                {u.stalled && <Pill tone="bg-amber-100 text-amber-700">{t("stalled")}</Pill>}
                {u.complete && <Pill tone="bg-emerald-100 text-emerald-700">{t("complete")}</Pill>}
              </div>
              <div className="mt-2"><TaskChecklist tasks={u.tasks} compact /></div>
            </div>
            {!u.complete && (
              <button type="button" disabled={busy === u.id} onClick={() => remind(u)} className={btnGhost}>
                {busy === u.id ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}{t("remind")}
                {u.reminder_count > 0 && <span className="text-[11px] text-gray-400">({u.reminder_count})</span>}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
