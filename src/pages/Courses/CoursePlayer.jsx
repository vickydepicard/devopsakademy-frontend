import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export default function CoursePlayer() {
  const { id, lessonId } = useParams()
  const courseId = id
  const { accessToken: token } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ================= Fetch cours complet =================
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/courses/${courseId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur chargement cours")

        setCourse(data.data)

        // Trouver la leçon actuelle
        const allLessons = data.data.modules.flatMap((m) => m.lessons || [])
        const firstLesson = allLessons[0] || null
        const selectedLesson = allLessons.find((l) => l.id.toString() === lessonId)
        setCurrentLesson(selectedLesson || firstLesson)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, lessonId, token])

  // ================= Marquer leçon terminée =================
  const markLessonCompleted = async (lessonId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/lessons/${lessonId}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur progression")

      setCourse((prev) => ({
        ...prev,
        progression: [...(prev.progression || []), { lesson_id: lessonId, completed: true }],
      }))
    } catch (err) {
      console.error("Erreur progression:", err)
    }
  }

  // ================= Navigation =================
  const goToNextLesson = () => {
    if (!course || !currentLesson) return
    const allLessons = course.modules.flatMap((m) => m.lessons || [])
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      navigate(`/courses/${courseId}/player/${nextLesson.id}`)
      setCurrentLesson(nextLesson)
    }
  }

  // ================= RENDER =================
  if (loading) return <p className="text-center py-10">Chargement...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (!course || !currentLesson) return <p className="text-center">Cours introuvable</p>

  const completed = course.progression?.find((p) => p.lesson_id === currentLesson.id)?.completed

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen bg-gray-100">
      {/* LEFT: Lecteur */}
      <div className="lg:col-span-2 p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-3">{currentLesson.title}</h1>

        {currentLesson.video_url ? (
          <video
            src={currentLesson.video_url}
            controls
            className="w-full h-[480px] rounded-md shadow"
          />
        ) : (
          <div className="bg-gray-200 h-[480px] flex items-center justify-center rounded-md">
            <p className="text-gray-500">Aucune vidéo disponible</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {!completed ? (
            <button
              onClick={() => markLessonCompleted(currentLesson.id)}
              className="px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
            >
              ✅ Marquer comme terminé
            </button>
          ) : (
            <span className="text-green-600 font-semibold">Déjà terminé</span>
          )}

          <button
            onClick={goToNextLesson}
            className="px-5 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
          >
            ▶️ Leçon suivante
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <p className="text-gray-700">{currentLesson.description || "Aucune description."}</p>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div className="bg-white border-l shadow-md p-4 lg:h-screen lg:overflow-y-auto sticky top-0">
        <h2 className="text-lg font-bold mb-4">📂 Contenu du cours</h2>
        {course.modules.map((mod) => (
          <div key={mod.id} className="mb-4">
            <h3 className="font-semibold text-indigo-700">{mod.title}</h3>
            <ul className="space-y-2 mt-2">
              {mod.lessons?.map((lesson) => {
                const isCompleted = course.progression?.find(
                  (p) => p.lesson_id === lesson.id
                )?.completed
                return (
                  <li
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson)
                      navigate(`/courses/${courseId}/player/${lesson.id}`)
                    }}
                    className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                      currentLesson.id === lesson.id
                        ? "bg-indigo-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{lesson.title}</span>
                    {isCompleted && <span className="text-green-500">✔</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
