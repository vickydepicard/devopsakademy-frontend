import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  Award
} from "lucide-react";

export default function CourseLearning() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await api.get(`/courses/${id}/learning`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(res.data.data.course);
        setModules(res.data.data.modules);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, token]);
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
        <p className="text-gray-600 mt-2">{course?.short_description}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Modules et leçons */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
              Contenu du cours
            </h2>
            
            {modules.map(module => (
              <div key={module.id} className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                <div className="space-y-2">
                  {module.lessons?.map(lesson => (
                    <Link
                      key={lesson.id}
                      to={`/courses/${id}/modules/${module.id}/lessons/${lesson.id}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        {lesson.content_type === 'video' ? (
                          <PlayCircle className="w-5 h-5 text-red-500 mr-3" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
                        )}
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.duration_minutes} min
                          </div>
                        </div>
                      </div>
                      {lesson.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Progression et info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Votre progression</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {course?.completion_percentage || 0}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${course?.completion_percentage || 0}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm">
                {course?.completed_lessons || 0} / {course?.total_lessons || 0} leçons terminées
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <Award className="w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg mb-2">Certificat</h3>
            <p className="text-sm mb-4">
              Obtenez votre certificat en terminant tous les modules
            </p>
            <button className="w-full bg-white text-blue-600 font-medium py-2 rounded-lg hover:bg-gray-100">
              Voir le certificat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}