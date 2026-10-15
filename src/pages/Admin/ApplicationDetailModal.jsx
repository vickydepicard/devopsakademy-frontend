// src/pages/Admin/ApplicationDetailModal.jsx — DevOpsAkademy
// Dossier complet d'une candidature instructeur : dossier, échanges (commentaires),
// entretiens (visio plateforme / lien externe / téléphone) et évaluation.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X, Loader, AlertCircle, Briefcase, Timer, Calendar, BookOpen, Linkedin, Globe, Video, FileText,
  Eye, XCircle, CheckCircle, Lock, MessageSquare, Send, Trash2, Copy, Check, Star, Clock, Phone,
  ExternalLink, Users, RotateCcw,
} from "lucide-react";
import api from "../../api/api";
import { getLocale } from "../../i18n";

const C = { primary: "rgb(var(--c-primary))", light: "rgb(var(--c-primary-light))" };

const STATUS_STYLE = {
  pending:      "bg-amber-100 text-amber-700 border-amber-200",
  under_review: "bg-blue-100 text-blue-700 border-blue-200",
  accepted:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:     "bg-red-100 text-red-600 border-red-200",
};

const IV_STYLE = {
  proposed:  "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  done:      "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
  declined:  "bg-orange-100 text-orange-700",
};

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString(getLocale(), { dateStyle: "medium", timeStyle: "short" }) : "—";

const apiMsg = (e, fallback) => e?.response?.data?.message || fallback;

