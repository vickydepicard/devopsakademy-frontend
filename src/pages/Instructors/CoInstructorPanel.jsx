// src/pages/Instructors/CoInstructorPanel.jsx — DevOpsAkademy
// Panneau de gestion des co-instructeurs sur un cours
// Intégrer dans la page CourseForm (onglet Paramètres) ou en page dédiée

import { useState, useEffect } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users, Plus, Trash2, Edit3, Check, X, Mail,
  Loader, AlertCircle, ChevronDown, Award, Clock
} from "lucide-react";

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" };

const STATUS_BADGE = {
  pending:  { label: "Invitation envoyée", cls: "bg-amber-100 text-amber-700" },
  accepted: { label: "Actif",              cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Décliné",            cls: "bg-red-100 text-red-600" },
};

export default function CoInstructorPanel({ courseId, isOwner = false }) {
  const { user }      = useAuth();
  const [list,        setList]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [instructors, setInstructors] = useState([]); // Liste instructeurs disponibles
  const [err,         setErr]         = useState("");
  const [success,     setSuccess]     = useState("");

  const [form, setForm] = useState({ instructor_id: "", commission_rate: "0" });
  const [editId,   setEditId]   = useState(null);
  const [editRate, setEditRate] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const canManage = isOwner || isAdmin;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}/co-instructors`);
      setList(res.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const loadInstructors = async () => {
    try {
      // Récupérer tous les instructeurs actifs
      const res = await api.get("/users?role=instructor&is_active=1&limit=100");
      setInstructors(res.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    load();
    if (canManage) loadInstructors();
  }, [courseId]);

  const handleAdd = async () => {
    if (!form.instructor_id) { setErr("Sélectionnez un instructeur"); return; }
    setAdding(true); setErr(""); setSuccess("");
    try {
      await api.post(`/courses/${courseId}/co-instructors`, {
        instructor_id: parseInt(form.instructor_id),
        commission_rate: parseFloat(form.commission_rate) || 0,
      });
      setSuccess("Invitation envoyée !");
      setForm({ instructor_id: "", commission_rate: "0" });
      setShowForm(false);
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Erreur lors de l'invitation");
    } finally { setAdding(false); }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Retirer ${name} comme co-instructeur ?`)) return;
    try {
      await api.delete(`/courses/${courseId}/co-instructors/${id}`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur");
    }
  };

  const handleUpdateRate = async (id) => {
    try {
      await api.patch(`/courses/${courseId}/co-instructors/${id}`, {
        commission_rate: parseFloat(editRate) || 0,
      });
      setEditId(null);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur");
    }
  };

  // Filtrer les instructeurs déjà invités
  const existingIds = new Set(list.map(e => e.instructor_id));
  const available   = instructors.filter(i => !existingIds.has(i.id) && i.id !== user?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: C.light }} />
          <h3 className="font-black text-gray-800 text-sm">Co-instructeurs</h3>
          {list.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">{list.length}</span>
          )}
        </div>
        {canManage && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
            <Plus className="w-3.5 h-3.5" /> Inviter
          </button>
        )}
      </div>

      {/* Feedback */}
      {err && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-red-600 text-xs">{err}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700 text-xs font-semibold">{success}</p>
        </div>
      )}

      {/* Formulaire invitation */}
      {showForm && canManage && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-black text-indigo-700">Inviter un co-instructeur</p>
          <select value={form.instructor_id} onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))}
            className="w-full px-3 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
            <option value="">-- Sélectionner un instructeur --</option>
            {available.map(i => (
              <option key={i.id} value={i.id}>{i.first_name} {i.last_name} ({i.email})</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-600 mb-1 block">Commission (%)</label>
              <input type="number" min="0" max="100" step="0.5"
                value={form.commission_rate}
                onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))}
                className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white"
                placeholder="0" />
            </div>
            <div className="flex gap-2 pt-5">
              <button onClick={() => { setShowForm(false); setErr(""); }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={handleAdd} disabled={adding}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 disabled:opacity-60 transition"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                {adding ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Envoyer l'invitation
              </button>
            </div>
          </div>
          <p className="text-[10px] text-indigo-500">
            L'instructeur recevra un email et devra accepter l'invitation.
          </p>
        </div>
      )}

      {/* Liste co-instructeurs */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
          <p className="text-xs">Aucun co-instructeur sur ce cours.</p>
          {canManage && <p className="text-xs mt-1">Invitez un instructeur pour collaborer.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(entry => {
            const badge = STATUS_BADGE[entry.status] || STATUS_BADGE.pending;
            return (
              <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                  {entry.first_name?.[0]}{entry.last_name?.[0]}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{entry.first_name} {entry.last_name}</p>
                  <p className="text-xs text-gray-400">{entry.email}</p>
                </div>

                {/* Commission */}
                <div className="shrink-0">
                  {editId === entry.id ? (
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="0" max="100" step="0.5"
                        value={editRate} onChange={e => setEditRate(e.target.value)}
                        className="w-16 px-2 py-1 border border-indigo-300 rounded-lg text-xs text-center focus:outline-none"
                        autoFocus />
                      <span className="text-xs text-gray-500">%</span>
                      <button onClick={() => handleUpdateRate(entry.id)}
                        className="p-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="p-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black" style={{ color: C.light }}>{entry.commission_rate}%</span>
                      {canManage && (
                        <button onClick={() => { setEditId(entry.id); setEditRate(String(entry.commission_rate)); }}
                          className="p-1 rounded text-gray-400 hover:text-indigo-600 transition">
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Statut */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>

                {/* Supprimer */}
                {(canManage || entry.instructor_id === user?.id) && (
                  <button onClick={() => handleRemove(entry.id, `${entry.first_name} ${entry.last_name}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info modèle de commission */}
      <div className="rounded-xl p-3 flex items-start gap-2 bg-blue-50 border border-blue-100">
        <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-600 leading-relaxed">
          La commission de chaque co-instructeur est déduite de la commission globale du cours.
          Le propriétaire du cours gère la répartition. Les modifications sont effectives immédiatement.
        </p>
      </div>
    </div>
  );
}