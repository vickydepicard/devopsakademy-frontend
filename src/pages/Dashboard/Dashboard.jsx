import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Eye, 
  PlayCircle,
  BarChart,
  Award,
  Calendar,
  FileText,
  Download,
  Lock,
  Unlock,
  UserCheck,
  TrendingUp,
  Star,
  Users
} from "lucide-react";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });
  const navigate = useNavigate();

  // 🔹 Charger les cours de l'étudiant
  useEffect(() => {
    if (!token) return;
    const fetchCourses = async () => {
      try {
        const res = await api.get("/enrollments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data?.data || []);
        calculateStats(res.data?.data || []);
      } catch (err) {
        console.error("Erreur chargement cours :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  // 🔹 Calculer les statistiques
  const calculateStats = (coursesData) => {
    const statsData = {
      total: coursesData.length,
      active: coursesData.filter(c => c.is_approved && !c.completed).length,
      pending: coursesData.filter(c => !c.is_approved && c.payment_status === 'pending').length,
      completed: coursesData.filter(c => c.completed).length
    };
    setStats(statsData);
  };

  // 🔹 Upload preuve de paiement
  const handleUploadProof = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("❌ Format de fichier non supporté. Utilisez JPG, PNG ou PDF.");
      return;
    }

    if (file.size > maxSize) {
      alert("❌ Fichier trop volumineux. Taille maximale : 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      setUploadingId(courseId);
      const res = await api.post(`/enrollments/${courseId}/upload-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Mise à jour locale
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                payment_status: 'pending',
                payment_proof_url: res.data.payment_proof_url 
              }
            : course
        )
      );

      calculateStats(courses.map(course => 
        course.id === courseId 
          ? { ...course, payment_status: 'pending' }
          : course
      ));

      alert("✅ Preuve de paiement envoyée avec succès ! L'administrateur la vérifiera sous peu.");
    } catch (err) {
      console.error("Erreur upload preuve:", err);
      alert(err.response?.data?.message || "❌ Erreur lors de l'envoi de la preuve de paiement.");
    } finally {
      setUploadingId(null);
    }
  };

  // 🔹 Filtrage des cours
  const filteredCourses = courses.filter(course => {
    switch(activeFilter) {
      case 'active':
        return course.is_approved && !course.completed;
      case 'pending':
        return !course.is_approved && course.payment_status === 'pending';
      case 'completed':
        return course.completed;
      case 'rejected':
        return course.payment_status === 'rejected';
      default:
        return true;
    }
  });

  // 🔹 Obtenir le statut avec icône et couleur
  const getEnrollmentStatus = (course) => {
    if (course.is_approved) {
      return {
        text: "Accès activé",
        icon: <CheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-800",
        badge: "border-green-200",
        description: "Vous avez accès complet au cours"
      };
    }
    
    if (course.payment_status === 'verified') {
      return {
        text: "Paiement vérifié",
        icon: <UserCheck className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-800",
        badge: "border-blue-200",
        description: "En attente d'activation par l'administrateur"
      };
    }
    
    if (course.payment_status === 'pending') {
      return {
        text: "En attente de validation",
        icon: <Clock className="w-4 h-4" />,
        color: "bg-yellow-100 text-yellow-800",
        badge: "border-yellow-200",
        description: "L'administrateur vérifie votre paiement"
      };
    }
    
    if (course.payment_status === 'rejected') {
      return {
        text: "Paiement rejeté",
        icon: <AlertCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-800",
        badge: "border-red-200",
        description: "Veuillez téléverser une nouvelle preuve"
      };
    }
    
    return {
      text: "En attente de paiement",
      icon: <Lock className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-800",
      badge: "border-gray-200",
      description: "Téléversez votre preuve de paiement"
    };
  };

  // 🔹 Calculer la progression
  const calculateProgress = (course) => {
    if (!course.total_lessons) return 0;
    return Math.round((course.completed_lessons || 0) / course.total_lessons * 100);
  };

  // 🔹 Format de date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎯 En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎓 Mon Dashboard Apprentissage
          </h1>
          <p className="text-gray-600">
            Gérez vos cours, suivez votre progression et accédez à votre contenu
          </p>
        </div>

        {/* 📊 Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des cours</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cours actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <PlayCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Filtres */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-[#3B3A82] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tous les cours ({courses.length})
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Actifs ({stats.active})
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "completed"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Terminés ({stats.completed})
          </button>
          <button
            onClick={() => setActiveFilter("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rejetés ({courses.filter(c => c.payment_status === 'rejected').length})
          </button>
        </div>

        {/* 📚 Liste des cours */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeFilter === "all" 
                ? "Aucun cours trouvé" 
                : `Aucun cours ${activeFilter === 'active' ? 'actif' : activeFilter === 'pending' ? 'en attente' : 'terminé'}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === "all" 
                ? "Commencez par vous inscrire à un cours pour démarrer votre apprentissage." 
                : "Explorez d'autres cours pour élargir vos compétences."}
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-3 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Explorer les formations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const status = getEnrollmentStatus(course);
              const progress = calculateProgress(course);

              return (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image du cours */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color} ${status.badge}`}>
                        <div className="flex items-center gap-1">
                          {status.icon}
                          {status.text}
                        </div>
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Niveau : <span className="font-medium">{course.level || "Tous niveaux"}</span>
                      </p>
                      <p className="text-xs text-gray-500">{status.description}</p>
                    </div>

                    {/* Barre de progression */}
                    {course.is_approved && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.completed_lessons || 0}/{course.total_lessons || 0} leçons complétées
                        </p>
                      </div>
                    )}

                    {/* Informations */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Inscrit le {formatDate(course.enrolled_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration_hours || 0}h</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {course.is_approved ? (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.id}/learn`)}
                            className="w-full py-2.5 bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Continuer l'apprentissage
                          </button>
                          <button
                            onClick={() => navigate(`/courses/${course.id}/progress`)}
                            className="w-full py-2 border border-[#3B3A82] text-[#3B3A82] rounded-lg font-medium hover:bg-[#3B3A82]/5 transition-all flex items-center justify-center gap-2"
                          >
                            <BarChart className="w-4 h-4" />
                            Voir progression détaillée
                          </button>
                        </>
                      ) : course.payment_status === 'pending' ? (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">
                              En attente de validation
                            </span>
                          </div>
                          <p className="text-xs text-yellow-600">
                            L'administrateur vérifie votre paiement. Vous recevrez une notification par email.
                          </p>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Voir les détails du cours
                          </button>

                          {/* Upload de preuve de paiement */}
                          {(course.payment_status === 'rejected' || !course.payment_status) && (
                            <div className="space-y-2">
                              <label className="block">
                                <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer">
                                  <Upload className="w-4 h-4" />
                                  {uploadingId === course.id ? "Envoi en cours..." : "Téléverser la preuve"}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleUploadProof(course.id, e)}
                                  disabled={uploadingId === course.id}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-xs text-gray-500 text-center">
                                Formats acceptés : JPG, PNG, PDF (max 5MB)
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Preuve de paiement existante */}
                    {course.payment_proof_url && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-600 mb-2">Preuve de paiement :</p>
                        <a
                          href={course.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4" />
                          Voir le document
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🎯 Guide du processus */}
        {activeFilter === "all" && (
          <div className="mt-12 bg-gradient-to-r from-[#3B3A82]/10 to-[#4F46E5]/10 border border-[#3B3A82]/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Comment accéder à vos cours ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white border-2 border-[#3B3A82] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-[#3B3A82]">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Inscription</h4>
                <p className="text-sm text-gray-600">Choisissez un cours et cliquez sur "S'inscrire"</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white border-2 border-[#3B3A82] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-[#3B3A82]">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Paiement</h4>
                <p className="text-sm text-gray-600">Effectuez le paiement et téléversez la preuve</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white border-2 border-[#3B3A82] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-[#3B3A82]">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Validation</h4>
                <p className="text-sm text-gray-600">L'administrateur vérifie et valide votre paiement</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white border-2 border-[#3B3A82] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-[#3B3A82]">4</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Accès</h4>
                <p className="text-sm text-gray-600">Accédez au contenu complet du cours</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}