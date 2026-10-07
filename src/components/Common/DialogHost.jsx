import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";
import { subscribe } from "../../utils/dialog";

const ICON = { success: [CheckCircle2, "text-emerald-600 bg-emerald-50"], error: [AlertCircle, "text-red-600 bg-red-50"], info: [Info, "text-primary bg-primary/10"], confirm: [HelpCircle, "text-amber-600 bg-amber-50"] };

export default function DialogHost() {
  const { t } = useTranslation("common");
  const [queue, setQueue] = useState([]);
  const [text, setText] = useState("");
  const current = queue[0];
  const inputRef = useRef(null);

  useEffect(() => subscribe((d) => setQueue((q) => [...q, d])), []);
  useEffect(() => { setText(""); if (current?.kind === "prompt") setTimeout(() => inputRef.current?.focus(), 30); }, [current]);

  const close = (value) => { current.resolve(value); setQueue((q) => q.slice(1)); };

  useEffect(() => {
    if (!current) return undefined;
    const h = (e) => { if (e.key === "Escape") close(current.kind === "confirm" ? false : current.kind === "prompt" ? null : undefined); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;
  const type = current.kind === "confirm" || current.kind === "prompt" ? "confirm" : current.type;
  const [Icon, tone] = ICON[type] || ICON.info;
  const title = current.title || t({ success: "success_title", error: "error_title", info: "info_title", confirm: "confirm_title" }[type]);
  const danger = current.danger !== false;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-slate-900/50"
      onMouseDown={() => close(current.kind === "confirm" ? false : current.kind === "prompt" ? null : undefined)}>
      <div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-left">
        <div className="flex items-start gap-4">
          <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line break-words">{current.message}</p>
            {current.kind === "prompt" && (
              <textarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} rows={3}
                className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          {current.kind !== "alert" && (
            <button type="button" onClick={() => close(current.kind === "prompt" ? null : false)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">{t("cancel")}</button>
          )}
          <button type="button" autoFocus={current.kind !== "prompt"}
            onClick={() => close(current.kind === "alert" ? undefined : current.kind === "prompt" ? text : true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${current.kind === "confirm" && danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90"}`}>
            {current.kind === "alert" ? t("ok") : (current.confirmLabel || t("confirm"))}
          </button>
        </div>
      </div>
    </div>
  );
}
