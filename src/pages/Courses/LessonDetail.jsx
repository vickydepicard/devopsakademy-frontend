import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LessonDetail() {
  const { id, lessonId } = useParams(); // courseId + lessonId
  const { token } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`${API_URL}/api/courses/${id}/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLesson(data.data);
        } else {
          console.error("Erreur:", data.message);
        }
      } catch (err) {
        console.error("Erreur récupération leçon:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && lessonId && token) fetchLesson();
  }, [id, lessonId, token]);

  if (loading) return <p className="text-center mt-10">Chargement de la leçon...</p>;
  if (!lesson) return <p className="text-center mt-10">Leçon introuvable.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">{lesson.title}</h1>

      {lesson.content_type === "video" && (
        <video
          src={lesson.content_url}
          controls
          className="w-full rounded-lg mb-4"
        />
      )}

      {lesson.content_type === "article" && (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.article_content }} />
      )}

      <p className="text-sm text-gray-500 mt-4">
        ⏱ Durée : {lesson.duration_minutes} min | Statut :{" "}
        <span className="font-semibold">{lesson.status}</span>
      </p>
    </div>
  );
}
