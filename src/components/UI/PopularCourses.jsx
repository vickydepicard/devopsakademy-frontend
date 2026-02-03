import { useEffect, useState } from "react";
import api from "../../api/api";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    api
      .get("/courses/popular")
      .then((res) => setCourses(res.data?.data || []))
      .catch((err) => {
        console.error(
          "❌ Erreur lors du chargement des cours populaires :",
          err
        );
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      {/* TITRE */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#3B3A82] mb-3">
          🌟 Formations populaires
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          Nos parcours les plus suivis par la communauté DevOps Akademy.
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white border border-[#3B3A82]/10 rounded-2xl shadow p-5 h-72"
            >
              <div className="bg-gray-200 h-40 w-full rounded-xl"></div>
              <div className="h-4 bg-gray-200 mt-4 w-3/4 rounded"></div>
              <div className="h-4 bg-gray-200 mt-2 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white border border-[#3B3A82]/10 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-[#3B3A82]/30"
              >
                {/* IMAGE / FALLBACK */}
                <div className="relative">
                  {course.thumbnail_url && !imageError[course.id] ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      onError={() =>
                        setImageError((prev) => ({
                          ...prev,
                          [course.id]: true,
                        }))
                      }
                      className="rounded-t-2xl w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="rounded-t-2xl w-full h-48 bg-gradient-to-br from-[#3B3A82] to-[#4F46E5] flex items-center justify-center">
                      <span className="text-white/90 text-6xl font-extrabold tracking-wider drop-shadow-md">
                        {course.title?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* PRIX */}
                  <span className="absolute top-3 right-3 bg-yellow-400 text-[#3B3A82] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {course.is_free ? "Gratuit" : `${course.price || 0} €`}
                  </span>
                </div>

                {/* CONTENU */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#3B3A82] transition-colors duration-200">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    Par {course.first_name} {course.last_name}
                  </p>

                  <p className="text-xs text-gray-500 mt-2 italic">
                    Niveau :{" "}
                    {course.level === "beginner"
                      ? "Débutant"
                      : course.level === "intermediate"
                      ? "Intermédiaire"
                      : "Avancé"}
                  </p>

                  <div className="mt-4 flex justify-between items-center">
                    <a
                      href={`/courses/${course.id}`}
                      className="text-sm font-medium text-[#4F46E5] hover:underline"
                    >
                      Voir le cours →
                    </a>
                    <span className="text-xs text-gray-400">
                      ⭐ {course.rating || "4.8"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">
              Aucune formation disponible pour le moment.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default PopularCourses;
