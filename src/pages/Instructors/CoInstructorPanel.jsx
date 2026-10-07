// Équipe pédagogique d'un cours, en lecture seule : les intervenants sont désignés par l'administration.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Loader } from "lucide-react";
import api from "../../api/api";

export default function CoInstructorPanel({ courseId }) {
  const { t } = useTranslation("coInstructorPanel");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get(`/instructor/courses/${courseId}/co-instructors`)
      .then((r) => setList((r.data?.data || []).filter((e) => e.status === "accepted")))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
        <Users className="w-4 h-4 text-gray-400" />{t("titre")}
        {list.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{list.length}</span>}
      </h3>
      {loading ? (
        <div className="flex justify-center py-6"><Loader className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : failed ? (
        <p className="text-sm text-gray-500">{t("erreur_chargement")}</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">{t("aucun")}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">{entry.first_name?.[0]}{entry.last_name?.[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.first_name} {entry.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{entry.email}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800">{Number(entry.commission_rate)} %</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500">{t("note_equipe")}</p>
    </div>
  );
}
