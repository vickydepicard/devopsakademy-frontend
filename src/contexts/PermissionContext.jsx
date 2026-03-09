// src/contexts/PermissionContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within a PermissionProvider');
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserEnrollments = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/enrollments/me');
      let data = [];
      if (response.data?.success) data = response.data.data || [];
      else if (Array.isArray(response.data)) data = response.data;
      else data = response.data?.enrollments || [];
      setEnrollments(data);
    } catch (err) {
      console.error('Erreur chargement inscriptions:', err.response?.data || err.message);
      setError('Impossible de charger vos inscriptions.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => { loadUserEnrollments(); }, [loadUserEnrollments]);

  const isAdmin      = () => !!user && (user.role === 'admin' || user.role === 'administrator');
  const isInstructor = () => !!user && (user.role === 'instructor' || user.role === 'teacher');
  const isStudent    = () => {
    if (!user) return false;
    const r = user.role?.toLowerCase();
    return !r || r === 'student' || r === 'learner' || r === 'étudiant';
  };

  const _findEnrollment = (courseId) => {
    const n = parseInt(courseId);
    return enrollments.find(e => e.course_id === n || e.course?.id === n) || null;
  };

  const isUserEnrolled       = (courseId) => !!_findEnrollment(courseId);
  const isEnrollmentApproved = (courseId) => {
    const e = _findEnrollment(courseId);
    if (!e) return false;
    return e.is_approved === 1 || e.is_approved === true || !!e.approved_at
        || e.payment_status === 'verified' || e.payment_status === 'free'
        || e.status === 'approved';
  };

  // ✅ FONCTION MANQUANTE — ajoutée ici
  const canAccessCourseContent = (courseId) => {
    if (!user) return false;
    if (isAdmin() || isInstructor()) return true;
    return isEnrollmentApproved(courseId);
  };

  const getEnrollmentStatus = (courseId) => {
    const e = _findEnrollment(courseId);
    if (!e) return 'not_enrolled';
    if (e.is_approved === 1 || e.is_approved === true || e.payment_status === 'verified' || e.payment_status === 'free') return 'approved';
    if (e.payment_status === 'pending') return 'pending';
    if (e.payment_status === 'rejected') return 'rejected';
    return 'pending';
  };

  const getCourseProgress = (courseId) => {
    const e = _findEnrollment(courseId);
    if (!e) return 0;
    return e.completion_percentage || e.progress_percentage || e.progress || 0;
  };

  const canManageCourse = (courseId) => {
    if (!user) return false;
    if (isAdmin()) return true;
    if (isInstructor()) {
      const e = _findEnrollment(courseId);
      return e?.instructor_id === user.id;
    }
    return false;
  };

  const enrollInCourse = async (courseId) => {
    try {
      const res = await api.post('/enrollments', { course_id: courseId });
      await loadUserEnrollments();
      return res.data;
    } catch (err) {
      if (err.response?.status === 409) throw new Error('Déjà inscrit à ce cours');
      throw new Error(err.response?.data?.message || 'Erreur inscription');
    }
  };

  const uploadPaymentProof = async (courseId, file) => {
    const formData = new FormData();
    formData.append('payment_proof', file);
    try {
      const res = await api.post(`/enrollments/${courseId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadUserEnrollments();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erreur upload preuve');
    }
  };

  const value = {
    enrollments, loading, error,
    isAdmin, isInstructor, isStudent,
    isUserEnrolled, isEnrollmentApproved,
    canAccessCourseContent,           // ✅ exportée
    getEnrollmentStatus, getCourseProgress, canManageCourse,
    enrollInCourse, uploadPaymentProof,
    refreshEnrollments: loadUserEnrollments,
    loadUserEnrollments,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export default PermissionContext;