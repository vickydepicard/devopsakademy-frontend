// src/components/Common/CourseContentRoute.jsx
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";

const CourseContentRoute = ({ children }) => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isEnrollmentApproved, isUserEnrolled } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/courses/${id}/learn` }} />;
  }

  if (!isUserEnrolled(id)) {
    return <Navigate to={`/courses/${id}`} state={{ 
      message: "Vous devez vous inscrire pour accéder au contenu du cours" 
    }} />;
  }

  if (!isEnrollmentApproved(id)) {
    return <Navigate to={`/courses/${id}`} state={{ 
      message: "Votre inscription est en attente de validation" 
    }} />;
  }

  return children;
};

export default CourseContentRoute;