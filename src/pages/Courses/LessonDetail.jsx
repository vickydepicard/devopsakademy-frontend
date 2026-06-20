import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LessonDetail() {
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [lesson,  setLesson]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id || !lessonId || !token) return;
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/courses/${id}/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) setLesson(data.data);
        else setError(data.message || "Leçon introuvable");
      } catch (err) {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, lessonId, token]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !lesson) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="font-bold text-lg mb-2">{error || "Leçon introuvable"}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-[#2d287f] rounded-xl text-sm font-bold hover:bg-[#3b3aab] transition mt-3">← Retour</button>
      </div>
    </div>
  );

  const getYoutubeId = (url) => {
    const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? m[1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button onClick={() => navigate(`/courses/${id}/learn`)} className="flex items-center gap-2 text-[#5653e1] hover:text-[#2d287f] transition text-sm mb-6">
          ← Retour au cours
        </button>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
        {lesson.duration_minutes > 0 && (
          <p className="text-gray-400 text-sm mb-6">⏱ {lesson.duration_minutes} min</p>
        )}

        {/* Vidéo */}
        {lesson.content_type === "video" && lesson.content_url && (
          <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-6">
            {getYoutubeId(lesson.content_url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(lesson.content_url)}`}
                className="w-full h-full border-none"
                allowFullScreen
                title={lesson.title}
              />
            ) : lesson.content_url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={lesson.content_url} controls className="w-full h-full" />
            ) : (
              <iframe src={lesson.content_url} className="w-full h-full border-none" title={lesson.title} />
            )}
          </div>
        )}

        {/* Contenu article */}
        {lesson.content_type === "article" && (
          lesson.article_content ? (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
              <div
                className="prose prose-invert prose-sm max-w-none
                  text-gray-200 leading-relaxed
                  prose-headings:text-white prose-h2:border-b prose-h2:border-gray-600 prose-h2:pb-2
                  prose-p:text-gray-300 prose-p:leading-7
                  prose-a:text-[#5653e1]
                  prose-code:bg-gray-900 prose-code:text-green-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
                  prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-900/20
                  prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: lesson.article_content }}
              />
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 border-dashed mb-6">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-300 font-semibold">Contenu en cours de rédaction</p>
              <p className="text-gray-500 text-sm mt-1">L'instructeur n'a pas encore ajouté le contenu.</p>
            </div>
          )
        )}

        {/* Téléchargement */}
        {lesson.content_type === "download" && lesson.content_url && (
          <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4 mb-6 border border-gray-700">
            <div className="text-3xl">📥</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{lesson.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">Ressource téléchargeable</p>
            </div>
            <a href={lesson.content_url} download target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-[#3b3aab] text-white text-sm font-semibold rounded-xl transition">
              Télécharger
            </a>
          </div>
        )}

        {/* Statut */}
        <p className="text-sm text-gray-500">
          Statut : <span className="font-semibold text-gray-300">{lesson.status || "—"}</span>
        </p>
      </div>
    </div>
  );
}