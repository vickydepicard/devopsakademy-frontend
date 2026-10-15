// Historique des retours de l'équipe sur un cours (grille de qualité + commentaires).
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, X } from "lucide-react";
import api from "../../../api/api";
import { RoundsHistory } from "../../Admin/program/ReviewGrid";

export default function CourseFeedbackModal({ courseId, title, onClose }) {
  const { t } = useTranslation("instructorProgram");
  const [rounds, setRounds] = useState(null);
  useEffect(() => { api.get(`/instructor-program/courses/${courseId}/review-history`).then((r) => setRounds(r.data.data)).catch(() => setRounds([])); }, [courseId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto text-left">
        <div className="sticky top-0 bg-white flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 truncate">{t("feedback_title", { title })}</h3>
          <button type="button" onClick={onClose} className="p-1.5 bg-transparent text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          {!rounds ? <div className="flex justify-center py-10"><Loader className="w-5 h-5 animate-spin text-primary" /></div>
            : rounds.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">{t("feedback_empty")}</p>
            : <RoundsHistory rounds={rounds} />}
        </div>
      </div>
    </div>
  );
}
