// Demandes de collaboration : rejoindre un cours existant comme co-instructeur ou assistant.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Search, Send } from "lucide-react";
import api from "../../api/api";
import { formatDate } from "../../utils/format";

const TONE = { pending: "bg-amber-100 text-amber-700", accepted: "bg-emerald-100 text-emerald-700", declined: "bg-red-100 text-red-600", withdrawn: "bg-gray-100 text-gray-500" };
const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function InstructorCollaborations() {
  const { t } = useTranslation("instructorProgram");
  const [reqs, setReqs] = useState(null);
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);   // { course, role, message }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const loadReqs = useCallback(() => api.get("/instructor-program/collab/requests").then((r) => setReqs(r.data.data)).catch(() => setReqs([])), []);
  const loadCourses = useCallback(() => api.get("/instructor-program/collab/courses", { params: { search: q || undefined } }).then((r) => setCourses(r.data.data)).catch(() => setCourses([])), [q]);

  useEffect(() => { document.title = `${t("collab_page_title")} — DevOpsAkademy`; loadReqs(); }, [loadReqs, t]);
  useEffect(() => { const h = setTimeout(loadCourses, 250); return () => clearTimeout(h); }, [loadCourses]);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      await api.post("/instructor-program/collab/requests", { course_id: form.course.id, role: form.role, message: form.message.trim() });
      setForm(null); loadReqs(); loadCourses();
    } catch (e) { setErr(e?.response?.data?.message || t("error_generic")); }
    finally { setBusy(false); }
  };
  const withdraw = async (id) => { try { await api.delete(`/instructor-program/collab/requests/${id}`); loadReqs(); loadCourses(); } catch { /* non bloquant */ } };

  return (
    <div className="max-w-5xl space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("collab_page_title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("collab_page_subtitle")}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <h2 className="px-5 py-3 text-sm font-bold text-gray-900 border-b border-gray-100">{t("collab_my_requests")}</h2>
        <div className="p-5">
          {!reqs ? <div className="flex justify-center py-6"><Loader className="w-5 h-5 animate-spin text-primary" /></div> : reqs.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">{t("collab_none")}</p> : (
            <ul className="divide-y divide-gray-100">
              {reqs.map((r) => (
                <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.course_title}</p>
                    <p className="text-xs text-gray-500">{t(`role_${r.role}`)} · {formatDate(r.created_at)}</p>
                    {r.response_note && <p className="text-xs text-gray-600 mt-1">{t("response_note")} : {r.response_note}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TONE[r.status]}`}>{t(`collab_status_${r.status}`)}</span>
                    {r.status === "pending" && <button type="button" onClick={() => withdraw(r.id)} className="text-xs font-semibold text-gray-500 bg-transparent hover:underline">{t("withdraw")}</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-bold text-gray-900">{t("collab_find")}</h2>
          <div className="relative w-64 max-w-full"><Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className={`${inp} !pl-9`} /></div>
        </div>
        <div className="p-5">
          {courses.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">{t("collab_no_courses")}</p> : (
            <ul className="divide-y divide-gray-100">
              {courses.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p><p className="text-xs text-gray-500">{c.first_name} {c.last_name}{c.category_name ? ` · ${c.category_name}` : ""}</p></div>
                  <button type="button" onClick={() => { setForm({ course: c, role: "assistant", message: "" }); setErr(""); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-primary text-primary bg-white hover:bg-gray-50 shrink-0">{t("collab_request")}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onMouseDown={() => setForm(null)}>
          <div onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <h3 className="font-bold text-gray-900">{t("collab_request_title", { title: form.course.title })}</h3>
            <div className="grid grid-cols-2 gap-2">
              {["assistant", "co_instructor"].map((r) => (
                <button key={r} type="button" onClick={() => setForm((p) => ({ ...p, role: r }))}
                  className={`text-left p-3 rounded-xl border-2 text-xs ${form.role === r ? "border-primary bg-indigo-50/40" : "border-gray-200 bg-white"}`}>
                  <span className="block font-bold text-gray-800">{t(`role_${r}`)}</span><span className="block text-gray-500 mt-0.5">{t(`role_${r}_hint`)}</span>
                </button>
              ))}
            </div>
            <textarea rows={4} value={form.message} maxLength={1500} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder={t("collab_message_ph")} className={`${inp} resize-none`} />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600">{t("cancel")}</button>
              <button type="button" onClick={submit} disabled={busy || form.message.trim().length < 10} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary disabled:opacity-50">{busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("send")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
