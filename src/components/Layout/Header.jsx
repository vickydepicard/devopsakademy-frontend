import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import { usePermissions } from "../../contexts/PermissionContext"; // NOUVEAU
import { 
  Linkedin, 
  Youtube, 
  Mail, 
  User, 
  GraduationCap,
  Crown,
  Shield,
  BookOpen,
  Bell,
  ChevronDown
} from "lucide-react";
import logo from "../../assets/logo.png";

export default function Header() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { 
    isAdmin, 
    isInstructor, 
    isStudent, 
    enrollments,
    getEnrollmentStatus,
    canManageCourse 
  } = usePermissions(); // NOUVEAU
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasPendingEnrollments, setHasPendingEnrollments] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Vérifier les inscriptions en attente
  useEffect(() => {
    if (enrollments && enrollments.length > 0) {
      const pending = enrollments.some(enrollment => 
        enrollment.status === 'pending' || enrollment.is_approved === 0
      );
      setHasPendingEnrollments(pending);
    }
  }, [enrollments]);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-accent font-semibold"
      : "text-white hover:text-accent transition duration-300";

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (isAdmin()) return "/admin";
    if (isInstructor()) return "/instructor";
    return "/dashboard";
  };

  const getUserRoleBadge = () => {
    if (!user) return null;
    
    if (isAdmin()) {
      return {
        text: "👑 Admin",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <Crown className="w-3 h-3" />
      };
    }
    
    if (isInstructor()) {
      return {
        text: "👨‍🏫 Instructeur",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: <Shield className="w-3 h-3" />
      };
    }
    
    return {
      text: "🎓 Étudiant",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <GraduationCap className="w-3 h-3" />
    };
  };

  const getMyCoursesCount = () => {
    if (!enrollments) return 0;
    return enrollments.filter(e => 
      e.is_approved === 1 || e.status === 'approved'
    ).length;
  };

  const getPendingCount = () => {
    if (!enrollments) return 0;
    return enrollments.filter(e => 
      e.status === 'pending' || e.is_approved === 0
    ).length;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const roleBadge = getUserRoleBadge();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-primary-dark/95 shadow-lg backdrop-blur-md" : "bg-primary"
      }`}
    >
      {/* 🔹 Top Bar */}
      <div
        className={`bg-primary-dark text-gray-200 text-xs sm:text-sm py-1 px-4 flex justify-between items-center border-b border-primary-light transition-all duration-500 ${
          scrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
        }`}
      >
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-accent" />
          <span>devopseduque@gmail.com</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://www.linkedin.com/company/devopsakademy/?viewAsMember=true"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={16} className="hover:text-accent transition" />
          </a>
          <a
            href="https://youtube.com/@devopsakademy"
            target="_blank"
            rel="noreferrer"
          >
            <Youtube size={16} className="hover:text-accent transition" />
          </a>
        </div>
      </div>

      {/* 🔹 Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg sm:text-xl">
            DevOps <span className="text-accent">Akademy</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/courses" className={navLinkClass}>Cours</NavLink>
          
          {/* Menu Instructeurs visible pour tous */}
          <NavLink to="/instructors" className={navLinkClass}>Instructeurs</NavLink>
          
          {/* Menu Instructeur (visible seulement pour les instructeurs) */}
          {isInstructor() && (
            <NavLink 
              to="/instructor/courses" 
              className="flex items-center gap-1 text-white hover:text-accent transition duration-300"
            >
              <BookOpen className="w-4 h-4" />
              Mes Cours
            </NavLink>
          )}
          
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        {/* Auth / Profil */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications pour inscriptions en attente */}
              {hasPendingEnrollments && (
                <div className="relative">
                  <Link
                    to="/dashboard"
                    className="relative p-2 text-white hover:text-accent transition"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      !
                    </span>
                  </Link>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-4 animate-fadeIn z-50 hidden group-hover:block">
                    <p className="text-sm text-gray-700">
                      Vous avez {getPendingCount()} inscription(s) en attente de validation
                    </p>
                  </div>
                </div>
              )}

              {/* Badge de rôle */}
              {roleBadge && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${roleBadge.color} flex items-center gap-1`}>
                  {roleBadge.icon}
                  <span>{roleBadge.text}</span>
                </div>
              )}

              {/* Menu utilisateur */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="relative">
                    <img
                      src={profile?.avatar_url || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full border-2 border-accent hover:scale-105 transition"
                    />
                    {/* Indicateur en ligne */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 animate-fadeIn z-50">
                    {/* En-tête profil */}
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        <img
                          src={profile?.avatar_url || "/default-avatar.png"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border-2 border-accent"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="px-4 py-2 border-b">
                      <div className="flex justify-between text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{getMyCoursesCount()}</p>
                          <p className="text-xs text-gray-500">Cours</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{getPendingCount()}</p>
                          <p className="text-xs text-gray-500">En attente</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {enrollments?.filter(e => e.completion_percentage >= 100).length || 0}
                          </p>
                          <p className="text-xs text-gray-500">Terminés</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon Profil
                    </Link>
                    
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Tableau de bord
                    </Link>

                    {/* Lien admin/instructeur si applicable */}
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Crown className="w-4 h-4" />
                        Administration
                      </Link>
                    )}

                    {isInstructor() && (
                      <Link
                        to="/instructor/courses"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen className="w-4 h-4" />
                        Gérer mes cours
                      </Link>
                    )}

                    {/* Séparateur */}
                    <div className="border-t my-1"></div>

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                className="flex items-center gap-1 text-white hover:text-accent transition"
              >
                <User className="w-4 h-4" />
                Connexion
              </NavLink>
              <Link
                to="/register"
                className="bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-5 rounded-full transition duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Inscription
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          className="md:hidden text-white hover:text-accent transition relative"
        >
          {hasPendingEnrollments && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-primary"></span>
          )}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                mobileOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* 🔹 Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-dark px-6 py-6 space-y-4 border-t border-primary-light animate-slideDown">
          {/* Badge de rôle (mobile) */}
          {user && roleBadge && (
            <div className={`px-3 py-2 rounded-lg ${roleBadge.color} flex items-center justify-center gap-2 mb-4`}>
              {roleBadge.icon}
              <span className="font-medium">{roleBadge.text}</span>
            </div>
          )}

          <NavLink to="/" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/courses" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Cours
          </NavLink>
          
          {/* Menu instructeurs */}
          <NavLink to="/instructors" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Instructeurs
          </NavLink>
          
          {/* Menu instructeur (mobile) */}
          {isInstructor() && (
            <NavLink 
              to="/instructor/courses" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-white hover:text-accent transition"
            >
              <BookOpen className="w-4 h-4" />
              Mes Cours
            </NavLink>
          )}
          
          <NavLink to="/contact" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Contact
          </NavLink>

          {user ? (
            <>
              {/* Notifications mobile */}
              {hasPendingEnrollments && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">
                      {getPendingCount()} inscription(s) en attente
                    </span>
                  </div>
                  <p className="text-yellow-200/70 text-xs mt-1">
                    Votre accès sera activé après validation
                  </p>
                </div>
              )}

              {/* Statistiques mobile */}
              <div className="bg-primary-light/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{getMyCoursesCount()}</p>
                    <p className="text-xs text-gray-300">Cours</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{getPendingCount()}</p>
                    <p className="text-xs text-gray-300">En attente</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {enrollments?.filter(e => e.completion_percentage >= 100).length || 0}
                    </p>
                    <p className="text-xs text-gray-300">Terminés</p>
                  </div>
                </div>
              </div>

              <NavLink to={getDashboardLink()} onClick={() => setMobileOpen(false)} className={`${navLinkClass({})} flex items-center gap-2`}>
                <GraduationCap className="w-4 h-4" />
                Dashboard
              </NavLink>
              
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={`${navLinkClass({})} flex items-center gap-2`}>
                <User className="w-4 h-4" />
                Profil
              </NavLink>
              
              {isAdmin() && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={`${navLinkClass({})} flex items-center gap-2`}>
                  <Crown className="w-4 h-4" />
                  Administration
                </NavLink>
              )}
              
              {isInstructor() && (
                <NavLink to="/instructor/courses" onClick={() => setMobileOpen(false)} className={`${navLinkClass({})} flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4" />
                  Gérer mes cours
                </NavLink>
              )}
              
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 mt-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </>
          ) : (
            <div className="space-y-3 pt-4 border-t border-primary-light/50">
              <NavLink 
                to="/login" 
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-primary-light hover:bg-primary-light/80 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Connexion
              </NavLink>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-accent hover:bg-accent-light text-primary font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Inscription
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .group:hover .group-hover\\:block {
          display: block;
        }
      `}</style>
    </header>
  );
}