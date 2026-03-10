// src/pages/Profile/UserProfile.jsx
import { useState, useEffect } from "react";
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  User, CreditCard, Award, Edit3, Save, X, Github, Linkedin,
  Globe, MapPin, Briefcase, Mail, Calendar, Shield, CheckCircle,
  Clock, XCircle, FileText, Download, Upload, Eye, BookOpen,
  Lock, AlertCircle, Star, Trophy, RefreshCw, Phone, Building,
  BadgeCheck, ExternalLink
} from "lucide-react";

/* ── helpers ── */
const STATUS = {
  free:     { label:"Accès gratuit",  color:"text-emerald-600 bg-emerald-50 border-emerald-100", icon:CheckCircle },
  verified: { label:"Validé",         color:"text-emerald-600 bg-emerald-50 border-emerald-100", icon:CheckCircle },
  pending:  { label:"En vérification",color:"text-amber-600 bg-amber-50 border-amber-100",        icon:Clock },
  rejected: { label:"Refusé",         color:"text-red-600 bg-red-50 border-red-100",              icon:XCircle },
  default:  { label:"Non payé",       color:"text-gray-500 bg-gray-50 border-gray-100",           icon:Lock },
};

const TAB_ICONS = {
  profile:    User,
  payments:   CreditCard,
  certificates: Award,
};

/* ── Field component ── */
function Field({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ── Input component ── */
function Input({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition" />
    </div>
  );
}

/* ── Textarea ── */
function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition" />
    </div>
  );
}

