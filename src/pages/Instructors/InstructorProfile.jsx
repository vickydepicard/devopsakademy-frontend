// src/pages/Instructors/InstructorProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Users, BookOpen, MapPin, Globe,
  Linkedin, Github, Twitter, Calendar, Briefcase, Award,
} from "lucide-react";
import api from "../../api/api";
import CourseImage from "../../components/UI/CourseImage";

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");
const levelLabel = { beginner:"Débutant", intermediate:"Intermédiaire", advanced:"Avancé" };
const levelColor = { beginner:"#10b981", intermediate:"#f59e0b", advanced:"#ef4444" };

function Avatar({ src, name = "", size = 96 }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
  const colors = ["#2d287f","#0369a1","#7c3aed","#0f766e","#be185d","#b45309"];
  const bg = colors[(name.charCodeAt(0) || 65) % colors.length];
  if (!src || failed) return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"white", fontWeight:900, fontSize:size*0.36,
      border:"4px solid white", boxShadow:"0 6px 24px rgba(0,0,0,0.2)" }}>
      {initials || "?"}
    </div>
  );
  return <img src={src} alt={name} onError={() => setFailed(true)}
    style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0,
      border:"4px solid white", boxShadow:"0 6px 24px rgba(0,0,0,0.2)" }} />;
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration:"none" }}>
      <div style={{ background:"white", borderRadius:14, border:"1.5px solid #f0f0f0",
        overflow:"hidden", transition:"all 0.2s" }}
        className="hover:shadow-md hover:-translate-y-0.5">
        <div style={{ height:110 }}>
          <CourseImage src={course.thumbnail_url} title={course.title} slug={course.slug}
            wrapperClassName="w-full h-full" />
        </div>
        <div style={{ padding:"10px 12px" }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase",
            color: levelColor[course.level] || "#6b7280" }}>
            {levelLabel[course.level] || course.level}
          </span>
          <p style={{ fontWeight:800, fontSize:12, color:"#111", margin:"3px 0 6px",
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {course.title}
          </p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:900, fontSize:13,
              color: course.is_free ? "#10b981" : "#2d287f" }}>
              {course.is_free ? "Gratuit" : `${fmt(course.price)} FCFA`}
            </span>
            <span style={{ fontSize:10, color:"#9ca3af", display:"flex", alignItems:"center", gap:3 }}>
              <Users size={9} />{fmt(course.enrollment_count)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function InstructorProfile() {
  const { id } = useParams();
  const [inst,    setInst]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get(`/users/instructors/${id}`)
      .then(r => { setInst(r.data?.data || r.data); })
      .catch(() => setError("Instructeur introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid #5653e1", borderTopColor:"transparent",
        borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !inst) return (
    <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:12 }}>
      <p style={{ color:"#ef4444", fontWeight:600 }}>⚠️ {error || "Instructeur introuvable"}</p>
      <Link to="/instructors" style={{ color:"#5653e1", fontWeight:700, textDecoration:"none",
        fontSize:14 }}>← Retour aux instructeurs</Link>
    </div>
  );

  const skills = Array.isArray(inst.skills) ? inst.skills : [];
  const socials = [
    { url:inst.linkedin_url, Icon:Linkedin, color:"#0369a1" },
    { url:inst.github_url,   Icon:Github,   color:"#374151" },
    { url:inst.twitter_url,  Icon:Twitter,  color:"#0ea5e9" },
    { url:inst.website_url,  Icon:Globe,    color:"#0f766e" },
  ].filter(s => s.url);

  return (
    <div style={{ minHeight:"100vh", background:"#f8f7ff" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#2d287f 55%,#5653e1 100%)",
        padding:"24px 24px 72px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Link to="/instructors" style={{ display:"inline-flex", alignItems:"center", gap:6,
            color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:600, textDecoration:"none" }}
            className="hover:text-white">
            <ArrowLeft size={13} /> Tous les instructeurs
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"-52px auto 48px", padding:"0 20px" }}>

        {/* Profil card */}
        <div style={{ background:"white", borderRadius:24, boxShadow:"0 8px 32px rgba(0,0,0,0.1)",
          padding:"24px", marginBottom:20, border:"1px solid #f0f0f0" }}>
          <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
            <Avatar src={inst.avatar_url} name={inst.name} size={90} />
            <div style={{ flex:1, minWidth:200 }}>
              <h1 style={{ fontWeight:900, fontSize:24, color:"#111", margin:"0 0 2px" }}>
                {inst.name}
              </h1>
              {inst.job_title && (
                <p style={{ fontSize:14, color:"#5653e1", fontWeight:700, margin:"0 0 6px" }}>
                  {inst.job_title}{inst.company && <span style={{ color:"#9ca3af", fontWeight:500 }}> · {inst.company}</span>}
                </p>
              )}
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
                {(inst.city || inst.country) && (
                  <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
                    <MapPin size={12} />{[inst.city, inst.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {inst.years_experience && (
                  <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
                    <Briefcase size={12} />{inst.years_experience} ans d'expérience
                  </span>
                )}
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
                  <Calendar size={12} />Depuis {new Date(inst.created_at).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}
                </span>
              </div>

              {/* Stars */}
              {inst.avg_rating && (
                <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:8 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13}
                      fill={i <= Math.round(inst.avg_rating) ? "#facc15":"none"}
                      color={i <= Math.round(inst.avg_rating) ? "#facc15":"#d1d5db"} />
                  ))}
                  <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>
                    {inst.avg_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:12 }}>
              {[
                { Icon:BookOpen, val:inst.course_count,  label:"Cours",     c:"#5653e1", bg:"#f0efff" },
                { Icon:Users,    val:inst.student_count, label:"Étudiants", c:"#0369a1", bg:"#eff6ff" },
                inst.avg_rating && { Icon:Award, val:inst.avg_rating.toFixed(1), label:"Note", c:"#f59e0b", bg:"#fffbeb" },
              ].filter(Boolean).map(({ Icon, val, label, c, bg }) => (
                <div key={label} style={{ background:bg, borderRadius:14, padding:"12px 16px",
                  textAlign:"center", minWidth:72 }}>
                  <Icon size={16} color={c} style={{ margin:"0 auto 3px", display:"block" }} />
                  <p style={{ fontWeight:900, fontSize:20, color:c, margin:0 }}>{val}</p>
                  <p style={{ fontSize:10, color:"#9ca3af", fontWeight:600, margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Réseaux sociaux */}
          {socials.length > 0 && (
            <div style={{ display:"flex", gap:8, marginTop:16, paddingTop:16,
              borderTop:"1px solid #f0f0f0" }}>
              {socials.map(({ url, Icon, color }) => (
                <a key={url} href={url} target="_blank" rel="noreferrer"
                  style={{ width:32, height:32, borderRadius:10, background:"#f9fafb",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    border:"1px solid #f0f0f0", transition:"opacity 0.2s" }}
                  className="hover:opacity-70">
                  <Icon size={15} color={color} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Layout 2 colonnes */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}
          className="instructor-layout">

          {/* Gauche */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Bio */}
            {inst.bio && (
              <div style={{ background:"white", borderRadius:20, padding:20,
                border:"1.5px solid #f0f0f0" }}>
                <h2 style={{ fontWeight:900, fontSize:16, color:"#111", marginBottom:12 }}>À propos</h2>
                <p style={{ color:"#374151", lineHeight:1.8, fontSize:14, margin:0,
                  whiteSpace:"pre-wrap" }}>{inst.bio}</p>
              </div>
            )}

            {/* Compétences */}
            {skills.length > 0 && (
              <div style={{ background:"white", borderRadius:20, padding:20,
                border:"1.5px solid #f0f0f0" }}>
                <h2 style={{ fontWeight:900, fontSize:16, color:"#111", marginBottom:12 }}>
                  Compétences
                </h2>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {skills.map(s => (
                    <span key={s} style={{ padding:"5px 12px", borderRadius:20, fontSize:12,
                      fontWeight:700, background:"#f0efff", color:"#5653e1",
                      border:"1px solid #e0e7ff" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Cours */}
            {inst.courses?.length > 0 && (
              <div style={{ background:"white", borderRadius:20, padding:20,
                border:"1.5px solid #f0f0f0" }}>
                <h2 style={{ fontWeight:900, fontSize:16, color:"#111", marginBottom:14 }}>
                  Cours ({inst.courses.length})
                </h2>
                <div style={{ display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
                  {inst.courses.map(c => <CourseCard key={c.id} course={c} />)}
                </div>
              </div>
            )}
          </div>

          {/* Droite */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* CTA */}
            <div style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)",
              borderRadius:20, padding:20, textAlign:"center" }}>
              <BookOpen size={24} color="rgba(255,255,255,0.8)"
                style={{ margin:"0 auto 8px", display:"block" }} />
              <p style={{ color:"white", fontWeight:900, fontSize:15, margin:"0 0 4px" }}>
                Prêt à apprendre ?
              </p>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"0 0 12px" }}>
                {inst.course_count} cours disponibles
              </p>
              <Link to="/courses" style={{ display:"block", padding:"10px",
                borderRadius:12, background:"#facc15", color:"#1e1b4b",
                fontWeight:900, fontSize:13, textDecoration:"none" }}>
                Explorer les cours →
              </Link>
            </div>

            {/* Infos rapides */}
            <div style={{ background:"white", borderRadius:20, padding:16,
              border:"1.5px solid #f0f0f0" }}>
              <h3 style={{ fontWeight:800, fontSize:14, color:"#111", marginBottom:12 }}>
                Informations
              </h3>
              {[
                [BookOpen, "Cours publiés",    inst.course_count],
                [Users,    "Apprenants",       fmt(inst.student_count)],
                [Calendar, "Membre depuis",    new Date(inst.created_at).toLocaleDateString("fr-FR",{month:"short",year:"numeric"})],
                inst.years_experience && [Briefcase, "Expérience", `${inst.years_experience} ans`],
              ].filter(Boolean).map(([Icon, label, val]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", fontSize:12, paddingBottom:8, marginBottom:8,
                  borderBottom:"1px solid #f9fafb" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:6, color:"#6b7280" }}>
                    <Icon size={12} />{label}
                  </span>
                  <span style={{ fontWeight:700, color:"#111" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .instructor-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}