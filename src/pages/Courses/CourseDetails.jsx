import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";

// Icons imports
import {
  Star, Users, Clock, BookOpen, CheckCircle, Lock, Unlock, Award,
  MessageSquare, ChevronRight, PlayCircle, FileText, Download, Globe,
  Target, BarChart, Shield, Smartphone, Video, FileCode, Zap,
  TrendingUp, Heart, Share2, Bookmark, AlertCircle, UserCheck,
  Briefcase, GraduationCap, Languages, CalendarDays, Eye, ArrowRight,
  Info, HelpCircle, ChevronDown, ChevronUp, ExternalLink,
  // DevOps icons
  Code, Server, Database, Cloud, Terminal, GitBranch, Settings,
  ShieldCheck, Cpu, Network, Key, GitMerge, Container, Loader,
  Wifi, Check, X, AlertTriangle, Mail, Phone, CreditCard
} from "lucide-react";

import CourseReviews from "../../components/Reviews/CourseReviews";

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
  const [expandedModules, setExpandedModules] = useState([]);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  // Language detection
  const userLanguage = navigator.language || navigator.userLanguage || 'fr';
  const isFrench = userLanguage.startsWith('fr');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try enhanced version for authenticated users
        if (isAuthenticated) {
          try {
            const enhancedResponse = await api.get(`/courses/${id}/details`);
            if (enhancedResponse.data?.success) {
              setCourse(enhancedResponse.data.data);
              return;
            }
          } catch (enhancedErr) {
            console.log("Enhanced version not available, falling back to public");
          }
        }
        
        // Public version (for everyone)
        const response = await api.get(`/courses/${id}`);
        if (response.data?.success) {
          setCourse(response.data.data);
        } else {
          setError(isFrench ? "Impossible de charger les détails du cours" : "Unable to load course details");
        }
      } catch (err) {
        console.error("Error loading course details:", err);
        setError(err.response?.data?.message || (isFrench ? "Erreur de connexion au serveur" : "Server connection error"));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/courses/${id}`,
          message: isFrench ? "Connectez-vous pour vous inscrire à ce cours" : "Sign in to enroll in this course"
        }
      });
      return;
    }

    if (isUserEnrolled(id)) {
      if (isEnrollmentApproved(id)) {
        navigate(`/courses/${id}/learn`);
      } else {
        navigate(`/courses/${id}`, {
          state: { message: isFrench 
            ? "Votre inscription est en attente de validation par l'administrateur" 
            : "Your enrollment is pending administrator approval"
          }
        });
      }
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(id);
      
      // Reload data
      try {
        const enhancedResponse = await api.get(`/courses/${id}/details`);
        if (enhancedResponse.data?.success) {
          setCourse(enhancedResponse.data.data);
        }
      } catch (err) {
        console.log("Error reloading:", err);
      }
      
      navigate(`/courses/${id}`, {
        state: { 
          success: true,
          message: isFrench
            ? "Votre inscription a été soumise avec succès ! L'administrateur validera votre inscription après vérification du paiement."
            : "Your enrollment has been submitted successfully! The administrator will validate your enrollment after payment verification."
        }
      });
    } catch (err) {
      console.error("Enrollment error:", err);
      setError(err.response?.data?.message || (isFrench ? "Erreur lors de l'inscription" : "Error during enrollment"));
    } finally {
      setEnrolling(false);
    }
  };

  // Unified access logic
  const accessStatus = useMemo(() => {
    if (!isAuthenticated) {
      return {
        status: 'guest',
        label: isFrench ? 'Visiteur' : 'Visitor',
        message: isFrench ? 'Inscrivez-vous pour accéder à ce cours' : 'Sign up to access this course',
        icon: <Unlock className="w-5 h-5" />,
        color: 'blue',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        actions: {
          primary: {
            text: isFrench ? 'S\'inscrire au cours' : 'Enroll in Course',
            action: () => navigate('/login', { 
              state: { 
                from: `/courses/${id}`,
                message: isFrench ? "Connectez-vous pour vous inscrire à ce cours" : "Sign in to enroll in this course"
              }
            }),
            variant: 'primary',
            icon: <BookOpen className="w-4 h-4" />
          },
        }
      };
    }

    const status = getEnrollmentStatus(id);
    
    switch(status) {
      case 'approved':
        return {
          status: 'approved',
          label: isFrench ? 'Accès autorisé' : 'Access Granted',
          message: isFrench ? 'Votre inscription a été validée' : 'Your enrollment has been approved',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green',
          badgeClass: 'bg-green-50 text-green-700 border-green-200',
          actions: {
            primary: {
              text: isFrench ? 'Continuer l\'apprentissage' : 'Continue Learning',
              action: () => navigate(`/courses/${id}/learn`),
              variant: 'success',
              icon: <PlayCircle className="w-4 h-4" />
            },
            secondary: {
              text: isFrench ? 'Voir progression' : 'View Progress',
              action: () => navigate(`/courses/${id}/progress`),
              variant: 'outline',
              icon: <BarChart className="w-4 h-4" />
            }
          }
        };
      
      case 'pending':
        return {
          status: 'pending',
          label: isFrench ? 'En attente de validation' : 'Pending Approval',
          message: isFrench ? 'Validation administrateur en cours' : 'Awaiting administrator approval',
          icon: <Clock className="w-5 h-5" />,
          color: 'yellow',
          badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          actions: {
            primary: {
              text: isFrench ? 'Voir le statut' : 'View Status',
              action: () => navigate('/dashboard/enrollments'),
              variant: 'disabled',
              icon: <Clock className="w-4 h-4" />
            },
            secondary: {
              text: isFrench ? 'Contacter le support' : 'Contact Support',
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
          label: isFrench ? 'Non inscrit' : 'Not Enrolled',
          message: isFrench ? 'Inscrivez-vous pour accéder au contenu' : 'Enroll to access full content',
          icon: <Lock className="w-5 h-5" />,
          color: 'gray',
          badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
          actions: {
            primary: {
              text: enrolling 
                ? (isFrench ? 'Inscription en cours...' : 'Enrolling...') 
                : (isFrench ? 'S\'inscrire maintenant' : 'Enroll Now'),
              action: handleEnroll,
              disabled: enrolling,
              variant: 'primary',
              icon: <BookOpen className="w-4 h-4" />
            },
            secondary: {
              text: isFrench ? 'Informations paiement' : 'Payment Info',
              action: () => setShowPaymentInfo(true),
              variant: 'outline',
              icon: <CreditCard className="w-4 h-4" />
            }
          }
        };
    }
  }, [isAuthenticated, getEnrollmentStatus, id, enrolling, navigate, isFrench]);

  // Utility functions
  const formatDuration = (hours) => {
    if (!hours) return isFrench ? 'Durée flexible' : 'Flexible duration';
    if (hours < 1) return `${Math.round(hours * 60)} ${isFrench ? 'minutes' : 'min'}`;
    if (hours === 1) return `1 ${isFrench ? 'heure' : 'hour'}`;
    return `${hours} ${isFrench ? 'heures' : 'hours'}`;
  };

  const formatPrice = (price) => {
    if (price === 0 || course?.is_free) return isFrench ? 'Gratuit' : 'Free';
    if (!price) return isFrench ? 'Prix sur demande' : 'Price on request';
    return new Intl.NumberFormat(isFrench ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatRating = (rating) => {
    if (!rating) return '0.0';
    return parseFloat(rating).toFixed(1);
  };

  const getLevelInfo = (level) => {
    const levels = {
      'beginner': { 
        text: isFrench ? 'Débutant' : 'Beginner', 
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '🟢',
        description: isFrench ? 'Aucune connaissance préalable requise' : 'No prior knowledge required'
      },
      'intermediate': { 
        text: isFrench ? 'Intermédiaire' : 'Intermediate', 
        class: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: '🔵',
        description: isFrench ? 'Connaissances de base requises' : 'Basic knowledge required'
      },
      'advanced': { 
        text: isFrench ? 'Avancé' : 'Advanced', 
        class: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: '🟣',
        description: isFrench ? 'Expérience significative requise' : 'Significant experience required'
      }
    };
    
    return levels[level?.toLowerCase()] || { 
      text: isFrench ? 'Tous niveaux' : 'All Levels', 
      class: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: '⚪',
      description: isFrench ? 'Adapté à tous les niveaux' : 'Suitable for all levels'
    };
  };

  const getLanguageInfo = (language) => {
    const languages = {
      'fr': { name: 'Français', flag: '🇫🇷' },
      'en': { name: 'English', flag: '🇬🇧' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'de': { name: 'Deutsch', flag: '🇩🇪' }
    };
    return languages[language] || { name: isFrench ? 'Multilingue' : 'Multilingual', flag: '🌐' };
  };

  const calculateDiscount = () => {
    if (!course?.original_price || !course?.price) return null;
    const discount = ((course.original_price - course.price) / course.original_price) * 100;
    return Math.round(discount);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const renderPaymentInfoModal = () => {
    if (!showPaymentInfo) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {isFrench ? 'Informations de Paiement' : 'Payment Information'}
            </h3>
            <button
              onClick={() => setShowPaymentInfo(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {isFrench ? 'Méthodes de Paiement' : 'Payment Methods'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Virement Bancaire', icon: '🏦' },
                  { name: 'Orange Money', icon: '🟠' },
                  { name: 'Moov Money', icon: '🔵' },
                  { name: 'Wave', icon: '🌊' }
                ].map((method, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <p className="text-sm font-medium">{method.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-amber-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {isFrench ? 'Processus de Validation' : 'Validation Process'}
                </h4>
              </div>
              <ol className="space-y-4">
                {[
                  isFrench ? 'Effectuez le paiement via votre méthode préférée' : 'Complete payment via your preferred method',
                  isFrench ? 'Envoyez la preuve de paiement à support@devopsakademy.com' : 'Send payment proof to support@devopsakademy.com',
                  isFrench ? 'Notre équipe valide votre paiement sous 24h' : 'Our team validates your payment within 24 hours',
                  isFrench ? 'Accès immédiat au cours après validation' : 'Immediate course access after validation'
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {isFrench ? 'Support & Assistance' : 'Support & Assistance'}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-700">support@devopsakademy.com</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-700">+33 1 23 45 67 89</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-700">
                    {isFrench ? 'Lun-Ven: 9h-18h (GMT+1)' : 'Mon-Fri: 9AM-6PM (GMT+1)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setShowPaymentInfo(false)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {isFrench ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {isFrench ? 'Cours non disponible' : 'Course Unavailable'}
          </h3>
          <p className="text-gray-600 mb-8">
            {error || (isFrench ? "Le cours demandé n'est pas accessible pour le moment." : "The requested course is not currently available.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              {isFrench ? 'Explorer les formations' : 'Browse Courses'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-[#2d287f] text-[#2d287f] rounded-xl font-medium hover:bg-[#2d287f] hover:text-white transition-all duration-300"
            >
              {isFrench ? 'Réessayer' : 'Retry'}
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
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Notification Banner */}
        {location.state?.message && (
          <div className={`${location.state?.success ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border-b`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-3 flex items-center justify-between">
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-[#2d287f] transition-colors"
            >
              {isFrench ? 'Accueil' : 'Home'}
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigate('/courses')} 
              className="hover:text-[#2d287f] transition-colors"
            >
              {isFrench ? 'Formations' : 'Courses'}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Course Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${levelInfo.class}`}>
                    {levelInfo.icon} {levelInfo.text}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {languageInfo.flag} {languageInfo.name}
                  </span>
                  {discount && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-bold animate-pulse">
                      -{discount}%
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                  {course.short_description || course.description?.substring(0, 200) + "..." || 
                   (isFrench ? "Formation DevOps complète et professionnelle" : "Complete professional DevOps training")}
                </p>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl border border-gray-200/50 group">
                {course.thumbnail_url ? (
                  <>
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-[400px] bg-gradient-to-br from-[#2d287f] via-[#3b3a82] to-[#5653e1] flex items-center justify-center">
                    <div className="text-center">
                      <Terminal className="w-16 h-16 text-white/80 mx-auto mb-4" />
                      <p className="text-white/80 text-xl font-semibold">DevOps Akademy</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay Stats */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">{course.student_count?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">{formatRating(course.rating)}/5.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">{formatDuration(course.duration_hours)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {course?.student_count?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-gray-600">{isFrench ? 'Étudiants' : 'Students'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatRating(course?.rating)}
                        <span className="text-sm text-gray-500">/5</span>
                      </p>
                      <p className="text-sm text-gray-600">{isFrench ? 'Note moyenne' : 'Average Rating'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDuration(course?.duration_hours)}
                      </p>
                      <p className="text-sm text-gray-600">{isFrench ? 'Durée' : 'Duration'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {course?.completion_percentage || '85'}%
                      </p>
                      <p className="text-sm text-gray-600">{isFrench ? 'Taux de réussite' : 'Success Rate'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-1 overflow-x-auto">
                    {[
                      { id: 'overview', label: isFrench ? 'Aperçu' : 'Overview', icon: <Eye className="w-4 h-4" /> },
                      { id: 'curriculum', label: isFrench ? 'Programme' : 'Curriculum', icon: <BookOpen className="w-4 h-4" /> },
                      { id: 'instructor', label: isFrench ? 'Instructeur' : 'Instructor', icon: <Users className="w-4 h-4" /> },
                      { id: 'outcomes', label: isFrench ? 'Compétences' : 'Skills', icon: <Target className="w-4 h-4" /> },
                      { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
                      { id: 'reviews', label: isFrench ? 'Avis' : 'Reviews', icon: <Star className="w-4 h-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-3 px-4 font-medium text-sm rounded-t-lg transition-all whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                          {isFrench ? 'À propos de ce cours' : 'About This Course'}
                        </h3>
                        <div className="prose prose-lg max-w-none">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.description || (isFrench ? 'Aucune description disponible.' : 'No description available.')}
                          </div>
                        </div>
                      </div>

                      {/* What You'll Learn */}
                      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {isFrench ? 'Ce que vous apprendrez' : 'What You\'ll Learn'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { icon: <Server className="w-5 h-5" />, text: isFrench ? 'Architecture Cloud & Containers' : 'Cloud & Container Architecture' },
                            { icon: <GitBranch className="w-5 h-5" />, text: isFrench ? 'CI/CD Pipelines automatisés' : 'Automated CI/CD Pipelines' },
                            { icon: <Database className="w-5 h-5" />, text: isFrench ? 'Gestion infrastructure as Code' : 'Infrastructure as Code Management' },
                            { icon: <ShieldCheck className="w-5 h-5" />, text: isFrench ? 'Sécurité DevOps (DevSecOps)' : 'DevOps Security (DevSecOps)' },
                            { icon: <Cpu className="w-5 h-5" />, text: isFrench ? 'Monitoring & Observabilité' : 'Monitoring & Observability' },
                            { icon: <Network className="w-5 h-5" />, text: isFrench ? 'Réseau & Sécurité Cloud' : 'Cloud Network & Security' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-[#2d287f]/20 transition-colors">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#2d287f]/10 to-[#5653e1]/10 rounded-lg flex items-center justify-center text-[#2d287f]">
                                {item.icon}
                              </div>
                              <span className="text-gray-800 font-medium">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Included Features */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          {isFrench ? 'Ce qui est inclus' : 'What\'s Included'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { icon: <Video className="w-5 h-5" />, text: isFrench ? 'Vidéos HD 4K' : '4K HD Videos' },
                            { icon: <FileText className="w-5 h-5" />, text: isFrench ? 'Ressources téléchargeables' : 'Downloadable Resources' },
                            { icon: <Award className="w-5 h-5" />, text: isFrench ? 'Certificat officiel' : 'Official Certificate' },
                            { icon: <Smartphone className="w-5 h-5" />, text: isFrench ? 'Accès mobile & TV' : 'Mobile & TV Access' },
                            { icon: <MessageSquare className="w-5 h-5" />, text: isFrench ? 'Support Q&A' : 'Q&A Support' },
                            { icon: <div className="text-lg font-bold">∞</div>, text: isFrench ? 'Accès à vie' : 'Lifetime Access' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#2d287f]/10 to-[#5653e1]/10 rounded-lg flex items-center justify-center text-[#2d287f]">
                                {item.icon}
                              </div>
                              <span className="text-gray-800">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {isFrench ? 'Programme du cours' : 'Course Curriculum'}
                          </h3>
                          <p className="text-gray-600 mt-2">
                            {course.modules?.length || 0} {isFrench ? 'modules' : 'modules'} • 
                            {course.modules?.reduce((total, m) => total + (m.lesson_count || 0), 0) || 0} {isFrench ? 'leçons' : 'lessons'} • 
                            {formatDuration(course.duration_hours)}
                          </p>
                        </div>
                      </div>

                      {course.modules && course.modules.length > 0 ? (
                        <div className="space-y-4">
                          {course.modules.map((module, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#2d287f]/40 transition-all duration-300"
                            >
                              <button
                                onClick={() => toggleModule(module.id || idx)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#2d287f] to-[#5653e1] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {idx + 1}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-bold text-gray-900 text-lg">
                                      {module.title}
                                    </h4>
                                    {module.description && (
                                      <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                      {module.lesson_count || 0} {isFrench ? 'leçons' : 'lessons'}
                                    </p>
                                    {module.total_duration && (
                                      <p className="text-sm text-gray-500">
                                        {Math.round(module.total_duration / 60)}h
                                      </p>
                                    )}
                                  </div>
                                  {expandedModules.includes(module.id || idx) ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  )}
                                </div>
                              </button>

                              {expandedModules.includes(module.id || idx) && module.lessons && module.lessons.length > 0 && (
                                <div className="border-t border-gray-100">
                                  {module.lessons.map((lesson, lessonIdx) => (
                                    <div 
                                      key={lessonIdx} 
                                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors border-t border-gray-50"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                          lesson.content_type === 'video' ? 'bg-blue-50 text-blue-600' :
                                          lesson.content_type === 'article' ? 'bg-emerald-50 text-emerald-600' :
                                          lesson.content_type === 'quiz' ? 'bg-purple-50 text-purple-600' :
                                          'bg-gray-50 text-gray-600'
                                        }`}>
                                          {lesson.content_type === 'video' ? (
                                            <Video className="w-5 h-5" />
                                          ) : lesson.content_type === 'article' ? (
                                            <FileText className="w-5 h-5" />
                                          ) : lesson.content_type === 'quiz' ? (
                                            <FileCode className="w-5 h-5" />
                                          ) : (
                                            <Terminal className="w-5 h-5" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            {lesson.duration_minutes && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {lesson.duration_minutes} {isFrench ? 'min' : 'min'}
                                              </span>
                                            )}
                                            <span className="capitalize">{lesson.content_type}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {accessStatus.status === 'approved' ? (
                                        <button 
                                          onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                                          className="px-4 py-2 bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                                        >
                                          <PlayCircle className="w-4 h-4" />
                                          {isFrench ? 'Commencer' : 'Start'}
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <Lock className="w-4 h-4" />
                                          <span className="text-sm">{isFrench ? 'Verrouillé' : 'Locked'}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {isFrench ? 'Programme en cours de finalisation' : 'Curriculum being finalized'}
                          </h4>
                          <p className="text-gray-600">
                            {isFrench ? 'Le programme détaillé sera disponible prochainement.' : 'Detailed curriculum will be available soon.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'instructor' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <div className="relative">
                            <img
                              src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${course.first_name}+${course.last_name}&background=2d287f&color=fff&size=128`}
                              alt={`${course.first_name} ${course.last_name}`}
                              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{course.first_name} {course.last_name}</h3>
                            <p className="text-gray-600 mb-4">{isFrench ? 'Expert DevOps Certifié' : 'Certified DevOps Expert'}</p>
                            <p className="text-gray-700 mb-6">
                              {isFrench 
                                ? 'Avec plus de 10 ans d\'expérience en DevOps et Cloud Computing, j\'ai formé des milliers de professionnels à travers le monde. Mes cours allient théorie et pratique pour une acquisition rapide des compétences.'
                                : 'With over 10 years of experience in DevOps and Cloud Computing, I have trained thousands of professionals worldwide. My courses combine theory and practice for rapid skill acquisition.'}
                            </p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                <Briefcase className="w-5 h-5 text-[#2d287f] mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">10+ {isFrench ? 'ans' : 'years'}</p>
                                <p className="text-xs text-gray-500">{isFrench ? 'Expérience' : 'Experience'}</p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                <GraduationCap className="w-5 h-5 text-[#2d287f] mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">{isFrench ? 'Certifié' : 'Certified'}</p>
                                <p className="text-xs text-gray-500">AWS & K8s</p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                <Users className="w-5 h-5 text-[#2d287f] mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">5K+</p>
                                <p className="text-xs text-gray-500">{isFrench ? 'Étudiants' : 'Students'}</p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                <Award className="w-5 h-5 text-[#2d287f] mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">Top 1%</p>
                                <p className="text-xs text-gray-500">{isFrench ? 'Instructeur' : 'Instructor'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'outcomes' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {isFrench ? 'Compétences acquises' : 'Skills You\'ll Gain'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Code className="w-6 h-6 text-blue-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {isFrench ? 'Développement & CI/CD' : 'Development & CI/CD'}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {[
                              'Git & GitHub Actions',
                              'Jenkins Pipelines',
                              'Docker & Containerization',
                              'Kubernetes Orchestration',
                              'Terraform Infrastructure'
                            ].map((skill, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Cloud className="w-6 h-6 text-emerald-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {isFrench ? 'Cloud & Infrastructure' : 'Cloud & Infrastructure'}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {[
                              'AWS/Azure/GCP Services',
                              'Infrastructure as Code',
                              'Networking & Security',
                              'Monitoring & Logging',
                              'Cost Optimization'
                            ].map((skill, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-gray-700">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                          <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-6 h-6 text-purple-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {isFrench ? 'Sécurité DevOps' : 'DevOps Security'}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {[
                              'DevSecOps Implementation',
                              'Security Scanning',
                              'Compliance & Auditing',
                              'Secret Management',
                              'Vulnerability Assessment'
                            ].map((skill, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-700">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Settings className="w-6 h-6 text-amber-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {isFrench ? 'Outils & Automatisation' : 'Tools & Automation'}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {[
                              'Ansible Automation',
                              'Prometheus & Grafana',
                              'ELK Stack',
                              'ArgoCD',
                              'Helm Charts'
                            ].map((skill, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-gray-700">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'faq' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {isFrench ? 'Questions fréquentes' : 'Frequently Asked Questions'}
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          {
                            q: isFrench ? "Puis-je suivre ce cours à mon rythme ?" : "Can I take this course at my own pace?",
                            a: isFrench ? "Oui, tous nos cours sont disponibles à la demande. Vous pouvez apprendre à votre propre rythme, n'importe quand, n'importe où, sur tous vos appareils." : "Yes, all our courses are available on-demand. You can learn at your own pace, anytime, anywhere, on all your devices."
                          },
                          {
                            q: isFrench ? "Ai-je besoin de prérequis techniques ?" : "Do I need technical prerequisites?",
                            a: isFrench ? "Ce cours est conçu pour être accessible aux débutants. Nous couvrons toutes les bases nécessaires avant d'aborder les concepts avancés. Des connaissances en programmation sont un plus mais pas obligatoires." : "This course is designed to be accessible to beginners. We cover all necessary basics before moving to advanced concepts. Programming knowledge is a plus but not required."
                          },
                          {
                            q: isFrench ? "Comment obtenir le certificat ?" : "How do I get the certificate?",
                            a: isFrench ? "Le certificat est délivré automatiquement après avoir complété toutes les leçons et réussi les évaluations avec un score minimum de 80%." : "The certificate is automatically issued after completing all lessons and passing assessments with a minimum score of 80%."
                          },
                          {
                            q: isFrench ? "Puis-je accéder au cours sur mobile ?" : "Can I access the course on mobile?",
                            a: isFrench ? "Oui, notre plateforme est entièrement responsive et fonctionne parfaitement sur smartphones, tablettes et ordinateurs. Vous pouvez même télécharger les vidéos pour un visionnage hors ligne." : "Yes, our platform is fully responsive and works perfectly on smartphones, tablets, and computers. You can even download videos for offline viewing."
                          },
                          {
                            q: isFrench ? "Y a-t-il un support disponible ?" : "Is there support available?",
                            a: isFrench ? "Oui, vous bénéficiez d'un support direct de l'instructeur, d'un accès à notre communauté d'étudiants et d'un support technique 24/7 pour toutes vos questions." : "Yes, you get direct instructor support, access to our student community, and 24/7 technical support for all your questions."
                          },
                          {
                            q: isFrench ? "Puis-je obtenir un remboursement ?" : "Can I get a refund?",
                            a: isFrench ? "Oui, nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait du cours, vous pouvez demander un remboursement complet dans les 30 jours suivant votre inscription." : "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the course, you can request a full refund within 30 days of enrollment."
                          }
                        ].map((faq, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#2d287f] transition-colors">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-[#2d287f]" />
                              {faq.q}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  )}

                  {activeTab === 'reviews' && (
                    <div className="p-2">
                      <CourseReviews
                        courseId={id}
                        isEnrolled={isUserEnrolled(id) && isEnrollmentApproved(id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Pricing Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  {discount && (
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5 animate-pulse" />
                        <span className="font-bold text-sm">
                          {isFrench ? `OFFRE SPÉCIALE : -${discount}%` : `SPECIAL OFFER: -${discount}%`}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 text-center mt-1">
                        {isFrench ? 'Valable encore 2 jours' : 'Valid for 2 more days'}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(course.price)}
                        </span>
                        {course.original_price && course.price !== course.original_price && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(course.original_price)}
                          </span>
                        )}
                      </div>
                      
                      {discount && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-4">
                          <span className="font-bold">{isFrench ? 'Économisez' : 'Save'} </span>
                          <span>{formatPrice(course.original_price - course.price)}</span>
                        </div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="space-y-4 mb-6">
                      {[
                        { icon: <Clock className="w-4 h-4" />, label: isFrench ? 'Durée' : 'Duration', value: formatDuration(course.duration_hours) },
                        { icon: <BookOpen className="w-4 h-4" />, label: isFrench ? 'Leçons' : 'Lessons', value: course.modules?.reduce((total, m) => total + (m.lesson_count || 0), 0) || 'N/A' },
                        { icon: <Globe className="w-4 h-4" />, label: isFrench ? 'Langue' : 'Language', value: languageInfo.name },
                        { icon: <Award className="w-4 h-4" />, label: isFrench ? 'Certificat' : 'Certificate', value: isFrench ? 'Inclus' : 'Included', badge: true }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                              {item.icon}
                            </div>
                            <span className="text-gray-600">{item.label}</span>
                          </div>
                          <span className={`font-medium ${item.badge ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={accessStatus.actions.primary.action}
                        disabled={accessStatus.actions.primary.disabled}
                        className={`w-full py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                          accessStatus.actions.primary.variant === 'primary' 
                            ? 'bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white hover:shadow-lg hover:shadow-[#5653e1]/30 hover:scale-[1.02] active:scale-[0.98]' 
                            : accessStatus.actions.primary.variant === 'success'
                            ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {accessStatus.actions.primary.icon}
                        <span>{accessStatus.actions.primary.text}</span>
                      </button>
                      
                      {accessStatus.actions.secondary && (
                        <button
                          onClick={accessStatus.actions.secondary.action}
                          className="w-full py-3 px-4 border-2 border-[#2d287f] text-[#2d287f] rounded-xl font-medium hover:bg-[#2d287f] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {accessStatus.actions.secondary.icon}
                          {accessStatus.actions.secondary.text}
                        </button>
                      )}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {isFrench ? 'Garantie satisfait ou remboursé' : '30-Day Money-Back Guarantee'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {isFrench ? 'Essayez sans risque pendant 30 jours' : 'Try risk-free for 30 days'}
                          </p>
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
                      <p className="text-sm text-gray-600 mt-1">{accessStatus.message}</p>
                    </div>
                  </div>
                  
                  {accessStatus.status === 'guest' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        {isFrench ? 'Rejoignez notre communauté' : 'Join our community'}
                      </p>
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

                {/* Enrollment Process */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    {isFrench ? 'Processus d\'inscription' : 'Enrollment Process'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { number: 1, title: isFrench ? 'Inscription' : 'Enrollment', desc: isFrench ? 'Cliquez sur "S\'inscrire"' : 'Click "Enroll Now"' },
                      { number: 2, title: isFrench ? 'Paiement' : 'Payment', desc: isFrench ? 'Effectuez le paiement' : 'Complete payment' },
                      { number: 3, title: isFrench ? 'Validation' : 'Validation', desc: isFrench ? 'Admin vérifie la preuve' : 'Admin verifies payment' },
                      { number: 4, title: isFrench ? 'Accès' : 'Access', desc: isFrench ? 'Accès immédiat au cours' : 'Immediate course access' }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#2d287f] to-[#5653e1] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {step.number}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{step.title}</p>
                          <p className="text-xs text-gray-600">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    {isFrench ? 'Informations clés' : 'Key Information'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: isFrench ? 'Niveau' : 'Level', value: levelInfo.text },
                      { label: isFrench ? 'Catégorie' : 'Category', value: course.category_name || 'DevOps' },
                      { label: isFrench ? 'Accès' : 'Access', value: isFrench ? 'À vie' : 'Lifetime' },
                      { label: isFrench ? 'Mise à jour' : 'Updated', value: course.updated_at ? new Date(course.updated_at).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US') : 'Recent' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    {isFrench ? 'Partager ce cours' : 'Share this course'}
                  </h3>
                  <div className="flex gap-2">
                    {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#2d287f] via-[#3b3a82] to-[#5653e1] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isFrench ? 'Prêt à maîtriser DevOps ?' : 'Ready to Master DevOps?'}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                {isFrench 
                  ? 'Rejoignez des milliers de professionnels qui ont transformé leur carrière avec DevOps Akademy'
                  : 'Join thousands of professionals who have transformed their careers with DevOps Akademy'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={accessStatus.actions.primary.action}
                  disabled={accessStatus.actions.primary.disabled}
                  className="px-8 py-3 bg-white text-[#2d287f] rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {accessStatus.actions.primary.text}
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
                >
                  {isFrench ? 'Explorer d\'autres cours' : 'Explore Other Courses'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info Modal */}
      {renderPaymentInfoModal()}
    </>
  );
};

export default CourseDetails;