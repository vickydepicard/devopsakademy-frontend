import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Settings, Save, RefreshCw, CheckCircle, AlertCircle,
  Globe, Mail, Bell, Shield, DollarSign, Zap,
  ToggleLeft, ToggleRight, Loader
} from "lucide-react";

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
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    document.title = "Paramètres — Admin";
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
    { key: "general", label: "Général", icon: Globe },
    { key: "payments", label: "Paiements", icon: DollarSign },
    { key: "features", label: "Fonctionnalités", icon: Zap },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Sécurité", icon: Shield },
  ];

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configuration globale de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSettings} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Message statut */}
      {status === "success" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Paramètres enregistrés avec succès !
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> Erreur lors de l'enregistrement. Vérifiez l'API.
        </div>
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
        <Section icon={Globe} title="Informations générales" desc="Identité et coordonnées de la plateforme">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom de la plateforme" name="site_name" value={settings.site_name} onChange={handleChange} placeholder="DevOpsAkademy" />
            <Field label="URL du site" name="site_url" type="url" value={settings.site_url} onChange={handleChange} placeholder="https://devopsakademy.com" />
            <Field label="Email de support" name="support_email" type="email" value={settings.support_email} onChange={handleChange} placeholder="support@devopsakademy.com" />
            <Field label="Email de contact" name="contact_email" type="email" value={settings.contact_email} onChange={handleChange} placeholder="contact@devopsakademy.com" />
          </div>
        </Section>
      )}

      {/* Paiements */}
      {activeTab === "payments" && (
        <Section icon={DollarSign} title="Paiements" desc="Configuration des moyens et devises de paiement">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Devise" name="currency" value={settings.currency} onChange={handleChange} placeholder="XAF" help="Code ISO de la devise (ex: XAF, EUR, USD)" />
            <Field label="Symbole devise" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} placeholder="FCFA" />
            <Field label="Numéro Mobile Money" name="mobile_money_number" value={settings.mobile_money_number} onChange={handleChange} placeholder="+237 6XX XXX XXX" help="Numéro MTN ou Orange Money affiché aux étudiants" />
            <Field label="Coordonnées bancaires" name="bank_account" value={settings.bank_account} onChange={handleChange} placeholder="IBAN ou informations virement" />
          </div>
        </Section>
      )}

      {/* Fonctionnalités */}
      {activeTab === "features" && (
        <Section icon={Zap} title="Fonctionnalités" desc="Activez ou désactivez les modules de la plateforme">
          <Toggle label="Inscription ouverte" desc="Les nouveaux utilisateurs peuvent créer un compte"
            checked={settings.allow_registration} onChange={() => toggle("allow_registration")} />
          <Toggle label="Vérification email obligatoire" desc="Les comptes doivent confirmer leur email avant de se connecter"
            checked={settings.require_email_verification} onChange={() => toggle("require_email_verification")} />
          <Toggle label="Cours gratuits" desc="Permettre aux instructeurs de publier des cours gratuits"
            checked={settings.allow_free_courses} onChange={() => toggle("allow_free_courses")} />
          <Toggle label="Forum communautaire" desc="Activer le forum de discussion entre apprenants et instructeurs"
            checked={settings.allow_forum} onChange={() => toggle("allow_forum")} />
          <Toggle label="Mode maintenance" desc="Affiche une page de maintenance — seuls les admins peuvent se connecter"
            checked={settings.maintenance_mode} onChange={() => toggle("maintenance_mode")} />
        </Section>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <Section icon={Bell} title="Notifications email" desc="Gérez les emails automatiques envoyés par la plateforme">
          <Toggle label="Notifications email activées" desc="Activer/désactiver toutes les notifications email"
            checked={settings.email_notifications} onChange={() => toggle("email_notifications")} />
          <Toggle label="Email lors d'une inscription" desc="Notifier l'admin et l'étudiant lors d'une nouvelle inscription"
            checked={settings.notify_on_enrollment} onChange={() => toggle("notify_on_enrollment")} />
          <Toggle label="Email de complétion" desc="Envoyer un email de félicitations lorsqu'un cours est terminé"
            checked={settings.notify_on_completion} onChange={() => toggle("notify_on_completion")} />
        </Section>
      )}

      {/* Sécurité */}
      {activeTab === "security" && (
        <Section icon={Shield} title="Sécurité" desc="Paramètres de sécurité et de session">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tentatives de connexion max" name="max_login_attempts" type="number"
              value={settings.max_login_attempts} onChange={handleChange}
              help="Nombre d'essais avant blocage temporaire du compte" />
            <Field label="Expiration de session (heures)" name="session_timeout_hours" type="number"
              value={settings.session_timeout_hours} onChange={handleChange}
              help="Durée avant déconnexion automatique pour inactivité" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Les changements de sécurité prennent effet immédiatement et peuvent déconnecter des sessions actives.</p>
          </div>
        </Section>
      )}

      {/* Bouton save bas de page */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 text-sm">
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Enregistrement…" : "Sauvegarder les paramètres"}
        </button>
      </div>
    </div>
  );
}