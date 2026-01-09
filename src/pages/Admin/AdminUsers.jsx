// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else toast.error("Erreur lors du chargement des utilisateurs");
    } catch {
      toast.error("Impossible de récupérer les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const searchMatch =
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === "all" || u.role === roleFilter;
    return searchMatch && roleMatch;
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">👥 Gestion des utilisateurs</h1>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          🔄 Actualiser
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          className="border p-2 rounded w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructeurs</option>
          <option value="student">Étudiants</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-center">Rôle</th>
              <th className="p-2 text-center">Validé</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{u.first_name} {u.last_name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 text-center">{u.role}</td>
                  <td className="p-2 text-center">{u.is_validated ? "✅" : "❌"}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Voir profil
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
