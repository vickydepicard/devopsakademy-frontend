import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import { 
  Star, 
  Users, 
  Clock, 
  Lock, 
  Unlock, 
  CheckCircle, 
  BookOpen,
  Eye,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState({});
  const { user, isAuthenticated } = useAuth();
  const { 
    isUserEnrolled, 
    isEnrollmentApproved, 
    getEnrollmentStatus 
  } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/courses/popular")
      .then((res) => {
        if (res.data?.success) {
          setCourses(res.data.data || []);
        } else {
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement cours populaires:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const formatRating = (rating) => {
    if (!rating && rating !== 0) return '0.0';
    const num = parseFloat(rating);
    return isNaN(num) ? '0.0' : num.toFixed(1);
  };

  const getLevelText = (level) => {
    if (!level) return 'Tous niveaux';
    switch (level.toLowerCase()) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  // 🎯 LOGIQUE UNIFIÉE POUR LES BOUTONS
  const getActionButtons = (courseId) => {
    const buttons = [];
    
    // ============= BOUTON 1 : "VOIR DÉTAIL" (TOUJOURS PRÉSENT) =============
    buttons.push({
      text: 'Voir détail',
      icon: <Eye className="w-4 h-4" />,
      variant: 'secondary',
      onClick: () => navigate(`/courses/${courseId}`),
      className: 'border-[#3B3A82] text-[#3B3A82] hover:bg-[#3B3A82] hover:text-white'
    });
    
    // ============= BOUTON 2 : "S'INSCRIRE" (LOGIQUE VARIABLE) =============
    if (!isAuthenticated) {
      // Visiteur : Redirige vers login
      buttons.push({
        text: "S'inscrire",
        icon: <BookOpen className="w-4 h-4" />,
        variant: 'primary',
        onClick: () => navigate('/login', { 
          state: { 
            from: `/courses/${courseId}`,
            message: "Connectez-vous pour vous inscrire à ce cours"
          } 
        }),
        className: 'bg-[#3B3A82] hover:bg-[#4F46E5] text-white'
      });
    } else {
      const status = getEnrollmentStatus(courseId);
      
      switch(status) {
        case 'not_enrolled':
          // Connecté mais non inscrit : Inscription
          buttons.push({
            text: "S'inscrire",
            icon: <BookOpen className="w-4 h-4" />,
            variant: 'primary',
            onClick: () => navigate(`/courses/${courseId}`, {
              state: { showEnrollButton: true }
            }),
            className: 'bg-[#3B3A82] hover:bg-[#4F46E5] text-white'
          });
          break;
        
        case 'pending':
          // En attente de validation
          buttons.push({
            text: 'En attente',
            icon: <Clock className="w-4 h-4" />,
            variant: 'disabled',
            onClick: null,
            className: 'bg-yellow-500 text-white cursor-not-allowed opacity-70'
          });
          break;
        
        case 'approved':
          // Déjà inscrit et approuvé : Accéder au cours
          buttons.push({
            text: 'Accéder',
            icon: <ArrowRight className="w-4 h-4" />,
            variant: 'success',
            onClick: () => navigate(`/courses/${courseId}/learn`),
            className: 'bg-green-600 hover:bg-green-700 text-white'
          });
          break;
        
        default:
          // Fallback
          buttons.push({
            text: "S'inscrire",
            icon: <BookOpen className="w-4 h-4" />,
            variant: 'primary',
            onClick: () => navigate(`/courses/${courseId}`),
            className: 'bg-[#3B3A82] hover:bg-[#4F46E5] text-white'
          });
      }
    }
    
    return buttons;
  };

  const getAccessIcon = (courseId) => {
    if (!isAuthenticated) {
      return <Unlock className="w-5 h-5 text-blue-500" />;
    }

    const status = getEnrollmentStatus(courseId);
    
    switch(status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'not_enrolled':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAccessBadge = (courseId) => {
    if (!isAuthenticated) {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <Unlock className="w-3 h-3" />
          Aperçu disponible
        </span>
      );
    }

    const status = getEnrollmentStatus(courseId);
    
    switch(status) {
      case 'approved':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Accès autorisé
          </span>
        );
      
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      {/* TITRE */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#3B3A82] mb-3">
          🌟 Formations populaires
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          Nos parcours les plus suivis par la communauté DevOps Akademy.
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white border border-[#3B3A82]/10 rounded-2xl shadow p-5 h-72"
            >
              <div className="bg-gray-200 h-40 w-full rounded-xl"></div>
              <div className="h-4 bg-gray-200 mt-4 w-3/4 rounded"></div>
              <div className="h-4 bg-gray-200 mt-2 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          {courses.length > 0 ? (
            courses.map((course) => {
              const actionButtons = getActionButtons(course.id);
              const accessBadge = getAccessBadge(course.id);
              const isFree = course.is_free || course.price === 0;

              return (
                <div
                  key={course.id}
                  className="group bg-white border border-[#3B3A82]/10 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-[#3B3A82]/30 relative flex flex-col"
                >
                  {/* BADGE D'ACCÈS */}
                  {accessBadge && (
                    <div className="absolute top-3 left-3 z-10">
                      {accessBadge}
                    </div>
                  )}

                  {/* BADGE GRATUIT */}
                  {isFree && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        GRATUIT
                      </span>
                    </div>
                  )}

                  {/* IMAGE / FALLBACK */}
                  <div className="relative">
                    {course.thumbnail_url && !imageError[course.id] ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        onError={() =>
                          setImageError((prev) => ({
                            ...prev,
                            [course.id]: true,
                          }))
                        }
                        className="rounded-t-2xl w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="rounded-t-2xl w-full h-48 bg-gradient-to-br from-[#3B3A82] to-[#4F46E5] flex items-center justify-center">
                        <span className="text-white/90 text-6xl font-extrabold tracking-wider drop-shadow-md">
                          {course.title?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* PRIX */}
                    {!isFree && (
                      <span className="absolute bottom-3 right-3 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {formatPrice(course.price)} €
                      </span>
                    )}
                  </div>

                  {/* CONTENU */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#3B3A82] transition-colors duration-200 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      {/* ICONE D'ACCÈS */}
                      <div className="flex-shrink-0 ml-2">
                        {getAccessIcon(course.id)}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      Par {course.first_name} {course.last_name}
                    </p>

                    {/* DESCRIPTION COURTE */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2 flex-1">
                      {course.short_description || "Formation complète avec exercices pratiques et certifications."}
                    </p>

                    {/* MÉTADONNÉES */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {formatRating(course.rating)}/5.0 ({course.review_count || 0})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          {course.student_count || 0} étudiants
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getLevelText(course.level)}
                        </span>
                        
                        {course.duration_hours && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {course.duration_hours}h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 🎯 BOUTONS D'ACTION - TOUJOURS 2 BOUTONS */}
                    <div className="mt-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {actionButtons.map((button, index) => (
                          <button
                            key={index}
                            onClick={button.onClick || undefined}
                            disabled={!button.onClick}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                              button.className
                            } ${!button.onClick ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                          >
                            {button.icon}
                            <span className="whitespace-nowrap">{button.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-auto border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation disponible</h3>
                <p className="text-gray-600">Les formations seront bientôt disponibles. Revenez plus tard !</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA POUR VOIR TOUS LES COURS */}
      {courses.length > 0 && (
        <div className="text-center mt-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <Eye className="w-5 h-5" />
            Voir toutes les formations
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-gray-500 text-sm mt-4">
            Plus de {courses.reduce((total, c) => total + (c.student_count || 0), 0)} étudiants formés
          </p>
        </div>
      )}
    </section>
  );
};

export default PopularCourses;