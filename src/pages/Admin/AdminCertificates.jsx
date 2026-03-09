import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Award, Search, Plus, Eye, Download, Trash2,
  CheckCircle, RefreshCw, X, Copy, ExternalLink, Loader
} from "lucide-react";

const IssueModal = ({ onClose, onIssue }) => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ user_id: "", course_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get("/admin/users?role=student"),
      api.get("/admin/courses"),
    ]).then(([usersRes, coursesRes]) => {
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data?.data || []);
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.data?.data || []);
    });
  }, []);

  const handleIssue = async () => {
    if (!form.user_id || !form.course_id) { alert("Sélectionnez un utilisateur et un cours."); return; }
    setSaving(true);
    await onIssue(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Émettre un certificat</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Étudiant *</label>
          <select value={form.user_id} onChange={(e) => setForm(p => ({ ...p, user_id: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
            <option value="">Sélectionner un étudiant</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cours *</label>
          <select value={form.course_id} onChange={(e) => setForm(p => ({ ...p, course_id: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
            <option value="">Sélectionner un cours</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleIssue} disabled={saving || !form.user_id || !form.course_id}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Award className="w-4 h-4" />}
            {saving ? "Génération…" : "Émettre"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CertPreview = ({ cert, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cert.certificate_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg overflow-hidden">
        {/* Certificat visuel */}
        <div className="bg-gradient-to-br from-[#0B1B3A] via-primary to-indigo-800 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Certificat de complétion</p>
          <h2 className="text-xl font-extrabold mb-1">DevOpsAkademy</h2>
          <div className="my-4 border-t border-white/20" />
          <p className="text-sm text-white/70 mb-1">Décerné à</p>
          <p className="text-2xl font-bold text-yellow-400">{cert.first_name} {cert.last_name}</p>
          <p className="text-sm text-white/70 mt-2">pour avoir complété</p>
          <p className="text-lg font-semibold mt-1 px-4">{cert.course_title}</p>
          <p className="text-xs text-white/50 mt-4">
            {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </p>
        </div>
        {/* Numéro + actions */}
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Numéro de certificat</p>
              <p className="font-mono font-bold text-gray-800 text-sm">{cert.certificate_number}</p>
            </div>
            <button onClick={copy} className={`p-2 rounded-lg transition ${copied ? "text-emerald-500 bg-emerald-50" : "text-gray-400 hover:bg-gray-200"}`}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-3 justify-end">
            {cert.certificate_url && (
              <a href={cert.certificate_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                <ExternalLink className="w-4 h-4" /> Voir PDF
              </a>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issueModal, setIssueModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = "Certificats — Admin";
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/certificates");
      setCerts(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleIssue = async (form) => {
    try {
      await api.post("/admin/certificates/issue", form);
      await fetchCerts();
      setIssueModal(false);
      alert("✅ Certificat émis avec succès !");
    } catch { alert("Erreur lors de l'émission."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Révoquer ce certificat ? Cette action est irréversible.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/certificates/${id}`);
      setCerts(prev => prev.filter(c => c.id !== id));
    } catch { alert("Erreur."); }
    setDeletingId(null);
  };

  const filtered = certs.filter(c => {
    const text = `${c.first_name} ${c.last_name} ${c.email} ${c.course_title} ${c.certificate_number}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      {issueModal && <IssueModal onClose={() => setIssueModal(false)} onIssue={handleIssue} />}
      {preview && <CertPreview cert={preview} onClose={() => setPreview(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificats</h1>
          <p className="text-gray-500 text-sm mt-0.5">{certs.length} certificat{certs.length > 1 ? "s" : ""} émis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCerts} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setIssueModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md text-sm">
            <Plus className="w-4 h-4" /> Émettre un certificat
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, cours ou numéro…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">Aucun certificat trouvé</p>
          <button onClick={() => setIssueModal(true)} className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-xl text-sm hover:-translate-y-0.5 transition">
            <Plus className="w-4 h-4" /> Émettre le premier certificat
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Étudiant", "Cours", "Numéro", "Date d'émission", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(cert => (
                  <tr key={cert.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {cert.first_name?.[0]}{cert.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{cert.first_name} {cert.last_name}</p>
                          <p className="text-xs text-gray-400">{cert.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium max-w-[180px] truncate">{cert.course_title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{cert.certificate_number}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setPreview(cert)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cert.id)} disabled={deletingId === cert.id}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Révoquer">
                          {deletingId === cert.id
                            ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}