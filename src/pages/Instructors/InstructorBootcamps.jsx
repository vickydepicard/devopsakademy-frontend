import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Calendar, BookOpen, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";

const BADGE = {
  live: "bg-red-50 text-red-700 border-red-200",
  scheduled: "bg-slate-50 text-slate-700 border-slate-200",
  ended: "bg-slate-50 text-slate-500 border-slate-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function InstructorBootcamps() {
  const { t, i18n } = useTranslation("instructorBootcamps");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = `${t("titre")} — DevOpsAkademy`;
    api.get("/bootcamps/admin/all")
      .then((r) => setRows(r.data?.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [t]);

  const fmt = (d) => {
    const x = new Date(d);
    if (isNaN(x)) return "";
    return x.toLocaleString(i18n.language?.startsWith("fr") ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">{t("titre")}</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">{t("sous_titre")}</p>

      {loading ? <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        : error ? <p className="text-sm text-red-600">{t("erreur")}</p>
        : rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            <Radio className="w-8 h-8 mx-auto mb-3 text-gray-300" /><p className="text-sm">{t("aucun")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((b) => (
              <li key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{b.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${BADGE[b.status] || BADGE.draft}`}>{t(`statut_${b.status}`, { defaultValue: b.status })}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmt(b.scheduled_at)}</span>
                    {b.course_title && <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{b.course_title}</span>}
                    {b.reg_count != null && <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t("participants", { count: Number(b.reg_count) })}</span>}
                  </div>
                </div>
                {b.status !== "draft" && (
                  <Link to={`/bootcamps/${b.id}`} className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium ${
                    b.status === "ended" ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-primary text-white hover:bg-primary-700"}`}>
                    {b.status === "ended" ? t("rejoindre") : b.status === "live" ? t("ouvrir_la_salle") : t("lancer_le_live")}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
