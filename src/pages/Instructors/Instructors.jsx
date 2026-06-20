// src/pages/Instructors/Instructors.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Users, Star, MapPin, Linkedin, Github, Globe, Twitter } from "lucide-react";
import api from "../../api/api";

function Avatar({ src, name = "", size = 72 }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
  const colors = ["#2d287f","#0369a1","#7c3aed","#0f766e","#be185d","#b45309","#0e7490"];
  const bg = colors[(name.charCodeAt(0) || 65) % colors.length];
  if (!src || failed) return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"white", fontWeight:900, fontSize:size*0.35, flexShrink:0,
      border:"3px solid #e0e7ff" }}>
      {initials || "?"}
    </div>
  );
  return <img src={src} alt={name} onError={() => setFailed(true)}
    style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover",
      flexShrink:0, border:"3px solid #e0e7ff" }} />;
}

function StarRating({ val }) {
  if (!val) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(val) ? "#facc15" : "none"}
          color={i <= Math.round(val) ? "#facc15" : "#d1d5db"} />
      ))}
      <span style={{ fontSize:11, fontWeight:800, color:"#374151", marginLeft:1 }}>
        {parseFloat(val).toFixed(1)}
      </span>
    </div>
  );
}

function InstructorCard({ inst }) {
  const skills = (Array.isArray(inst.skills) ? inst.skills : []).slice(0, 2);
  return (
    <Link to={`/instructors/${inst.id}`} style={{ textDecoration:"none" }}>
      <div style={{
        background:"white", borderRadius:20, border:"1.5px solid #f0f0f0",
        padding:"20px", display:"flex", flexDirection:"column", gap:12,
        transition:"all 0.2s", height:"100%", boxSizing:"border-box",
        boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
      }} className="hover:-translate-y-1 hover:shadow-lg group">

        {/* Top row: avatar + infos */}
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <Avatar src={inst.avatar_url} name={inst.name} size={60} />
          <div style={{ minWidth:0, flex:1 }}>
            <h3 style={{ fontWeight:900, fontSize:15, color:"#111", margin:0, lineHeight:1.3,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {inst.name}
            </h3>
            {inst.job_title && (
              <p style={{ fontSize:12, color:"#5653e1", fontWeight:700, margin:"2px 0 0",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {inst.job_title}
              </p>
            )}
            {(inst.city || inst.country) && (
              <p style={{ fontSize:11, color:"#9ca3af", margin:"2px 0 0",
                display:"flex", alignItems:"center", gap:3 }}>
                <MapPin size={10} />{[inst.city, inst.country].filter(Boolean).join(", ")}
              </p>
            )}
            <div style={{ marginTop:4 }}>
              <StarRating val={inst.avg_rating} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.6, margin:0,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {inst.bio || "Passionné de DevOps et des technologies Cloud."}
        </p>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {skills.map(s => (
              <span key={s} style={{ padding:"2px 8px", borderRadius:20, fontSize:10,
                fontWeight:700, background:"#f0efff", color:"#5653e1", border:"1px solid #e0e7ff" }}>
                {s}
              </span>
            ))}
            {inst.skills?.length > 2 && (
              <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10,
                fontWeight:700, background:"#f9fafb", color:"#9ca3af" }}>
                +{inst.skills.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { icon: BookOpen, val: inst.course_count,  label:"Cours" },
            { icon: Users,    val: inst.student_count, label:"Étudiants" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} style={{ background:"#f8f7ff", borderRadius:10,
              padding:"8px", textAlign:"center" }}>
              <Icon size={13} color="#5653e1" style={{ margin:"0 auto 2px", display:"block" }} />
              <p style={{ fontWeight:900, fontSize:16, color:"#2d287f", margin:0 }}>{val}</p>
              <p style={{ fontSize:10, color:"#9ca3af", fontWeight:600, margin:0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Réseaux + CTA */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
          <div style={{ display:"flex", gap:6 }}>
            {[
              [inst.linkedin_url, Linkedin, "#0369a1"],
              [inst.github_url,   Github,   "#374151"],
              [inst.twitter_url,  Twitter,  "#0ea5e9"],
              [inst.website_url,  Globe,    "#0f766e"],
            ].filter(([u]) => u).map(([url, Icon, color]) => (
              <a key={url} href={url} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ width:26, height:26, borderRadius:8, background:"#f9fafb",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:"1px solid #f0f0f0" }}>
                <Icon size={13} color={color} />
              </a>
            ))}
          </div>
          <span style={{ fontSize:11, fontWeight:800, color:"#5653e1" }}
            className="group-hover:underline">
            Voir le profil →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get("/users/instructors")
      .then(r => { setInstructors(r.data?.data || r.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = instructors.filter(i => {
    const s = search.toLowerCase();
    return !s || `${i.name} ${i.job_title} ${i.bio}`.toLowerCase().includes(s) ||
      (Array.isArray(i.skills) && i.skills.some(sk => sk.toLowerCase().includes(s)));
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f8f7ff" }}>

      {/* Header compact */}
      <div style={{
        background:"linear-gradient(135deg,#1e1b4b 0%,#2d287f 55%,#5653e1 100%)",
        padding:"40px 24px 36px", textAlign:"center",
      }}>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:11, fontWeight:700,
          letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 8px" }}>
          DevOps Akademy
        </p>
        <h1 style={{ color:"white", fontSize:"clamp(24px,4vw,38px)", fontWeight:900,
          margin:"0 0 6px", letterSpacing:"-0.02em" }}>
          Nos <span style={{ color:"#facc15" }}>Instructeurs</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13, margin:"0 0 20px" }}>
          {instructors.length} expert{instructors.length > 1 ? "s" : ""} DevOps & Cloud
        </p>

        {/* Search */}
        <div style={{ maxWidth:400, margin:"0 auto", position:"relative" }}>
          <Search size={14} color="#9ca3af"
            style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, spécialité, compétence..."
            style={{ width:"100%", paddingLeft:38, paddingRight:16, paddingTop:11, paddingBottom:11,
              borderRadius:14, border:"none", outline:"none", fontSize:13,
              background:"white", boxSizing:"border-box",
              boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"32px 20px 48px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:36, height:36, border:"3px solid #5653e1", borderTopColor:"transparent",
              borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
            <p style={{ color:"#9ca3af", fontSize:13 }}>Chargement...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <Users size={40} color="#d1d5db" style={{ margin:"0 auto 12px", display:"block" }} />
            <p style={{ color:"#9ca3af", fontWeight:600 }}>
              {search ? `Aucun résultat pour "${search}"` : "Aucun instructeur."}
            </p>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
            gap:20,
          }}>
            {filtered.map(i => <InstructorCard key={i.id} inst={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}