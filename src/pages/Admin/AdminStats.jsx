import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchStats = async () => {
    const [res1, res2] = await Promise.all([
      fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/admin/stats/courses`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const data1 = await res1.json();
    const data2 = await res2.json();
    if (data1.success) setStats(data1.data);
    if (data2.success) setCourseStats(data2.data);
  };

  useEffect(() => { fetchStats(); }, []);

  if (!stats) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📈 Statistiques générales</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded text-center">
          👥 <br /> <b>{stats.users}</b> utilisateurs
        </div>
        <div className="bg-white p-4 shadow rounded text-center">
          🎓 <br /> <b>{stats.courses}</b> cours
        </div>
        <div className="bg-white p-4 shadow rounded text-center">
          🪪 <br /> <b>{stats.enrollments}</b> inscriptions
        </div>
        <div className="bg-white p-4 shadow rounded text-center">
          📊 <br /> <b>{stats.avgCompletion}%</b> progression moyenne
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">Par cours</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Cours</th>
            <th className="p-2 text-center">Étudiants</th>
          </tr>
        </thead>
        <tbody>
          {courseStats.map((c) => (
            <tr key={c.title} className="border-t">
              <td className="p-2">{c.title}</td>
              <td className="p-2 text-center">{c.student_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
