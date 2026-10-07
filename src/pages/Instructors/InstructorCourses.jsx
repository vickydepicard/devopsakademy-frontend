import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Search, BookOpen, Users, Eye, Edit3,
  Trash2, BarChart2,
  Star, Clock, CheckCircle, XCircle, Settings,
  ChevronRight, Filter
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import useFeedback, { apiError } from "../../components/Common/useFeedback";

const STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

const LEVEL_LABELS = () => ({ beginner: i18n.t("instructorCourses:debutant"), intermediate: i18n.t("instructorCourses:intermediaire"), advanced: i18n.t("instructorCourses:avance") });

export default function InstructorCourses() {
  const { t } = useTranslation("instructorCourses");
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { ui: feedbackUi, notify, confirm } = useFeedback();
  const [rateModal, setRateModal] = useState(null);
  const [rateValue, setRateValue] = useState("");

  useEffect(() => {
    document.title = t("mes_cours_devopsakademy");
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/instructor/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reviewAction = async (course, action, rate) => {
    setTogglingId(course.id);
    try {
      const res = await api.post(`/instructor/courses/${course.id}/${action}`, action === "submit" && rate !== "" && rate != null ? { proposed_rate: rate } : {});
      const next = action === "submit" ? "submitted" : "draft";
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, review_status: next, review_note: null } : c)));
      notify(res.data?.message || t(action === "submit" ? "soumis_ok" : "retire_ok"), "success");
    } catch (e) {
      notify(apiError(e, t("erreur_soumission")));
    } finally {
      setTogglingId(null);
    }
  };

  const deleteCourse = async (id) => {
    if (!(await confirm(t("supprimer_ce_cours_definitivement_cette_action"), { confirmLabel: t("supprimer", { defaultValue: "Supprimer" }) }))) return;
    setDeletingId(id);
    try {
      await api.delete(`/instructor/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      notify(apiError(e, t("erreur_lors_de_la_suppression")));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "published" && c.is_published) ||
      (filter === "draft" && !c.is_published);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    draft: courses.filter((c) => !c.is_published).length,
    students: courses.reduce((a, c) => a + (c.enrolled_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
        {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {feedbackUi}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("mes_cours")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("gerez_et_publiez_vos_formations")}</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />{" "}{t("nouveau_cours")}</Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("total"), value: stats.total, color: "text-gray-800", bg: "bg-gray-100" },
          { label: t("publies"), value: stats.published, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: t("brouillons"), value: stats.draft, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: t("etudiants"), value: stats.students, color: "text-blue-700", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl px-5 py-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("rechercher_un_cours")}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        {["all", "published", "draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              filter === f
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {f === "all" ? t("tous") : f === "published" ? t("publies") : t("brouillons")}
          </button>
        ))}
      </div>

      {/* Liste des cours */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">
            {search ? t("aucun_resultat_pour", { search }) : t("aucun_cours_trouve")}
          </h3>
          <p className="text-gray-400 text-sm mb-6">{t("creez_votre_premiere_formation_des_maintenant")}</p>
          <Link to="/instructor/courses/new" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm">
            <Plus className="w-4 h-4" />{" "}{t("creer_un_cours")}</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((course) => (
              <div key={course.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-5 hover:bg-gray-50/60 transition group">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary-dark to-primary shrink-0">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-contain" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-white/40" /></div>
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate max-w-full">{course.title}</p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[course.is_published ? "approved" : (course.review_status || "draft")]}`}>
                      {t(`statut_${course.is_published ? "approved" : (course.review_status || "draft")}`)}
                    </span>
                    {course.is_author === false && (
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">{t("intervenant")}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolled_count || 0}{" "}{t("etudiants_2")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_hours || 0}h</span>
                    <span>{LEVEL_LABELS()[course.level] || course.level || "—"}</span>
                    {course.avg_rating && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {Number(course.avg_rating).toFixed(1)}</span>
                    )}
                  </div>
                  {!course.is_published && course.review_status === "rejected" && course.review_note && (
                    <p className="mt-1.5 text-xs text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5 line-clamp-2"><span className="font-medium">{t("motif_renvoi")}</span> {course.review_note}</p>
                  )}
                </div>

                {/* Soumission */}
                {course.is_author !== false && !course.is_published && (course.review_status === "submitted" ? (
                  <button type="button" onClick={() => reviewAction(course, "withdraw")} disabled={togglingId === course.id}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60">{t("retirer_soumission")}</button>
                ) : (
                  <button type="button" onClick={() => { setRateModal(course); setRateValue(course.proposed_commission_rate != null ? String(Number(course.proposed_commission_rate)) : ""); }} disabled={togglingId === course.id}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60">{t("soumettre")}</button>
                ))}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Link to={`/courses/${course.id}/learn`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title={t("ouvrir_le_cours")}><Eye className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title={t("modifier")}><Edit3 className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/modules`} className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition" title={t("modules")}><Settings className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/students`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition" title={t("etudiants")}><Users className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/analytics`} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title={t("analytics")}><BarChart2 className="w-4 h-4" /></Link>
                  {course.is_author !== false && <button
                    onClick={() => deleteCourse(course.id)}
                    disabled={deletingId === course.id}
                    title={t("supprimer")}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    {deletingId === course.id
                      ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {rateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setRateModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900">{t("soumettre_au_catalogue")}</h3>
            <p className="text-sm text-gray-600 mt-2">{t("soumettre_explication")}</p>
            <label className="block mt-4">
              <span className="block text-xs font-medium text-gray-600 mb-1">{t("part_souhaitee")}</span>
              <input inputMode="decimal" value={rateValue} onChange={(e) => setRateValue(e.target.value)} placeholder={t("part_placeholder")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </label>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setRateModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">{t("annuler")}</button>
              <button type="button" onClick={() => { const c = rateModal; const v = rateValue.trim(); setRateModal(null); reviewAction(c, "submit", v); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90">{t("soumettre")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}