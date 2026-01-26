import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import { Linkedin, Youtube, Mail } from "lucide-react";
import logo from "../../assets/logo.png";

export default function Header() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-accent font-semibold"
      : "text-white hover:text-accent transition duration-300";

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

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

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
          <NavLink to="/instructors" className={navLinkClass}>Instructeurs</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>

        </nav>

        {/* Auth / Profil */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center focus:outline-none"
              >
                <img
                  src={profile?.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border-2 border-accent hover:scale-105 transition"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 animate-fadeIn">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to={dashboardLink()}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Connexion
              </NavLink>
              <Link
                to="/register"
                className="bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-5 rounded-full transition duration-300 shadow-md hover:shadow-lg"
              >
                Inscription
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          className="md:hidden text-white hover:text-accent transition"
        >
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
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/courses" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Cours
          </NavLink>
          <NavLink to="/instructors" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Instructeurs
          </NavLink>
          <NavLink to="/contact" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            Contact
          </NavLink>

          {user ? (
            <>
              <NavLink to={dashboardLink()} onClick={() => setMobileOpen(false)} className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>
                Profil
              </NavLink>
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-accent hover:bg-accent-light text-primary font-semibold py-2 px-4 rounded-full transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="block bg-accent hover:bg-accent-light text-primary font-semibold py-3 px-4 rounded-full text-center transition shadow-lg"
            >
              Inscription
            </Link>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
