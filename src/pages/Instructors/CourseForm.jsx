// src/pages/Instructors/CourseForm.jsx — DevOpsAkademy
// ✅ FIX validation : description optionnelle
// ✅ FIX erreur backend : message propre

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { Save, ArrowLeft, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Loader } from "lucide-react";

const LEVELS    = ["beginner", "intermediate", "advanced"];
const LVL_LABEL = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const LANGS     = [{ value: "fr", label: "Français" }, { value: "en", label: "Anglais" }];
const EMPTY_FORM = {
  title: "", short_description: "", description: "",
  category_id: "", price: "", original_price: "",
  duration_hours: "", level: "beginner", language: "fr",
  thumbnail_url: "", video_preview_url: "",
  is_published: false, is_featured: false, is_free: false,
  requirements: "", what_you_learn: "", target_audience: "",
};
const TABS = [
  { key: "basic",    label: "Infos générales" },
  { key: "content",  label: "Contenu & Prérequis" },
  { key: "media",    label: "Médias & Prix" },
  { key: "settings", label: "Paramètres" },
];
const CLS = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition bg-white";

// ✅ CRITIQUE : composants définis HORS du composant principal
// s'ils étaient dedans → recréés à chaque render → perd le focus
function InputField({ label, name, value, onChange, type="text", placeholder, required, help, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} className={CLS} {...rest} />
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, rows=4, placeholder, help }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows}
        placeholder={placeholder} className={CLS + " resize-none"} />
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <select name={name} value={value} onChange={onChange} className={CLS}>{children}</select>
    </div>
  );
}

