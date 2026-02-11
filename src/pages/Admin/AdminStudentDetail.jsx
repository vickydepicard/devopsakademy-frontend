import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Award,
  TrendingUp,
  FileText,
  Shield,
  AlertCircle,
  CreditCard,
  UserCheck,
  GraduationCap,
  BarChart,
  Loader2
} from "lucide-react";

export default function AdminStudentDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      const studentRes = await api.get(`/users/${userId}`);
      if (studentRes.data.success) {
        setStudent(studentRes.data.data);
      }
      
      let enrollmentsData = [];
      
      try {
        const enrollmentsRes = await api.get(`/admin/enrollments/user/${userId}`);
        if (enrollmentsRes.data.success) {
          enrollmentsData = enrollmentsRes.data.data || [];
        }
      } catch (error) {
        const allEnrollmentsRes = await api.get(`/admin/enrollments`);
        if (allEnrollmentsRes.data.success) {
          enrollmentsData = (allEnrollmentsRes.data.data || []).filter(
            enrollment => enrollment.user_id == userId
          );
        }
      }
      
      const enrichedEnrollments = await enrichEnrollments(enrollmentsData);
      setEnrollments(enrichedEnrollments);
      
    } catch (error) {
      alert("Erreur lors du chargement des données de l'étudiant");
    } finally {
      setLoading(false);
    }
  };

  const enrichEnrollments = async (enrollmentsData) => {
    const enriched = [];
    
    for (const enrollment of enrollmentsData) {
      let courseId = enrollment.course_id;
      
      if (!courseId && enrollment.course_title) {
        try {
          const coursesRes = await api.get(`/courses?search=${encodeURIComponent(enrollment.course_title)}&limit=5`);
          if (coursesRes.data.success && coursesRes.data.data.length > 0) {
            courseId = coursesRes.data.data[0].id;
          }
        } catch (err) {
          // Continuer sans course_id
        }
      }
      
      if (!courseId) {
        try {
          const userEnrollmentsRes = await api.get(`/enrollments/me`);
          if (userEnrollmentsRes.data.success) {
            const userEnrollments = userEnrollmentsRes.data.data || [];
            const matchingEnrollment = userEnrollments.find(e => 
              e.id === enrollment.id || e.course_title === enrollment.course_title
            );
            if (matchingEnrollment && matchingEnrollment.course_id) {
              courseId = matchingEnrollment.course_id;
            }
          }
        } catch (err) {
          // Continuer sans course_id
        }
      }
      
      const enrichedEnrollment = {
        ...enrollment,
        course_id: courseId,
        user_id: enrollment.user_id || userId,
        course_title: enrollment.course_title || "Cours sans nom",
        course_level: enrollment.course_level || enrollment.level || "Tous niveaux",
        duration_hours: enrollment.duration_hours || enrollment.duration || 0,
        category_name: enrollment.category_name || enrollment.category,
        thumbnail_url: enrollment.thumbnail_url || enrollment.image_url || enrollment.thumbnail,
        is_approved: enrollment.is_approved || enrollment.approved || false,
        status: enrollment.status || enrollment.payment_status || "pending",
        rejection_reason: enrollment.rejection_reason || enrollment.reason,
        payment_proof_url: enrollment.payment_proof_url || enrollment.payment_proof,
        enrolled_at: enrollment.enrolled_at || enrollment.created_at,
        completion_percentage: Number(enrollment.completion_percentage) || Number(enrollment.progress) || 0,
      };
      
      enriched.push(enrichedEnrollment);
    }
    
    return enriched;
  };

  const handleEnrollmentAction = async (action, enrollment, extraData = {}) => {
    if (!enrollment.course_id) {
      alert(`Impossible d'exécuter l'action: ID du cours manquant`);
      return;
    }
    
    const actionKey = `${enrollment.id}-${action}`;
    
    try {
      setProcessing(prev => ({ ...prev, [actionKey]: true }));
      
      let response;
      
      switch(action) {
        case 'approve':
          response = await api.patch(`/enrollments/${userId}/${enrollment.course_id}/approve`);
          break;
          
        case 'reject':
          response = await api.patch(`/enrollments/${userId}/${enrollment.course_id}/reject`, {
            reason: extraData.reason
          });
          break;
          
        case 'delete':
          response = await api.delete(`/enrollments/${enrollment.course_id}/students/${userId}`);
          break;
          
        default:
          return;
      }
      
      setEnrollments(prevEnrollments => {
        return prevEnrollments.map(item => {
          if (item.id === enrollment.id) {
            const updatedItem = { ...item };
            
            if (action === 'approve') {
              updatedItem.is_approved = true;
              updatedItem.status = "approved";
              updatedItem.rejection_reason = null;
            } else if (action === 'reject') {
              updatedItem.is_approved = false;
              updatedItem.status = "rejected";
              updatedItem.rejection_reason = extraData.reason;
            } else if (action === 'delete') {
              updatedItem._deleted = true;
            }
            
            return updatedItem;
          }
          return item;
        }).filter(item => !item._deleted);
      });
      
      alert(response.data.message || `Action ${action} réussie`);
      
    } catch (error) {
      let errorMessage = `Erreur lors de l'action ${action}`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setProcessing(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const getStatusInfo = (enrollment) => {
    if (enrollment.is_approved) {
      return {
        text: "Validé",
        color: "bg-emerald-100 text-emerald-800",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-4 h-4" />,
        description: "Accès complet au cours"
      };
    }
    
    if (enrollment.status === "rejected") {
      return {
        text: "Rejeté",
        color: "bg-red-100 text-red-800",
        border: "border-red-200",
        icon: <XCircle className="w-4 h-4" />,
        description: `Raison: ${enrollment.rejection_reason || "Non spécifiée"}`
      };
    }
    
    return {
      text: "En attente",
      color: "bg-amber-100 text-amber-800",
      border: "border-amber-200",
      icon: <Clock className="w-4 h-4" />,
      description: "En attente de validation"
    };
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (enrollment._deleted) return false;
    
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return !enrollment.is_approved && enrollment.status !== "rejected";
    if (activeFilter === "approved") return enrollment.is_approved;
    if (activeFilter === "rejected") return enrollment.status === "rejected";
    if (activeFilter === "active") return enrollment.is_approved && enrollment.completion_percentage < 100;
    if (activeFilter === "completed") return enrollment.completion_percentage === 100;
    return true;
  });

  const stats = {
    total: enrollments.filter(e => !e._deleted).length,
    pending: enrollments.filter(e => !e._deleted && !e.is_approved && e.status !== "rejected").length,
    approved: enrollments.filter(e => !e._deleted && e.is_approved).length,
    rejected: enrollments.filter(e => !e._deleted && e.status === "rejected").length,
    active: enrollments.filter(e => !e._deleted && e.is_approved && e.completion_percentage < 100).length,
    completed: enrollments.filter(e => !e._deleted && e.completion_percentage === 100).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/enrollments")}
            className="flex items-center gap-2 text-[#3B3A82] hover:text-[#4F46E5] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux inscriptions
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👤 Détails de l'étudiant
              </h1>
              <p className="text-gray-600">
                Gestion des inscriptions et validation des cours
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                student?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                student?.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {student?.role === 'admin' ? 'Administrateur' : 
                 student?.role === 'instructor' ? 'Instructeur' : 'Étudiant'}
              </span>
              
              <button
                onClick={() => navigate(`/admin/users/${userId}`)}
                className="px-4 py-2 bg-[#3B3A82] text-white rounded-lg hover:bg-[#4F46E5] transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Profil complet
              </button>
            </div>
          </div>
        </div>

        {/* Carte profil étudiant */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center text-center">
                <img
                  src={student?.avatar_url || `https://ui-avatars.com/api/?name=${student?.first_name}+${student?.last_name}&background=3B3A82&color=fff&size=256`}
                  alt={`${student?.first_name} ${student?.last_name}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  {student?.first_name} {student?.last_name}
                </h2>
                <p className="text-gray-600 mb-2">{student?.email}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Inscrit le {student?.created_at ? new Date(student.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-600">Cours total</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                      <p className="text-sm text-gray-600">Validés</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                      <p className="text-sm text-gray-600">En attente</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                      <p className="text-sm text-gray-600">Rejetés</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                      <p className="text-sm text-gray-600">Actifs</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                      <p className="text-sm text-gray-600">Terminés</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{student?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>ID: {student?.id}</span>
                  </div>
                  {student?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student?.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>{student.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "all", label: "Tous les cours", count: stats.total, color: "bg-[#3B3A82]" },
            { id: "pending", label: "En attente", count: stats.pending, color: "bg-amber-500" },
            { id: "approved", label: "Validés", count: stats.approved, color: "bg-emerald-600" },
            { id: "rejected", label: "Rejetés", count: stats.rejected, color: "bg-red-600" },
            { id: "active", label: "En cours", count: stats.active, color: "bg-blue-600" },
            { id: "completed", label: "Terminés", count: stats.completed, color: "bg-purple-600" }
          ].map(filterItem => (
            <button
              key={filterItem.id}
              onClick={() => setActiveFilter(filterItem.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                activeFilter === filterItem.id
                  ? `${filterItem.color} text-white shadow-lg`
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{filterItem.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filterItem.id ? "bg-white/20" : "bg-gray-100"
              }`}>
                {filterItem.count}
              </span>
            </button>
          ))}
        </div>

        {/* Liste des cours */}
        <div className="space-y-4">
          {filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aucun cours {activeFilter === "all" ? "" : activeFilter === "pending" ? "en attente" : activeFilter === "approved" ? "validé" : "rejeté"}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeFilter === "all" 
                  ? "Cet étudiant n'est inscrit à aucun cours pour le moment."
                  : `Cet étudiant n'a pas de cours ${activeFilter === "pending" ? "en attente de validation" : activeFilter === "approved" ? "validés" : "rejetés"}.`}
              </p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => {
              const status = getStatusInfo(enrollment);
              const hasCourseId = !!enrollment.course_id;
              
              return (
                <div
                  key={`${enrollment.id}-${enrollment.course_id}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                    {/* Informations du cours */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={enrollment.thumbnail_url || `https://ui-avatars.com/api/?name=${enrollment.course_title}&background=3B3A82&color=fff&size=128`}
                            alt={enrollment.course_title}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {enrollment.course_title}
                            {!hasCourseId && (
                              <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                ⚠️ ID cours manquant
                              </span>
                            )}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {enrollment.course_level || "Tous niveaux"}
                            </span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {enrollment.duration_hours || 0}h
                            </span>
                            {enrollment.category_name && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                {enrollment.category_name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Inscrit le {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                          {enrollment.completion_percentage > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progression</span>
                                <span className="font-bold text-[#3B3A82]">
                                  {enrollment.completion_percentage}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#3B3A82] to-[#4F46E5] rounded-full"
                                  style={{ width: `${enrollment.completion_percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statut et paiement */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Statut</h4>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.color} ${status.border}`}>
                          {status.icon}
                          <span className="font-medium">{status.text}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                      </div>
                      
                      {enrollment.payment_proof_url && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Preuve de paiement</h4>
                          <button
                            onClick={() => window.open(enrollment.payment_proof_url, '_blank')}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Actions</h4>
                      
                      {!hasCourseId ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            ⚠️ Actions désactivées: Course ID manquant
                          </p>
                        </div>
                      ) : !enrollment.is_approved && enrollment.status !== "rejected" ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              if (confirm(`Valider l'inscription à "${enrollment.course_title}" ?`)) {
                                handleEnrollmentAction('approve', enrollment);
                              }
                            }}
                            disabled={processing[`${enrollment.id}-approve`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-approve`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Validation...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Valider
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt("Raison du rejet :");
                              if (reason) {
                                handleEnrollmentAction('reject', enrollment, { reason });
                              }
                            }}
                            disabled={processing[`${enrollment.id}-reject`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-reject`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Rejet...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5" />
                                Rejeter
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => window.open(`/courses/${enrollment.course_id}`, '_blank')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#3B3A82] text-[#3B3A82] rounded-xl font-medium hover:bg-[#3B3A82] hover:text-white transition-all"
                          >
                            <Eye className="w-5 h-5" />
                            Voir le cours
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer définitivement cette inscription ?`)) {
                                handleEnrollmentAction('delete', enrollment);
                              }
                            }}
                            disabled={processing[`${enrollment.id}-delete`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-delete`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Suppression...
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                Supprimer
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => window.open(`/admin/enrollments?student=${userId}`, '_blank')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        <BarChart className="w-5 h-5" />
                        Historique complet
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Inscrire à un cours</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ajouter cet étudiant à un nouveau cours
            </p>
            <button
              onClick={() => navigate("/admin/courses")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choisir un cours
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Générer rapport</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Exporter les données de cet étudiant
            </p>
            <button
              onClick={() => alert("Fonctionnalité à venir")}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Générer PDF
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-gray-900">Contact rapide</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Contacter l'étudiant par email
            </p>
            <button
              onClick={() => window.location.href = `mailto:${student?.email}`}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Envoyer email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}