import { Link } from "react-router-dom";
import { Mail, Linkedin, Youtube, MapPin } from "lucide-react";
import logo from "../../assets/logo2.png";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-gray-300 pt-12 pb-6 border-t border-primary-light">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* 🔹 Bloc 1 — Logo & description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="DevOps Akademy" className="h-10 w-auto rounded" />
              <h2 className="text-xl font-bold text-white">DevOps <span className="text-accent">Akademy</span></h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Plateforme de formation Cloud, DevOps et CI/CD pour maîtriser les outils modernes et propulser ta carrière.
            </p>
          </div>

          {/* 🔹 Bloc 2 — Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-lg">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-accent transition">Accueil</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition">Cours</Link></li>
              <li><Link to="/instructors" className="hover:text-accent transition">Instructeurs</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition">Contact</Link></li>
            </ul>
          </div>

          {/* 🔹 Bloc 3 — Ressources */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-lg">Ressources</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-accent transition">À propos</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-accent transition">Politique de confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition">Conditions d’utilisation</Link></li>
            </ul>
          </div>

          {/* 🔹 Bloc 4 — Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-lg">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <a href="mailto:contact@devopsakademy.cloud" className="hover:text-accent transition">
                  contact@devopsakademy.cloud
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                <span>Douala, Cameroun</span>
              </li>
            </ul>

            {/* 🔹 Réseaux sociaux */}
            <div className="flex gap-4 mt-4">
              <a
                href="https://linkedin.com/company/devops-akademy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://youtube.com/@devopsakademy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="border-t border-primary-light mt-10 pt-6 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} <span className="text-accent font-semibold">DevOps Akademy</span>.  
            Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
