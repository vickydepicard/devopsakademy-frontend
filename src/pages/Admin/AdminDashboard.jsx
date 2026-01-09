import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, avgCompletion: 0 });
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Tableau de bord Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Utilisateurs" value={stats.users} color="bg-blue-500" />
        <StatCard label="Cours" value={stats.courses} color="bg-green-500" />
        <StatCard label="Inscriptions" value={stats.enrollments} color="bg-indigo-500" />
        <StatCard label="Taux de complétion" value={`${stats.avgCompletion}%`} color="bg-yellow-500" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} text-white p-4 rounded-xl shadow-lg`}>
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
