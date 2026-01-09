import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fermer le menu utilisateur si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Style des liens actifs
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-accent font-semibold"
      : "text-white hover:text-accent transition duration-300";

  // ✅ Redirection selon rôle
  const dashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "instructor":
        return "/instructor";
      default:
        return "/dashboard";
    }
  };

  // ✅ Déconnexion
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="DevOps Akademy" className="h-10 w-auto rounded" />
            <span className="font-bold text-white text-xl">DevOps Akademy</span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
            <NavLink to="/courses" className={navLinkClass}>Cours</NavLink>
            <NavLink to="/instructors" className={navLinkClass}>Instructeurs</NavLink>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                >
                  <img
                    src={profile?.avatar_url || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-accent cursor-pointer hover:scale-105 transition"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-fadeIn z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      👤 Mon profil
                    </Link>
                    <Link
                      to={dashboardLink()}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Connexion</NavLink>
                <Link
                  to="/register"
                  className="bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-5 rounded-full transition duration-300 shadow-md hover:shadow-lg"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* --- MOBILE BUTTON --- */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu mobile"
            className="md:hidden text-white hover:text-accent focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {mobileOpen && (
        <div className="md:hidden bg-primary px-6 py-4 space-y-3 animate-slideDown">
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/courses" onClick={() => setMobileOpen(false)} className={navLinkClass}>Cours</NavLink>
          <NavLink to="/instructors" onClick={() => setMobileOpen(false)} className={navLinkClass}>Instructeurs</NavLink>

          {user ? (
            <>
              <NavLink to={dashboardLink()} onClick={() => setMobileOpen(false)} className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>Profil</NavLink>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full text-left bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-4 rounded-lg transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMobileOpen(false)} className={navLinkClass}>Connexion</NavLink>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-4 rounded-lg text-center transition"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}

      {/* --- Animations CSS --- */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.25s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
