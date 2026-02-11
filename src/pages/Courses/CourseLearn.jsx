// src/pages/Courses/CourseLearn.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnrollmentApproved } = usePermissions();
  
  // Vérifier que l'utilisateur est bien inscrit et approuvé
  // (déjà fait par CourseContentRoute, mais double vérification ici)
  
  // Récupérer le contenu complet du cours
  // Afficher les modules et leçons
  // Permettre la navigation entre les leçons
  // Suivre la progression
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Contenu du cours
        </h1>
        {/* Ici le contenu complet du cours */}
      </div>
    </div>
  );
};

export default CourseLearn;