// Champ « URL ou fichier » : on peut coller une adresse ou importer un fichier depuis l'ordinateur.
import { useRef, useState } from "react";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";
import { apiError } from "./useFeedback";
import { showAlert } from "../../utils/dialog";

export default function FileUrlField({ label, value, onChange, kind = "image", accept, hint, placeholder, preview = true, inputClass = "", labelClass = "" }) {
  const { t } = useTranslation("fileField");
  const ref = useRef(null);
  const [pct, setPct] = useState(null);
  const acceptAttr = accept || { image: "image/jpeg,image/png,image/webp,image/gif", video: "video/mp4,video/webm,video/quicktime", file: ".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.json" }[kind];

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setPct(0);
    try {
      const r = await api.post(`/uploads/${kind}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0,
        onUploadProgress: (ev) => ev.total && setPct(Math.round((ev.loaded / ev.total) * 100)),
      });
      onChange(r.data?.data?.url || "");
    } catch (err) {
      showAlert(apiError(err, t("erreur")), "error");
    } finally { setPct(null); }
  };

  const uploading = pct !== null;
  const isImg = preview && kind === "image" && value;

  return (
    <div>
      {label && <label className={labelClass || "block text-sm font-medium text-gray-700 mb-1.5"}>{label}</label>}
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="url" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className={inputClass || "w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"} />
          {value && !uploading && (
            <button type="button" onClick={() => onChange("")} aria-label={t("retirer")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent p-0"><X className="w-4 h-4" /></button>
          )}
        </div>
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? `${pct}%` : t("importer")}
        </button>
        <input ref={ref} type="file" accept={acceptAttr} onChange={pick} className="hidden" />
      </div>
      {uploading && <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>}
      {isImg && <img src={value} alt="" className="mt-2 h-24 rounded-lg border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}
