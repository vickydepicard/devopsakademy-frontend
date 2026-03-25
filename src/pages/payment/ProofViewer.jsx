// src/components/payment/ProofViewer.jsx
// Visualiseur de preuve de paiement — Modal avec aperçu + téléchargement
import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText, Eye } from "lucide-react";

/* ══════════════════════════════════════════
   HELPER: normaliser l'URL de la preuve
══════════════════════════════════════════ */
function normalizeProofUrl(url) {
  if (!url) return null;
  // Si c'est déjà une URL complète
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Si c'est un chemin relatif type /uploads/...
  if (url.startsWith("/uploads/")) return url;
  // Si c'est juste un nom de fichier
  if (!url.startsWith("/")) return `/uploads/payments/${url}`;
  return url;
}

function isPdf(url) {
  return url?.toLowerCase().includes(".pdf") || url?.toLowerCase().endsWith(".pdf");
}

/* ══════════════════════════════════════════
   BOUTON DÉCLENCHEUR
══════════════════════════════════════════ */
export function ProofButton({ url, label = "Voir la preuve", size = "sm", className = "" }) {
  const [open, setOpen] = useState(false);
  const normalized = normalizeProofUrl(url);
  if (!normalized) return null;

  const sz = size === "xs"
    ? "px-2 py-1 text-xs gap-1"
    : size === "sm"
    ? "px-3 py-1.5 text-xs gap-1.5"
    : "px-4 py-2 text-sm gap-2";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center font-semibold rounded-xl border transition hover:shadow-sm active:scale-95 ${sz} ${className}`}
        style={{ borderColor: "#5653e1", color: "#2d287f", background: "#f0efff" }}
      >
        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
        {label}
      </button>
      {open && <ProofModal url={normalized} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ══════════════════════════════════════════
   MODAL VISUALISEUR
══════════════════════════════════════════ */
export function ProofModal({ url, onClose }) {
  const [zoom,   setZoom]   = useState(1);
  const [rotate, setRotate] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);
  const pdf = isPdf(url);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      // Extraire le nom du fichier de l'URL
      const filename = url.split("/").pop() || "preuve-paiement";
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: ouvrir dans un nouvel onglet
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: "90vw", maxHeight: "90vh", minWidth: 340, animation: "fadeIn .2s" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              {pdf
                ? <FileText className="w-4 h-4 text-white" />
                : <Eye className="w-4 h-4 text-white" />
              }
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Preuve de paiement</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{url.split("/").pop()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!pdf && (
              <>
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                  title="Dézoomer">
                  <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="text-xs font-bold text-gray-500 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                  title="Zoomer">
                  <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button onClick={() => setRotate(r => (r + 90) % 360)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                  title="Rotation">
                  <RotateCw className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </>
            )}
            <button onClick={() => window.open(url, "_blank")}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              title="Ouvrir dans un nouvel onglet">
              <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}
              title="Télécharger">
              <Download className="w-3.5 h-3.5" /> Télécharger
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center"
          style={{ background: "#f1f0f9", minHeight: 300, maxHeight: "75vh" }}>
          {pdf ? (
            <iframe
              src={`${url}#toolbar=1&view=FitH`}
              className="w-full rounded-xl shadow-md border border-gray-200"
              style={{ minHeight: 500, height: "65vh" }}
              title="Preuve PDF"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          ) : error ? (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-gray-600 font-semibold text-sm">Impossible d'afficher l'image</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleDownload}
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                  <Download className="w-4 h-4 inline mr-1.5" /> Télécharger
                </button>
                <button onClick={() => window.open(url, "_blank")}
                  className="px-4 py-2 rounded-xl border-2 text-sm font-bold"
                  style={{ borderColor: "#2d287f", color: "#2d287f" }}>
                  Ouvrir ↗
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={url}
                alt="Preuve de paiement"
                className="rounded-xl shadow-lg border border-gray-200 block"
                style={{
                  transform: `scale(${zoom}) rotate(${rotate}deg)`,
                  transition: "transform 0.2s ease",
                  maxWidth: "80vw",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  transformOrigin: "center center",
                }}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {pdf ? "Document PDF" : `Image · Zoom: ${Math.round(zoom * 100)}% · Rotation: ${rotate}°`}
          </p>
          <div className="flex gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
              <Download className="w-3.5 h-3.5" /> Télécharger
            </button>
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 text-xs font-bold transition"
              style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              Fermer
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

/* Export défaut = ProofButton pour import simple */
export default ProofButton;