import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Users, Search, ArrowLeft, CheckCircle, Clock,
  XCircle, Award, BarChart2, Mail, Calendar,
  TrendingUp, Download, Loader
} from "lucide-react";

const STATUS_CONFIG = {
  approved:  { label: "Actif",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-400" },
  rejected:  { label: "Rejeté",     color: "bg-red-100 text-red-600",         dot: "bg-red-500" },
};

const getStatus = (e) => {
  if (e.is_approved) return "approved";
  if (e.payment_status === "pending") return "pending";
  return "rejected";
};

export default function CourseStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    document.title = "Étudiants du cours — DevOpsAkademy";
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studRes, courseRes] = await Promise.allSettled([
        api.get(`/instructor/courses/${id}/students`),
        api.get(`/instructor/courses/${id}`),
      ]);
      if (studRes.status === "fulfilled") setStudents(studRes.value.data?.data || []);
      if (courseRes.status === "fulfilled") setCourseName(courseRes.value.data?.data?.title || "");
    } catch {}
    setLoading(false);
  };

  const filtered = students
    .filter((s) => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(s);
      const matchFilter = filter === "all" || status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.enrolled_at) - new Date(a.enrolled_at);
      if (sortBy === "progress") return (b.completion_percentage || 0) - (a.completion_percentage || 0);
      return a.first_name?.localeCompare(b.first_name);
    });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.is_approved).length,
    pending: students.filter((s) => !s.is_approved && s.payment_status === "pending").length,
    completed: students.filter((s) => (s.completion_percentage || 0) >= 100).length,
    avgProgress: students.length
      ? Math.round(students.reduce((a, s) => a + (s.completion_percentage || 0), 0) / students.length)
      : 0,
  };

  const exportCSV = () => {
    const rows = [["Prénom", "Nom", "Email", "Inscrit le", "Statut", "Progression"]];
    students.forEach((s) => {
      rows.push([s.first_name, s.last_name, s.email,
        new Date(s.enrolled_at).toLocaleDateString("fr-FR"),
        getStatus(s), `${Math.round(s.completion_percentage || 0)}%`]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `etudiants-cours-${id}.csv`; a.click();
  };

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate("/instructor/courses")} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Étudiants inscrits</h1>
          <p className="text-gray-500 text-sm mt-0.5">{courseName}</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm hover:bg-gray-50 transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-800", bg: "bg-gray-100" },
          { label: "Actifs", value: stats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "En attente", value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "Complétés", value: stats.completed, color: "text-violet-700", bg: "bg-violet-50" },
          { label: "Progression moy.", value: `${stats.avgProgress}%`, color: "text-blue-700", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl px-4 py-3`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un étudiant…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        {["all", "approved", "pending", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${filter === f ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"}`}>
            {f === "all" ? "Tous" : f === "approved" ? "Actifs" : f === "pending" ? "En attente" : "Rejetés"}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-600">
          <option value="date">Trier : Date</option>
          <option value="progress">Trier : Progression</option>
          <option value="name">Trier : Nom</option>
        </select>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">Aucun étudiant trouvé</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Étudiant", "Email", "Inscrit le", "Statut", "Progression", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => {
                  const status = getStatus(student);
                  const cfg = STATUS_CONFIG[status];
                  const progress = Math.round(student.completion_percentage || 0);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition">
                      {/* Nom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{student.first_name} {student.last_name}</p>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4">
                        <a href={`mailto:${student.email}`} className="text-sm text-gray-500 hover:text-primary transition flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />{student.email}
                        </a>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(student.enrolled_at).toLocaleDateString("fr-FR")}
                        </span>
                      </td>
                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      {/* Progression */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progress >= 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-9 shrink-0">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {progress >= 100 && <Award className="w-4 h-4 text-yellow-500" title="Cours complété" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}