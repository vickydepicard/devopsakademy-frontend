// src/pages/Bootcamps/BootcampsPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Radio, Play, Lock, ChevronRight } from "lucide-react";
import api from "../../api/api";

const STATUS = {
  live:      { label:"🔴 En direct",  color:"#ef4444", bg:"#fef2f2", pulse:true },
  scheduled: { label:"📅 Planifié",   color:"#f59e0b", bg:"#fffbeb", pulse:false },
  ended:     { label:"✅ Terminé",    color:"#10b981", bg:"#f0fdf4", pulse:false },
  cancelled: { label:"❌ Annulé",     color:"#9ca3af", bg:"#f9fafb", pulse:false },
};

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

function BootcampCard({ b }) {
  const st = STATUS[b.status] || STATUS.scheduled;
  const date = new Date(b.scheduled_at);
  const isLive = b.status === "live";
  const isEnded = b.status === "ended";

  return (
    <Link to={`/bootcamps/${b.id}`} style={{ textDecoration:"none" }}>
      <div style={{
        background:"white", borderRadius:20, border:`2px solid ${isLive ? "#ef4444" : "#f0f0f0"}`,
        overflow:"hidden", transition:"all 0.2s",
        boxShadow: isLive ? "0 4px 20px rgba(239,68,68,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
      }} className="hover:-translate-y-1 hover:shadow-xl group">

        {/* Thumbnail */}
        <div style={{ height:180, background:"linear-gradient(135deg,#1e1b4b,#5653e1)",
          position:"relative", overflow:"hidden" }}>
          {b.thumbnail_url && (
            <img src={b.thumbnail_url} alt={b.title}
              style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.85 }} />
          )}

          {/* Status badge */}
          <div style={{ position:"absolute", top:12, left:12, display:"flex",
            alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20,
            background: st.bg, border:`1px solid ${st.color}30` }}>
            {st.pulse && (
              <span style={{ width:8, height:8, borderRadius:"50%", background:st.color,
                animation:"pulse 1.5s infinite" }} />
            )}
            <span style={{ fontSize:12, fontWeight:800, color:st.color }}>{st.label}</span>
          </div>

          {/* Prix */}
          <div style={{ position:"absolute", top:12, right:12, padding:"4px 12px",
            borderRadius:20, background:"rgba(0,0,0,0.6)",
            color:"white", fontSize:12, fontWeight:800 }}>
            {b.is_free ? "Gratuit 🎉" : `${fmt(b.price)} FCFA`}
          </div>

          {/* Play overlay si ended */}
          {isEnded && b.replay_url && (
            <div style={{ position:"absolute", inset:0, display:"flex",
              alignItems:"center", justifyContent:"center",
              background:"rgba(0,0,0,0.4)" }}>
              <div style={{ width:48, height:48, borderRadius:"50%",
                background:"rgba(255,255,255,0.9)", display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                <Play size={20} color="#2d287f" fill="#2d287f" />
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div style={{ padding:"16px" }}>
          <h3 style={{ fontWeight:900, fontSize:15, color:"#111", margin:"0 0 6px",
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            overflow:"hidden" }}>
            {b.title}
          </h3>

          {/* Instructeur */}
          <p style={{ fontSize:12, color:"#5653e1", fontWeight:600, margin:"0 0 10px" }}>
            Par {b.instructor_name}
          </p>

          {/* Méta */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:12 }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#6b7280" }}>
              <Calendar size={11} />
              {date.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#6b7280" }}>
              <Clock size={11} />{b.duration_minutes} min
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#6b7280" }}>
              <Users size={11} />{fmt(b.registered_count)} inscrits
              {b.max_participants && <span style={{ color:"#9ca3af" }}> / {fmt(b.max_participants)}</span>}
            </span>
          </div>

          {/* CTA */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            paddingTop:12, borderTop:"1px solid #f0f0f0",
          }}>
            <span style={{ fontSize:11, fontWeight:700,
              color: b.level === "beginner" ? "#10b981" : b.level === "intermediate" ? "#f59e0b" : "#ef4444" }}>
              {b.level === "beginner" ? "Débutant" : b.level === "intermediate" ? "Intermédiaire" : "Avancé"}
            </span>
            <span style={{ fontSize:12, fontWeight:800, color:"#5653e1",
              display:"flex", alignItems:"center", gap:4 }}
              className="group-hover:underline">
              {isLive ? "Rejoindre le live" : isEnded ? "Voir le replay" : "S'inscrire"}
              <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </Link>
  );
}

export default function BootcampsPage() {
  const [bootcamps, setBootcamps] = useState([]);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get("/bootcamps")
      .then(r => setBootcamps(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? bootcamps
    : bootcamps.filter(b => b.status === filter);

  const counts = {
    all:       bootcamps.length,
    live:      bootcamps.filter(b => b.status === "live").length,
    scheduled: bootcamps.filter(b => b.status === "scheduled").length,
    ended:     bootcamps.filter(b => b.status === "ended").length,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8f7ff" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#2d287f 55%,#5653e1 100%)",
        padding:"40px 24px 36px", textAlign:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:11, fontWeight:700,
          letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 8px" }}>
          DevOps Akademy
        </p>
        <h1 style={{ color:"white", fontSize:"clamp(24px,4vw,38px)", fontWeight:900,
          margin:"0 0 8px", letterSpacing:"-0.02em" }}>
          Bootcamps <span style={{ color:"#facc15" }}>& Lives</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, margin:"0 0 24px" }}>
          Sessions live, formations intensives et replays à la demande
        </p>

        {/* Filtres */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            ["all",       "Tous",          counts.all],
            ["live",      "🔴 En direct",  counts.live],
            ["scheduled", "📅 Planifiés",  counts.scheduled],
            ["ended",     "▶ Replays",     counts.ended],
          ].map(([val, label, count]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{
                padding:"8px 16px", borderRadius:20, border:"2px solid",
                borderColor: filter === val ? "#facc15" : "rgba(255,255,255,0.2)",
                background:  filter === val ? "#facc15" : "rgba(255,255,255,0.1)",
                color:       filter === val ? "#1e1b4b" : "white",
                fontWeight: 700, fontSize: 13, cursor:"pointer", transition:"all 0.2s",
              }}>
              {label} {count > 0 && <span style={{ opacity:0.7 }}>({count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"32px 20px 48px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:36, height:36, border:"3px solid #5653e1",
              borderTopColor:"transparent", borderRadius:"50%",
              animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
            <p style={{ color:"#9ca3af", fontSize:13 }}>Chargement...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <Radio size={40} color="#d1d5db" style={{ margin:"0 auto 12px", display:"block" }} />
            <p style={{ color:"#9ca3af", fontWeight:600 }}>
              {filter === "live" ? "Aucun live en cours pour le moment."
               : filter === "scheduled" ? "Aucun bootcamp planifié."
               : "Aucun bootcamp disponible."}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {filtered.map(b => <BootcampCard key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}