import { useState, useEffect } from "react";
import { askConfirm, askPrompt } from "../../utils/dialog";
import { initialsAvatar, coverPlaceholder, onAvatarError } from "../../utils/avatar";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { ProofButton } from "../payment/ProofViewer";
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
import { useTranslation } from "react-i18next";
import { getLocale } from "../../i18n";
import i18n from "../../i18n";

export default function AdminStudentDetail() {
  const { t } = useTranslation("adminStudentDetail");
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
      
      const studentRes = await api.get(`/admin/users/${userId}`);
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
      alert(t("erreur_lors_du_chargement_des_donnees"));
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
        course_title: enrollment.course_title || i18n.t("adminStudentDetail:cours_sans_nom"),
        course_level: enrollment.course_level || enrollment.level || i18n.t("adminStudentDetail:tous_niveaux"),
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
      alert(t("impossible_d_executer_l_action_id"));
      return;
    }
    
    const actionKey = `${enrollment.id}-${action}`;
    
    try {
      setProcessing(prev => ({ ...prev, [actionKey]: true }));
      
      let response;
      
      switch(action) {
        case 'approve':
          response = await api.patch(`/admin/enrollments/${enrollment.id}/approve`);
          break;
          
        case 'reject':
          response = await api.patch(`/admin/enrollments/${enrollment.id}/reject`, {
            reason: extraData.reason
          });
          break;
          
        case 'delete':
          response = await api.delete(`/admin/enrollments/${enrollment.id}`);
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
      
      alert(response.data.message || t("action_reussie", { action }));
      
    } catch (error) {
      let errorMessage = i18n.t("adminStudentDetail:erreur_lors_de_l_action", { action });
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
        text: t("valide"),
        color: "bg-emerald-100 text-emerald-800",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-4 h-4" />,
        description: t("acces_complet_au_cours")
      };
    }
    
    if (enrollment.status === "rejected") {
      return {
        text: t("rejete"),
        color: "bg-red-100 text-red-800",
        border: "border-red-200",
        icon: <XCircle className="w-4 h-4" />,
        description: t("raison", { v: enrollment.rejection_reason || i18n.t("adminStudentDetail:non_specifiee") })
      };
    }
    
    return {
      text: t("en_attente"),
      color: "bg-amber-100 text-amber-800",
      border: "border-amber-200",
      icon: <Clock className="w-4 h-4" />,
      description: t("en_attente_de_validation")
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
            <ArrowLeft className="w-5 h-5" />{t("retour_aux_inscriptions")}</button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("details_de_l_etudiant")}</h1>
              <p className="text-gray-600">{t("gestion_des_inscriptions_et_validation_des")}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                student?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                student?.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {student?.role === 'admin' ? t("administrateur") : 
                 student?.role === 'instructor' ? t("instructeur") : t("etudiant")}
              </span>
              
              <button
                onClick={() => navigate(`/admin/users/${userId}`)}
                className="px-4 py-2 bg-[#3B3A82] text-white rounded-lg hover:bg-[#4F46E5] transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />{t("profil_complet")}</button>
            </div>
          </div>
        </div>

        {/* Carte profil étudiant */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center text-center">
                <img
                  src={student?.avatar_url || initialsAvatar(`${student?.first_name} ${student?.last_name}`)}
                  onError={onAvatarError(`${student?.first_name} ${student?.last_name}`)}
                  alt={`${student?.first_name} ${student?.last_name}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  {student?.first_name} {student?.last_name}
                </h2>
                <p className="text-gray-600 mb-2">{student?.email}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />{t("inscrit_le")}{" "}{student?.created_at ? new Date(student.created_at).toLocaleDateString(getLocale()) : t("date_inconnue")}
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
                      <p className="text-sm text-gray-600">{t("cours_total")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                      <p className="text-sm text-gray-600">{t("valides")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                      <p className="text-sm text-gray-600">{t("en_attente")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                      <p className="text-sm text-gray-600">{t("rejetes")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                      <p className="text-sm text-gray-600">{t("actifs")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                      <p className="text-sm text-gray-600">{t("termines")}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 mb-2">{t("informations")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{student?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{t("id", { id: student?.id })}</span>
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
            { id: "all", label: t("tous_les_cours"), count: stats.total, color: "bg-[#3B3A82]" },
            { id: "pending", label: t("en_attente"), count: stats.pending, color: "bg-amber-500" },
            { id: "approved", label: t("valides"), count: stats.approved, color: "bg-emerald-600" },
            { id: "rejected", label: t("rejetes"), count: stats.rejected, color: "bg-red-600" },
            { id: "active", label: t("en_cours"), count: stats.active, color: "bg-blue-600" },
            { id: "completed", label: t("termines"), count: stats.completed, color: "bg-purple-600" }
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("aucun_cours")}{" "}{activeFilter === "all" ? "" : activeFilter === "pending" ? t("en_attente_2") : activeFilter === "approved" ? t("valide_2") : t("rejete_2")}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeFilter === "all" 
                  ? t("cet_etudiant_n_est_inscrit_a")
                  : t("cet_etudiant_n_a_pas_de", { v: activeFilter === "pending" ? i18n.t("adminStudentDetail:en_attente_de_validation_2") : activeFilter === "approved" ? i18n.t("adminStudentDetail:valides_2") : i18n.t("adminStudentDetail:rejetes_2") })}
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
                            src={enrollment.thumbnail_url || coverPlaceholder(enrollment.course_title)}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = coverPlaceholder(enrollment.course_title); }}
                            alt={enrollment.course_title}
                            className="w-20 h-20 rounded-xl object-contain border border-gray-200"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {enrollment.course_title}
                            {!hasCourseId && (
                              <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">{t("id_cours_manquant")}</span>
                            )}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {enrollment.course_level || t("tous_niveaux")}
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
                          <p className="text-sm text-gray-600">{t("inscrit_le")}{" "}{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString(getLocale()) : t("date_inconnue")}
                          </p>
                          {enrollment.completion_percentage > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{t("progression")}</span>
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
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{t("statut")}</h4>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.color} ${status.border}`}>
                          {status.icon}
                          <span className="font-medium">{status.text}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                      </div>
                      
                      {enrollment.payment_proof_url && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">{t("preuve_de_paiement")}</h4>
                          <ProofButton
                            url={enrollment.payment_proof_url}
                            label={t("voir_telecharger_la_preuve")}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">{t("actions")}</h4>
                      
                      {!hasCourseId ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">{t("actions_desactivees_course_id_manquant")}</p>
                        </div>
                      ) : !enrollment.is_approved && enrollment.status !== "rejected" ? (
                        <div className="space-y-2">
                          <button
                            onClick={async () => {
                              if ((await askConfirm(t("valider_l_inscription_a", { course_title: enrollment.course_title })))) {
                                handleEnrollmentAction('approve', enrollment);
                              }
                            }}
                            disabled={processing[`${enrollment.id}-approve`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-approve`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />{t("validation")}</>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />{t("valider")}</>
                            )}
                          </button>
                          
                          <button
                            onClick={async () => {
                              const reason = (await askPrompt(i18n.t("adminStudentDetail:raison_du_rejet")));
                              if (reason) {
                                handleEnrollmentAction('reject', enrollment, { reason });
                              }
                            }}
                            disabled={processing[`${enrollment.id}-reject`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-reject`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />{t("rejet")}</>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5" />{t("rejeter")}</>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => window.open(`/courses/${enrollment.course_id}`, '_blank')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#3B3A82] text-[#3B3A82] rounded-xl font-medium hover:bg-[#3B3A82] hover:text-white transition-all"
                          >
                            <Eye className="w-5 h-5" />{t("voir_le_cours")}</button>
                          
                          <button
                            onClick={async () => {
                              if ((await askConfirm(t("supprimer_definitivement_cette_inscription")))) {
                                handleEnrollmentAction('delete', enrollment);
                              }
                            }}
                            disabled={processing[`${enrollment.id}-delete`]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            {processing[`${enrollment.id}-delete`] ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />{t("suppression")}</>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />{t("supprimer")}</>
                            )}
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => window.open(`/admin/enrollments?student=${userId}`, '_blank')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        <BarChart className="w-5 h-5" />{t("historique_complet")}</button>
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
              <h3 className="font-bold text-gray-900">{t("inscrire_a_un_cours")}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t("ajouter_cet_etudiant_a_un_nouveau")}</p>
            <button
              onClick={() => navigate("/admin/courses")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >{t("choisir_un_cours")}</button>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-gray-900">{t("generer_rapport")}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t("exporter_les_donnees_de_cet_etudiant")}</p>
            <button
              onClick={() => alert(t("fonctionnalite_a_venir"))}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >{t("generer_pdf")}</button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-gray-900">{t("contact_rapide")}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t("contacter_l_etudiant_par_email")}</p>
            <button
              onClick={() => window.location.href = `mailto:${student?.email}`}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >{t("envoyer_email")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}