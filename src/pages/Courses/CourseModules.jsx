import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Trash2, Edit3, ChevronDown, ChevronUp,
  GripVertical, BookOpen, Video, FileText, Save,
  ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff,
  Loader, X
} from "lucide-react";

const LESSON_TYPE_ICONS = { video: Video, article: FileText, quiz: CheckCircle };
const LESSON_TYPE_LABELS = { video: "Vidéo", article: "Article", quiz: "Quiz" };

const ModuleModal = ({ module, onSave, onClose }) => {
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
          <h3 className="font-bold text-gray-900">{module ? "Modifier le module" : "Nouveau module"}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre du module *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Introduction à Docker"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} placeholder="Description du module…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:-translate-y-0.5 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

const LessonModal = ({ lesson, moduleId, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: lesson?.title || "",
    type: lesson?.type || "video",
    content_url: lesson?.content_url || "",
    article_content: lesson?.article_content || "",
    duration_minutes: lesson?.duration_minutes || "",
    is_preview: lesson?.is_preview ?? lesson?.is_free_preview ?? false,
    description: lesson?.description || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{lesson ? "Modifier la leçon" : "Nouvelle leçon"}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Titre de la leçon"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de contenu</label>
          <div className="flex gap-2">
            {["video", "article", "quiz"].map((t) => {
              const Icon = LESSON_TYPE_ICONS[t];
              return (
                <button key={t} type="button" onClick={() => set("type", t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                    form.type === t ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {LESSON_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {form.type === "video" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL de la vidéo</label>
            <input value={form.content_url} onChange={(e) => set("content_url", e.target.value)}
              type="url" placeholder="https://youtube.com/… ou lien direct"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        )}

        {form.type === "article" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contenu de l'article</label>
            <textarea value={form.article_content} onChange={(e) => set("article_content", e.target.value)}
              rows={5} placeholder="Rédigez ici le contenu de votre leçon article (Markdown supporté)…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
        )}

        {form.type === "quiz" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            💡 Après la création, gérez les questions depuis l'onglet <strong>Quizzes</strong> du cours.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Durée (minutes)</label>
            <input type="number" value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)}
              placeholder="Ex : 15" min="0"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.is_preview} onChange={(e) => set("is_preview", e.target.checked)}
                className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-gray-700">Aperçu gratuit</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:-translate-y-0.5 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CourseModules() {
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

  useEffect(() => {
    document.title = "Gérer les modules — DevOpsAkademy";
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.allSettled([
        api.get(`/admin/courses/${id}`),
        api.get(`/admin/courses/${id}/modules`),
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
        await api.patch(`/admin/modules/${moduleModal.id}`, data);
      } else {
        await api.post(`/admin/modules`, { ...data, order_index: modules.length + 1 });
      }
      await fetchData();
    } catch { alert("Erreur lors de l'enregistrement du module."); }
    setModuleModal(null);
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm("Supprimer ce module et toutes ses leçons ?")) return;
    setDeletingModule(moduleId);
    try {
      await api.delete(`/admin/modules/${moduleId}`);
      setModules((p) => p.filter((m) => m.id !== moduleId));
    } catch { alert("Erreur."); }
    setDeletingModule(null);
  };

  // ── LEÇONS ──
  const saveLesson = async (data) => {
    try {
      const { moduleId, lesson } = lessonModal;
      if (lesson?.id) {
        await api.patch(`/admin/lessons/${lesson.id}`, data);
      } else {
        const mod = modules.find((m) => m.id === moduleId);
        await api.post(`/admin/lessons`, { ...data, order_index: (mod?.lessons?.length || 0) + 1 });
      }
      await fetchData();
    } catch { alert("Erreur lors de l'enregistrement de la leçon."); }
    setLessonModal(null);
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Supprimer cette leçon ?")) return;
    setDeletingLesson(lessonId);
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      await fetchData();
    } catch { alert("Erreur."); }
    setDeletingLesson(null);
  };

  if (loading) return (
    <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>
  );

  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);

  return (
    <div className="max-w-4xl space-y-6">

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
          <h1 className="text-2xl font-bold text-gray-900">Structure du cours</h1>
          <p className="text-gray-500 text-sm mt-0.5">{course?.title} · {modules.length} modules · {totalLessons} leçons</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/instructor/courses/${id}/edit`}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
            Modifier infos
          </Link>
          <Link to={`/instructor/courses/${id}/quizzes`}
            className="px-4 py-2 border border-primary text-primary rounded-xl text-sm hover:bg-primary/5 transition">
            Gérer quizzes
          </Link>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600 mb-1">Aucun module créé</p>
            <p className="text-gray-400 text-sm mb-5">Commencez par ajouter un module pour structurer votre cours.</p>
          </div>
        )}

        {modules.map((mod, modIdx) => {
          const isExpanded = !!expandedModules[mod.id];
          const lessonCount = mod.lessons?.length || 0;
          return (
            <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
              {/* Header module */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                <button onClick={() => toggleModule(mod.id)} className="flex-1 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {modIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{mod.title}</p>
                    <p className="text-xs text-gray-400">{lessonCount} leçon{lessonCount > 1 ? "s" : ""}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModuleModal(mod)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title="Modifier">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteModule(mod.id)} disabled={deletingModule === mod.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
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
                    const Icon = LESSON_TYPE_ICONS[lesson.type] || FileText;
                    return (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition group">
                        <GripVertical className="w-4 h-4 text-gray-200 cursor-grab shrink-0" />
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          lesson.type === "video" ? "bg-blue-50" : lesson.type === "quiz" ? "bg-violet-50" : "bg-green-50"
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${lesson.type === "video" ? "text-blue-500" : lesson.type === "quiz" ? "text-violet-500" : "text-green-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{LESSON_TYPE_LABELS[lesson.type] || lesson.type}</span>
                            {lesson.duration_minutes && <span>· {lesson.duration_minutes} min</span>}
                            {(lesson.is_preview || lesson.is_free_preview) && <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Aperçu gratuit</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <Plus className="w-4 h-4" /> Ajouter une leçon
                    </button>
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
        <Plus className="w-5 h-5" /> Ajouter un module
      </button>
    </div>
  );
}