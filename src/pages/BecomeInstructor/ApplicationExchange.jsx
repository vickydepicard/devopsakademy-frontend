// src/pages/BecomeInstructor/ApplicationExchange.jsx — DevOpsAkademy
// Côté candidat : échanges avec l'équipe (messages visibles) et entretiens proposés / confirmés.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Calendar, Check, Clock, ExternalLink, Loader, MessageSquare, Phone, Send, Video, X } from "lucide-react";
import api from "../../api/api";
import { getLocale } from "../../i18n";
import { CERTIFICATION_OPTIONS, EXPERTISE_OPTIONS } from "../../utils/instructorOptions";
import { CategorySelect, ChipSelect, CvUpload, HoursSelect, LevelSelect, YearsSelect, inputCls, uploadCv } from "./FormControls";

const C = { primary: "rgb(var(--c-primary))", light: "rgb(var(--c-primary-light))" };

const fmt = (d) => (d ? new Date(d).toLocaleString(getLocale(), { dateStyle: "full", timeStyle: "short" }) : "—");

function InterviewItem({ iv, onChanged }) {
  const { t } = useTranslation("applicationReview");
  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const ModeIcon = iv.mode === "phone" ? Phone : iv.mode === "external" ? ExternalLink : Video;
  const past = new Date(iv.scheduled_at).getTime() < Date.now();

  const respond = async (action) => {
    setBusy(true); setErr("");
    try {
      await api.post(`/instructor-applications/my/interviews/${iv.id}/respond`, { action, note: note.trim() });
      await onChanged();
    } catch (e) { setErr(e?.response?.data?.message || t("error_generic")); }
    finally { setBusy(false); }
  };

  const tone = iv.status === "confirmed" ? "border-emerald-200 bg-emerald-50/60"
    : iv.status === "proposed" ? "border-amber-200 bg-amber-50/60" : "border-gray-200 bg-gray-50";

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${tone}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{fmt(iv.scheduled_at)}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><ModeIcon className="w-3.5 h-3.5" />{t(`mode_${iv.mode}`)} · {iv.duration_min} min</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-gray-200 text-gray-600">{t(`iv_${iv.status}`)}</span>
      </div>
      {iv.message && <p className="text-sm text-gray-600 whitespace-pre-line">{iv.message}</p>}
      {err && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{err}</p>}

      {iv.status === "confirmed" && iv.join_url && !past && (
        <a href={iv.join_url} target="_blank" rel="noreferrer noopener"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
          <Video className="w-4 h-4" />{t("join_interview")}
        </a>
      )}
      {iv.status === "confirmed" && iv.mode === "phone" && <p className="text-xs text-gray-500">{t("phone_will_call")}</p>}

      {iv.status === "proposed" && !past && !declining && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button disabled={busy} onClick={() => respond("accept")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
            {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{t("accept_slot")}
          </button>
          <button disabled={busy} onClick={() => setDeclining(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-50">
            <X className="w-4 h-4" />{t("decline_slot")}
          </button>
        </div>
      )}
      {declining && (
        <div className="space-y-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} placeholder={t("decline_placeholder")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeclining(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600">{t("cancel")}</button>
            <button disabled={busy} onClick={() => respond("decline")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-white disabled:opacity-50">{t("send_decline")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Type de saisie de chaque champ que l'équipe peut demander
const TEXTAREAS = { motivation: 4, experience: 4, proposed_course_description: 4 };
const URL_PLACEHOLDERS = {
  linkedin_url: "https://linkedin.com/in/…",
  portfolio_url: "https://github.com/…",
  video_url: "https://…",
};

function CompletionForm({ app, onChanged }) {
  const { t } = useTranslation("applicationReview");
  const fields = app.requested_fields || [];
  const initial = () => Object.fromEntries(fields.map((k) => {
    if (k === "cv_url") return [k, app.cv_url ?? ""];
    const v = app[k];
    if (Array.isArray(v)) return [k, v];
    return [k, v ?? ""];
  }));
  const [vals, setVals] = useState(initial);
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => { setVals((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const submit = async () => {
    setBusy(true); setErrors({}); setMsg("");
    try {
      if (fields.includes("cv_url") && cvFile) await uploadCv(cvFile);

      const payload = {};
      for (const k of fields) {
        const v = vals[k];
        const empty = Array.isArray(v) ? v.length === 0 : String(v ?? "").trim() === "";
        if (k === "cv_url") { if (!empty) payload[k] = v; continue; }
        payload[k] = v;
        if (empty) payload[k] = Array.isArray(v) ? [] : "";
      }
      const hasPayload = Object.keys(payload).length > 0;
      if (hasPayload) await api.patch("/instructor-applications/my/complete", payload);
      else if (fields.includes("cv_url") && !cvFile) { setErrors({ cv_url: t("cv_required") }); setMsg(t("error_generic")); setBusy(false); return; }
      await onChanged();
    } catch (e) {
      const data = e?.response?.data;
      if (data?.errors) setErrors(data.errors);
      setMsg(data?.message || t("error_generic"));
      // si le CV est parti mais pas le reste, on rafraîchit pour refléter l'état réel
      if (fields.includes("cv_url") && cvFile && !data?.errors) await onChanged();
    } finally { setBusy(false); }
  };

  const renderInput = (k) => {
    const err = !!errors[k];
    if (k === "years_experience") return <YearsSelect value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "weekly_hours") return <HoursSelect value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "proposed_course_level") return <LevelSelect value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "proposed_course_category") return <CategorySelect value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "expertise_areas") return <ChipSelect options={EXPERTISE_OPTIONS} value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "certifications") return <ChipSelect options={CERTIFICATION_OPTIONS} value={vals[k]} onChange={(v) => set(k, v)} error={err} />;
    if (k === "cv_url") {
      return (
        <div className="space-y-2">
          <CvUpload file={cvFile} onFile={setCvFile} existingName={app.has_cv_file ? app.cv_original_name : null} error={errors[k]} />
          <input type="url" value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={t("cv_link_optional")} className={inputCls(false)} />
        </div>
      );
    }
    if (TEXTAREAS[k]) return <textarea rows={TEXTAREAS[k]} value={vals[k]} onChange={(e) => set(k, e.target.value)} className={inputCls(err) + " resize-none"} />;
    return <input type={URL_PLACEHOLDERS[k] ? "url" : "text"} placeholder={URL_PLACEHOLDERS[k]} value={vals[k]} onChange={(e) => set(k, e.target.value)} className={inputCls(err)} />;
  };

  return (
    <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-sm p-5 space-y-5">
      <div>
        <h3 className="font-bold text-amber-900 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("complete_title")}</h3>
        <p className="text-sm text-amber-800 mt-1">{t("complete_hint")}</p>
      </div>
      {fields.map((k) => (
        <div key={k}>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t(`f_${k}`)}</label>
          {renderInput(k)}
          {errors[k] && k !== "cv_url" && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
        </div>
      ))}
      {msg && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{msg}</p>}
      <div className="flex justify-end">
        <button onClick={submit} disabled={busy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("complete_btn")}
        </button>
      </div>
    </div>
  );
}

export default function ApplicationExchange({ app, onChanged }) {
  const { t } = useTranslation("applicationReview");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const interviews = app.interviews || [];
  const comments = app.comments || [];
  const requested = app.requested_fields || [];
  if (!interviews.length && !comments.length && !app.candidate_can_reply && !requested.length) return null;

  const send = async () => {
    if (!body.trim()) return;
    setBusy(true); setErr("");
    try { await api.post("/instructor-applications/my/comments", { body: body.trim() }); setBody(""); await onChanged(); }
    catch (e) { setErr(e?.response?.data?.message || t("error_generic")); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 mb-8">
      {requested.length > 0 && <CompletionForm key={requested.join(",")} app={app} onChanged={onChanged} />}

      {interviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: C.light }} />{t("my_interviews")}</h3>
          {interviews.map((iv) => <InterviewItem key={iv.id} iv={iv} onChanged={onChanged} />)}
        </div>
      )}

      {(comments.length > 0 || app.candidate_can_reply) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" style={{ color: C.light }} />{t("exchanges_with_team")}</h3>
          <div className="space-y-2.5">
            {comments.map((c) => {
              const mine = c.author_role === "candidate";
              return (
                <div key={c.id} className={`rounded-xl p-3 max-w-[90%] ${mine ? "ml-auto bg-indigo-50 border border-indigo-100" : "mr-auto bg-gray-50 border border-gray-100"}`}>
                  <p className="text-[11px] font-bold text-gray-500 mb-1">{mine ? t("you") : t("team")} · {new Date(c.created_at).toLocaleString(getLocale(), { dateStyle: "medium", timeStyle: "short" })}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{c.body}</p>
                </div>
              );
            })}
          </div>
          {app.candidate_can_reply ? (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {err && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{err}</p>}
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} placeholder={t("reply_placeholder")}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              <div className="flex justify-end">
                <button onClick={send} disabled={busy || !body.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                  {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("send")}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">{t("replies_closed")}</p>
          )}
        </div>
      )}
    </div>
  );
}
