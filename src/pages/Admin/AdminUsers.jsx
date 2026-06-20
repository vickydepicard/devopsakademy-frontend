// src/pages/Admin/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Users, Search, RefreshCw, Eye, Trash2, ShieldCheck,
  ShieldOff, UserCheck, UserX, ChevronDown, X, Plus,
  Mail, Calendar, BookOpen, Crown, GraduationCap, User,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────
const ROLES = {
  admin:      { label: "Admin",       icon: Crown,         color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  instructor: { label: "Instructeur", icon: UserCheck,     color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
  student:    { label: "Étudiant",    icon: GraduationCap, color: "#0f766e", bg: "#f0fdf4", border: "#a7f3d0" },
};

const roleCfg = (role) => ROLES[role] || { label: role, icon: User, color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };

const Avatar = ({ u, size = 36 }) => {
  const initials = `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase() || "?";
  const colors = ["#2d287f","#0369a1","#0f766e","#7c3aed","#be185d","#b45309"];
  const bg = colors[(u.id || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"white", fontWeight:800, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
};

const Badge = ({ role }) => {
  const cfg = roleCfg(role);
  const Icon = cfg.icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px",
      borderRadius:20, fontSize:11, fontWeight:700,
      background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}` }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ── Modal Créer/Éditer Utilisateur ───────────────────
function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    first_name:  user?.first_name  || "",
    last_name:   user?.last_name   || "",
    email:       user?.email       || "",
    role:        user?.role        || "student",
    password:    "",
    is_active:   user?.is_active   !== undefined ? user.is_active : 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handle = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setError("Prénom, nom et email sont obligatoires."); return;
    }
    if (!isEdit && !form.password) {
      setError("Mot de passe requis pour un nouvel utilisateur."); return;
    }
    setSaving(true); setError("");
    try {
      if (isEdit) {
        await api.put(`/admin/users/${user.id}`, {
          first_name: form.first_name,
          last_name:  form.last_name,
          role:       form.role,
          is_validated: form.is_active,
        });
      } else {
        await api.post("/admin/users", form);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation:"fadeIn .2s" }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ background:"linear-gradient(135deg,#1e1b4b,#2d287f)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-white font-black text-lg">
              {isEdit ? "✏️ Modifier l'utilisateur" : "➕ Nouvel utilisateur"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[["first_name","Prénom"],["last_name","Nom"]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{l} *</label>
                <input value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition"
                  placeholder={l} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({...p, email:e.target.value}))}
              disabled={isEdit}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="email@example.com" />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Mot de passe *</label>
              <input type="password" value={form.password}
                onChange={e => setForm(p => ({...p, password:e.target.value}))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition"
                placeholder="••••••••" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Rôle</label>
              <select value={form.role} onChange={e => setForm(p => ({...p, role:e.target.value}))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition">
                <option value="student">Étudiant</option>
                <option value="instructor">Instructeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Statut</label>
              <select value={form.is_active} onChange={e => setForm(p => ({...p, is_active: Number(e.target.value)}))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition">
                <option value={1}>✅ Actif</option>
                <option value={0}>❌ Inactif</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm text-red-600 font-medium"
              style={{ background:"#fef2f2", border:"1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handle} disabled={saving}
              className="flex-[2] py-3 text-white rounded-2xl font-black text-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)" }}>
              {saving ? "Sauvegarde..." : isEdit ? "Enregistrer" : "Créer l'utilisateur"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function AdminUsers() {
  const navigate  = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "create" | user object
  const [delConf, setDelConf] = useState(null); // user to delete
  const [deleting,setDeleting]= useState(false);
  const [loadError,setLoadError]= useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      const data = res.data?.data || [];
      console.log("✅ Users loaded:", data.length);
      setUsers(data);
    } catch (err) {
      console.error("❌ AdminUsers load error:", err?.response?.data || err?.message || err);
      setLoadError(err?.response?.data?.message || "Impossible de charger les utilisateurs. Vérifiez la connexion API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (u) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${u.id}`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setDelConf(null);
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}`, {
        first_name: u.first_name,
        last_name:  u.last_name,
        role:       u.role,
        is_validated: u.is_active ? 0 : 1,
      });
      setUsers(prev => prev.map(x => x.id === u.id ? {...x, is_active: x.is_active ? 0 : 1} : x));
    } catch {
      alert("Erreur lors de la mise à jour.");
    }
  };

  // Filtrage local
  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const nameMatch = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(s);
    const roleMatch = role === "all" || u.role === role;
    return nameMatch && roleMatch;
  });

  // Compteurs
  const counts = {
    all:        users.length,
    admin:      users.filter(u => u.role === "admin").length,
    instructor: users.filter(u => u.role === "instructor").length,
    student:    users.filter(u => u.role === "student").length,
    inactive:   users.filter(u => !u.is_active).length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.all} utilisateurs au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => setModal("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
            style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)" }}>
            <Plus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Admins",        val: counts.admin,       icon: Crown,         color:"#7c3aed", bg:"#f5f3ff" },
          { label:"Instructeurs",  val: counts.instructor,  icon: UserCheck,     color:"#0369a1", bg:"#eff6ff" },
          { label:"Étudiants",     val: counts.student,     icon: GraduationCap, color:"#0f766e", bg:"#f0fdf4" },
          { label:"Inactifs",      val: counts.inactive,    icon: UserX,         color:"#dc2626", bg:"#fef2f2" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 border border-gray-100 flex items-center gap-3"
            style={{ background: bg }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"white" }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color }}>{val}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[["all","Tous"],["admin","Admins"],["instructor","Instructeurs"],["student","Étudiants"]].map(([v,l]) => (
            <button key={v} onClick={() => setRole(v)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition border-2"
              style={{
                background: role === v ? "#2d287f" : "white",
                color:      role === v ? "white"   : "#6b7280",
                borderColor: role === v ? "#2d287f" : "#e5e7eb",
              }}>
              {l} <span className="opacity-60 text-xs">({counts[v] ?? users.filter(u => u.role===v).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background:"#fef2f2", border:"1px solid #fecaca" }}>
          <span className="text-red-500 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-red-800 text-sm">Erreur de chargement</p>
            <p className="text-red-600 text-xs mt-0.5">{loadError}</p>
          </div>
          <button onClick={() => { setLoadError(""); load(); }}
            className="text-xs font-bold text-red-600 underline">Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Chargement des utilisateurs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">Aucun utilisateur trouvé</p>
            {search && <p className="text-gray-400 text-sm mt-1">Essayez un autre terme de recherche</p>}
          </div>
        ) : (
          <>
            {/* Header table */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="col-span-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateur</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Statut</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Cours</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</div>
            </div>

            {/* Rows */}
            {filtered.map(u => (
              <div key={u.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center">

                {/* Utilisateur */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar u={u} size={38} />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail size={10} /> {u.email}
                    </p>
                    <p className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5">
                      <Calendar size={9} />
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </p>
                  </div>
                </div>

                {/* Rôle */}
                <div className="col-span-2">
                  <Badge role={u.role} />
                </div>

                {/* Statut */}
                <div className="col-span-2 flex justify-center">
                  <button onClick={() => handleToggleActive(u)}
                    title={u.is_active ? "Cliquer pour désactiver" : "Cliquer pour activer"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition hover:scale-105"
                    style={{
                      background:  u.is_active ? "#ecfdf5" : "#fef2f2",
                      color:       u.is_active ? "#065f46" : "#991b1b",
                      borderColor: u.is_active ? "#a7f3d0" : "#fecaca",
                    }}>
                    {u.is_active
                      ? <><ShieldCheck size={12} /> Actif</>
                      : <><ShieldOff size={12}  /> Inactif</>
                    }
                  </button>
                </div>

                {/* Cours inscrits */}
                <div className="col-span-2 flex justify-center">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <BookOpen size={14} className="text-indigo-400" />
                    {u.enrollment_count ?? "—"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-1.5">
                  <button onClick={() => navigate(`/admin/students/${u.id}`)}
                    title="Voir le profil"
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:scale-110"
                    style={{ background:"#eff6ff", color:"#0369a1" }}>
                    <Eye size={15} />
                  </button>
                  <button onClick={() => setModal(u)}
                    title="Modifier"
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:scale-110"
                    style={{ background:"#f5f3ff", color:"#7c3aed" }}>
                    <UserCheck size={15} />
                  </button>
                  {u.role !== "admin" && (
                    <button onClick={() => setDelConf(u)}
                      title="Supprimer"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:scale-110"
                      style={{ background:"#fef2f2", color:"#dc2626" }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
                {search || role !== "all" ? ` (filtre actif)` : ""}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal Créer/Éditer */}
      {modal && (
        <UserModal
          user={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {/* Modal Confirmation Suppression */}
      {delConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg">Supprimer l'utilisateur ?</h3>
              <p className="text-gray-500 text-sm mt-1">
                <strong>{delConf.first_name} {delConf.last_name}</strong> sera définitivement supprimé.
                Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDelConf(null)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={() => handleDelete(delConf)} disabled={deleting}
                className="flex-1 py-3 text-white rounded-2xl font-black text-sm transition hover:opacity-90 disabled:opacity-50"
                style={{ background:"linear-gradient(135deg,#dc2626,#ef4444)" }}>
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}