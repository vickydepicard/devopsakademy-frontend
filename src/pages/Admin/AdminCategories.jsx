import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Tag, Plus, Edit3, Trash2, Save, X,
  Search, BookOpen, RefreshCw, Loader, CheckCircle
} from "lucide-react";

const CategoryModal = ({ cat, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: cat?.name || "",
    description: cat?.description || "",
    slug: cat?.slug || "",
    icon: cat?.icon || "",
    color: cat?.color || "#3B3A82",
    is_active: cat?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (val) => {
    setForm(p => ({ ...p, name: val, slug: p.slug || autoSlug(val) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const EMOJI_OPTIONS = ["🐳", "⚙️", "☁️", "🔧", "🛡️", "📊", "🚀", "🔗", "💻", "🌐", "🏗️", "🔐"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{cat ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom *</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex : Containerisation"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
            <input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="containerisation"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder="Description courte de cette catégorie…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icône (emoji)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => setForm(p => ({ ...p, icon: e }))}
                  className={`text-xl p-1.5 rounded-lg transition ${form.icon === e ? "bg-blue-100 ring-2 ring-blue-400" : "hover:bg-gray-100"}`}>
                  {e}
                </button>
              ))}
            </div>
            <input value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))}
              placeholder="Ou saisir manuellement"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Couleur</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
              <input value={form.color} onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))}
                placeholder="#3B3A82"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <span className="text-sm font-medium text-gray-700">Catégorie active (visible sur le site)</span>
        </label>

        {/* Prévisualisation */}
        {(form.name || form.icon) && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Aperçu</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: form.color }}>
              {form.icon && <span>{form.icon}</span>}
              {form.name || "Catégorie"}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : cat ? "Sauvegarder" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = "Catégories — Admin";
    fetchCats();
  }, []);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/categories");
      setCats(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleSave = async (form) => {
    try {
      if (modal?.id) await api.patch(`/admin/categories/${modal.id}`, form);
      else await api.post("/admin/categories", form);
      await fetchCats();
      setModal(null);
    } catch { alert("Erreur lors de l'enregistrement."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ? Les cours liés ne seront pas supprimés.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/categories/${id}`);
      setCats(p => p.filter(c => c.id !== id));
    } catch { alert("Erreur."); }
    setDeletingId(null);
  };

  const toggleActive = async (cat) => {
    try {
      await api.patch(`/admin/categories/${cat.id}`, { is_active: !cat.is_active });
      setCats(p => p.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
    } catch {}
  };

  const filtered = cats.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {modal !== null && (
        <CategoryModal cat={modal === "new" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories de cours</h1>
          <p className="text-gray-500 text-sm mt-0.5">{cats.length} catégorie{cats.length > 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCats} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setModal("new")}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md text-sm">
            <Plus className="w-4 h-4" /> Nouvelle catégorie
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une catégorie…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">Aucune catégorie trouvée</p>
          <button onClick={() => setModal("new")} className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Créer la première catégorie
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className={`bg-white border rounded-2xl p-5 shadow-soft hover:shadow-medium transition group relative ${!cat.is_active ? "opacity-60" : ""}`}>
              {/* Badge statut */}
              <div className="absolute top-3 right-3">
                <button onClick={() => toggleActive(cat)}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${
                    cat.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600" : "bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600"
                  }`}>
                  {cat.is_active ? "Actif" : "Inactif"}
                </button>
              </div>

              {/* Icône colorée */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 text-white font-bold"
                style={{ backgroundColor: cat.color || "#3B3A82" }}>
                {cat.icon || cat.name?.[0]?.toUpperCase()}
              </div>

              <h3 className="font-bold text-gray-900 mb-0.5">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>}

              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{cat.course_count || 0} cours</span>
                <span className="mx-1">·</span>
                <span className="font-mono text-gray-300">{cat.slug}</span>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                  <Edit3 className="w-3.5 h-3.5" /> Modifier
                </button>
                <button onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id}
                  className="p-2 text-red-400 border border-red-100 hover:bg-red-50 rounded-xl transition">
                  {deletingId === cat.id
                    ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}