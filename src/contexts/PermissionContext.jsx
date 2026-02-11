// PermissionContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les inscriptions de l'utilisateur avec la VRAIE route
  const loadUserEnrollments = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ✅ Route CORRECTE : /api/enrollments/me
      const response = await api.get('/enrollments/me');
      
      // Gérer le format de réponse
      let enrollmentsData = [];
      
      if (response.data?.success) {
        enrollmentsData = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        enrollmentsData = response.data;
      } else {
        // Fallback si la structure est différente
        enrollmentsData = response.data?.enrollments || [];
      }
      
      console.log('Enrollments chargés:', enrollmentsData.length, 'inscriptions');
      setEnrollments(enrollmentsData);
      
    } catch (err) {
      console.error('Erreur chargement inscriptions:', err.response?.data || err.message);
      setError('Impossible de charger vos inscriptions. Code: ' + (err.response?.status || 'N/A'));
      setEnrollments([]);
      
      // Log détaillé pour debug
      if (err.response) {
        console.error('Détails erreur:', {
          status: err.response.status,
          data: err.response.data,
          url: err.config?.url
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadUserEnrollments();
  }, [loadUserEnrollments]);

  // ========== FONCTIONS DE RÔLE ==========
  const isAdmin = () => {
    if (!user || !user.role) return false;
    return user.role === 'admin' || user.role === 'administrator';
  };

  const isInstructor = () => {
    if (!user || !user.role) return false;
    return user.role === 'instructor' || user.role === 'teacher' || user.role === 'formateur';
  };

  const isStudent = () => {
    if (!user) return false;
    const role = user.role?.toLowerCase();
    return !role || 
           role === 'student' || 
           role === 'learner' || 
           role === 'étudiant' ||
           role === 'eleve';
  };

  // ========== FONCTIONS D'INSCRIPTION ==========
  const isUserEnrolled = (courseId) => {
    if (!courseId) return false;
    
    const courseIdNum = parseInt(courseId);
    
    return enrollments.some(enrollment => {
      // Vérifier plusieurs formats possibles
      return (
        enrollment.course_id === courseIdNum ||
        enrollment.course?.id === courseIdNum ||
        enrollment.id === courseIdNum || // Si l'ID est celui du cours (à adapter)
        enrollment.enrollment_id === courseIdNum
      );
    });
  };

  const isEnrollmentApproved = (courseId) => {
    if (!courseId) return false;
    
    const courseIdNum = parseInt(courseId);
    const enrollment = enrollments.find(e => {
      return (
        e.course_id === courseIdNum ||
        e.course?.id === courseIdNum
      );
    });
    
    if (!enrollment) return false;
    
    // Plusieurs façons de vérifier l'approbation
    if (enrollment.status === 'approved') return true;
    if (enrollment.is_approved === true || enrollment.is_approved === 1) return true;
    if (enrollment.approved_at) return true;
    if (enrollment.payment_status === 'verified') return true;
    
    return false;
  };

  const getEnrollmentStatus = (courseId) => {
    if (!courseId) return 'not_enrolled';
    
    const courseIdNum = parseInt(courseId);
    const enrollment = enrollments.find(e => {
      return (
        e.course_id === courseIdNum ||
        e.course?.id === courseIdNum
      );
    });
    
    if (!enrollment) return 'not_enrolled';
    
    // Priorité au champ 'status'
    if (enrollment.status) {
      const status = enrollment.status.toLowerCase();
      if (status === 'approved' || status === 'active') return 'approved';
      if (status === 'pending' || status === 'waiting') return 'pending';
      if (status === 'rejected' || status === 'failed') return 'rejected';
    }
    
    // Fallback sur is_approved
    if (enrollment.is_approved === true || enrollment.is_approved === 1) {
      return 'approved';
    }
    
    // Fallback sur payment_status
    if (enrollment.payment_status === 'verified') return 'approved';
    if (enrollment.payment_status === 'pending') return 'pending';
    if (enrollment.payment_status === 'rejected') return 'rejected';
    
    // Par défaut
    return 'pending';
  };

  const enrollInCourse = async (courseId) => {
    try {
      // ✅ Route CORRECTE : POST /api/enrollments
      const response = await api.post('/enrollments', {
        course_id: courseId
      });
      
      // Recharger les inscriptions
      await loadUserEnrollments();
      
      console.log('Inscription réussie:', response.data);
      return response.data;
      
    } catch (err) {
      console.error('Erreur inscription détaillée:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Messages d'erreur spécifiques
      if (err.response?.status === 409) {
        throw new Error('Vous êtes déjà inscrit à ce cours');
      }
      if (err.response?.status === 403) {
        throw new Error('Vous n\'avez pas la permission de vous inscrire');
      }
      if (err.response?.status === 404) {
        throw new Error('Cours non trouvé');
      }
      
      throw new Error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const uploadPaymentProof = async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('payment_proof', file);
      
      // ✅ Route CORRECTE : POST /api/enrollments/:courseId/upload-proof
      const response = await api.post(`/enrollments/${courseId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Recharger les inscriptions
      await loadUserEnrollments();
      
      return response.data;
      
    } catch (err) {
      console.error('Erreur upload preuve:', err);
      throw new Error(err.response?.data?.message || 'Erreur lors de l\'envoi de la preuve');
    }
  };

  const getCourseProgress = (courseId) => {
    if (!courseId) return 0;
    
    const courseIdNum = parseInt(courseId);
    const enrollment = enrollments.find(e => 
      e.course_id === courseIdNum || e.course?.id === courseIdNum
    );
    
    if (!enrollment) return 0;
    
    return enrollment.progress_percentage || 
           enrollment.completion_percentage || 
           enrollment.progress || 
           0;
  };

  const canManageCourse = (courseId) => {
    if (!user) return false;
    
    // Admin peut tout
    if (isAdmin()) return true;
    
    // Instructeur peut gérer ses cours
    if (isInstructor()) {
      const enrollment = enrollments.find(e => e.course_id === parseInt(courseId));
      return enrollment?.instructor_id === user.id;
    }
    
    return false;
  };

  const refreshEnrollments = async () => {
    await loadUserEnrollments();
  };

  // Valeur du contexte
  const value = {
    // États
    enrollments,
    loading,
    error,
    
    // Fonctions de rôle
    isAdmin,
    isInstructor,
    isStudent,
    
    // Fonctions d'inscription
    isUserEnrolled,
    isEnrollmentApproved,
    getEnrollmentStatus,
    getCourseProgress,
    canManageCourse,
    
    // Actions
    enrollInCourse,
    uploadPaymentProof,
    refreshEnrollments,
    
    // Pour débogage
    loadUserEnrollments,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;