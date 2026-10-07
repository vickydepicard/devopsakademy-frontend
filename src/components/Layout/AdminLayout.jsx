import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "../Common/NotificationBell";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  BarChart2, Mail, FileText, CreditCard, Award,
  Tag, Trophy, Settings, LogOut, Menu, X,
  ChevronLeft, ChevronRight, Bell, Shield, GraduationCap, CheckSquare, Radio, Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const NAV_GROUPS = () => ([
  {
    label: i18n.t("adminLayout:principal"),
    items: [
      { to: "/admin", label: i18n.t("adminLayout:dashboard"), icon: LayoutDashboard, exact: true },
      { to: "/admin/stats", label: i18n.t("adminLayout:statistiques"), icon: BarChart2 },
      { to: "/admin/notifications", label: i18n.t("adminLayout:notifications"), icon: Bell },
    ],
  },
  {
    label: i18n.t("adminLayout:gestion"),
    items: [
      { to: "/admin/users", label: i18n.t("adminLayout:utilisateurs"), icon: Users },
      { to: "/admin/courses", label: i18n.t("adminLayout:cours"), icon: BookOpen },
      { to: "/admin/course-reviews", label: i18n.t("adminLayout:cours_a_valider"), icon: CheckSquare },
      { to: "/admin/enrollments", label: i18n.t("adminLayout:inscriptions"), icon: ClipboardList },
      { to: "/admin/submissions", label: i18n.t("adminLayout:devoirs"), icon: FileText },
      { to: "/admin/instructors", label: i18n.t("adminLayout:instructeurs"), icon: GraduationCap },
      { to: "/admin/instructor-applications", label: i18n.t("adminLayout:candidatures"), icon: Award },
      { to: "/admin/bootcamps", label: i18n.t("adminLayout:bootcamps_lives"), icon: Radio },
    ],
  },
  {
    label: i18n.t("adminLayout:financier"),
    items: [
      { to: "/admin/subscriptions", label: i18n.t("adminLayout:abonnements"), icon: CreditCard },
    ],
  },
  {
    label: i18n.t("adminLayout:plateforme"),
    items: [
      { to: "/admin/certificates", label: i18n.t("adminLayout:certificats"), icon: Award },
      { to: "/admin/categories", label: i18n.t("adminLayout:categories"), icon: Tag },
      { to: "/admin/leaderboard", label: i18n.t("adminLayout:classement"), icon: Trophy },
      { to: "/admin/messages", label: i18n.t("adminLayout:messages"), icon: Mail },
      { to: "/admin/settings", label: i18n.t("adminLayout:parametres"), icon: Settings },
    ],
  },
]);

export default function AdminLayout() {
  const { t } = useTranslation("adminLayout");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
      isActive
        ? "bg-indigo-700 text-white font-semibold shadow-sm ring-1 ring-indigo-500"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    } ${collapsed ? "justify-center" : ""}`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 flex-shrink-0" style={{background:"linear-gradient(135deg,#2d287f,#5653e1)"}}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">{t("admin_panel")}</p>
            <p className="text-indigo-300 text-xs mt-0.5">DevOpsAkademy</p>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS().map(({ label, items }) => (
          <div key={label}>
            {!collapsed && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">{label}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ to, label: itemLabel, icon: Icon, exact }) => (
                <NavLink key={to} to={to} end={exact} className={linkClass}
                  onClick={() => setMobileOpen(false)} title={collapsed ? itemLabel : ""}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{itemLabel}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-400">{t("connecte_en_tant_que")}</p>
            <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
          </div>
        )}
        <NavLink to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition ${collapsed ? "justify-center" : ""}`}>
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t("viewSite")}</span>}
        </NavLink>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition ${collapsed ? "justify-center" : ""}`}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t("deconnexion")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`hidden lg:flex flex-col bg-[#1a1640] transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"} shrink-0 sticky top-0 h-screen z-30`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition z-50">
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-600" /> : <ChevronLeft className="w-3 h-3 text-gray-600" />}
        </button>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1a1640] flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-800 text-sm">{t("panneau_d_administration")}</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell basePath="/admin/notifications" />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{background:"#facc15",color:"#2d287f"}}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-gray-800 leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-indigo-400 mt-0.5">{t("administrateur")}</p>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto text-left">
          <Outlet />
        </main>
      </div>
    </div>
  );
}