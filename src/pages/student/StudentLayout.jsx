// src/pages/Student/StudentLayout.jsx
// Sidebar claire, épurée, charte DevOps Akademy : primary #2d287f / accent #facc15
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  LayoutDashboard, BookOpen, Trophy, CreditCard, User,
  Bell, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Flame, Award, Clock, GraduationCap, Star
} from "lucide-react";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts,     setCounts]     = useState({ active: 0, completed: 0, pending: 0 });

  useEffect(() => { loadCounts(); }, []);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const loadCounts = async () => {
    try {
      const { data } = await api.get("/enrollments/me");
      const list = data?.data || [];
      const acc  = c => c.is_approved && ["free","verified"].includes(c.payment_status);
      const pct  = c => c.total_lessons > 0
        ? Math.round(((c.completed_lessons||0)/c.total_lessons)*100)
        : Number(c.completion_percentage||0);
      const done = c => !!(c.completed_at) || pct(c) >= 100;
      setCounts({
        active:    list.filter(c => acc(c) && !done(c)).length,
        completed: list.filter(c => done(c)).length,
        pending:   list.filter(c => c.payment_status === "pending").length,
      });
    } catch (_) {}
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Étudiant";
  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const NAV = [
    { group: "Formation", items: [
      { to:"/student",            end:true,  label:"Vue d'ensemble",  Icon:LayoutDashboard },
      { to:"/student/active",     end:false, label:"En cours",        Icon:Flame,    badge: counts.active    || null, badgeCls:"bg-orange-100 text-orange-600" },
      { to:"/student/completed",  end:false, label:"Terminés",        Icon:Trophy,   badge: counts.completed || null, badgeCls:"bg-violet-100 text-violet-700" },
      { to:"/student/pending",    end:false, label:"En attente",      Icon:Clock,    badge: counts.pending   || null, badgeCls:"bg-amber-100  text-amber-700"  },
    ]},
    { group: "Mon espace", items: [
      { to:"/student/profile",      end:false, label:"Mon profil",      Icon:User },
      { to:"/student/certificates", end:false, label:"Mes certificats", Icon:Award },
      { to:"/student/payments",     end:false, label:"Paiements",       Icon:CreditCard },
      { to:"/leaderboard",          end:false, label:"Classement",      Icon:Star },
    ]},
    { group: "Catalogue", items: [
      { to:"/courses", end:true, label:"Explorer les cours", Icon:BookOpen },
    ]},
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <Link to="/student"
        className={`flex items-center gap-2.5 py-5 flex-shrink-0 transition-all ${collapsed?"justify-center px-3":"px-5"}`}
        style={{ borderBottom:"1px solid #e8e6f5" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:"#facc15" }}>
          <GraduationCap className="w-4 h-4" style={{ color:"#2d287f" }} />
        </div>
        {!collapsed && (
          <span className="font-black text-sm" style={{ color:"#2d287f" }}>
            DevOps <span style={{ color:"#5653e1" }}>Akademy</span>
          </span>
        )}
      </Link>

      {/* ── User pill ── */}
      {!collapsed ? (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom:"1px solid #e8e6f5" }}>
          <div className="flex items-center gap-2.5 bg-violet-50 rounded-xl px-3 py-2.5">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0"/>
              : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background:"#2d287f", color:"#facc15" }}>{initials}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none" style={{ color:"#2d287f" }}>{fullName}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-xs text-emerald-600 font-medium">Étudiant</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-3 flex-shrink-0" style={{ borderBottom:"1px solid #e8e6f5" }}>
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover"/>
            : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background:"#2d287f", color:"#facc15" }}>{initials}</div>
          }
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV.map(g => (
          <div key={g.group}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {g.group}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items.map(({ to, end, label, Icon, badge, badgeCls }) => (
                <NavLink key={to} to={to} end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150
                    ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
                    ${isActive
                      ? "font-semibold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }
                  `}
                  style={({ isActive }) => isActive
                    ? { background:"#eeeeff", color:"#2d287f", fontWeight:700 }
                    : {}
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4 flex-shrink-0"
                        style={{ color: isActive ? "#2d287f" : undefined }} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 leading-none">{label}</span>
                          {badge != null && badge > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-2 py-3 space-y-0.5 flex-shrink-0" style={{ borderTop:"1px solid #e8e6f5" }}>
        <NavLink to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all
            ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}
            ${isActive ? "bg-slate-100 text-slate-800" : ""}`
          }
          title={collapsed ? "Notifications" : undefined}>
          <Bell className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </NavLink>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 rounded-xl text-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all
            ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}
          title={collapsed ? "Déconnexion" : undefined}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:"#f6f5fb" }}>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className={`hidden lg:flex flex-col relative flex-shrink-0 transition-[width] duration-300 ease-in-out bg-white`}
        style={{ width: collapsed ? 60 : 210, borderRight:"1px solid #e8e6f5", boxShadow:"2px 0 12px rgba(45,40,127,0.06)" }}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(p => !p)}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full flex items-center justify-center z-10 bg-white shadow-md transition hover:shadow-lg"
          style={{ border:"1.5px solid #e8e6f5" }}>
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" style={{ color:"#5653e1" }} />
            : <ChevronLeft  className="w-3.5 h-3.5" style={{ color:"#5653e1" }} />
          }
        </button>
      </aside>

      {/* ── SIDEBAR MOBILE ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[210px] bg-white flex flex-col z-10 shadow-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/student" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:"#facc15" }}>
              <GraduationCap className="w-3.5 h-3.5" style={{ color:"#2d287f" }} />
            </div>
            <span className="font-black text-sm" style={{ color:"#2d287f" }}>DevOps <span style={{ color:"#5653e1" }}>Akademy</span></span>
          </Link>
          <Link to="/notifications" className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400">
            <Bell className="w-5 h-5" />
          </Link>
        </div>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}