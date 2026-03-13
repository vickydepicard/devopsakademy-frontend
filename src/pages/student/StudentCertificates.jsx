// src/pages/Student/StudentCertificates.jsx
// Page certificats étudiant — liste + téléchargement PDF natif (canvas → PDF)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  Award, Download, ExternalLink, BookOpen,
  Clock, RefreshCw, Trophy, Copy, CheckCircle, Zap
} from "lucide-react";

const C = {
  primary: "#2d287f",
  light:   "#5653e1",
  accent:  "#facc15",
  bg:      "#f6f5fb",
  border:  "#e8e6f5",
  text:    "#1e1b4b",
};

const LEVELS = {
  beginner:     "Débutant",
  intermediate: "Intermédiaire",
  advanced:     "Avancé",
};

/* ── Génère et télécharge le certificat en PDF via canvas ── */
const downloadCertificate = (cert, user) => {
  const canvas  = document.createElement("canvas");
  canvas.width  = 1122; // A4 landscape px @96dpi
  canvas.height = 794;
  const ctx = canvas.getContext("2d");

  // Fond dégradé
  const grad = ctx.createLinearGradient(0, 0, 1122, 794);
  grad.addColorStop(0, "#1f1b5a");
  grad.addColorStop(1, "#2d287f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1122, 794);

  // Bordure dorée
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 8;
  ctx.strokeRect(24, 24, 1074, 746);
  ctx.strokeStyle = "rgba(250,204,21,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1050, 722);

  // Coins décoratifs
  const drawCorner = (x, y, flip) => {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(60, 0);
    ctx.moveTo(0, 0); ctx.lineTo(0, 60);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(36, 36, false);
  drawCorner(1086, 36, true);
  drawCorner(36, 758, false);
  drawCorner(1086, 758, true);

  // Logo / titre plateforme
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("DevOps Akademy", 561, 100);

  // Sous-titre
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "16px Georgia, serif";
  ctx.fillText("Certificat de réussite", 561, 130);

  // Ligne séparatrice
  ctx.strokeStyle = "rgba(250,204,21,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 150); ctx.lineTo(922, 150);
  ctx.stroke();

  // "Décerné à"
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillText("Ce certificat est décerné à", 561, 210);

  // Nom étudiant
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 54px Georgia, serif`;
  ctx.fillText(`${cert.first_name} ${cert.last_name}`, 561, 285);

  // Ligne sous le nom
  ctx.strokeStyle = "rgba(250,204,21,0.5)";
  ctx.lineWidth = 1;
  const nameWidth = ctx.measureText(`${cert.first_name} ${cert.last_name}`).width;
  ctx.beginPath();
  ctx.moveTo(561 - nameWidth/2, 298);
  ctx.lineTo(561 + nameWidth/2, 298);
  ctx.stroke();

  // "pour avoir complété"
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillText("pour avoir complété avec succès la formation", 561, 345);

  // Titre du cours
  ctx.fillStyle = "#facc15";
  ctx.font = `bold 28px Georgia, serif`;
  // Tronquer si trop long
  let courseTitle = cert.course_title || "Formation DevOps";
  if (ctx.measureText(courseTitle).width > 900) {
    courseTitle = courseTitle.substring(0, 55) + "…";
  }
  ctx.fillText(courseTitle, 561, 395);

  // Informations complémentaires
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "16px Georgia, serif";
  const infoY = 460;
  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  if (cert.duration_hours) {
    ctx.fillText(`Durée : ${cert.duration_hours}h  ·  Délivré le ${issuedDate}`, 561, infoY);
  } else {
    ctx.fillText(`Délivré le ${issuedDate}`, 561, infoY);
  }

  // Séparateur
  ctx.strokeStyle = "rgba(250,204,21,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 510); ctx.lineTo(922, 510);
  ctx.stroke();

  // Numéro de certificat
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "13px monospace";
  ctx.fillText(`N° ${cert.certificate_number}`, 561, 545);

  // URL de vérification
  ctx.fillStyle = "rgba(250,204,21,0.6)";
  ctx.font = "12px monospace";
  ctx.fillText(`Vérifiable sur : devopsakademy.cloud/certificates/verify/${cert.certificate_number}`, 561, 570);

  // Sceau / badge
  ctx.save();
  ctx.translate(561, 650);
  // Cercle extérieur
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, 2 * Math.PI);
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.stroke();
  // Cercle intérieur
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(250,204,21,0.1)";
  ctx.fill();
  // Texte sceau
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CERTIFIÉ", 0, -10);
  ctx.fillText("DEVOPS", 0, 5);
  ctx.fillText("AKADEMY", 0, 20);
  ctx.restore();

  // Signature à gauche
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "14px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("L'équipe pédagogique", 150, 700);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(150, 680); ctx.lineTo(350, 680);
  ctx.stroke();

  // Signature à droite
  ctx.textAlign = "right";
  ctx.fillText("Directeur de la plateforme", 972, 700);
  ctx.beginPath();
  ctx.moveTo(772, 680); ctx.lineTo(972, 680);
  ctx.stroke();

  // Convertir en image et télécharger via un lien temporaire
  canvas.toBlob((blob) => {
    // Télécharger en PNG (qualité maximale, universel)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificat_${cert.course_title?.replace(/\s+/g,"_")}_${cert.first_name}_${cert.last_name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
};

/* ── Card certificat ── */
function CertCard({ cert, user, onCopy, copied }) {
  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="bg-white rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(45,40,127,0.06)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(45,40,127,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 4px rgba(45,40,127,0.06)"}>

      {/* Header coloré */}
      <div className="p-5 relative overflow-hidden"
        style={{ background:`linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
        {/* Motif décoratif */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
          style={{ background:C.accent }} />
        <div className="absolute -right-2 bottom-0 w-14 h-14 rounded-full opacity-5"
          style={{ background:C.accent }} />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background:C.accent }}>
                <Trophy className="w-4 h-4" style={{ color:C.primary }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color:"rgba(255,255,255,0.6)" }}>Certifié</span>
            </div>
            <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">
              {cert.course_title}
            </h3>
            {cert.level && (
              <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background:"rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)" }}>
                {LEVELS[cert.level] || cert.level}
              </span>
            )}
          </div>
          <Award className="w-10 h-10 flex-shrink-0 opacity-30 text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Infos */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-400 mb-0.5">Délivré le</p>
            <p className="font-semibold" style={{ color:C.text }}>{issuedDate}</p>
          </div>
          {cert.duration_hours && (
            <div>
              <p className="text-slate-400 mb-0.5">Durée</p>
              <p className="font-semibold flex items-center gap-1" style={{ color:C.text }}>
                <Clock className="w-3 h-3"/> {cert.duration_hours}h
              </p>
            </div>
          )}
        </div>

        {/* Numéro */}
        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
          style={{ background:C.bg, border:`1px solid ${C.border}` }}>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">Numéro de certificat</p>
            <p className="font-mono text-xs font-bold truncate" style={{ color:C.primary }}>
              {cert.certificate_number}
            </p>
          </div>
          <button
            onClick={() => onCopy(cert.certificate_number)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white transition"
            title="Copier le numéro">
            {copied === cert.certificate_number
              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500"/>
              : <Copy className="w-3.5 h-3.5 text-slate-400"/>
            }
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => downloadCertificate(cert, user)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
            style={{ background:`linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
            <Download className="w-3.5 h-3.5"/> Télécharger
          </button>
          <Link
            to={`/certificates/verify/${cert.certificate_number}`}
            className="flex items-center justify-center px-3 py-2 rounded-xl border text-xs font-semibold transition hover:bg-slate-50"
            style={{ border:`1px solid ${C.border}`, color:C.primary }}
            title="Vérifier le certificat">
            <ExternalLink className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function StudentCertificates() {
  const { user } = useAuth();
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get("/certificates/my");
      setCerts(data?.data || []);
    } catch (_) {
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num).catch(() => {});
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Étudiant";

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:C.bg }}>

      {/* Header */}
      <div className="flex-shrink-0 bg-white px-8 py-5 border-b" style={{ borderColor:C.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"#fef9c3" }}>
              <Award className="w-5 h-5" style={{ color:"#854d0e" }}/>
            </div>
            <div>
              <h1 className="text-lg font-black" style={{ color:C.primary }}>Mes certificats</h1>
              <p className="text-xs text-slate-400">
                {loading ? "Chargement…" : `${certs.length} certificat${certs.length !== 1 ? "s" : ""} obtenu${certs.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          {certs.length > 0 && (
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              Cliquez sur <strong>Télécharger</strong> pour obtenir votre certificat en image HD
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color:C.light }}/>
              <p className="text-sm text-slate-400">Chargement des certificats…</p>
            </div>
          </div>
        ) : certs.length === 0 ? (
          /* Empty state */
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background:"#eeeeff" }}>
                <Award className="w-10 h-10" style={{ color:C.light }}/>
              </div>
              <h3 className="text-lg font-black mb-2" style={{ color:C.primary }}>
                Aucun certificat pour l'instant
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Les certificats sont générés automatiquement lorsque vous terminez un cours à 100%.
                Complétez toutes les leçons d'un cours pour obtenir votre certificat.
              </p>
              <Link to="/student/active"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                style={{ background:`linear-gradient(135deg, ${C.primary}, ${C.light})` }}>
                <Zap className="w-4 h-4"/> Continuer mes formations
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl">
            {/* Bannière succès */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
              <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0"/>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  🎉 Félicitations {user?.first_name} ! Vous avez obtenu {certs.length} certificat{certs.length > 1 ? "s" : ""}.
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Partagez votre numéro de certificat pour permettre aux recruteurs de le vérifier en ligne.
                </p>
              </div>
            </div>

            {/* Grille */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {certs.map(cert => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  user={user}
                  onCopy={handleCopy}
                  copied={copied}
                />
              ))}
            </div>

            {/* Info vérification */}
            <div className="mt-6 bg-white border rounded-2xl px-5 py-4 flex items-start gap-3"
              style={{ border:`1px solid ${C.border}` }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:C.light }}/>
              <p className="text-xs text-slate-500">
                Chaque certificat est vérifiable publiquement via son numéro unique sur{" "}
                <Link to="/certificates/verify"
                  className="font-semibold hover:underline"
                  style={{ color:C.light }}>
                  devopsakademy.cloud/certificates/verify
                </Link>.
                Partagez ce lien avec vos recruteurs ou sur LinkedIn.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}