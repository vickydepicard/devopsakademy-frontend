import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText,
  PlayCircle,
  CheckCircle
} from "lucide-react";

export default function LessonPlayer() {
  const { id, moduleId, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const res = await api.get(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLesson(res.data.data.lesson);
        setNextLesson(res.data.data.nextLesson);
        setPrevLesson(res.data.data.prevLesson);
        setCompleted(res.data.data.completed);
      } catch (error) {
        console.error("Erreur:", error);
        navigate(`/courses/${id}/learn`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [id, moduleId, lessonId, token, navigate]);
  
  const markAsComplete = async () => {
    try {
      await api.post(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompleted(true);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <Link
          to={`/courses/${id}/learn`}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour au cours
        </Link>
        
        <div className="flex items-center space-x-4">
          {prevLesson && (
            <Link
              to={`/courses/${id}/modules/${prevLesson.module_id}/lessons/${prevLesson.id}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </Link>
          )}
          
          {nextLesson && (
            <Link
              to={`/courses/${id}/modules/${nextLesson.module_id}/lessons/${nextLesson.id}`}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
      
      {/* Contenu de la leçon */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            {lesson.content_type === 'video' ? (
              <PlayCircle className="w-5 h-5 mr-2" />
            ) : (
              <FileText className="w-5 h-5 mr-2" />
            )}
            <span className="capitalize">{lesson.content_type}</span>
            <span className="mx-2">•</span>
            <span>{lesson.duration_minutes} minutes</span>
          </div>
          
          {/* Contenu */}
          <div className="prose max-w-none">
            {lesson.content_type === 'video' && lesson.content_url ? (
              <div className="mb-6">
                <video
                  controls
                  className="w-full rounded-lg"
                  src={lesson.content_url}
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
              </div>
            ) : (
              <div 
                className="mb-6"
                dangerouslySetInnerHTML={{ __html: lesson.article_content }}
              />
            )}
          </div>
          
          {/* Bouton de complétion */}
          {!completed && (
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={markAsComplete}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Marquer comme terminé
              </button>
            </div>
          )}
          
          {completed && (
            <div className="mt-8 p-4 bg-green-50 text-green-800 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Vous avez terminé cette leçon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}