import { Link, useLocation } from "react-router-dom";
import { Mail, Linkedin, Youtube, MapPin } from "lucide-react";
import logo from "../../assets/logo2.png";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";

const linkCls = "text-gray-300 hover:text-accent transition text-sm";

const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (/^\/(admin|instructor)(\/|$)/.test(pathname)) return null;
  const { isAdmin, isInstructor } = usePermissions();

  // Colonne de navigation adaptée au profil connecté
  const nav = isAdmin()
    ? { title: t("footer.admin"), links: [["/admin", t("footer.admin")], ["/admin/users", t("footer.users")], ["/admin/course-reviews", t("footer.toReview")], ["/admin/enrollments", t("footer.enrollments")], ["/admin/bootcamps", t("footer.bootcamps")]] }
    : isInstructor()
    ? { title: t("footer.instructor"), links: [["/instructor/courses", t("footer.myCourses")], ["/instructor/courses/new", t("footer.createCourse")], ["/instructor/bootcamps", t("footer.myLives")], ["/instructor/earnings", t("footer.earnings")], ["/profile", t("footer.profile")]] }
    : user
    ? { title: t("footer.student"), links: [["/my-courses", t("footer.myCourses")], ["/courses", t("footer.catalog")], ["/bootcamps", t("footer.bootcamps")], ["/forum", t("footer.forum")], ["/profile", t("footer.profile")]] }
    : { title: t("footer.navigation"), links: [["/", t("footer.home")], ["/courses", t("footer.courses")], ["/pricing", t("footer.pricing")], ["/instructors", t("footer.instructors")], ["/become-instructor", t("footer.becomeInstructor")]] };

  const help = [["/about", t("footer.about")], ["/faq", t("footer.faq")], ["/contact", t("footer.contact")], ["/certificates/verify", t("footer.certificates")]];
  const legal = [["/privacy-policy", t("footer.privacy")], ["/terms", t("footer.terms")]];

  return (
    <footer className="bg-primary-dark text-gray-300 border-t border-primary-light text-left">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="" className="h-9 w-auto rounded" />
              <span className="text-lg font-bold text-white">DevOps <span className="text-accent">Akademy</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">{t("footer.description")}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">{nav.title}</h3>
            <ul className="space-y-2.5">{nav.links.map(([to, label]) => <li key={to}><Link to={to} className={linkCls}>{label}</Link></li>)}</ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2.5">{help.map(([to, label]) => <li key={to}><Link to={to} className={linkCls}>{label}</Link></li>)}</ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><Mail size={16} className="text-accent" />
                <a href="mailto:contact@devopsakademy.cloud" className={linkCls}>contact@devopsakademy.cloud</a></li>
              <li className="flex items-center gap-2.5"><MapPin size={16} className="text-accent" /><span className="text-sm text-gray-300">{t("footer.location")}</span></li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="https://linkedin.com/company/devops-akademy" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gray-300 hover:text-accent transition"><Linkedin size={19} /></a>
              <a href="https://youtube.com/@devopsakademy" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-gray-300 hover:text-accent transition"><Youtube size={19} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} <span className="text-accent font-semibold">DevOps Akademy</span>. {t("footer.rights")}</p>
          <ul className="flex items-center gap-5">{legal.map(([to, label]) => <li key={to}><Link to={to} className="hover:text-accent transition">{label}</Link></li>)}</ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
