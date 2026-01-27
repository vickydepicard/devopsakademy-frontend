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

  // ================= GET FILTERS =================
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/courses/filters");
        if (!res.ok) throw new Error("Erreur HTTP filtres");

        const data = await res.json();
        if (data?.success) {
          setFilters(data.data);
        }
      } catch (err) {
        console.error("❌ Erreur chargement filtres", err);
      }
    }

    fetchFilters();
  }, []);

  // ================= GET COURSES + ENROLLMENTS =================
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        Object.entries(selectedFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const res = await fetch(
          `/api/courses?page=1&limit=12&${params.toString()}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        );

        if (!res.ok) throw new Error("Erreur HTTP cours");

        const data = await res.json();
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error("❌ Erreur chargement cours", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchEnrollments() {
      if (!token || user?.role !== "student") return;

      try {
        const res = await fetch("/api/enrollments/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur HTTP inscriptions");

        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setEnrollments(data.data.map((e) => e.id));
        }
      } catch (err) {
        console.error("❌ Erreur chargement inscriptions", err);
      }
    }

    fetchCourses();
    fetchEnrollments();
  }, [token, user, selectedFilters]);

  // ================= HANDLE ENROLL =================
  const handleEnroll = async (courseId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(courseId);

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) throw new Error("Erreur HTTP inscription");

      const data = await res.json();
      if (data?.success && !data?.alreadyEnrolled) {
        setEnrollments((prev) => [...prev, courseId]);
      }
    } catch (err) {
      console.error("❌ Erreur inscription", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Chargement des cours...
      </p>
    );
  }

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
          className="w-full md:w-1/4 border rounded-lg px-3 py-2"
        />

        <select
          value={selectedFilters.category}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, category: e.target.value })
          }
          className="w-full md:w-1/5 border rounded-lg px-3 py-2"
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
          className="w-full md:w-1/5 border rounded-lg px-3 py-2"
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
          className="w-full md:w-1/5 border rounded-lg px-3 py-2"
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
          className="w-full md:w-1/5 border rounded-lg px-3 py-2"
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
                className="bg-white rounded-2xl shadow-md border hover:shadow-xl transition"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center rounded-t-2xl">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-500">
                      {course.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-lg">{course.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {course.short_description || "Aucune description."}
                  </p>

                  <p className="mt-3 font-semibold text-green-600">
                    {course.is_free ? "Gratuit" : `${course.price ?? 0} €`}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-blue-600 text-sm"
                    >
                      Voir détails
                    </Link>

                    {isEnrolled ? (
                      <span className="text-sm text-green-600">✅ Inscrit</span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={actionLoading === course.id}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm disabled:opacity-50"
                      >
                        {actionLoading === course.id ? "⏳..." : "S’inscrire"}
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
