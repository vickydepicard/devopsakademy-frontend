import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Mail, BookOpen } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ContactSuccess() {
  const { t, i18n } = useTranslation("contact");
  const navigate = useNavigate();
  const [count, setCount] = useState(6);

  useEffect(() => {
    document.title = t("meta.successTitle");
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(interval); navigate("/"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, t, i18n.language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1b5a] via-[#2d287f] to-[#3b3aab] flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">

        {/* Icône succès */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-black text-[#1f1b5a] mb-3">
          {t("success.title")}
        </h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          {t("success.thanks")} <strong className="text-[#1f1b5a]">{t("success.delay")}</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          {t("success.confirmation")}
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <Link to="/courses"
            className="w-full py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
            <BookOpen className="w-5 h-5" /> {t("success.explore")} <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => navigate("/")}
            className="w-full py-3 rounded-2xl border-2 border-[#2d287f]/25 text-[#2d287f] font-semibold text-sm hover:border-[#2d287f] hover:bg-[#2d287f]/5 transition">
            {t("success.home")}
          </button>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
            {count}
          </div>
          {t("success.redirect", { count })}
        </div>

        {/* Contact direct */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Mail className="w-3.5 h-3.5" />
          {t("success.urgent")} <a href="mailto:contact@devopsakademy.cloud" className="text-[#2d287f] font-semibold hover:underline">contact@devopsakademy.cloud</a>
        </div>
      </div>
    </div>
  );
}