/* ──────────────────────────── MAIN ──────────────────────────── */
export default function UserProfile() {
  const { profile, loading, error, saving, updateProfile, fetchProfile } = useProfile();
  const { user } = useAuth();

  const [tab, setTab]       = useState("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm]     = useState({});
  const [saveMsg, setSaveMsg] = useState("");

  // Données paiements et certificats
  const [enrollments,   setEnrollments]   = useState([]);
  const [certificates,  setCertificates]  = useState([]);
  const [loadingData,   setLoadingData]   = useState(false);

  useEffect(() => {
    if (tab === "payments" || tab === "certificates") fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [enrollRes, certRes] = await Promise.all([
        api.get("/enrollments/me").catch(() => ({ data: { data: [] } })),
        api.get("/certificates/my").catch(() => ({ data: { data: [] } })),
      ]);
      setEnrollments(enrollRes.data?.data || []);
      setCertificates(certRes.data?.data || []);
    } catch (err) {
      console.error("Profile data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = () => {
    setForm({
      first_name:   profile?.first_name   || "",
      last_name:    profile?.last_name    || "",
      bio:          profile?.bio          || "",
      job_title:    profile?.job_title    || "",
      company:      profile?.company      || "",
      phone:        profile?.phone        || "",
      github_url:   profile?.github_url   || "",
      linkedin_url: profile?.linkedin_url || "",
      website_url:  profile?.website_url  || "",
      country:      profile?.country      || "",
      city:         profile?.city         || "",
    });
    setEditing(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    const result = await updateProfile(form);
    if (result?.success) {
      setSaveMsg("✅ Profil mis à jour !");
      setEditing(false);
      fetchProfile();
    } else {
      setSaveMsg(`❌ ${result?.message || "Erreur"}`);
    }
  };

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const fullName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "...";
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const avatar   = profile?.avatar_url;

  const ROLE_STYLE = {
    admin:       "bg-red-100 text-red-700 border-red-200",
    superadmin:  "bg-red-100 text-red-700 border-red-200",
    instructor:  "bg-purple-100 text-purple-700 border-purple-200",
    student:     "bg-blue-100 text-blue-700 border-blue-200",
  };
  const ROLE_LABEL = { admin:"Administrateur", superadmin:"Super Admin", instructor:"Instructeur", student:"Étudiant" };

  const TABS = [
    { key:"profile",      label:"Mon profil",    icon:User },
    { key:"payments",     label:"Paiements",     icon:CreditCard },
    { key:"certificates", label:"Certificats",   icon:Award },
  ];

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-700 font-bold mb-3">{error}</p>
        <button onClick={fetchProfile} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition">
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* ── Header profil ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4c1d95] px-6 py-6 flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {avatar ? (
              <img src={avatar} alt={fullName}
                className="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl border-2 border-white/30 shadow-xl">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#1e1b4b]" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-xl">{fullName}</h1>
            {profile?.job_title && <p className="text-indigo-200 text-sm mt-0.5">{profile.job_title}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${ROLE_STYLE[profile?.role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {ROLE_LABEL[profile?.role] || profile?.role}
              </span>
              {profile?.country && (
                <span className="text-xs text-indigo-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.country}
                </span>
              )}
              {profile?.created_at && (
                <span className="text-xs text-indigo-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month:"long", year:"numeric" })}
                </span>
              )}
            </div>
          </div>

          {!editing && (
            <button onClick={handleEdit}
              className="flex-shrink-0 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Edit3 className="w-3.5 h-3.5" /> Modifier
            </button>
          )}
        </div>

        {/* Liens sociaux */}
        {(profile?.github_url || profile?.linkedin_url || profile?.website_url) && (
          <div className="px-6 py-3 border-b border-gray-50 flex gap-3 flex-wrap">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-semibold text-blue-700 transition">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 transition">
                <Globe className="w-3.5 h-3.5" /> Site web
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-1.5 mb-5">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-indigo-700 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ════════════ ONGLET PROFIL ════════════ */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {editing ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-800">Modifier mon profil</h2>
                <button onClick={() => setEditing(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prénom" value={form.first_name} onChange={set("first_name")} required />
                  <Input label="Nom"    value={form.last_name}  onChange={set("last_name")}  required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Poste / Titre"  value={form.job_title}   onChange={set("job_title")}   placeholder="Ex: DevOps Engineer" />
                  <Input label="Entreprise"     value={form.company}     onChange={set("company")}     placeholder="Ex: CloudTech" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Pays"           value={form.country}     onChange={set("country")}     placeholder="Ex: France" />
                  <Input label="Ville"          value={form.city}        onChange={set("city")}        placeholder="Ex: Paris" />
                </div>
                <Input label="Téléphone"        value={form.phone}       onChange={set("phone")}       type="tel" placeholder="+33 6 00 00 00 00" />
                <Textarea label="Bio"           value={form.bio}         onChange={set("bio")}         placeholder="Parlez de vous, de vos compétences..." />

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Liens professionnels</p>
                  <div className="space-y-3">
                    <Input label="GitHub"   value={form.github_url}   onChange={set("github_url")}   type="url" placeholder="https://github.com/..." />
                    <Input label="LinkedIn" value={form.linkedin_url} onChange={set("linkedin_url")} type="url" placeholder="https://linkedin.com/in/..." />
                    <Input label="Site web" value={form.website_url}  onChange={set("website_url")}  type="url" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {saveMsg && (
                <p className={`mt-4 text-sm font-semibold ${saveMsg.startsWith("✅") ? "text-emerald-600" : "text-red-600"}`}>
                  {saveMsg}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {saveMsg && <p className="text-emerald-600 text-sm font-semibold mb-4">{saveMsg}</p>}
              <div className="space-y-0">
                <Field label="Email"        value={profile?.email}      icon={Mail} />
                <Field label="Téléphone"    value={profile?.phone}      icon={Phone} />
                <Field label="Entreprise"   value={profile?.company}    icon={Building} />
                <Field label="Poste"        value={profile?.job_title}  icon={Briefcase} />
                <Field label="Pays"         value={profile?.country}    icon={MapPin} />
                <Field label="Ville"        value={profile?.city}       icon={MapPin} />
              </div>
              {profile?.bio && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {!profile?.bio && !profile?.company && !profile?.phone && (
                <div className="text-center py-8">
                  <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Complétez votre profil pour le rendre plus attractif</p>
                  <button onClick={handleEdit}
                    className="mt-3 px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-bold hover:bg-indigo-800 transition">
                    Compléter mon profil
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════ ONGLET PAIEMENTS ════════════ */}
      {tab === "payments" && (
        <div className="space-y-4">
          {loadingData ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-700">Aucun paiement enregistré</p>
              <p className="text-gray-400 text-sm mt-1">Vos paiements de cours apparaîtront ici</p>
            </div>
          ) : (
            <>
              {/* Résumé stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Total inscriptions", value:enrollments.length,                                                    color:"text-indigo-600 bg-indigo-50 border-indigo-100" },
                  { label:"Validés",             value:enrollments.filter(e => ["free","verified"].includes(e.payment_status)).length, color:"text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { label:"En attente",          value:enrollments.filter(e => e.payment_status === "pending").length,        color:"text-amber-600 bg-amber-50 border-amber-100" },
                ].map(s => (
                  <div key={s.label} className={`border rounded-xl px-4 py-3 ${s.color}`}>
                    <div className="text-2xl font-black">{s.value}</div>
                    <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Liste des paiements */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-sm">Détail de mes inscriptions</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {enrollments.map(enr => {
                    const st = STATUS[enr.payment_status] || STATUS.default;
                    const StIcon = st.icon;
                    const pct = enr.total_lessons > 0
                      ? Math.round(((enr.completed_lessons || 0) / enr.total_lessons) * 100)
                      : Number(enr.completion_percentage || 0);

                    return (
                      <div key={enr.id} className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 flex items-center justify-center">
                            {enr.thumbnail_url
                              ? <img src={enr.thumbnail_url} alt="" className="w-full h-full object-cover"
                                  onError={e => e.target.style.display="none"} />
                              : <BookOpen className="w-5 h-5 text-indigo-300" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{enr.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${st.color}`}>
                                <StIcon className="w-2.5 h-2.5" /> {st.label}
                              </span>
                              {enr.enrollment_type && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <CreditCard className="w-2.5 h-2.5" />
                                  {enr.enrollment_type === "individual" ? "Individuel" :
                                   enr.enrollment_type === "free"       ? "Gratuit" :
                                   enr.enrollment_type === "subscription"? "Abonnement" : enr.enrollment_type}
                                </span>
                              )}
                              {enr.enrolled_at && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {new Date(enr.enrolled_at).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </div>

                            {/* Progression */}
                            {["free","verified"].includes(enr.payment_status) && enr.is_approved && (
                              <div className="mt-2">
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    style={{ width:`${pct}%` }} />
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{pct}% · {enr.completed_lessons||0}/{enr.total_lessons||0} leçons</p>
                              </div>
                            )}

                            {/* Preuve de paiement */}
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {enr.payment_proof_url && (
                                <a href={enr.payment_proof_url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition">
                                  <FileText className="w-3 h-3" /> Voir ma preuve de paiement
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {enr.approved_at && (
                                <span className="text-xs text-emerald-600 flex items-center gap-1">
                                  <BadgeCheck className="w-3 h-3" />
                                  Validé le {new Date(enr.approved_at).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Moyens de paiement acceptés */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Moyens de paiement acceptés
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name:"Virement bancaire",     icon:"🏦", desc:"Virement SWIFT/SEPA" },
                      { name:"Mobile Money",          icon:"📱", desc:"Orange Money, MTN, Wave" },
                      { name:"Western Union",         icon:"🌍", desc:"Transfert international" },
                      { name:"PayPal",                icon:"💙", desc:"Paiement en ligne sécurisé" },
                      { name:"Carte bancaire",        icon:"💳", desc:"Visa, Mastercard" },
                      { name:"Dépôt espèces",         icon:"💵", desc:"Agences partenaires" },
                    ].map(m => (
                      <div key={m.name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-xl mb-1">{m.icon}</div>
                        <p className="font-bold text-gray-800 text-xs">{m.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Après paiement, <strong>envoyez votre preuve</strong> (capture d'écran ou reçu) via le bouton "Upload preuve"
                      sur la page de votre cours. L'équipe valide sous <strong>24-48h ouvrées</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════ ONGLET CERTIFICATS ════════════ */}
      {tab === "certificates" && (
        <div className="space-y-4">
          {loadingData ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-700">Aucun certificat pour l'instant</p>
              <p className="text-gray-400 text-sm mt-1">Terminez un cours pour obtenir votre certificat</p>
              <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-left max-w-sm mx-auto">
                <p className="text-xs font-bold text-indigo-800 mb-2">Comment obtenir un certificat ?</p>
                <ol className="text-xs text-indigo-700 space-y-1 list-decimal list-inside">
                  <li>Accédez à votre cours</li>
                  <li>Complétez toutes les leçons</li>
                  <li>Atteignez 100% de progression</li>
                  <li>Votre certificat est généré automatiquement</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-indigo-900" />
                </div>
                <div>
                  <p className="font-black text-amber-900">{certificates.length} certificat{certificates.length > 1 ? "s" : ""} obtenu{certificates.length > 1 ? "s" : ""}</p>
                  <p className="text-amber-700 text-xs">Bravo pour votre engagement dans l'apprentissage DevOps !</p>
                </div>
              </div>

              <div className="grid gap-3">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="flex items-center gap-4 p-5">
                      {/* Badge */}
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Award className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 truncate">{cert.course_title || "Cours complété"}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            Obtenu le {new Date(cert.issued_at).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}
                          </span>
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                            {cert.certificate_number}
                          </span>
                        </div>
                        {cert.is_revoked && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-2.5 h-2.5" /> Révoqué
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {cert.pdf_url && !cert.is_revoked && (
                          <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition">
                            <Download className="w-3 h-3" /> Télécharger
                          </a>
                        )}
                        <a href={`/certificates/verify/${cert.certificate_number}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition">
                          <Eye className="w-3 h-3" /> Vérifier
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}