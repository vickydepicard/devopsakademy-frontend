import { useEffect, useState } from "react";
import api from "../../api/api";
import { Users, BookOpen, TrendingUp, BarChart2, RefreshCw } from "lucide-react";

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" };

export default function AdminStats() {
  const [stats,       setStats]       = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchStats = async () => {
    setLoading(true); setError(null);
    try {
      const [r1, r2] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/stats/courses"),
      ]);
      if (r1.data?.success) setStats(r1.data.data);
      if (r2.data?.success) setCourseStats(r2.data.data || []);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques.");
      console.error("AdminStats:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 animate-spin" style={{ color: C.light }} />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
      <p className="text-red-600 font-semibold mb-3">{error}</p>
      <button onClick={fetchStats} className="px-4 py-2 text-white rounded-xl text-sm font-bold"
        style={{ background: C.primary }}>Réessayer</button>
    </div>
  );

  const CARDS = [
    { icon: Users,     label: "Utilisateurs",       val: stats?.users || 0,        bg: "bg-blue-50",    tx: "text-blue-600" },
    { icon: BookOpen,  label: "Cours",              val: stats?.courses || 0,      bg: "bg-indigo-50",  tx: "text-indigo-600" },
    { icon: TrendingUp,label: "Inscriptions",       val: stats?.enrollments || 0,  bg: "bg-emerald-50", tx: "text-emerald-600" },
    { icon: BarChart2, label: "Progression moy.",   val: `${stats?.avgCompletion || 0}%`, bg: "bg-amber-50", tx: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black" style={{ color: C.primary }}>📈 Statistiques</h1>
        <button onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Cards stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map(({ icon: Icon, label, val, bg, tx }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-gray-100 shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Icon className={`w-5 h-5 ${tx}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{val}</p>
          </div>
        ))}
      </div>

      {/* Table cours */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-gray-900">Cours par popularité</h2>
          <span className="text-sm text-gray-400">{courseStats.length} cours</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-semibold">Cours</th>
                <th className="text-center px-6 py-3 font-semibold">Étudiants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courseStats.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-400 text-sm">Aucun cours</td></tr>
              ) : courseStats.map((cs, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-gray-800 text-sm">{cs.title}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#ede9fe", color: C.primary }}>
                      {cs.student_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}