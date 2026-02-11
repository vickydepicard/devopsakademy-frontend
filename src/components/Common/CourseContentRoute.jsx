import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';

const CourseContentRoute = ({ children }) => {
  const { id: courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const { canAccessCourseContent, getEnrollmentStatus, loading } = usePermissions();

  // Si les permissions sont en cours de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3A82] mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // 1. Si non connecté → rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ 
      from: window.location.pathname,
      message: "Veuillez vous connecter pour accéder au contenu du cours"
    }} />;
  }

  // 2. Si non inscrit ou non approuvé → rediriger vers les détails du cours
  const status = getEnrollmentStatus(courseId);
  
  if (status === 'not_enrolled') {
    return <Navigate to={`/courses/${courseId}`} state={{
      message: "Vous devez vous inscrire à ce cours pour accéder au contenu",
      showEnrollButton: true
    }} />;
  }

  if (status === 'pending') {
    return <Navigate to={`/courses/${courseId}`} state={{
      message: "Votre inscription est en attente de validation",
      showStatus: true
    }} />;
  }

  // 3. Si inscrit et approuvé → autoriser l'accès
  if (canAccessCourseContent(courseId)) {
    return children;
  }

  // 4. Fallback (ne devrait pas arriver)
  return <Navigate to={`/courses/${courseId}`} />;
};

export default CourseContentRoute;