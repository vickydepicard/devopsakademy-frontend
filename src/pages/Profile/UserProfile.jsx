// src/pages/profile/UserProfile.jsx
import { useState } from "react"
import { useProfile } from "../../contexts/ProfileContext"
import { useAuth } from "../../contexts/AuthContext"

const UserProfile = () => {
  const { profile, loading, error, saving, updateProfile, fetchProfile } = useProfile()
  const { getFullName } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [form, setForm] = useState({})

  // ── Ouvrir l'édition ──────────────────────────────────────
  const handleEdit = () => {
    setForm({
      first_name:   profile?.first_name  || "",
      last_name:    profile?.last_name   || "",
      bio:          profile?.bio         || "",
      job_title:    profile?.job_title   || "",
      company:      profile?.company     || "",
      github_url:   profile?.github_url  || "",
      linkedin_url: profile?.linkedin_url || "",
      country:      profile?.country     || "",
    })
    setEditing(true)
    setSaveMsg("")
  }

  // ── Sauvegarder ───────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    const result = await updateProfile(form)
    if (result?.success) {
      setSaveMsg("✅ Profil mis à jour !")
      setEditing(false)
      fetchProfile()
    } else {
      setSaveMsg(`❌ ${result?.message || "Erreur"}`)
    }
  }

  // ── États ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Erreur de chargement du profil</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-500">
        Aucune donnée disponible
      </div>
    )
  }

  // ── Formulaire d'édition ──────────────────────────────────
  if (editing) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-6">Modifier mon profil</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input
                type="text"
                value={form.job_title}
                onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
                placeholder="Ex: DevOps Engineer"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                placeholder="Parlez de vous..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  type="url"
                  value={form.github_url}
                  onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                placeholder="Ex: France"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                {saveMsg}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── Vue profil ────────────────────────────────────────────
  const roleColors = {
    admin:       "bg-red-100 text-red-700",
    superadmin:  "bg-red-100 text-red-700",
    instructor:  "bg-purple-100 text-purple-700",
    student:     "bg-blue-100 text-blue-700",
  }
  const roleLabels = {
    admin:      "Administrateur",
    superadmin: "Super Admin",
    instructor: "Instructeur",
    student:    "Étudiant",
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-700 px-6 py-8 flex items-center gap-5">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=6366f1&color=fff&size=96`}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">
              {profile.first_name} {profile.last_name}
            </h2>
            {profile.job_title && (
              <p className="text-indigo-200 text-sm mt-1">{profile.job_title}</p>
            )}
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${roleColors[profile.role] || "bg-gray-100 text-gray-700"}`}>
              {roleLabels[profile.role] || profile.role}
            </span>
          </div>
          <button
            onClick={handleEdit}
            className="ml-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-lg text-sm transition"
          >
            ✏️ Modifier
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5">

          {/* Infos de base */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Email"      value={profile.email} />
            <InfoRow label="Pays"       value={profile.country} />
            <InfoRow label="Entreprise" value={profile.company} />
            <InfoRow label="Membre depuis" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : null} />
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Liens */}
          {(profile.github_url || profile.linkedin_url) && (
            <div className="flex gap-3 flex-wrap">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
                  🐙 GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition">
                  💼 LinkedIn
                </a>
              )}
            </div>
          )}

          {/* Message succès après sauvegarde */}
          {saveMsg && (
            <p className="text-green-600 text-sm font-medium">{saveMsg}</p>
          )}

        </div>
      </div>
    </div>
  )
}

// Composant helper
const InfoRow = ({ label, value }) => {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-800 text-sm">{value}</p>
    </div>
  )
}

export default UserProfile