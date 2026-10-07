import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, BookOpen, GraduationCap, ShieldCheck, ShieldOff, Github, Linkedin, Globe, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";
import { getLocale } from "../../i18n";

const ROLE_STYLE = {
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  instructor: "bg-sky-50 text-sky-700 border-sky-200",
  student: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString(getLocale(), { day: "numeric", month: "long", year: "numeric" }) : "—");

export default function AdminUserProfile() {
  const { t } = useTranslation("adminUserProfile");
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api.get(`/admin/users/${id}/profile`)
      .then((r) => { if (alive) setData(r.data?.data || null); })
      .catch((e) => { if (alive) setError(e?.response?.status === 404 ? t("introuvable") : t("impossible_de_charger_le_profil")); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="py-20 flex justify-center text-gray-400"><Loader className="w-6 h-6 animate-spin" /></div>;
  if (error || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-700 font-semibold mb-4">{error || t("profil_indisponible")}</p>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft className="w-4 h-4" />{t("retour")}</button>
      </div>
    );
  }

  const { user, profile, teachingCourses = [], enrolledCourses = [], stats } = data;
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  const place = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const links = [
    [profile?.github_url, Github, "GitHub"],
    [profile?.linkedin_url, Linkedin, "LinkedIn"],
    [profile?.website_url, Globe, t("site_web")],
  ].filter(([u]) => u);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:underline"><ArrowLeft className="w-4 h-4" />{t("retour_aux_utilisateurs")}</Link>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl font-black flex items-center justify-center shrink-0">{initials}</div>}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 break-words">{user.first_name} {user.last_name}</h1>
            {profile?.job_title && <p className="text-sm text-gray-500 mt-0.5">{profile.job_title}{profile.company ? ` · ${profile.company}` : ""}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${ROLE_STYLE[user.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{t(`role_${user.role}`, { defaultValue: user.role })}</span>
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${user.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {user.is_active ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}{user.is_active ? t("actif") : t("inactif")}
              </span>
            </div>
          </div>
          {user.role === "student" && (
            <Link to={`/admin/students/${user.id}`} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 text-white text-sm font-bold hover:bg-indigo-800 transition">
              <GraduationCap className="w-4 h-4" />{t("suivi_pedagogique")}
            </Link>
          )}
        </div>

        <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2 min-w-0"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><a href={`mailto:${user.email}`} className="text-indigo-700 hover:underline truncate">{user.email}</a></div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-600">{t("inscrit_le")} {fmt(user.created_at)}</span></div>
          {place && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-600">{place}</span></div>}
          {profile?.company && !profile?.job_title && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-600">{profile.company}</span></div>}
        </dl>
        {profile?.bio && <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>}
        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map(([u, Icon, label]) => (
              <a key={label} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100"><Icon className="w-3.5 h-3.5" />{label}</a>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4"><p className="text-2xl font-black text-gray-900">{stats?.total_enrollments ?? 0}</p><p className="text-xs text-gray-500">{t("cours_suivis")}</p></div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4"><p className="text-2xl font-black text-gray-900">{stats?.avg_completion ?? 0}%</p><p className="text-xs text-gray-500">{t("progression_moyenne")}</p></div>
      </div>

      {enrolledCourses.length > 0 && (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-5 py-3.5 border-b border-gray-100 font-bold text-gray-900 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-600" />{t("cours_suivis")}</h2>
          <ul className="divide-y divide-gray-50">
            {enrolledCourses.map((c) => (
              <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-800 truncate">{c.title}</span>
                <span className="text-xs font-bold text-indigo-700 shrink-0">{Math.round(Number(c.completion_percentage) || 0)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {teachingCourses.length > 0 && (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-5 py-3.5 border-b border-gray-100 font-bold text-gray-900 text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4 text-indigo-600" />{t("cours_enseignes")}</h2>
          <ul className="divide-y divide-gray-50">
            {teachingCourses.map((c) => (
              <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-800 truncate">{c.title}</span>
                <span className={`text-xs font-semibold shrink-0 ${c.is_published ? "text-emerald-600" : "text-gray-400"}`}>{c.is_published ? t("publie") : t("brouillon")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
