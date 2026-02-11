// src/components/Course/CourseAccessGuard.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import { Lock, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function CourseAccessGuard({ children, requireEnrollment = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [accessLevel, setAccessLevel] = useState('checking');
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!id) {
        setAccessLevel('invalid');
        setLoading(false);
        return;
      }

      try {
        // 1. Si l'utilisateur n'est pas connecté, il a accès en mode aperçu
        if (!isAuthenticated) {
          setAccessLevel('preview');
          setLoading(false);
          return;
        }

        // 2. Vérifier le statut d'inscription
        const res = await api.get(`/courses/${id}/enrollment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const enrollmentData = res.data.data;
        setEnrollmentStatus(enrollmentData);

        if (enrollmentData?.is_approved) {
          setAccessLevel('full');
        } else if (enrollmentData?.enrolled) {
          setAccessLevel('pending');
        } else {
          setAccessLevel('none');
        }

      } catch (error) {
        console.error("Erreur vérification accès:", error);
        
        // Si l'utilisateur est admin ou instructeur, lui donner accès complet
        if (user?.role === 'admin' || user?.role === 'instructor') {
          setAccessLevel('full');
        } else {
          setAccessLevel('preview');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id, isAuthenticated, token, user]);

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-blue-600 border-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // Si on ne requiert pas d'inscription (page détails)
  if (!requireEnrollment) {
    return children;
  }

  // Messages d'accès selon le niveau
  const accessMessages = {
    checking: { 
      title: "Vérification en cours...", 
      message: "Nous vérifions votre accès au cours." 
    },
    full: { 
      title: "Accès autorisé", 
      message: "Vous avez accès à ce cours." 
    },
    pending: { 
      title: "Inscription en attente", 
      message: "Votre inscription est en cours de validation par l'administrateur." 
    },
    none: { 
      title: "Inscription requise", 
      message: "Vous devez vous inscrire à ce cours pour y accéder." 
    },
    preview: { 
      title: "Mode aperçu", 
      message: "Connectez-vous pour vous inscrire et accéder au contenu complet." 
    },
    invalid: { 
      title: "Cours introuvable", 
      message: "Le cours demandé n'existe pas ou a été supprimé." 
    }
  };

  const currentAccess = accessMessages[accessLevel];

  // Accès complet ou page détails
  if (accessLevel === 'full' || !requireEnrollment) {
    return children;
  }

  // Pages bloquées avec message d'accès
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          accessLevel === 'pending' ? 'bg-yellow-100' :
          accessLevel === 'none' ? 'bg-red-100' :
          accessLevel === 'preview' ? 'bg-blue-100' :
          'bg-gray-100'
        }`}>
          {accessLevel === 'pending' ? (
            <Clock className="w-10 h-10 text-yellow-600" />
          ) : accessLevel === 'none' ? (
            <Lock className="w-10 h-10 text-red-600" />
          ) : accessLevel === 'preview' ? (
            <AlertCircle className="w-10 h-10 text-blue-600" />
          ) : (
            <CheckCircle className="w-10 h-10 text-green-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {currentAccess.title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {currentAccess.message}
        </p>

        <div className="space-y-4">
          {accessLevel === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <p className="font-medium">Statut: En attente de validation</p>
              <p className="mt-1">Vous recevrez un email lorsque votre inscription sera approuvée.</p>
            </div>
          )}

          {accessLevel === 'none' && isAuthenticated && (
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              S'inscrire maintenant
            </button>
          )}

          {accessLevel === 'preview' && !isAuthenticated && (
            <button
              onClick={() => navigate('/login', { state: { from: `/courses/${id}` } })}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Se connecter pour s'inscrire
            </button>
          )}

          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Retour aux détails du cours
          </button>

          <button
            onClick={() => navigate('/courses')}
            className="w-full py-2.5 text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tous les cours
          </button>
        </div>
      </div>
    </div>
  );
}