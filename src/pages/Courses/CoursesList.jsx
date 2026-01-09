import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function CoursesList() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    levels: [],
    languages: [],
    freePaid: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    level: "",
    is_free: "",
    language: "",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // ================= GET FILTERS =================
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch(`${API_URL}/api/courses/filters`);
        const data = await res.json();
        if (data.success) setFilters(data.data);
      } catch (err) {
        console.error("❌ Erreur chargement filtres", err);
      }
    }
    fetchFilters();
  }, [API_URL]);

  // ================= GET COURSES =================
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(selectedFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const url = `${API_URL}/api/courses?page=1&limit=12&${params.toString()}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        setCourses(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("❌ Erreur chargement cours", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchEnrollments() {
      if (!token || user?.role !== "student") return;
      try {
        const res = await fetch(`${API_URL}/api/enrollments/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setEnrollments(data.data.map((e) => e.id));
        }
      } catch (err) {
        console.error("❌ Erreur chargement inscriptions", err);
      }
    }

    fetchCourses();
    fetchEnrollments();
  }, [API_URL, token, user, selectedFilters]);

  // ================= HANDLE ENROLL =================
  const handleEnroll = async (courseId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setActionLoading(courseId);
      const res = await fetch(`${API_URL}/api/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (data.success && !data.alreadyEnrolled) {
        setEnrollments((prev) => [...prev, courseId]);
      }
    } catch (err) {
      console.error("❌ Erreur inscription:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ================= UI =================
  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">
        Chargement des cours...
      </p>
    );

  return (
    <div className="p-6">
      {/* Filtres */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={selectedFilters.search}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, search: e.target.value })
          }
          className="w-full md:w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
        />

        <select
          value={selectedFilters.category}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, category: e.target.value })
          }
          className="w-full md:w-1/5 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Toutes les catégories</option>
          {filters.categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.level}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, level: e.target.value })
          }
          className="w-full md:w-1/5 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Tous niveaux</option>
          {filters.levels.map((lvl, idx) => (
            <option key={idx} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.is_free}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, is_free: e.target.value })
          }
          className="w-full md:w-1/5 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Tous</option>
          {filters.freePaid.map((fp) => (
            <option key={fp.value} value={fp.value}>
              {fp.label}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.language}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, language: e.target.value })
          }
          className="w-full md:w-1/5 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Toutes langues</option>
          {filters.languages.map((lang, idx) => (
            <option key={idx} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center col-span-3">
            Aucun cours trouvé.
          </p>
        ) : (
          courses.map((course) => {
            const isEnrolled = enrollments.includes(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-gray-200"
              >
                {/* Image / Initiales */}
                <div className="relative h-40 w-full flex items-center justify-center bg-gray-100 rounded-t-2xl overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-500">
                      {course.title.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                    {course.level || "N/A"}
                  </span>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {course.short_description ||
                      "Aucune description disponible."}
                  </p>

                  <div className="mt-2 text-xs text-gray-400">
                    <p>
                      Catégorie :{" "}
                      <span className="text-gray-700 font-medium">
                        {course.category_name}
                      </span>
                    </p>
                    <p>
                      Instructeur :{" "}
                      <span className="text-gray-700 font-medium">
                        {course.first_name} {course.last_name}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <span>👨‍🎓 {course.student_count || 0} inscrits</span>
                    <span>
                      ⭐ {course.rating || 0} ({course.review_count || 0} avis)
                    </span>
                  </div>

                  <p className="mt-3 text-md font-semibold text-green-600">
                    {course.is_free ? "Gratuit" : `${course.price ?? 0} €`}
                  </p>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir détails
                    </Link>

                    {/* Bouton Inscription visible pour tous */}
                    {isEnrolled ? (
                      <span className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-sm shadow">
                        ✅ Inscrit
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (!token) {
                            navigate("/login");
                          } else if (user?.role === "student") {
                            handleEnroll(course.id);
                          }
                        }}
                        disabled={actionLoading === course.id}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-1.5 rounded-full text-sm shadow hover:opacity-90 transition disabled:opacity-50"
                      >
                        {actionLoading === course.id
                          ? "⏳..."
                          : "S’inscrire"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
