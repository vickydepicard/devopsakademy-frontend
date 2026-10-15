// Parcours d'intégration affiché sur le tableau de bord de l'instructeur.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, Circle, Rocket } from "lucide-react";
import api from "../../../api/api";

export default function OnboardingCard() {
  const { t } = useTranslation("instructorProgram");
  const [ob, setOb] = useState(null);
  useEffect(() => { api.get("/instructor-program/onboarding/me").then((r) => setOb(r.data.data)).catch(() => {}); }, []);
  if (!ob || ob.complete) return null;

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-black text-gray-900 text-sm flex items-center gap-2"><Rocket className="w-4 h-4 text-indigo-500" />{t("my_onboarding_title")}</h2>
        <span className="text-xs font-bold text-indigo-600">{ob.done}/{ob.total}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${ob.percent}%` }} />
      </div>
      <ul className="space-y-1.5">
        {ob.tasks.map((k) => (
          <li key={k.key}>
            {k.done ? (
              <span className="flex items-center gap-2 text-sm text-gray-400 line-through"><Check className="w-4 h-4 text-emerald-500 shrink-0" />{t(`task_${k.key}`)}</span>
            ) : (
              <Link to={k.link} className="flex items-center justify-between gap-2 text-sm font-medium text-gray-800 hover:text-indigo-600">
                <span className="flex items-center gap-2"><Circle className="w-4 h-4 text-gray-300 shrink-0" />{t(`task_${k.key}`)}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
