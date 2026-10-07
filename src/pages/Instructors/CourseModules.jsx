import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Trash2, Edit3, ChevronDown, ChevronUp,
  GripVertical, BookOpen, Video, FileText, Save,
  ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff,
  Loader, X, ArrowUp, ArrowDown, Upload
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import FileUrlField from "../../components/Common/FileUrlField";
import useFeedback, { apiError } from "../../components/Common/useFeedback";

const LESSON_TYPE_ICONS = { video: Video, article: FileText, quiz: CheckCircle };
const LESSON_TYPE_LABELS = () => ({ video: i18n.t("courseModules:video"), article: i18n.t("courseModules:article"), quiz: i18n.t("courseModules:quiz") });

const ModuleModal = ({ module, onSave, onClose }) => {
  const { t } = useTranslation("courseModules");
  const [title, setTitle] = useState(module?.title || "");
  const [description, setDescription] = useState(module?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title, description });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{module ? t("modifier_le_module") : t("nouveau_module")}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("titre_du_module")}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={t("ex_introduction_a_docker")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("description")}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} placeholder={t("description_du_module")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
};


// Fichiers téléchargeables rattachés à une leçon (importés depuis l'ordinateur)
const LessonResources = ({ lessonId }) => {
  const { t } = useTranslation("courseModules");
  const { notify, confirm } = useFeedback();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    if (!lessonId) return;
    try { const r = await api.get(`/instructor/lessons/${lessonId}/resources`); setItems(r.data?.data || []); } catch { /* liste vide */ }
  };
  useEffect(() => { load(); }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name.replace(/\.[^.]+$/, ""));
      try { await api.post(`/instructor/lessons/${lessonId}/upload-resource`, fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 0 }); }
      catch (err) { notify(apiError(err, t("erreur_import_fichier"))); }
    }
    setBusy(false);
    load();
  };

  const remove = async (r) => {
    if (!(await confirm(t("retirer_fichier_confirm", { name: r.title }), { confirmLabel: t("retirer") }))) return;
    try { await api.delete(`/instructor/lesson-resources/${r.id}`); load(); } catch (err) { notify(apiError(err, t("erreur_import_fichier"))); }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">{t("fichiers_a_telecharger")}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t("fichiers_a_telecharger_aide")}</p>
        </div>
        {lessonId && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
            className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{t("ajouter_un_fichier")}
          </button>
        )}
        <input ref={inputRef} type="file" multiple onChange={add} className="hidden"
          accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.json,image/*" />
      </div>
      {!lessonId ? (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">{t("enregistrez_la_lecon_d_abord")}</p>
      ) : items.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100">
          {items.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={r.file_url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm text-gray-800 hover:underline">{r.title}</a>
              <span className="text-xs text-gray-400 shrink-0">{r.download_count || 0} ↓</span>
              <button type="button" onClick={() => remove(r)} aria-label={t("retirer")} className="text-gray-400 hover:text-red-600 bg-transparent p-1"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LessonModal = ({ lesson, moduleId, onSave, onClose }) => {
  const { t } = useTranslation("courseModules");
  const [form, setForm] = useState({
    title: lesson?.title || "",
    type: lesson?.content_type || lesson?.type || "video",
    content_url: lesson?.content_url || "",
    article_content: lesson?.article_content || "",
    duration_minutes: lesson?.duration_minutes || "",
    is_preview: !!(lesson?.is_preview ?? lesson?.is_free_preview),
    is_published: lesson?.is_published ?? true,
    description: lesson?.description || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { type, ...rest } = form;
    await onSave({ ...rest, content_type: type, duration_minutes: form.duration_minutes === "" ? 0 : Number(form.duration_minutes) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{lesson ? t("modifier_la_lecon") : t("nouvelle_lecon")}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("titre")}</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder={t("titre_de_la_lecon")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("type_de_contenu")}</label>
          <div className="flex gap-2">
            {["video", "article", "quiz"].map((t) => {
              const Icon = LESSON_TYPE_ICONS[t];
              return (
                <button key={t} type="button" onClick={() => set("type", t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                    form.type === t ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {LESSON_TYPE_LABELS()[t]}
                </button>
              );
            })}
          </div>
        </div>

        {form.type === "video" && (
          <div>
            <FileUrlField label={t("url_de_la_video")} kind="video" value={form.content_url} onChange={(v) => set("content_url", v)}
              placeholder={i18n.t("courseModules:placeholder_video_url")} labelClass="block text-sm font-semibold text-gray-700 mb-1.5" />
          </div>
        )}

        {form.type === "article" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("contenu_de_l_article")}</label>
            <textarea value={form.article_content} onChange={(e) => set("article_content", e.target.value)}
              rows={5} placeholder={t("redigez_ici_le_contenu_de_votre")}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
        )}

        {form.type === "quiz" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">{t("apres_la_creation_gerez_les_questions")}{" "}<strong>{t("quizzes")}</strong>{" "}{t("du_cours")}</div>
        )}

        {form.type !== "quiz" && <LessonResources lessonId={lesson?.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("duree_minutes")}</label>
            <input type="number" value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)}
              placeholder={t("ex_15")} min="0"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.is_preview} onChange={(e) => set("is_preview", e.target.checked)}
                className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-gray-700">{t("apercu_gratuit")}</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CourseModules() {
  const { t } = useTranslation("courseModules");
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [moduleModal, setModuleModal] = useState(null); // null | "new" | module_obj
  const [lessonModal, setLessonModal] = useState(null); // null | { moduleId } | { moduleId, lesson }
  const [deletingModule, setDeletingModule] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const { ui: feedbackUi, notify, confirm } = useFeedback();

  useEffect(() => {
    document.title = t("gerer_les_modules_devopsakademy");
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.allSettled([
        api.get(`/instructor/courses/${id}`),
        api.get(`/instructor/courses/${id}/modules`),
      ]);
      if (courseRes.status === "fulfilled") setCourse(courseRes.value.data?.data);
      if (modulesRes.status === "fulfilled") {
        const mods = modulesRes.value.data?.data || [];
        setModules(mods);
        // Expand premier module par défaut
        if (mods.length > 0) setExpandedModules({ [mods[0].id]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => setExpandedModules((p) => ({ ...p, [moduleId]: !p[moduleId] }));

  // ── MODULES ──
  const saveModule = async (data) => {
    try {
      if (moduleModal?.id) {
        await api.patch(`/instructor/modules/${moduleModal.id}`, data);
      } else {
        await api.post(`/instructor/courses/${id}/modules`, data);
      }
      await fetchData();
      setModuleModal(null);
    } catch (e) { notify(apiError(e, t("erreur_lors_de_l_enregistrement_du"))); }
  };

  const deleteModule = async (moduleId) => {
    if (!(await confirm(t("supprimer_ce_module_et_toutes_ses"), { confirmLabel: t("supprimer") }))) return;
    setDeletingModule(moduleId);
    try {
      await api.delete(`/instructor/modules/${moduleId}`);
      setModules((p) => p.filter((m) => m.id !== moduleId));
    } catch (e) { notify(apiError(e, t("erreur"))); }
    setDeletingModule(null);
  };

  // ── LEÇONS ──
  const saveLesson = async (data) => {
    try {
      const { moduleId, lesson } = lessonModal;
      if (lesson?.id) {
        await api.patch(`/instructor/lessons/${lesson.id}`, data);
      } else {
        await api.post(`/instructor/modules/${moduleId}/lessons`, data);
      }
      await fetchData();
      setLessonModal(null);
    } catch (e) { notify(apiError(e, t("erreur_lors_de_l_enregistrement_de"))); }
  };

  const deleteLesson = async (lessonId) => {
    if (!(await confirm(t("supprimer_cette_lecon"), { confirmLabel: t("supprimer") }))) return;
    setDeletingLesson(lessonId);
    try {
      await api.delete(`/instructor/lessons/${lessonId}`);
      await fetchData();
    } catch (e) { notify(apiError(e, t("erreur"))); }
    setDeletingLesson(null);
  };

  const move = async (kind, itemId, direction) => {
    try {
      await api.post(`/instructor/${kind}/${itemId}/move`, { direction });
      await fetchData();
    } catch (e) { notify(apiError(e, t("erreur"))); }
  };

  if (loading) return (
    <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>
  );

  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);

  return (
    <div className="max-w-4xl space-y-6">

      {feedbackUi}
      {/* Modales */}
      {moduleModal !== null && (
        <ModuleModal
          module={moduleModal === "new" ? null : moduleModal}
          onSave={saveModule}
          onClose={() => setModuleModal(null)}
        />
      )}
      {lessonModal !== null && (
        <LessonModal
          lesson={lessonModal.lesson || null}
          moduleId={lessonModal.moduleId}
          onSave={saveLesson}
          onClose={() => setLessonModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate("/instructor/courses")} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t("structure_du_cours")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("modules_lecons", { title: course?.title, length: modules.length, totalLessons })}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/instructor/courses/${id}/edit`}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("modifier_infos")}</Link>
          <Link to={`/instructor/courses/${id}/quizzes`}
            className="px-4 py-2 border border-primary text-primary rounded-xl text-sm hover:bg-primary/5 transition">{t("gerer_quizzes")}</Link>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600 mb-1">{t("aucun_module_cree")}</p>
            <p className="text-gray-400 text-sm mb-5">{t("commencez_par_ajouter_un_module_pour")}</p>
          </div>
        )}

        {modules.map((mod, modIdx) => {
          const isExpanded = !!expandedModules[mod.id];
          const lessonCount = mod.lessons?.length || 0;
          return (
            <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
              {/* Header module */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                <div className="flex flex-col shrink-0">
                  <button onClick={() => move("modules", mod.id, "up")} disabled={modIdx === 0} aria-label={t("monter")}
                    className="p-0.5 text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => move("modules", mod.id, "down")} disabled={modIdx === modules.length - 1} aria-label={t("descendre")}
                    className="p-0.5 text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400"><ArrowDown className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={() => toggleModule(mod.id)} className="flex-1 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {modIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{mod.title}</p>
                    <p className="text-xs text-gray-400">{t("lecon_count", { count: lessonCount })}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModuleModal(mod)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title={t("modifier")}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteModule(mod.id)} disabled={deletingModule === mod.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title={t("supprimer")}>
                    {deletingModule === mod.id
                      ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>

              {/* Leçons */}
              {isExpanded && (
                <div className="divide-y divide-gray-50">
                  {(mod.lessons || []).map((lesson, lessonIdx) => {
                    const lessonType = lesson.content_type || lesson.type;
                    const Icon = LESSON_TYPE_ICONS[lessonType] || FileText;
                    return (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition group">
                        <div className="flex flex-col shrink-0">
                          <button onClick={() => move("lessons", lesson.id, "up")} disabled={lessonIdx === 0} aria-label={t("monter")}
                            className="p-0.5 text-gray-300 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300"><ArrowUp className="w-3 h-3" /></button>
                          <button onClick={() => move("lessons", lesson.id, "down")} disabled={lessonIdx === (mod.lessons || []).length - 1} aria-label={t("descendre")}
                            className="p-0.5 text-gray-300 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300"><ArrowDown className="w-3 h-3" /></button>
                        </div>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          lessonType === "video" ? "bg-blue-50" : lessonType === "quiz" ? "bg-violet-50" : "bg-green-50"
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${lessonType === "video" ? "text-blue-500" : lessonType === "quiz" ? "text-violet-500" : "text-green-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{LESSON_TYPE_LABELS()[lessonType] || lessonType}</span>
                            {lesson.duration_minutes > 0 && <span>{t("min", { vduration_minutes: lesson.duration_minutes })}</span>}
                            {lesson.is_preview ? <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">{t("apercu_gratuit")}</span> : null}
                            {!lesson.is_published && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t("brouillon")}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button onClick={() => setLessonModal({ moduleId: mod.id, lesson })}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteLesson(lesson.id)} disabled={deletingLesson === lesson.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            {deletingLesson === lesson.id
                              ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Ajouter une leçon */}
                  <div className="px-5 py-3">
                    <button onClick={() => setLessonModal({ moduleId: mod.id })}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-light font-medium transition">
                      <Plus className="w-4 h-4" />{" "}{t("ajouter_une_lecon")}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ajouter un module */}
      <button onClick={() => setModuleModal("new")}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-primary hover:text-primary transition font-medium">
        <Plus className="w-5 h-5" />{" "}{t("ajouter_un_module")}</button>
    </div>
  );
}