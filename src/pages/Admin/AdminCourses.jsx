import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/admin.css";

export default function AdminCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    instructor_id: "",
    category_id: "",
    price: "",
    original_price: "",
    duration_hours: "",
    level: "beginner",
    language: "fr",
    thumbnail_url: "",
    video_preview_url: "",
    is_published: false,
    is_featured: false,
    is_free: false,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // ---------------------------
  // 🔹 Fetch des données globales
  // ---------------------------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCourses(data.data);
    } catch (err) {
      console.error("Erreur chargement des cours:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const onlyInstructors = data.data.filter((u) => u.role === "instructor");
        setInstructors(onlyInstructors);
      }
    } catch (err) {
      console.error("Erreur chargement instructeurs:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchCategories();
      fetchInstructors();
    }
  }, [token]);

  // ---------------------------
  // 🔹 Actions
  // ---------------------------
  const deleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await fetch(`${API_URL}/api/admin/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCourses();
  };

  const togglePublish = async (course) => {
    await fetch(`${API_URL}/api/admin/courses/${course.id}/publish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_published: !course.is_published }),
    });
    fetchCourses();
  };

  const startCreate = () => {
    setEditingCourse(null);
    setIsCreating(true);
    setFormData({
      title: "",
      short_description: "",
      description: "",
      instructor_id: "",
      category_id: "",
      price: "",
      original_price: "",
      duration_hours: "",
      level: "beginner",
      language: "fr",
      thumbnail_url: "",
      video_preview_url: "",
      is_published: false,
      is_featured: false,
      is_free: false,
    });
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setIsCreating(false);
    setFormData({
      title: course.title || "",
      short_description: course.short_description || "",
      description: course.description || "",
      instructor_id: course.instructor_id || "",
      category_id: course.category_id || "",
      price: course.price || "",
      original_price: course.original_price || "",
      duration_hours: course.duration_hours || "",
      level: course.level || "beginner",
      language: course.language || "fr",
      thumbnail_url: course.thumbnail_url || "",
      video_preview_url: course.video_preview_url || "",
      is_published: course.is_published || false,
      is_featured: course.is_featured || false,
      is_free: course.is_free || false,
    });
  };

  const saveCourse = async () => {
    const method = editingCourse ? "PATCH" : "POST";
    const url = editingCourse
      ? `${API_URL}/api/admin/courses/${editingCourse.id}`
      : `${API_URL}/api/admin/courses`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.success) {
      setEditingCourse(null);
      setIsCreating(false);
      fetchCourses();
    } else {
      alert(data.message || "Erreur sauvegarde");
    }
  };

  // ---------------------------
  // 🔹 UI
  // ---------------------------
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-6">Chargement des cours...</p>;

  return (
    <div className="admin-container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎓 Gestion complète des cours</h1>
        <div className="flex gap-2">
          <button onClick={fetchCourses} className="admin-btn admin-btn-gray">
            🔄 Rafraîchir
          </button>
          <button onClick={startCreate} className="admin-btn admin-btn-blue">
            ➕ Nouveau cours
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Rechercher un cours..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {(editingCourse || isCreating) && (
        <div className="border p-4 mb-6 rounded bg-gray-50 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            {isCreating ? "🆕 Créer un cours" : `✏️ Modifier : ${editingCourse.title}`}
          </h2>

          {/* --- CHAMPS DU COURS --- */}
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Titre"
              className="border p-2 rounded"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Résumé court"
              className="border p-2 rounded"
              value={formData.short_description}
              onChange={(e) =>
                setFormData({ ...formData, short_description: e.target.value })
              }
            />
            <select
              className="border p-2 rounded"
              value={formData.instructor_id}
              onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
            >
              <option value="">👨‍🏫 Sélectionner un instructeur</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.first_name} {i.last_name}
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">📂 Catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Prix"
              className="border p-2 rounded"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Prix original"
              className="border p-2 rounded"
              value={formData.original_price}
              onChange={(e) =>
                setFormData({ ...formData, original_price: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Durée (heures)"
              className="border p-2 rounded"
              value={formData.duration_hours}
              onChange={(e) =>
                setFormData({ ...formData, duration_hours: e.target.value })
              }
            />
            <select
              className="border p-2 rounded"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
            <select
              className="border p-2 rounded"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
            <input
              type="text"
              placeholder="Miniature (URL)"
              className="border p-2 rounded"
              value={formData.thumbnail_url}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail_url: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Vidéo de prévisualisation (URL)"
              className="border p-2 rounded"
              value={formData.video_preview_url}
              onChange={(e) =>
                setFormData({ ...formData, video_preview_url: e.target.value })
              }
            />
          </div>

          <textarea
            className="border p-2 rounded w-full my-2"
            rows="5"
            placeholder="Description complète"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* --- TOGGLES --- */}
          <div className="flex gap-4 mt-2">
            {["is_published", "is_featured", "is_free"].map((key) => (
              <label key={key} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.checked })
                  }
                />
                {key === "is_published"
                  ? "Publié"
                  : key === "is_featured"
                  ? "En vedette"
                  : "Gratuit"}
              </label>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={saveCourse} className="admin-btn admin-btn-green">
              💾 Enregistrer
            </button>
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCreating(false);
              }}
              className="admin-btn admin-btn-gray"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* TABLEAU DES COURS */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Instructeur</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.instructor_name || "—"}</td>
              <td>{c.category_name || "—"}</td>
              <td>{c.is_free ? "Gratuit" : `${c.price} €`}</td>
              <td>{c.is_published ? "✅ Publié" : "❌ Brouillon"}</td>
              <td className="flex gap-2 py-2 justify-center">
                <button onClick={() => startEdit(c)} className="admin-btn admin-btn-blue">
                  Modifier
                </button>
                <button
                  onClick={() => togglePublish(c)}
                  className={`admin-btn ${
                    c.is_published ? "admin-btn-gray" : "admin-btn-green"
                  }`}
                >
                  {c.is_published ? "Dépublier" : "Publier"}
                </button>
                <button
                  onClick={() => deleteCourse(c.id)}
                  className="admin-btn admin-btn-red"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
