import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { useTranslation } from "react-i18next";

const CourseContentRoute = ({ children }) => {
  const { t } = useTranslation("courseContentRoute");
  const { id: courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const { canAccessCourseContent, getEnrollmentStatus, isAdmin, isInstructor, loading } = usePermissions();

  // Si les permissions sont en cours de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3A82] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("verification_des_permissions")}</p>
        </div>
      </div>
    );
  }

  // 1. Si non connecté → rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ 
      from: window.location.pathname,
      message: t("veuillez_vous_connecter_pour_acceder_au")
    }} />;
  }

  // Équipe pédagogique et admin : accès direct (mode enseignant, contrôlé côté serveur)
  if (isAdmin() || isInstructor()) return children;

  // 2. Si non inscrit ou non approuvé → rediriger vers les détails du cours
  const status = getEnrollmentStatus(courseId);
  
  if (status === 'not_enrolled') {
    return <Navigate to={`/courses/${courseId}`} state={{
      message: t("vous_devez_vous_inscrire_a_ce"),
      showEnrollButton: true
    }} />;
  }

  if (status === 'pending') {
    return <Navigate to={`/courses/${courseId}`} state={{
      message: t("votre_inscription_est_en_attente_de"),
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