export default function CourseForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(isEdit);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [activeTab,  setActiveTab]  = useState("basic");

  useEffect(() => {
    document.title = (isEdit ? "Modifier" : "Créer un cours") + " — DevOpsAkademy";
    api.get("/categories").then(r => setCategories(r.data?.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/instructor/courses/${id}`).then(r => {
        const d = r.data?.data;
        if (d) setForm({
          title: d.title||"", short_description: d.short_description||"",
          description: d.description||"", category_id: d.category_id||"",
          price: d.price||"", original_price: d.original_price||"",
          duration_hours: d.duration_hours||"", level: d.level||"beginner",
          language: d.language||"fr", thumbnail_url: d.thumbnail_url||"",
          video_preview_url: d.video_preview_url||"",
          is_published: !!d.is_published, is_featured: !!d.is_featured, is_free: !!d.is_free,
          requirements:   Array.isArray(d.requirements)   ? d.requirements.join("\n")   : d.requirements||"",
          what_you_learn: Array.isArray(d.what_you_learn) ? d.what_you_learn.join("\n") : d.what_you_learn||"",
          target_audience: d.target_audience||"",
        });
      }).catch(() => setError("Impossible de charger le cours.")).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleToggle = useCallback((field) => {
    setForm(p => ({ ...p, [field]: !p[field] }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.title.trim()) { setError("Le titre du cours est obligatoire."); setActiveTab("basic"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        description:    form.description || form.short_description || "",
        price:          form.is_free ? 0 : parseFloat(form.price) || 0,
        original_price: parseFloat(form.original_price) || null,
        duration_hours: parseFloat(form.duration_hours) || null,
        category_id:    form.category_id ? parseInt(form.category_id) : null,
        requirements:   form.requirements   ? form.requirements.split("\n").filter(Boolean)   : [],
        what_you_learn: form.what_you_learn ? form.what_you_learn.split("\n").filter(Boolean) : [],
      };
      if (isEdit) {
        await api.patch(`/instructor/courses/${id}`, payload);
        setSuccess("Cours mis à jour avec succès !");
      } else {
        const res   = await api.post("/instructor/courses", payload);
        const newId = res.data?.data?.id;
        setSuccess("Cours créé avec succès !");
        setTimeout(() => navigate(`/instructor/courses/${newId}/modules`), 1200);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Une erreur est survenue.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate("/instructor/courses")}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Modifier le cours" : "Créer un cours"}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? "Mettez à jour les informations de votre formation" : "Remplissez les informations pour votre nouvelle formation"}
          </p>
        </div>
      </div>

      {error   && <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm"><CheckCircle className="w-4 h-4 shrink-0" />{success}</div>}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-6 space-y-5">

          {activeTab === "basic" && (<>
            <InputField label="Titre du cours" name="title" value={form.title} onChange={handleChange} required placeholder="Ex : Docker & Kubernetes de zéro à la production" />
            <InputField label="Sous-titre" name="short_description" value={form.short_description} onChange={handleChange} placeholder="Une phrase d'accroche percutante (max 120 caractères)" />
            <TextareaField label="Description complète" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Décrivez en détail le contenu, les objectifs et la valeur apportée…" />
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label="Catégorie" name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectField>
              <SelectField label="Niveau" name="level" value={form.level} onChange={handleChange}>
                {LEVELS.map(l => <option key={l} value={l}>{LVL_LABEL[l]}</option>)}
              </SelectField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label="Langue" name="language" value={form.language} onChange={handleChange}>
                {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </SelectField>
              <InputField label="Durée estimée (heures)" name="duration_hours" value={form.duration_hours} onChange={handleChange} type="number" placeholder="Ex : 12" min="0" step="0.5" />
            </div>
          </>)}

          {activeTab === "content" && (<>
            <TextareaField label="Ce que les apprenants vont apprendre" name="what_you_learn" value={form.what_you_learn} onChange={handleChange} rows={5}
              placeholder={"Listez les compétences acquises, une par ligne :\nInstaller et configurer Docker\nDéployer une app avec Kubernetes\n…"}
              help="Une compétence par ligne. Affiché sous forme de liste avec ✓" />
            <TextareaField label="Prérequis" name="requirements" value={form.requirements} onChange={handleChange} rows={4}
              placeholder={"Un prérequis par ligne :\nConnaissances de base en Linux\nPython débutant apprécié\n…"}
              help="Un prérequis par ligne." />
            <InputField label="Public cible" name="target_audience" value={form.target_audience} onChange={handleChange}
              placeholder="Ex : Développeurs souhaitant passer à une architecture conteneurisée" />
          </>)}

          {activeTab === "media" && (<>
            <InputField label="URL de la miniature (thumbnail)" name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} type="url"
              placeholder="https://…/image.jpg" help="Recommandé : 1280x720px, format JPG ou PNG" />
            {form.thumbnail_url && (
              <div className="rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50">
                <img src={form.thumbnail_url} alt="Preview" className="w-full h-full object-contain"
                  onError={e => { e.target.style.display = "none"; }} />
              </div>
            )}
            <InputField label="URL de la vidéo de preview" name="video_preview_url" value={form.video_preview_url} onChange={handleChange} type="url"
              placeholder="https://youtube.com/… ou https://…/preview.mp4"
              help="Vidéo courte (1-3 min) présentant le cours" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix (FCFA)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  disabled={form.is_free} placeholder="Ex : 15000" min="0"
                  className={CLS + (form.is_free ? " opacity-50 cursor-not-allowed" : "")} />
              </div>
              <InputField label="Prix barré (FCFA)" name="original_price" value={form.original_price} onChange={handleChange}
                type="number" placeholder="Ex : 25000" min="0" help="Prix original barré si promo" />
            </div>
          </>)}

          {activeTab === "settings" && (
            <div className="space-y-3">
              {[
                { name: "is_published", label: "Cours publié",       desc: "Le cours est visible et accessible aux apprenants inscrits" },
                { name: "is_free",      label: "Cours gratuit",      desc: "L'accès est libre sans paiement. Le prix sera ignoré." },
                { name: "is_featured",  label: "Cours mis en avant", desc: "Affiché en priorité sur la page d'accueil et le catalogue" },
              ].map(({ name, label, desc }) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{label}</p>
                    {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                  </div>
                  <button type="button" onClick={() => handleToggle(name)}>
                    {form[name] ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button type="button" onClick={() => navigate("/instructor/courses")}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Annuler
          </button>
          <div className="flex gap-3">
            {activeTab !== "settings" && (
              <button type="button"
                onClick={() => { const i = TABS.findIndex(t => t.key === activeTab); setActiveTab(TABS[i+1]?.key || "settings"); }}
                className="px-5 py-2.5 border border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-medium">
                Suivant →
              </button>
            )}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-bold py-2.5 px-6 rounded-xl hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 text-sm">
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Enregistrement…" : isEdit ? "Sauvegarder" : "Créer le cours"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}