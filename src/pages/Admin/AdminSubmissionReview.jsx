import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  User,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star
} from "lucide-react";

export default function AdminSubmissionReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    course: '',
    search: ''
  });
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/submissions");
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
        calculateStats(res.data.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement soumissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    }
  };

  const calculateStats = (submissionsData) => {
    setStats({
      total: submissionsData.length,
      pending: submissionsData.filter(s => s.status === 'pending').length,
      approved: submissionsData.filter(s => s.status === 'approved').length,
      rejected: submissionsData.filter(s => s.status === 'rejected').length
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status !== 'all' && submission.status !== filters.status) return false;
    if (filters.course && submission.course_id !== filters.course) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        submission.title.toLowerCase().includes(searchLower) ||
        submission.user_name.toLowerCase().includes(searchLower) ||
        submission.course_title.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleReviewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
    setGrade(submission.grade || "");
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/submissions/${selectedSubmission.id}/review`, {
        status: 'approved',
        feedback: feedback.trim(),
        grade: grade || null
      });

      if (res.data?.success) {
        // Mettre à jour la liste
        setSubmissions(prev => prev.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, status: 'approved', feedback, grade }
            : s
        ));
        
        // Mettre à jour les stats
        calculateStats(submissions.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, status: 'approved' }
            : s
        ));
        
        setSelectedSubmission(null);
        alert("✅ Soumission validée avec succès !");
        
        // Notification à l'étudiant
        notifyStudent(selectedSubmission.user_id, 'approved');
      }
    } catch (error) {
      console.error("Erreur validation:", error);
      alert(error.response?.data?.message || "❌ Erreur lors de la validation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !feedback.trim()) {
      alert("Veuillez fournir un feedback pour expliquer le rejet");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/submissions/${selectedSubmission.id}/review`, {
        status: 'rejected',
        feedback: feedback.trim(),
        grade: grade || null
      });

      if (res.data?.success) {
        setSubmissions(prev => prev.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, status: 'rejected', feedback, grade }
            : s
        ));
        
        calculateStats(submissions.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, status: 'rejected' }
            : s
        ));
        
        setSelectedSubmission(null);
        alert("✅ Soumission rejetée avec feedback.");
        
        // Notification à l'étudiant
        notifyStudent(selectedSubmission.user_id, 'rejected');
      }
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert(error.response?.data?.message || "❌ Erreur lors du rejet");
    } finally {
      setActionLoading(false);
    }
  };

  const notifyStudent = async (userId, status) => {
    try {
      await api.post("/notifications", {
        user_id: userId,
        title: status === 'approved' ? "🎉 Votre soumission a été validée !" : "📝 Retour sur votre soumission",
        message: status === 'approved' 
          ? "Félicitations ! Votre travail a été approuvé par l'administrateur."
          : "Votre soumission nécessite des corrections. Consultez le feedback de l'administrateur.",
        type: status === 'approved' ? 'success' : 'warning'
      });
    } catch (error) {
      console.error("Erreur notification:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'approved':
        return {
          text: "Validé",
          color: "bg-emerald-100 text-emerald-800",
          border: "border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'rejected':
        return {
          text: "Rejeté",
          color: "bg-red-100 text-red-800",
          border: "border-red-200",
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          text: "En attente",
          color: "bg-yellow-100 text-yellow-800",
          border: "border-yellow-200",
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Revue des soumissions
          </h1>
          <p className="text-gray-600">
            Validez ou rejetez les travaux soumis par les apprenants
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-gray-600">Validées</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des soumissions */}
          <div className="lg:col-span-2">
            {/* Filtres */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Statut
                    </div>
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Validées</option>
                    <option value="rejected">Rejetées</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Cours
                  </label>
                  <select
                    value={filters.course}
                    onChange={(e) => setFilters({...filters, course: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all"
                  >
                    <option value="">Tous les cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Recherche
                    </div>
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="Titre, étudiant, cours..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Liste */}
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Aucune soumission
                  </h3>
                  <p className="text-gray-600">
                    {filters.status !== 'all' || filters.course || filters.search
                      ? "Aucune soumission ne correspond aux filtres"
                      : "Aucune soumission n'a été effectuée pour le moment"}
                  </p>
                </div>
              ) : (
                filteredSubmissions.map(submission => {
                  const status = getStatusInfo(submission.status);
                  
                  return (
                    <div
                      key={submission.id}
                      className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                        selectedSubmission?.id === submission.id ? 'ring-2 ring-[#2d287f]' : ''
                      }`}
                      onClick={() => handleReviewSubmission(submission)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.border} flex items-center gap-1`}>
                              {status.icon}
                              {status.text}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(submission.created_at)}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {submission.title}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{submission.user_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{submission.user_email}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-gray-600 mb-1">
                                <span className="font-medium">Cours:</span> {submission.course_title}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span>{submission.files?.length || 0} fichier(s)</span>
                              </div>
                            </div>
                          </div>
                          
                          {submission.description && (
                            <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                              {submission.description}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewSubmission(submission);
                          }}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                          Examiner
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Panneau d'examen */}
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Examen de la soumission</h2>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Informations */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{selectedSubmission.title}</h3>
                      <p className="text-sm text-gray-600">{selectedSubmission.description}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Étudiant</div>
                          <div className="font-medium">{selectedSubmission.user_name}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Cours</div>
                          <div className="font-medium">{selectedSubmission.course_title}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Date</div>
                          <div className="font-medium">{formatDate(selectedSubmission.created_at)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Version</div>
                          <div className="font-medium">Soumission #{selectedSubmission.attempt || 1}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fichiers */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Fichiers soumis</h3>
                    <div className="space-y-2">
                      {selectedSubmission.files?.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <Download className="w-4 h-4 text-gray-500" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Feedback à l'étudiant *
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Donnez un retour constructif à l'étudiant..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Note (optionnelle)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="Ex: 16.5"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all"
                        />
                        <div className="text-sm text-gray-600">/20</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !feedback.trim()}
                        className="px-4 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        Rejeter
                      </button>
                      
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        Valider
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open(`/admin/users/${selectedSubmission.user_id}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Voir le profil étudiant
                    </button>
                    <button
                      onClick={() => window.open(`/courses/${selectedSubmission.course_id}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Voir le cours
                    </button>
                    <a
                      href={`mailto:${selectedSubmission.user_email}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Contacter l'étudiant
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucune soumission sélectionnée
                </h3>
                <p className="text-gray-600">
                  Cliquez sur une soumission dans la liste pour l'examiner
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}