// Briques d'interface communes aux écrans du programme instructeurs.
import { Loader } from "lucide-react";
import api from "../../../api/api";

export const inp = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary/30";
export const btn = "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60";
export const btnPrimary = `${btn} bg-primary text-white hover:opacity-90`;
export const btnGhost = `${btn} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`;
export const btnDanger = `${btn} bg-white border border-red-200 text-red-600 hover:bg-red-50`;

export const Spinner = ({ className = "w-5 h-5" }) => <Loader className={`${className} animate-spin text-gray-400`} />;

export const Center = ({ children }) => <div className="flex justify-center py-12">{children}</div>;

export const Empty = ({ children }) => <p className="text-sm text-gray-500 text-center py-10">{children}</p>;

export const Card = ({ title, action, children, className = "" }) => (
  <section className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>{action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const Stat = ({ label, value, tone = "text-gray-900", sub }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-2xl font-black mt-1 ${tone}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export const Pill = ({ children, tone = "bg-gray-100 text-gray-600" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${tone}`}>{children}</span>
);

export const Progress = ({ percent }) => (
  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
    <div className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(percent, 100)}%` }} />
  </div>
);

export const fullName = (u) => `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();

// Téléchargement d'un fichier protégé (CSV) avec le jeton d'authentification
export async function downloadFile(url, params, fallbackName) {
  const res = await api.get(url, { params, responseType: "blob" });
  const cd = res.headers?.["content-disposition"] || "";
  const m = /filename="?([^";]+)"?/i.exec(cd);
  const href = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = href; a.download = m?.[1] || fallbackName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