function Stars({ value, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={readOnly}
          onClick={() => onChange?.(value === n ? null : n)}
          className="p-0.5 disabled:cursor-default">
          <Star className={`w-5 h-5 ${n <= (value || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────── Onglet Dossier ───────────────────────────
// [clé, type, obligatoire]
const FIELDS = [
  ["motivation", "text", true],
  ["experience", "text", true],
  ["years_experience", "years", true],
  ["expertise_areas", "list", true],
  ["sample_course_topic", "text", true],
  ["proposed_course_category", "text", false],
  ["proposed_course_level", "level", false],
  ["proposed_course_description", "text", true],
  ["linkedin_url", "link", false],
  ["portfolio_url", "link", false],
  ["cv_url", "cv", false],
  ["certifications", "list", false],
  ["video_url", "link", false],
  ["weekly_hours", "hours", false],
];

const GROUPS = [
  { id: "story", cols: 1, keys: ["motivation", "experience"] },
  { id: "profile", cols: 2, keys: ["years_experience", "weekly_hours", "expertise_areas", "certifications"] },
  { id: "course", cols: 2, keys: ["sample_course_topic", "proposed_course_category", "proposed_course_level", "proposed_course_description"] },
  { id: "links", cols: 2, keys: ["linkedin_url", "portfolio_url", "cv_url", "video_url"] },
];

const WIDE = ["motivation", "experience", "expertise_areas", "certifications", "sample_course_topic", "proposed_course_description"];

const isFilled = (app, key) => {
  if (key === "cv_url" && app.has_cv_file) return true;
  const v = app[key];
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && String(v).trim() !== "";
};

function CvValue({ app, t }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const download = async () => {
    setBusy(true); setErr("");
    try {
      const res = await api.get(`/instructor-applications/${app.id}/cv`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = app.cv_original_name || "cv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setErr(t("error_generic")); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {app.has_cv_file && (
        <button type="button" onClick={download} disabled={busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60">
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          <span className="truncate max-w-[260px]">{app.cv_original_name || "CV"}</span>
          <span className="text-[11px] font-semibold text-indigo-500">{t("download")}</span>
        </button>
      )}
      {app.cv_url && (
        <a href={app.cv_url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 text-sm font-medium hover:underline break-all" style={{ color: C.light }}>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />{app.cv_url}
        </a>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

function FieldValue({ app, k, type, t }) {
  const v = app[k];
  if (type === "list") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {v.map((d, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold border"
            style={{ background: "#f0f0ff", color: C.light, borderColor: "#e0e7ff" }}>{d}</span>
        ))}
      </div>
    );
  }
  if (type === "link") {
    return (
      <a href={v} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline break-all" style={{ color: C.light }}>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />{v}
      </a>
    );
  }
  if (type === "level") return <p className="text-sm font-semibold text-gray-800">{t(`level_${v}`)}</p>;
  if (type === "cv") return <CvValue app={app} t={t} />;
  if (type === "years") return <p className="text-sm font-semibold text-gray-800">{t("years", { count: Number(v) })}</p>;
  if (type === "hours") return <p className="text-sm font-semibold text-gray-800">{v}h / {t("week")}</p>;
  return <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{v}</p>;
}

function DossierTab({ app, reload }) {
  const { t } = useTranslation("applicationReview");
  const open = ["pending", "under_review"].includes(app.status);
  const requested = Array.isArray(app.requested_fields) ? app.requested_fields : [];
  const [picked, setPicked] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const missing = FIELDS.filter(([k]) => !isFilled(app, k));
  const filledCount = FIELDS.length - missing.length;
  const missingRequired = missing.filter(([, , req]) => req).map(([k]) => k);
  const toggle = (k) => { setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k])); setSent(false); };

  const request = async () => {
    setBusy(true); setErr("");
    try {
      await api.post(`/instructor-applications/${app.id}/request-info`, { fields: picked, message: message.trim() });
      setPicked([]); setMessage(""); setSent(true);
      await reload();
    } catch (e) { setErr(apiMsg(e, t("error_generic"))); }
    finally { setBusy(false); }
  };
  const cancelRequest = async () => {
    try { await api.delete(`/instructor-applications/${app.id}/request-info`); await reload(); }
    catch (e) { setErr(apiMsg(e, t("error_generic"))); }
  };

  return (
    <div className="space-y-5">
      {err && <ErrBox msg={err} />}

      {/* Complétude */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-bold text-gray-800">{t("completeness")}</p>
              <p className="text-sm font-black" style={{ color: C.light }}>{filledCount} / {FIELDS.length}</p>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(filledCount / FIELDS.length) * 100}%`, background: `linear-gradient(90deg,${C.primary},${C.light})` }} />
            </div>
          </div>
        </div>
        {missingRequired.length > 0 && (
          <p className="text-xs font-semibold text-red-600 mt-2.5 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{t("missing_required", { count: missingRequired.length })}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            [Calendar, `${t("submitted_on")} ${app.submitted_at ? new Date(app.submitted_at).toLocaleDateString(getLocale()) : "—"}`, "bg-gray-100 text-gray-600"],
            [Users, `${t("account_since")} ${app.user_since ? new Date(app.user_since).toLocaleDateString(getLocale()) : "—"}`, "bg-gray-100 text-gray-600"],
            [CheckCircle, app.charter_accepted ? t("charter_accepted") : t("charter_not_recorded"), app.charter_accepted ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"],
          ].map(([Icon, label, cls], i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}><Icon className="w-3 h-3 shrink-0" />{label}</span>
          ))}
        </div>
      </div>

      {/* Demande en cours */}
      {requested.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-800">{t("request_pending")}</p>
            <p className="text-xs text-amber-700 mt-1">{requested.map((k) => t(`f_${k}`)).join(" · ")}</p>
          </div>
          <button onClick={cancelRequest} className="text-xs font-bold text-amber-800 hover:underline shrink-0">{t("cancel_request")}</button>
        </div>
      )}
      {sent && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" />{t("request_sent")}</p>}

      {/* Champs, par sections */}
      {GROUPS.map(({ id, keys }) => (
        <section key={id} className="space-y-2.5">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">{t(`group_${id}`)}</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {keys.map((k) => {
              const [, type, required] = FIELDS.find((f) => f[0] === k);
              const filled = isFilled(app, k);
              const isRequested = requested.includes(k);
              const isPicked = picked.includes(k);
              return (
                <div key={k} className={`rounded-xl border p-3.5 shadow-sm transition ${WIDE.includes(k) ? "sm:col-span-2" : ""} ${isPicked ? "border-indigo-400 ring-2 ring-indigo-100 bg-white" : filled ? "border-gray-200 bg-white" : "border-red-200 bg-red-50/50"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      {open && (
                        <input type="checkbox" className="w-4 h-4 shrink-0 accent-indigo-600" checked={isPicked} onChange={() => toggle(k)} title={t("ask_to_complete")} />
                      )}
                      <p className="text-xs font-bold text-gray-700">{t(`f_${k}`)}</p>
                      {required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">{t("required")}</span>}
                      {isRequested && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{t("requested")}</span>}
                    </div>
                    {!filled && <span className="text-[11px] font-bold text-red-600 shrink-0">{t("not_provided")}</span>}
                  </div>
                  {filled ? <FieldValue app={app} k={k} type={type} t={t} /> : <p className="text-sm text-gray-300">—</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Demande de complément */}
      {open && (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
          <p className="text-sm font-black text-gray-800 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-500" />{t("request_title")}</p>
          <p className="text-xs text-gray-500">{t("request_hint")}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPicked(missing.map(([k]) => k))} disabled={!missing.length}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-300 text-indigo-700 hover:bg-white disabled:opacity-40">{t("select_missing")}</button>
            {picked.length > 0 && <button type="button" onClick={() => setPicked([])} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:underline">{t("clear")}</button>}
          </div>
          {picked.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {picked.map((k) => <span key={k} className="px-2 py-1 rounded-full text-xs font-semibold bg-white border border-indigo-200 text-indigo-700">{t(`f_${k}`)}</span>)}
            </div>
          )}
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={2000} placeholder={t("request_message_placeholder")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white" />
          <div className="flex justify-end">
            <button onClick={request} disabled={busy || picked.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
              {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("request_btn", { count: picked.length })}
            </button>
          </div>
        </div>
      )}

      {app.status === "rejected" && app.review_note && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-bold text-red-700 mb-1">{t("rejection_reason")}</p>
          <p className="text-sm text-red-600">{app.review_note}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Onglet Échanges ───────────────────────────
function ExchangeTab({ app, reload }) {
  const { t } = useTranslation("applicationReview");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("internal");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const closed = ["accepted", "rejected"].includes(app.status);

  const send = async () => {
    if (!body.trim()) return;
    setBusy(true); setErr("");
    try {
      await api.post(`/instructor-applications/${app.id}/comments`, { body: body.trim(), visibility });
      setBody("");
      await reload();
    } catch (e) { setErr(apiMsg(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  const remove = async (cid) => {
    if (!window.confirm(t("confirm_delete_comment"))) return;
    try { await api.delete(`/instructor-applications/${app.id}/comments/${cid}`); await reload(); }
    catch (e) { setErr(apiMsg(e, t("error_generic"))); }
  };

  const toggleReply = async () => {
    setErr("");
    try {
      await api.patch(`/instructor-applications/${app.id}/settings`, { candidate_can_reply: !app.candidate_can_reply });
      await reload();
    } catch (e) { setErr(apiMsg(e, t("error_generic"))); }
  };

  const badge = (c) => c.author_role === "candidate"
    ? { label: t("from_candidate"), cls: "bg-emerald-100 text-emerald-700", Icon: Users }
    : c.visibility === "candidate"
      ? { label: t("visible_candidate"), cls: "bg-blue-100 text-blue-700", Icon: Eye }
      : { label: t("internal"), cls: "bg-amber-100 text-amber-700", Icon: Lock };

  return (
    <div className="space-y-4">
      {err && <ErrBox msg={err} />}

      <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
        <input type="checkbox" className="mt-1 w-4 h-4" checked={!!app.candidate_can_reply} onChange={toggleReply} disabled={closed} />
        <span>
          <span className="block text-sm font-bold text-gray-800">{t("allow_reply")}</span>
          <span className="block text-xs text-gray-500">{t("allow_reply_hint")}</span>
        </span>
      </label>

      <div className="space-y-3">
        {app.comments.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">{t("no_comments")}</p>
        )}
        {app.comments.map((c) => {
          const b = badge(c);
          const mine = c.author_role === "admin";
          return (
            <div key={c.id} className={`rounded-xl border p-3 ${c.author_role === "candidate" ? "bg-emerald-50/50 border-emerald-100" : c.visibility === "internal" ? "bg-amber-50/50 border-amber-100" : "bg-blue-50/50 border-blue-100"}`}>
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.cls}`}><b.Icon className="w-3 h-3" />{b.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{fmtDateTime(c.created_at)}</span>
                  {mine && <button onClick={() => remove(c.id)} className="text-gray-300 hover:text-red-500" title={t("delete")}><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{c.body}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-gray-200 rounded-xl p-3 space-y-3 bg-white">
        <div className="flex gap-2">
          {[["internal", Lock, t("internal_note")], ["candidate", Eye, t("message_to_candidate")]].map(([v, Icon, label]) => (
            <button key={v} type="button" onClick={() => setVisibility(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${visibility === v ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}
              style={visibility === v ? { background: `linear-gradient(135deg,${C.primary},${C.light})` } : {}}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000}
          placeholder={visibility === "internal" ? t("placeholder_internal") : t("placeholder_candidate")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none" />
        {visibility === "candidate" && <p className="text-xs text-blue-600 flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t("candidate_will_be_emailed")}</p>}
        <div className="flex justify-end">
          <button onClick={send} disabled={busy || !body.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
            {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Onglet Entretiens ───────────────────────────
function CopyButton({ text }) {
  const { t } = useTranslation("applicationReview");
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch { /* clipboard indisponible */ }
    }} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
      {ok ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{ok ? t("copied") : t("copy_link")}
    </button>
  );
}

function InterviewCard({ iv, appId, reload, setErr }) {
  const { t } = useTranslation("applicationReview");
  const [busy, setBusy] = useState(false);
  const [doneNotes, setDoneNotes] = useState(null);   // null = fermé
  const [resched, setResched] = useState(null);

  const act = async (payload) => {
    setBusy(true); setErr("");
    try { await api.patch(`/instructor-applications/${appId}/interviews/${iv.id}`, payload); setDoneNotes(null); setResched(null); await reload(); }
    catch (e) { setErr(apiMsg(e, t("error_generic"))); }
    finally { setBusy(false); }
  };
  const open = ["proposed", "confirmed"].includes(iv.status);
  const ModeIcon = iv.mode === "phone" ? Phone : iv.mode === "external" ? ExternalLink : Video;

  return (
    <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{fmtDateTime(iv.scheduled_at)}<span className="text-xs font-normal text-gray-500">· {iv.duration_min} min</span></p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1"><ModeIcon className="w-3.5 h-3.5" />{t(`mode_${iv.mode}`)}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${IV_STYLE[iv.status]}`}>{t(`iv_${iv.status}`)}</span>
      </div>

      {iv.share_url && iv.status === "confirmed" && (
        <div className="flex items-center gap-3 flex-wrap bg-indigo-50 rounded-lg px-3 py-2">
          <a href={iv.share_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 hover:underline">
            <Video className="w-3.5 h-3.5" />{t("join_room")}
          </a>
          <CopyButton text={iv.share_url} />
        </div>
      )}
      {iv.candidate_note && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"><strong>{t("candidate_note")} :</strong> {iv.candidate_note}</p>}
      {iv.notes && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line"><strong>{t("report")} :</strong> {iv.notes}</p>}

      {open && doneNotes === null && resched === null && (
        <div className="flex flex-wrap gap-2 pt-1">
          {iv.status === "proposed" && <button disabled={busy} onClick={() => act({ action: "confirm" })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white disabled:opacity-50">{t("confirm_slot")}</button>}
          {iv.status === "confirmed" && <button disabled={busy} onClick={() => setDoneNotes("")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-white">{t("mark_done")}</button>}
          <button disabled={busy} onClick={() => setResched("")} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">{t("reschedule")}</button>
          <button disabled={busy} onClick={() => window.confirm(t("confirm_cancel_interview")) && act({ action: "cancel" })} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50">{t("cancel_interview")}</button>
        </div>
      )}

      {doneNotes !== null && (
        <div className="space-y-2">
          <textarea value={doneNotes} onChange={(e) => setDoneNotes(e.target.value)} rows={3} placeholder={t("report_placeholder")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDoneNotes(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600">{t("cancel")}</button>
            <button disabled={busy} onClick={() => act({ action: "done", notes: doneNotes })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-white disabled:opacity-50">{t("save_report")}</button>
          </div>
        </div>
      )}

      {resched !== null && (
        <div className="flex gap-2 items-center flex-wrap">
          <input type="datetime-local" value={resched} onChange={(e) => setResched(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
          <button onClick={() => setResched(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600">{t("cancel")}</button>
          <button disabled={busy || !resched} onClick={() => act({ action: "reschedule", scheduled_at: new Date(resched).toISOString() })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-50">{t("save")}</button>
        </div>
      )}
    </div>
  );
}

function NewInterviewForm({ appId, reload, setErr }) {
  const { t } = useTranslation("applicationReview");
  const [slots, setSlots] = useState([""]);
  const [mode, setMode] = useState("platform");
  const [externalUrl, setExternalUrl] = useState("");
  const [duration, setDuration] = useState(30);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const filled = slots.filter(Boolean);
  const valid = filled.length > 0 && (mode !== "external" || externalUrl.trim());

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      await api.post(`/instructor-applications/${appId}/interviews`, {
        slots: (confirmed ? filled.slice(0, 1) : filled).map((s) => new Date(s).toISOString()),
        mode, duration_min: duration, external_url: externalUrl.trim(), message: message.trim(), confirmed,
      });
      setSlots([""]); setMessage(""); setConfirmed(false); setExternalUrl("");
      await reload();
    } catch (e) { setErr(apiMsg(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  const inp = "px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400";
  return (
    <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 space-y-3 bg-indigo-50/30">
      <p className="text-sm font-black text-gray-800 flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" />{t("schedule_interview")}</p>

      <div className="grid sm:grid-cols-3 gap-2">
        {["platform", "external", "phone"].map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`text-left p-2.5 rounded-lg border text-xs transition ${mode === m ? "border-indigo-500 bg-white shadow-sm" : "border-gray-200 bg-white/60 hover:bg-white"}`}>
            <span className="block font-bold text-gray-800">{t(`mode_${m}`)}</span>
            <span className="block text-gray-500 mt-0.5">{t(`mode_${m}_hint`)}</span>
          </button>
        ))}
      </div>

      {mode === "external" && (
        <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://meet.google.com/…" className={`${inp} w-full`} />
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{confirmed ? t("slot") : t("proposed_slots")}</p>
        {(confirmed ? slots.slice(0, 1) : slots).map((s, i) => (
          <div key={i} className="flex gap-2">
            <input type="datetime-local" value={s} onChange={(e) => setSlots((p) => p.map((x, j) => (j === i ? e.target.value : x)))} className={`${inp} flex-1`} />
            {slots.length > 1 && !confirmed && <button onClick={() => setSlots((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
          </div>
        ))}
        {!confirmed && slots.length < 5 && (
          <button type="button" onClick={() => setSlots((p) => [...p, ""])} className="text-xs font-bold text-indigo-600 hover:underline">+ {t("add_slot")}</button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <label className="text-xs font-bold text-gray-500">{t("duration")}
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={`${inp} ml-2`}>
            {[15, 30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} min</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="w-4 h-4" />
          {t("already_agreed")}
        </label>
      </div>

      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={2000} placeholder={t("interview_message_placeholder")}
        className={`${inp} w-full resize-none`} />

      <div className="flex justify-end">
        <button onClick={submit} disabled={busy || !valid}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {confirmed ? t("schedule_and_confirm") : t("send_proposal")}
        </button>
      </div>
    </div>
  );
}

function InterviewsTab({ app, reload }) {
  const { t } = useTranslation("applicationReview");
  const [err, setErr] = useState("");
  const closed = ["accepted", "rejected"].includes(app.status);
  return (
    <div className="space-y-4">
      {err && <ErrBox msg={err} />}
      {app.interviews.length === 0 && <p className="text-center text-sm text-gray-400 py-4">{t("no_interviews")}</p>}
      {app.interviews.map((iv) => <InterviewCard key={iv.id} iv={iv} appId={app.id} reload={reload} setErr={setErr} />)}
      {!closed && <NewInterviewForm appId={app.id} reload={reload} setErr={setErr} />}
    </div>
  );
}

// ─────────────────────────── Onglet Évaluation ───────────────────────────
function EvaluationTab({ app, reload }) {
  const { t } = useTranslation("applicationReview");
  const ev = app.evaluation || {};
  const [vals, setVals] = useState({ technical: ev.technical ?? null, pedagogy: ev.pedagogy ?? null, motivation: ev.motivation ?? null, recommendation: ev.recommendation ?? null });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setVals((p) => ({ ...p, [k]: v })); setSaved(false); };

  const rated = [vals.technical, vals.pedagogy, vals.motivation].filter(Boolean);
  const avg = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : null;

  const save = async () => {
    setBusy(true); setErr("");
    try { await api.put(`/instructor-applications/${app.id}/evaluation`, vals); setSaved(true); await reload(); }
    catch (e) { setErr(apiMsg(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      {err && <ErrBox msg={err} />}
      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t("evaluation_private")}</p>
      {[["technical", t("crit_technical")], ["pedagogy", t("crit_pedagogy")], ["motivation", t("crit_motivation")]].map(([k, label]) => (
        <div key={k} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <span className="text-sm font-bold text-gray-700">{label}</span>
          <Stars value={vals[k]} onChange={(v) => set(k, v)} />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">{t("average")}</span>
        <span className="text-2xl font-black" style={{ color: C.light }}>{avg ?? "—"}<span className="text-sm text-gray-400 font-normal"> / 5</span></span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">{t("recommendation")}</p>
        <div className="flex gap-2 flex-wrap">
          {[["yes", "bg-emerald-600"], ["maybe", "bg-amber-500"], ["no", "bg-red-600"]].map(([v, bg]) => (
            <button key={v} type="button" onClick={() => set("recommendation", vals.recommendation === v ? null : v)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${vals.recommendation === v ? `${bg} text-white border-transparent` : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t(`rec_${v}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" />{t("saved")}</span>}
        <button onClick={save} disabled={busy} className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : t("save")}
        </button>
      </div>
    </div>
  );
}

function ErrBox({ msg }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  );
}

// ─────────────────────────── Modal principal ───────────────────────────
export default function ApplicationDetailModal({ appId, onClose, onApprove, onReject, onReview, onChanged }) {
  const { t } = useTranslation("applicationReview");
  const [app, setApp] = useState(null);
  const [tab, setTab] = useState("dossier");
  const [loadErr, setLoadErr] = useState("");
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/instructor-applications/${appId}`);
      setApp(res.data?.data || null);
      setLoadErr("");
    } catch (e) { setLoadErr(apiMsg(e, t("error_generic"))); }
  }, [appId, t]);

  useEffect(() => { load(); }, [load]);

  const reload = useCallback(async () => { await load(); onChanged?.(); }, [load, onChanged]);

  const run = async (fn, fallback) => {
    setProcessing(true); setErr("");
    try { await fn(); return true; }
    catch (e) { setErr(apiMsg(e, fallback)); return false; }
    finally { setProcessing(false); }
  };

  const handleApprove = async () => { if (await run(() => onApprove(app.id), t("error_generic"))) onClose(); };
  const handleReject = async () => {
    if (reason.trim().length < 10) { setErr(t("reason_min_10")); return; }
    if (await run(() => onReject(app.id, reason.trim()), t("error_generic"))) onClose();
  };
  const handleReview = async () => { if (await run(() => onReview(app.id), t("error_generic"))) await load(); };

  const handleReopen = async () => {
    if (!window.confirm(t(app.status === "accepted" ? "reopen_confirm_accepted" : "reopen_confirm_rejected"))) return;
    if (await run(async () => { await api.patch(`/instructor-applications/${app.id}/reopen`); }, t("error_generic"))) {
      await load();
      onChanged?.();
    }
  };

  const isPending = app && ["pending", "under_review"].includes(app.status);
  const tabs = [
    ["dossier", t("tab_dossier"), FileText, null],
    ["exchange", t("tab_exchange"), MessageSquare, app?.comments?.length],
    ["interviews", t("tab_interviews"), Calendar, app?.interviews?.length],
    ["evaluation", t("tab_evaluation"), Star, null],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[94vh] max-h-[860px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3" style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm shrink-0">
              {app?.first_name?.[0]}{app?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-black text-white truncate">{app ? `${app.first_name} ${app.last_name}` : "…"}</p>
              <p className="text-white/70 text-xs truncate">{app?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {app && <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[app.status]}`}>{t(`status_${app.status}`)}</span>}
            <button onClick={onClose} className="text-white/70 hover:text-white transition"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Onglets */}
        <div className="shrink-0 flex border-b border-gray-200 px-3 overflow-x-auto overflow-y-hidden bg-white">
          {tabs.map(([key, label, Icon, count]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab === key ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon className="w-4 h-4" />{label}
              {count > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-600">{count}</span>}
            </button>
          ))}
        </div>

        {/* Corps */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 space-y-4 bg-gray-50/60">
          {err && <ErrBox msg={err} />}
          {loadErr && <ErrBox msg={loadErr} />}
          {!app && !loadErr && <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin" style={{ color: C.light }} /></div>}
          {app && tab === "dossier" && <DossierTab app={app} reload={reload} />}
          {app && tab === "exchange" && <ExchangeTab app={app} reload={reload} />}
          {app && tab === "interviews" && <InterviewsTab app={app} reload={reload} />}
          {app && tab === "evaluation" && <EvaluationTab app={app} reload={reload} />}

          {app && isPending && showReject && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-red-700">{t("rejection_reason")} <span className="text-red-500">*</span></p>
              <textarea value={reason} onChange={(e) => { setReason(e.target.value); setErr(""); }} rows={3} placeholder={t("rejection_placeholder")}
                className="w-full px-3 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 bg-white resize-none" />
              <p className="text-xs text-gray-400">{t("chars_min_10", { count: reason.length })}</p>
            </div>
          )}
        </div>

        {/* Actions de décision */}
        {app && !isPending && (
          <div className="shrink-0 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center gap-3 bg-white">
            <p className="text-xs text-gray-500">{t(app.status === "accepted" ? "closed_accepted_hint" : "closed_rejected_hint")}</p>
            <button onClick={handleReopen} disabled={processing}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition hover:bg-blue-50 disabled:opacity-60"
              style={{ borderColor: "#bfdbfe", color: "#2563eb" }}>
              {processing ? <Loader className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}{t("reopen")}
            </button>
          </div>
        )}

        {app && isPending && (
          <div className="shrink-0 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center gap-3 bg-white">
            {app.status === "pending" && (
              <button onClick={handleReview} disabled={processing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition hover:bg-blue-50 disabled:opacity-60"
                style={{ borderColor: "#bfdbfe", color: "#2563eb" }}>
                <Eye className="w-4 h-4" />{t("set_under_review")}
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              {!showReject ? (
                <button onClick={() => setShowReject(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-red-50"
                  style={{ borderColor: "#fecaca", color: "#dc2626" }}>
                  <XCircle className="w-4 h-4" />{t("reject")}
                </button>
              ) : (
                <>
                  <button onClick={() => { setShowReject(false); setReason(""); setErr(""); }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition">{t("cancel")}</button>
                  <button onClick={handleReject} disabled={processing || reason.trim().length < 10}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#dc2626" }}>
                    {processing ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}{t("confirm_rejection")}
                  </button>
                </>
              )}
              {!showReject && (
                <button onClick={handleApprove} disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                  {processing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{t("approve")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
