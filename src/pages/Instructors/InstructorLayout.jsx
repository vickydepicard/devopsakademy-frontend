import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Plus, Users, BarChart2,
  FileText, ChevronLeft, ChevronRight, LogOut, User,
  Bell, Settings, GraduationCap, Menu, X
} from "lucide-react";

const navItems = [
  { to: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/instructor/courses", label: "Mes cours", icon: BookOpen },
  { to: "/instructor/courses/new", label: "Créer un cours", icon: Plus },
  { to: "/instructor/submissions", label: "Devoirs", icon: FileText },
  { to: "/instructor/analytics", label: "Analytics", icon: BarChart2 },
];

export default function InstructorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-dark" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">Espace</p>
            <p className="text-accent font-bold text-sm">Instructeur</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActive({ to, exact: to === "/instructor" });
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-accent text-primary-dark font-semibold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : ""}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? "text-primary-dark" : ""}`} />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profil bas */}
      <div className={`px-3 py-4 border-t border-white/10 space-y-2`}>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition ${collapsed ? "justify-center" : ""}`}
        >
          <User className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Mon profil</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-primary-dark to-primary transition-all duration-300 ${collapsed ? "w-16" : "w-64"} shrink-0 sticky top-0 h-screen`}>
        <SidebarContent />
        {/* Toggle collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-600" /> : <ChevronLeft className="w-3 h-3 text-gray-600" />}
        </button>
      </aside>

      {/* ── SIDEBAR MOBILE ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-primary-dark to-primary flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-bold text-primary text-sm">Espace Instructeur</p>
          <Link to="/notifications" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
          </Link>
        </div>

        {/* Topbar desktop */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800 leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Instructeur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}