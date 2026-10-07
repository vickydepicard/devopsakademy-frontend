// src/pages/Instructors/CourseForm.jsx — DevOpsAkademy
// FIX validation : description optionnelle
// FIX erreur backend : message propre

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { Save, ArrowLeft, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import FileUrlField from "../../components/Common/FileUrlField";
import CoInstructorPanel from "./CoInstructorPanel";

const LEVELS    = ["beginner", "intermediate", "advanced"];
const LVL_LABEL = () => ({ beginner: i18n.t("courseForm:debutant"), intermediate: i18n.t("courseForm:intermediaire"), advanced: i18n.t("courseForm:avance") });
const LANGS     = () => ([{ value: "fr", label: i18n.t("courseForm:francais") }, { value: "en", label: i18n.t("courseForm:anglais") }]);
const REVIEW_BADGE = {
  draft: "bg-gray-100 text-gray-600", submitted: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-600",
};

const EMPTY_FORM = {
  title: "", short_description: "", description: "",
  category_id: "", price: "", original_price: "",
  duration_hours: "", level: "beginner", language: "fr",
  thumbnail_url: "", video_preview_url: "",
  is_published: false, is_free: false,
  requirements: "", what_you_learn: "",
};
const TABS = () => ([
  { key: "basic",    label: i18n.t("courseForm:infos_generales") },
  { key: "content",  label: i18n.t("courseForm:contenu_prerequis") },
  { key: "media",    label: i18n.t("courseForm:medias_prix") },
  { key: "settings", label: i18n.t("courseForm:parametres") },
]);
const CLS = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition bg-white";

// CRITIQUE : composants définis HORS du composant principal
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
  const { t } = useTranslation("courseForm");
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
  const [canManage,  setCanManage]  = useState(!isEdit);
  const [canEdit,    setCanEdit]    = useState(true);
  const [review,     setReview]     = useState({ status: "draft", note: "", published: false });
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    document.title = (isEdit ? i18n.t("courseForm:modifier") : i18n.t("courseForm:creer_un_cours")) + " — DevOpsAkademy";
    api.get("/categories").then(r => setCategories(r.data?.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/instructor/courses/${id}`).then(r => {
        const d = r.data?.data;
        if (d) { setCanManage(!!d.can_manage); setCanEdit(d.can_edit !== false); setReview({ status: d.review_status || "draft", note: d.review_note || "", published: !!d.is_published }); }
        if (d) setForm({
          title: d.title||"", short_description: d.short_description||"",
          description: d.description||"", category_id: d.category_id||"",
          price: d.price||"", original_price: d.original_price||"",
          duration_hours: d.duration_hours||"", level: d.level||"beginner",
          language: d.language||"fr", thumbnail_url: d.thumbnail_url||"",
          video_preview_url: d.video_preview_url||"",
          is_published: !!d.is_published, is_free: !!d.is_free,
          requirements:   Array.isArray(d.requirements)   ? d.requirements.join("\n")   : d.requirements||"",
          what_you_learn: Array.isArray(d.what_you_learn) ? d.what_you_learn.join("\n") : d.what_you_learn||"",
        });
      }).catch(() => setError(t("impossible_de_charger_le_cours"))).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleToggle = useCallback((field) => {
    setForm(p => ({ ...p, [field]: !p[field] }));
  }, []);

  const reviewCall = async (action, status) => {
    setReviewBusy(true); setError(""); setSuccess("");
    try {
      const r = await api.post(`/instructor/courses/${id}/${action}`);
      setReview((p) => ({ ...p, status, note: "" }));
      setSuccess(r.data?.message || "");
    } catch (e) { setError(e?.response?.data?.message || t("erreur_soumission")); }
    finally { setReviewBusy(false); }
  };
  const submitForReview = () => reviewCall("submit", "submitted");
  const withdraw = () => reviewCall("withdraw", "draft");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError(""); setSuccess("");
    if (form.title.trim().length < 3) { setError(t("le_titre_du_cours_est_obligatoire")); setActiveTab("basic"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:          form.is_free ? 0 : parseFloat(form.price) || 0,
        original_price: parseFloat(form.original_price) || null,
        duration_hours: form.duration_hours === "" ? null : Math.round(Number(form.duration_hours)),
        category_id:    form.category_id ? parseInt(form.category_id) : null,
        requirements:   form.requirements   ? form.requirements.split("\n").filter(Boolean)   : [],
        what_you_learn: form.what_you_learn ? form.what_you_learn.split("\n").filter(Boolean) : [],
      };
      delete payload.is_published; // la publication passe par la soumission à l'administration
      if (isEdit && review.published) { delete payload.price; delete payload.original_price; delete payload.is_free; }
      if (isEdit) {
        await api.patch(`/instructor/courses/${id}`, payload);
        setSuccess(t("cours_mis_a_jour_avec_succes"));
      } else {
        const res   = await api.post("/instructor/courses", payload);
        const newId = res.data?.data?.id;
        setSuccess(t("cours_cree_avec_succes"));
        setTimeout(() => navigate(`/instructor/courses/${newId}/modules`), 1200);
      }
    } catch (err) {
      const data = err?.response?.data;
      const details = data?.errors ? Object.values(data.errors).filter((v) => typeof v === "string" && v.length > 3) : [];
      setError([data?.message || err?.message || t("une_erreur_est_survenue"), ...details].join(" — "));
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
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t("modifier_le_cours") : t("creer_un_cours")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? t("mettez_a_jour_les_informations_de") : t("remplissez_les_informations_pour_votre_nouvelle")}
          </p>
        </div>
      </div>

      {error   && <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm"><CheckCircle className="w-4 h-4 shrink-0" />{success}</div>}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS().map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
      <fieldset disabled={!canEdit} className="contents">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-6 space-y-5">

          {activeTab === "basic" && (<>
            <InputField label={t("titre_du_cours")} name="title" value={form.title} onChange={handleChange} required placeholder={t("ex_docker_kubernetes_de_zero_a")} />
            <InputField label={t("sous_titre")} name="short_description" value={form.short_description} onChange={handleChange} placeholder={t("une_phrase_d_accroche_percutante_max")} />
            <TextareaField label={t("description_complete")} name="description" value={form.description} onChange={handleChange} rows={5} placeholder={t("decrivez_en_detail_le_contenu_les")} />
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label={t("categorie")} name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">{t("selectionner_une_categorie")}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectField>
              <SelectField label={t("niveau")} name="level" value={form.level} onChange={handleChange}>
                {LEVELS.map(l => <option key={l} value={l}>{LVL_LABEL()[l]}</option>)}
              </SelectField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label={t("langue")} name="language" value={form.language} onChange={handleChange}>
                {LANGS().map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </SelectField>
              <InputField label={t("duree_estimee_heures")} name="duration_hours" value={form.duration_hours} onChange={handleChange} type="number" placeholder={t("ex_12")} min="0" step="1" />
            </div>
          </>)}

          {activeTab === "content" && (<>
            <TextareaField label={t("ce_que_les_apprenants_vont_apprendre")} name="what_you_learn" value={form.what_you_learn} onChange={handleChange} rows={5}
              placeholder={t("listez_les_competences_acquises_une_par")}
              help={i18n.t("courseForm:une_competence_par_ligne_affiche_sous")} />
            <TextareaField label={t("prerequis")} name="requirements" value={form.requirements} onChange={handleChange} rows={4}
              placeholder={t("un_prerequis_par_ligne_connaissances_de")}
              help={i18n.t("courseForm:un_prerequis_par_ligne")} />
          </>)}

          {activeTab === "media" && (<>
            <FileUrlField label={t("url_de_la_miniature_thumbnail")} kind="image" value={form.thumbnail_url}
              onChange={(v) => setForm((p) => ({ ...p, thumbnail_url: v }))} placeholder="https://…/image.jpg"
              hint={i18n.t("courseForm:recommande_1280x720px_format_jpg_ou_png")} labelClass="block text-sm font-semibold text-gray-700 mb-1.5" />
            <FileUrlField label={t("url_de_la_video_de_preview")} kind="video" value={form.video_preview_url}
              onChange={(v) => setForm((p) => ({ ...p, video_preview_url: v }))} placeholder={i18n.t("courseForm:placeholder_preview_url")}
              hint={i18n.t("courseForm:video_courte_1_3_min_presentant")} labelClass="block text-sm font-semibold text-gray-700 mb-1.5" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("prix_fcfa")}</label>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  disabled={form.is_free || review.published} placeholder={t("ex_15000")} min="0"
                  className={CLS + (form.is_free ? " opacity-50 cursor-not-allowed" : "")} />
              </div>
              <InputField label={t("prix_barre_fcfa")} name="original_price" value={form.original_price} onChange={handleChange}
                type="number" placeholder={t("ex_25000")} min="0" disabled={review.published} help={i18n.t("courseForm:prix_original_barre_si_promo")} />
            </div>
          </>)}

          {activeTab === "settings" && (
            <div className="space-y-3">
              {[
                                { name: "is_free",      label: t("cours_gratuit"),      desc: t("l_acces_est_libre_sans_paiement") },
              ].map(({ name, label, desc }) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{label}</p>
                    {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                  </div>
                  <button type="button" onClick={() => handleToggle(name)} disabled={review.published} className="bg-transparent !p-0 disabled:opacity-50">
                    {form[name] ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                  </button>
                </div>
              ))}
              {isEdit && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{t("statut_publication")}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(`statut_aide_${review.published ? "approved" : review.status}`)}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${REVIEW_BADGE[review.published ? "approved" : review.status]}`}>{t(`statut_${review.published ? "approved" : review.status}`)}</span>
                  </div>
                  {!review.published && review.status === "rejected" && review.note && (
                    <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2"><span className="font-medium">{t("motif_renvoi")}</span> {review.note}</p>
                  )}
                  {canManage && !review.published && (
                    <button type="button" onClick={review.status === "submitted" ? withdraw : submitForReview} disabled={reviewBusy}
                      className={`px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 ${review.status === "submitted" ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-primary text-white hover:opacity-90"}`}>
                      {review.status === "submitted" ? t("retirer_soumission") : t("soumettre")}
                    </button>
                  )}
                  {review.published && <p className="text-xs text-gray-500">{t("prix_verrouille")}</p>}
                  {!canEdit && <p className="text-xs text-gray-500">{t("lecture_seule")}</p>}
                </div>
              )}
              {isEdit && (
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <CoInstructorPanel courseId={id} />
                </div>
              )}
            </div>
          )}
        </div>

      </fieldset>
        <div className="flex items-center justify-between gap-4 pt-2">
          <button type="button" onClick={() => navigate("/instructor/courses")}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />{" "}{t("annuler")}</button>
          <div className="flex gap-3">
            {activeTab !== "settings" && (
              <button type="button"
                onClick={() => { const i = TABS().findIndex(t => t.key === activeTab); setActiveTab(TABS()[i+1]?.key || "settings"); }}
                className="px-5 py-2.5 border border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-medium">{t("suivant")}</button>
            )}
            <button type="submit" disabled={saving || !canEdit}
              className="flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t("enregistrement") : isEdit ? t("sauvegarder") : t("creer_le_cours")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}