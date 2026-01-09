// src/pages/Admin/layouts/AdminLayout.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext"; // ✅ bon chemin

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 🧭 Barre latérale */}
      <aside className="w-64 bg-[#0B1B3A] text-white flex flex-col shadow-2xl">
        {/* Logo / Titre */}
        <div className="p-5 text-center font-extrabold text-xl border-b border-blue-600 tracking-wide bg-[#132E63]">
          ⚙️ Admin Panel
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 p-4 space-y-2 font-medium">
          <Link
            to="/admin"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            🏠 <span>Tableau de bord rrrr</span>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            👥 <span>Utilisateurs</span>
          </Link>

          <Link
            to="/admin/courses"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            🎓 <span>Cours</span>
          </Link>

          <Link
            to="/admin/enrollments"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            🧾 <span>Inscriptions</span>
          </Link>

          <Link
            to="/admin/stats"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            📊 <span>Statistiques</span>
          </Link>

          {/* 🆕 Nouvelle section : Messages reçus */}
          <Link
            to="/admin/messages"
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
          >
            📩 <span>Messages reçus</span>
          </Link>
        </nav>

        {/* 🔴 Bouton Déconnexion */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm font-semibold transition"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* 🧱 Zone principale */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4 text-sm text-gray-500">
          Connecté en tant que{" "}
          <strong>{user?.email || "Administrateur"}</strong>
        </div>

        {/* 🪄 Affiche ici les sous-pages (Dashboard, Users, Messages, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}
