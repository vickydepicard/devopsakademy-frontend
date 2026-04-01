import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  Unlock,
  Calendar,
  Award,
  MessageSquare,
  ChevronRight,
  PlayCircle,
  FileText,
  Download,
  Globe,
  Target,
  BarChart,
  Shield,
  Smartphone,
  Video,
  FileCode,
  Zap,
  TrendingUp,
  Heart,
  Share2,
  Bookmark,
  AlertCircle,
  UserCheck,
  Briefcase,
  GraduationCap,
  Languages,
  CalendarDays,
  Tag,
  DollarSign,
  Eye,
  ArrowRight,
  Info,
  HelpCircle,
  Users as UsersIcon,
  Clock as ClockIcon
} from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { 
    isUserEnrolled, 
    isEnrollmentApproved, 
    getEnrollmentStatus,
    enrollInCourse 
  } = usePermissions();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Essayer d'abord la version enrichie pour les connectés
        if (isAuthenticated) {
          try {
            const enhancedResponse = await api.get(`/courses/${id}/details`);
            if (enhancedResponse.data?.success) {
              setCourse(enhancedResponse.data.data);
              return;
            }
          } catch (enhancedErr) {
            console.log("Version enrichie non disponible, fallback sur version publique");
          }
        }
        
        // Version publique (pour tous)
        const response = await api.get(`/courses/${id}`);
        if (response.data?.success) {
          setCourse(response.data.data);
        } else {
          setError("Impossible de charger les détails du cours");
        }
      } catch (err) {
        console.error("Erreur chargement détails cours:", err);
        setError(err.response?.data?.message || "Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  // 🎯 LOGIQUE UNIFIÉE POUR L'ACCÈS
  const accessStatus = useMemo(() => {
    if (!isAuthenticated) {
      return {
        status: 'guest',
        label: 'Visiteur',
        message: 'Connectez-vous pour accéder au cours complet',
        icon: <Unlock className="w-5 h-5" />,
        color: 'blue',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        actions: {
          primary: {
            text: 'Se connecter',
            action: () => navigate('/login', { 
              state: { from: `/courses/${id}`, message: "Connectez-vous pour vous inscrire" }
            }),
            variant: 'primary',
            icon: <BookOpen className="w-4 h-4" />
          },
          secondary: {
            text: 'Créer un compte',
            action: () => navigate('/register', { state: { from: `/courses/${id}` } }),
            variant: 'outline',
            icon: <UserCheck className="w-4 h-4" />
          }
        }
      };
    }

    const status = getEnrollmentStatus(id);
    
    switch(status) {
      case 'approved':
        return {
          status: 'approved',
          label: 'Accès autorisé',
          message: 'Vous avez accès complet à ce cours',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green',
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
          actions: {
            primary: {
              text: 'Continuer l\'apprentissage',
              action: () => navigate(`/courses/${id}/learn`),
              variant: 'success',
              icon: <PlayCircle className="w-4 h-4" />
            },
            secondary: {
              text: 'Voir progression',
              action: () => navigate(`/courses/${id}/progress`),
              variant: 'outline',
              icon: <BarChart className="w-4 h-4" />
            }
          }
        };
      
      case 'pending':
        return {
          status: 'pending',
          label: 'En attente',
          message: 'Votre inscription est en cours de validation',
          icon: <Clock className="w-5 h-5" />,
          color: 'yellow',
          badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          actions: {
            primary: {
              text: 'Voir le statut',
              action: null,
              variant: 'disabled',
              icon: <Clock className="w-4 h-4" />
            },
            secondary: {
              text: 'Contacter le support',
              action: () => navigate('/support'),
              variant: 'outline',
              icon: <HelpCircle className="w-4 h-4" />
            }
          }
        };
      
      case 'not_enrolled':
      default:
        return {
          status: 'not_enrolled',
          label: 'Non inscrit',
          message: 'Inscrivez-vous pour accéder au contenu complet',
          icon: <Lock className="w-5 h-5" />,
          color: 'gray',
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
          actions: {
            primary: {
              text: enrolling ? 'Inscription en cours...' : 'S\'inscrire maintenant',
              action: handleEnroll,
              disabled: enrolling,
              variant: 'primary',
              icon: <BookOpen className="w-4 h-4" />
            },
            secondary: {
              text: 'En savoir plus',
              action: () => window.scrollTo({ top: 800, behavior: 'smooth' }),
              variant: 'outline',
              icon: <Info className="w-4 h-4" />
            }
          }
        };
    }
  }, [isAuthenticated, getEnrollmentStatus, id, enrolling]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/courses/${id}`,
          message: "Connectez-vous pour vous inscrire à ce cours"
        }
      });
      return;
    }

    if (isUserEnrolled(id)) {
      if (isEnrollmentApproved(id)) {
        navigate(`/courses/${id}/learn`);
      } else {
        navigate(`/courses/${id}`, {
          state: { message: "Votre inscription est en attente de validation" }
        });
      }
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(id);
      
      // Recharger les données
      const enhancedResponse = await api.get(`/courses/${id}/details`);
      if (enhancedResponse.data?.success) {
        setCourse(enhancedResponse.data.data);
      }
      
      navigate(`/courses/${id}`, {
        state: { 
          success: true,
          message: "Votre inscription a été soumise avec succès !"
        }
      });
    } catch (err) {
      console.error("Erreur inscription:", err);
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setEnrolling(false);
    }
  };

  // 🎯 FONCTIONS UTILITAIRES
  const formatDuration = (hours) => {
    if (!hours) return 'Durée flexible';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours === 1) return '1 heure';
    return `${hours} heures`;
  };

  const formatPrice = (price) => {
    if (price === 0 || course?.is_free) return 'Gratuit';
    if (!price) return 'Prix sur demande';
    return `${parseFloat(price).toLocaleString('fr-FR')} €`;
  };

  const formatRating = (rating) => {
    if (!rating) return '0.0';
    return parseFloat(rating).toFixed(1);
  };

  const getLevelInfo = (level) => {
    const levels = {
      'beginner': { 
        text: 'Débutant', 
        class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '🟢',
        description: 'Aucune connaissance préalable requise'
      },
      'intermediate': { 
        text: 'Intermédiaire', 
        class: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '🔵',
        description: 'Connaissances de base requises'
      },
      'advanced': { 
        text: 'Avancé', 
        class: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🟣',
        description: 'Expérience significative requise'
      }
    };
    
    return levels[level?.toLowerCase()] || { 
      text: 'Tous niveaux', 
      class: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '⚪',
      description: 'Adapté à tous les niveaux'
    };
  };

  const getLanguageInfo = (language) => {
    const languages = {
      'fr': { name: 'Français', flag: '🇫🇷' },
      'en': { name: 'English', flag: '🇬🇧' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'de': { name: 'Deutsch', flag: '🇩🇪' }
    };
    return languages[language] || { name: language?.toUpperCase() || 'Multilingue', flag: '🌐' };
  };

  const calculateDiscount = () => {
    if (!course?.original_price || !course?.price) return null;
    const discount = ((course.original_price - course.price) / course.original_price) * 100;
    return Math.round(discount);
  };

  const renderRequirements = () => {
    if (!course?.requirements) return null;
    
    const requirements = Array.isArray(course.requirements) 
      ? course.requirements 
      : JSON.parse(course.requirements || '[]');
    
    if (requirements.length === 0) return null;
    
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-amber-600" />
          <h3 className="text-xl font-bold text-gray-900">Prérequis</h3>
        </div>
        <ul className="space-y-2">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderLearningOutcomes = () => {
    if (!course?.learning_outcomes) return null;
    
    const outcomes = Array.isArray(course.learning_outcomes) 
      ? course.learning_outcomes 
      : JSON.parse(course.learning_outcomes || '[]');
    
    if (outcomes.length === 0) return null;
    
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Compétences acquises</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-800">{outcome}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCurriculum = () => {
    if (!course?.modules || course.modules.length === 0) {
      return (
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center">
          <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-900 mb-2">Programme en cours de finalisation</h4>
          <p className="text-gray-600">Le programme détaillé sera disponible prochainement.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Programme du cours</h3>
            <p className="text-gray-600 mt-1">
              {course.modules.length} modules • {course.modules.reduce((total, m) => total + (m.lesson_count || 0), 0)} leçons
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Durée totale : {formatDuration(course.duration_hours)}</span>
          </div>
        </div>

        {course.modules.map((module, idx) => (
          <div 
            key={idx} 
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#3B3A82]/40 transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-[#3B3A82]/5 to-transparent px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3B3A82] to-[#4F46E5] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {module.lesson_count || 0} leçons
                  </p>
                  {module.total_duration && (
                    <p className="text-sm text-gray-500">
                      {Math.round(module.total_duration / 60)}h
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {module.lessons && module.lessons.length > 0 && (
              <div className="divide-y divide-gray-100">
                {module.lessons.map((lesson, lessonIdx) => (
                  <div 
                    key={lessonIdx} 
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        lesson.content_type === 'video' ? 'bg-blue-100 text-blue-600' :
                        lesson.content_type === 'article' ? 'bg-emerald-100 text-emerald-600' :
                        lesson.content_type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {lesson.content_type === 'video' ? (
                          <Video className="w-5 h-5" />
                        ) : lesson.content_type === 'article' ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileCode className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {lesson.title}
                          </p>
                          {lesson.is_preview && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Aperçu
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          {lesson.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes} min
                            </span>
                          )}
                          <span className="capitalize">{lesson.content_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    {accessStatus.status === 'approved' ? (
                      <button 
                        onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                        className="px-4 py-2 bg-[#3B3A82] text-white rounded-lg font-medium hover:bg-[#4F46E5] transition-colors flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Commencer
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Verrouillé</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInstructorInfo = () => {
    if (!course) return null;
    
    return (
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${course.first_name}+${course.last_name}&background=3B3A82&color=fff&size=128`}
                alt={`${course.first_name} ${course.last_name}`}
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{course.first_name} {course.last_name}</h3>
              <p className="text-gray-600">Instructeur certifié DevOps</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {course.student_count?.toLocaleString() || '0'} étudiants
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {formatRating(course.rating)}/5.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <Briefcase className="w-5 h-5 text-[#3B3A82] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">10+ ans</p>
            <p className="text-xs text-gray-500">Expérience</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <GraduationCap className="w-5 h-5 text-[#3B3A82] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Certifié</p>
            <p className="text-xs text-gray-500">AWS & Kubernetes</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <UsersIcon className="w-5 h-5 text-[#3B3A82] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">5K+</p>
            <p className="text-xs text-gray-500">Étudiants formés</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <Award className="w-5 h-5 text-[#3B3A82] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Top 1%</p>
            <p className="text-xs text-gray-500">Instructeur</p>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {course?.student_count?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600">Étudiants</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatRating(course?.rating)}
                <span className="text-sm text-gray-500">/5</span>
              </p>
              <p className="text-sm text-gray-600">Note moyenne</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(course?.duration_hours)}
              </p>
              <p className="text-sm text-gray-600">Durée</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {course?.completion_percentage || '85'}%
              </p>
              <p className="text-sm text-gray-600">Taux de réussite</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 ERROR STATE
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Cours non disponible</h3>
          <p className="text-gray-600 mb-8">
            {error || "Le cours demandé n'est pas accessible pour le moment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Explorer les formations
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-[#3B3A82] text-[#3B3A82] rounded-xl font-medium hover:bg-[#3B3A82] hover:text-white transition-all duration-300"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(course.level);
  const languageInfo = getLanguageInfo(course.language);
  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 🎯 HEADER AVEC MESSAGE */}
      {location.state?.message && (
        <div className={`${location.state?.success ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border p-4`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {location.state?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600" />
                )}
                <p className={`${location.state?.success ? 'text-green-800' : 'text-blue-800'} font-medium`}>
                  {location.state.message}
                </p>
              </div>
              <button
                onClick={() => navigate(location.pathname, { replace: true, state: {} })}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3B3A82]/10 via-white to-[#4F46E5]/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-[#3B3A82] transition-colors"
            >
              Accueil
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigate('/courses')} 
              className="hover:text-[#3B3A82] transition-colors"
            >
              Formations
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 🎯 MAIN CONTENT */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${levelInfo.class}`}>
                      {levelInfo.icon} {levelInfo.text}
                    </span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {languageInfo.flag} {languageInfo.name}
                    </span>
                    {discount && (
                      <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold border border-red-200">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    {course.title}
                  </h1>
                  
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {course.short_description || course.description?.substring(0, 200) || "Formation DevOps complète"}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-full ${isBookmarked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 🎯 COURSE IMAGE */}
              <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl border border-gray-200">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-[400px] object-contain"
                  />
                ) : (
                  <div className="w-full h-[400px] bg-gradient-to-br from-[#3B3A82] to-[#4F46E5] flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-white text-8xl font-extrabold mb-4 block">
                        {course.title?.charAt(0).toUpperCase()}
                      </span>
                      <p className="text-white/80 text-lg">DevOps Akademy</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 🎯 STATS */}
              {renderStats()}

              {/* 🎯 TABS */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Aperçu', icon: <Eye className="w-4 h-4" /> },
                      { id: 'curriculum', label: 'Programme', icon: <BookOpen className="w-4 h-4" /> },
                      { id: 'instructor', label: 'Instructeur', icon: <Users className="w-4 h-4" /> },
                      { id: 'reviews', label: 'Avis', icon: <Star className="w-4 h-4" /> },
                      { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-6 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-[#3B3A82] text-[#3B3A82] bg-[#3B3A82]/5'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 🎯 TAB CONTENT */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Description du cours</h3>
                        <div className="prose prose-lg max-w-none">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.description || 'Aucune description disponible.'}
                          </div>
                        </div>
                      </div>

                      {renderLearningOutcomes()}
                      {renderRequirements()}
                      
                      {/* What's Included */}
                      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Ce qui est inclus</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { icon: <Video className="w-5 h-5" />, text: 'Vidéos HD' },
                            { icon: <FileText className="w-5 h-5" />, text: 'Ressources téléchargeables' },
                            { icon: <Award className="w-5 h-5" />, text: 'Certificat de fin' },
                            { icon: <Smartphone className="w-5 h-5" />, text: 'Accès mobile & TV' },
                            { icon: <MessageSquare className="w-5 h-5" />, text: 'Support instructeur' },
                            { icon: <Infinity className="w-5 h-5" />, text: 'Accès à vie' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                              <div className="w-8 h-8 bg-[#3B3A82]/10 rounded-lg flex items-center justify-center text-[#3B3A82]">
                                {item.icon}
                              </div>
                              <span className="text-gray-800">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && renderCurriculum()}
                  
                  {activeTab === 'instructor' && renderInstructorInfo()}
                  
                  {activeTab === 'reviews' && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun avis pour le moment</h3>
                      <p className="text-gray-600 mb-8">Soyez le premier à partager votre expérience !</p>
                      {accessStatus.status === 'approved' && (
                        <button className="px-6 py-3 bg-[#3B3A82] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors">
                          Donner mon avis
                        </button>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'faq' && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h3>
                      {[
                        {
                          q: "Puis-je suivre ce cours à mon rythme ?",
                          a: "Oui, tous nos cours sont disponibles à la demande. Vous pouvez apprendre à votre propre rythme, n'importe quand, n'importe où."
                        },
                        {
                          q: "Ai-je besoin de prérequis techniques ?",
                          a: "Ce cours est conçu pour être accessible aux débutants. Nous couvrons toutes les bases nécessaires avant d'aborder les concepts avancés."
                        },
                        {
                          q: "Comment obtenir le certificat ?",
                          a: "Le certificat est délivré automatiquement après avoir complété toutes les leçons et réussi les évaluations avec un score minimum de 80%."
                        },
                        {
                          q: "Puis-je accéder au cours sur mobile ?",
                          a: "Oui, notre plateforme est entièrement responsive et fonctionne parfaitement sur smartphones, tablettes et ordinateurs."
                        },
                        {
                          q: "Y a-t-il un support disponible ?",
                          a: "Oui, vous bénéficiez d'un support direct de l'instructeur et d'un accès à notre communauté d'étudiants pour poser vos questions."
                        }
                      ].map((faq, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#3B3A82] transition-colors">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[#3B3A82]" />
                            {faq.q}
                          </h4>
                          <p className="text-gray-600">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🎯 SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Pricing Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  {/* Discount Banner */}
                  {discount && (
                    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span className="font-bold">OFFRE SPÉCIALE : -{discount}%</span>
                      </div>
                      <p className="text-sm opacity-90 mt-1">Valable encore 2 jours</p>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatPrice(course.price)}
                        </div>
                        {course.original_price && course.price !== course.original_price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg text-gray-500 line-through">
                              {course.original_price.toLocaleString('fr-FR')} €
                            </span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                              Économisez {(course.original_price - course.price).toLocaleString('fr-FR')} €
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.class}`}>
                          {levelInfo.text}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{levelInfo.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Durée
                        </span>
                        <span className="font-medium">{formatDuration(course.duration_hours)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Leçons
                        </span>
                        <span className="font-medium">
                          {course.modules?.reduce((total, m) => total + (m.lesson_count || 0), 0) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          Langue
                        </span>
                        <span className="font-medium">{languageInfo.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Certification
                        </span>
                        <span className="font-medium text-green-600">Incluse</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={accessStatus.actions.primary.action}
                        disabled={accessStatus.actions.primary.disabled || !accessStatus.actions.primary.action}
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          accessStatus.actions.primary.variant === 'primary' 
                            ? 'bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white hover:shadow-lg hover:scale-[1.02]' 
                            : accessStatus.actions.primary.variant === 'success'
                            ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:shadow-lg hover:scale-[1.02]'
                            : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {accessStatus.actions.primary.icon}
                        {accessStatus.actions.primary.text}
                      </button>
                      
                      {accessStatus.actions.secondary && (
                        <button
                          onClick={accessStatus.actions.secondary.action}
                          className="w-full py-3 px-4 border-2 border-[#3B3A82] text-[#3B3A82] rounded-xl font-medium hover:bg-[#3B3A82] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {accessStatus.actions.secondary.icon}
                          {accessStatus.actions.secondary.text}
                        </button>
                      )}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-medium text-gray-900">Garantie satisfait ou remboursé</p>
                          <p className="text-sm text-gray-600">30 jours sans risque</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Status */}
                <div className={`${accessStatus.badgeClass} border rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    {accessStatus.icon}
                    <div>
                      <h3 className="font-bold text-gray-900">{accessStatus.label}</h3>
                      <p className="text-sm opacity-90 mt-1">{accessStatus.message}</p>
                    </div>
                  </div>
                  
                  {accessStatus.status === 'guest' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Rejoignez plus de 10,000 étudiants</p>
                      <div className="flex -space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"></div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                          +5K
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Informations clés</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dernière mise à jour</span>
                      <span className="text-sm font-medium">
                        {course.updated_at ? new Date(course.updated_at).toLocaleDateString('fr-FR') : 'Récent'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Catégorie</span>
                      <span className="text-sm font-medium">{course.category_name || 'DevOps'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accès</span>
                      <span className="text-sm font-medium">À vie</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mise à jour</span>
                      <span className="text-sm font-medium">Gratuite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 CTA SECTION */}
          <div className="mt-16 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] rounded-3xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Prêt à maîtriser DevOps ?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui ont transformé leur carrière avec DevOps Akademy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register', { state: { from: `/courses/${id}` } })}
                className="px-8 py-3 bg-white text-[#3B3A82] rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
              >
                Voir le programme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;