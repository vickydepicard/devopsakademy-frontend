// src/pages/Submissions/StudentSubmission.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Send,
  Paperclip,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  User,
  Award,
  BarChart
} from "lucide-react";

export default function StudentSubmission() {
  const { courseId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    title: "",
    description: "",
    files: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails du cours
      const courseRes = await api.get(`/courses/${courseId}`);
      if (courseRes.data?.success) {
        setCourse(courseRes.data.data);
      }

      // Récupérer les soumissions existantes
      const submissionsRes = await api.get(`/submissions/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (submissionsRes.data?.success) {
        setSubmissions(submissionsRes.data.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'image/jpeg',
        'image/png',
        'text/plain',
        'application/json',
        'application/x-yaml'
      ];
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Format non supporté: ${file.name}. Formats acceptés: PDF, Word, Excel, ZIP, Images, TXT, JSON, YAML`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`Fichier trop volumineux: ${file.name}. Taille max: 10MB`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newSubmission.title.trim()) {
      alert("Veuillez donner un titre à votre soumission");
      return;
    }
    
    if (selectedFiles.length === 0) {
      alert("Veuillez sélectionner au moins un fichier");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("title", newSubmission.title);
      formData.append("description", newSubmission.description || "");
      formData.append("course_id", courseId);
      
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const res = await api.post("/submissions", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        alert("✅ Soumission envoyée avec succès !");
        setSubmissions(prev => [res.data.data, ...prev]);
        setNewSubmission({ title: "", description: "", files: [] });
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      alert(error.response?.data?.message || "❌ Erreur lors de l'envoi de la soumission");
    } finally {
      setUploading(false);
    }
  };

  const getStatusInfo = (submission) => {
    switch(submission.status) {
      case 'approved':
        return {
          text: "Validé",
          color: "bg-emerald-100 text-emerald-800",
          border: "border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />,
          description: "Votre travail a été approuvé"
        };
      case 'rejected':
        return {
          text: "Rejeté",
          color: "bg-red-100 text-red-800",
          border: "border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          description: submission.feedback || "Veuillez corriger"
        };
      case 'pending':
      default:
        return {
          text: "En attente",
          color: "bg-yellow-100 text-yellow-800",
          border: "border-yellow-200",
          icon: <Clock className="w-4 h-4" />,
          description: "En attente de revue"
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/learn`)}
            className="flex items-center gap-2 text-[#2d287f] hover:text-[#5653e1] transition-colors mb-6"
          >
            <ExternalLink className="w-4 h-4 rotate-180" />
            Retour au cours
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📤 Soumissions de travaux
              </h1>
              <p className="text-gray-600 mt-2">
                Soumettez vos travaux pour validation
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Cours</div>
              <div className="font-bold text-gray-900">{course?.title}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de soumission */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-[#2d287f]" />
                <h2 className="text-xl font-bold text-gray-900">Nouvelle soumission</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Titre de la soumission *
                  </label>
                  <input
                    type="text"
                    value={newSubmission.title}
                    onChange={(e) => setNewSubmission({...newSubmission, title: e.target.value})}
                    placeholder="Ex: Projet Docker, TP Kubernetes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={newSubmission.description}
                    onChange={(e) => setNewSubmission({...newSubmission, description: e.target.value})}
                    placeholder="Décrivez votre travail..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#2d287f] focus:ring-2 focus:ring-[#2d287f]/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Zone de téléchargement */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fichiers joints *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#2d287f] transition-colors">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Glissez-déposez vos fichiers
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Formats acceptés: PDF, Word, Excel, ZIP, Images, TXT, JSON, YAML
                    </p>
                    <label className="inline-block px-6 py-3 bg-gradient-to-r from-[#2d287f] to-[#5653e1] text-white rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      Sélectionner des fichiers
                    </label>
                  </div>

                  {/* Liste des fichiers sélectionnés */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Fichiers sélectionnés ({selectedFiles.length})</h4>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <XCircle className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Soumettre le travail
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Historique des soumissions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Historique des soumissions</h2>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 text-sm text-[#2d287f] hover:text-[#5653e1]"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucune soumission
                </h3>
                <p className="text-gray-600 mb-6">
                  Soumettez votre premier travail
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const status = getStatusInfo(submission);
                  
                  return (
                    <div key={submission.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {submission.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.border} flex items-center gap-1`}>
                              {status.icon}
                              {status.text}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(submission.created_at)}
                            </span>
                          </div>
                          {submission.description && (
                            <p className="text-gray-600 text-sm">{submission.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Feedback de l'admin */}
                      {submission.feedback && (
                        <div className={`p-4 rounded-lg mb-4 ${
                          submission.status === 'approved' 
                            ? 'bg-emerald-50 border border-emerald-200' 
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Retour de l'administrateur</h4>
                              <p className="text-gray-700">{submission.feedback}</p>
                              {submission.grade && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Note: {submission.grade}/20
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}