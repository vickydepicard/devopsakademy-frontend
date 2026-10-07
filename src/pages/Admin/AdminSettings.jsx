import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Settings, Save, RefreshCw, CheckCircle, AlertCircle,
  Globe, Mail, Bell, Shield, DollarSign, Zap,
  ToggleLeft, ToggleRight, Loader
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Section = ({ icon: Icon, title, desc, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
    <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="font-bold text-gray-900">{title}</p>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, name, type = "text", value, onChange, placeholder, help, disabled }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input type={type} name={name} value={value || ""} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50 disabled:cursor-not-allowed" />
    {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={onChange} className="ml-4 shrink-0">
      {checked
        ? <ToggleRight className="w-8 h-8 text-blue-600" />
        : <ToggleLeft className="w-8 h-8 text-gray-300" />
      }
    </button>
  </div>
);

const DEFAULTS = {
  // Général
  site_name: "DevOpsAkademy",
  site_url: "",
  support_email: "",
  contact_email: "",
  // Paiements
  currency: "XAF",
  currency_symbol: "FCFA",
  mobile_money_number: "",
  bank_account: "",
  // Fonctionnalités
  allow_registration: true,
  require_email_verification: true,
  allow_free_courses: true,
  allow_forum: true,
  maintenance_mode: false,
  // Notifications
  email_notifications: true,
  notify_on_enrollment: true,
  notify_on_completion: true,
  // Sécurité
  max_login_attempts: 5,
  session_timeout_hours: 24,
};

export default function AdminSettings() {
  const { t } = useTranslation("adminSettings");
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    document.title = t("parametres_admin");
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      setSettings(prev => ({ ...prev, ...(res.data?.data || {}) }));
    } catch {
      // Garde les defaults si l'endpoint n'existe pas encore
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === "checkbox" ? checked : value);
  };
  const toggle = (key) => set(key, !settings[key]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await api.patch("/admin/settings", settings);
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: "general", label: t("general"), icon: Globe },
    { key: "payments", label: t("paiements"), icon: DollarSign },
    { key: "features", label: t("fonctionnalites"), icon: Zap },
    { key: "notifications", label: t("notifications"), icon: Bell },
    { key: "security", label: t("securite"), icon: Shield },
  ];

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("parametres")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("configuration_globale_de_la_plateforme")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSettings} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("sauvegarder")}
          </button>
        </div>
      </div>

      {/* Message statut */}
      {status === "success" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />{" "}{t("parametres_enregistres_avec_succes")}</div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{" "}{t("erreur_lors_de_l_enregistrement_verifiez")}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Général */}
      {activeTab === "general" && (
        <Section icon={Globe} title={t("informations_generales")} desc={t("identite_et_coordonnees_de_la_plateforme")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("nom_de_la_plateforme")} name="site_name" value={settings.site_name} onChange={handleChange} placeholder="DevOpsAkademy" />
            <Field label={t("url_du_site")} name="site_url" type="url" value={settings.site_url} onChange={handleChange} placeholder="https://devopsakademy.com" />
            <Field label={t("email_de_support")} name="support_email" type="email" value={settings.support_email} onChange={handleChange} placeholder="support@devopsakademy.com" />
            <Field label={t("email_de_contact")} name="contact_email" type="email" value={settings.contact_email} onChange={handleChange} placeholder="contact@devopsakademy.com" />
          </div>
        </Section>
      )}

      {/* Paiements */}
      {activeTab === "payments" && (
        <Section icon={DollarSign} title={t("paiements")} desc={t("configuration_des_moyens_et_devises_de")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("devise")} name="currency" value={settings.currency} onChange={handleChange} placeholder="XAF" help={i18n.t("adminSettings:code_iso_de_la_devise_ex")} />
            <Field label={t("symbole_devise")} name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} placeholder="FCFA" />
            <Field label={t("numero_mobile_money")} name="mobile_money_number" value={settings.mobile_money_number} onChange={handleChange} placeholder={t("237_6xx_xxx_xxx")} help={i18n.t("adminSettings:numero_mtn_ou_orange_money_affiche")} />
            <Field label={t("coordonnees_bancaires")} name="bank_account" value={settings.bank_account} onChange={handleChange} placeholder={t("iban_ou_informations_virement")} />
          </div>
        </Section>
      )}

      {/* Fonctionnalités */}
      {activeTab === "features" && (
        <Section icon={Zap} title={t("fonctionnalites")} desc={t("activez_ou_desactivez_les_modules_de")}>
          <Toggle label={t("inscription_ouverte")} desc={t("les_nouveaux_utilisateurs_peuvent_creer_un")}
            checked={settings.allow_registration} onChange={() => toggle("allow_registration")} />
          <Toggle label={t("verification_email_obligatoire")} desc={t("les_comptes_doivent_confirmer_leur_email")}
            checked={settings.require_email_verification} onChange={() => toggle("require_email_verification")} />
          <Toggle label={t("cours_gratuits")} desc={t("permettre_aux_instructeurs_de_publier_des")}
            checked={settings.allow_free_courses} onChange={() => toggle("allow_free_courses")} />
          <Toggle label={t("forum_communautaire")} desc={t("activer_le_forum_de_discussion_entre")}
            checked={settings.allow_forum} onChange={() => toggle("allow_forum")} />
          <Toggle label={t("mode_maintenance")} desc={t("affiche_une_page_de_maintenance_seuls")}
            checked={settings.maintenance_mode} onChange={() => toggle("maintenance_mode")} />
          <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
            <Toggle label={t("chatTitle")} desc={t("chatDesc")}
              checked={settings.tawk_enabled} onChange={() => toggle("tawk_enabled")} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("tawkProperty")} name="tawk_property_id" value={settings.tawk_property_id} onChange={handleChange}
                placeholder="64f1a2b3c4d5e6f7a8b9c0d1" help={t("tawkHelp")} />
              <Field label={t("tawkWidget")} name="tawk_widget_id" value={settings.tawk_widget_id} onChange={handleChange} placeholder="default" />
            </div>
          </div>
        </Section>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <Section icon={Bell} title={t("notifications_email")} desc={t("gerez_les_emails_automatiques_envoyes_par")}>
          <Toggle label={t("notifications_email_activees")} desc={t("activer_desactiver_toutes_les_notifications_emai")}
            checked={settings.email_notifications} onChange={() => toggle("email_notifications")} />
          <Toggle label={t("email_lors_d_une_inscription")} desc={t("notifier_l_admin_et_l_etudiant")}
            checked={settings.notify_on_enrollment} onChange={() => toggle("notify_on_enrollment")} />
          <Toggle label={t("email_de_completion")} desc={t("envoyer_un_email_de_felicitations_lorsqu")}
            checked={settings.notify_on_completion} onChange={() => toggle("notify_on_completion")} />
        </Section>
      )}

      {/* Sécurité */}
      {activeTab === "security" && (
        <Section icon={Shield} title={t("securite")} desc={t("parametres_de_securite_et_de_session")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("tentatives_de_connexion_max")} name="max_login_attempts" type="number"
              value={settings.max_login_attempts} onChange={handleChange}
              help={i18n.t("adminSettings:nombre_d_essais_avant_blocage_temporaire")} />
            <Field label={t("expiration_de_session_heures")} name="session_timeout_hours" type="number"
              value={settings.session_timeout_hours} onChange={handleChange}
              help={i18n.t("adminSettings:duree_avant_deconnexion_automatique_pour_inactiv")} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{t("les_changements_de_securite_prennent_effet")}</p>
          </div>
        </Section>
      )}

      {/* Bouton save bas de page */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 text-sm">
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t("enregistrement") : t("sauvegarder_les_parametres")}
        </button>
      </div>
    </div>
  );
}