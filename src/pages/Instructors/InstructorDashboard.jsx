import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen, Users, Star, TrendingUp, Plus, ArrowRight,
  PlayCircle, Clock, CheckCircle, Award, Eye, BarChart2,
  Zap, FileText, ChevronRight
} from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color, bg, trend }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentEnrollments, setRecentEnrollments] = useState([]);

  useEffect(() => {
    document.title = "Dashboard Instructeur — DevOpsAkademy";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.allSettled([
        api.get("/instructor/courses"),
        api.get("/instructor/stats"),
      ]);
      if (coursesRes.status === "fulfilled") {
        const data = coursesRes.value.data?.data || [];
        setCourses(data.slice(0, 5));
        // Calcule stats depuis courses si endpoint stats manquant
        if (statsRes.status === "rejected") {
          const total = data.length;
          const published = data.filter((c) => c.is_published).length;
          const totalStudents = data.reduce((acc, c) => acc + (c.enrolled_count || 0), 0);
          setStats({ total_courses: total, published_courses: published, total_students: totalStudents, avg_rating: 4.7 });
        }
      }
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data);
    } catch (err) {
      console.error("Erreur dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Bonjour, {user?.first_name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Voici un aperçu de votre activité d'enseignement</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md text-sm"
        >
          <Plus className="w-4 h-4" /> Nouveau cours
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cours créés" value={stats?.total_courses ?? courses.length} icon={BookOpen} color="text-primary" bg="bg-primary/10" />
        <StatCard label="Cours publiés" value={stats?.published_courses ?? 0} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Étudiants inscrits" value={stats?.total_students ?? 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Note moyenne" value={stats?.avg_rating ? `${Number(stats.avg_rating).toFixed(1)}/5` : "—"} icon={Star} color="text-yellow-500" bg="bg-yellow-50" />
      </div>

      {/* Mes cours */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900">Mes cours récents</h2>
          </div>
          <Link to="/instructor/courses" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 mb-2">Aucun cours créé</h3>
            <p className="text-gray-400 text-sm mb-6">Commencez par créer votre premier cours.</p>
            <Link to="/instructor/courses/new" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:-translate-y-0.5 transition">
              <Plus className="w-4 h-4" /> Créer un cours
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary-dark to-primary shrink-0">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/50" /></div>
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.enrolled_count || 0} étudiants
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {course.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/instructor/courses/${course.id}/edit`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title="Modifier">
                    <FileText className="w-4 h-4" />
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/students`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Étudiants">
                    <Users className="w-4 h-4" />
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/analytics`} className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition" title="Analytics">
                    <BarChart2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/instructor/courses/new", icon: Plus, label: "Créer un cours", desc: "Publiez une nouvelle formation", color: "from-primary to-primary-light", textColor: "text-white" },
          { to: "/instructor/submissions", icon: FileText, label: "Corriger les devoirs", desc: "Devoirs en attente de correction", color: "from-violet-500 to-purple-600", textColor: "text-white" },
          { to: "/instructor/analytics", icon: BarChart2, label: "Voir les analytics", desc: "Performances et statistiques", color: "from-emerald-500 to-teal-600", textColor: "text-white" },
        ].map(({ to, icon: Icon, label, desc, color, textColor }) => (
          <Link key={to} to={to} className={`bg-gradient-to-br ${color} rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-md group`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-white">{label}</p>
            <p className="text-white/70 text-xs mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}