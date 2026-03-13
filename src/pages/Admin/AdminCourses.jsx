// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  AdminCourses.jsx  —  Gestion complète des cours DevOpsAkademy          ║
// ║  Cours → Modules → Leçons → Ressources → Quiz → Questions → Projets     ║
// ║  Utilise proxy Vite /api → localhost:5000  (pas de VITE_API_URL)        ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";

/* ══════════════════════ CONSTANTES ══════════════════════ */
const LEVEL_MAP   = { beginner:"Débutant", intermediate:"Intermédiaire", advanced:"Avancé" };
const LEVEL_CLR   = { beginner:"#10b981",  intermediate:"#f59e0b",       advanced:"#ef4444" };
const CTYPE_MAP   = { video:"Vidéo", article:"Article", quiz:"Quiz", exercise:"Exercice", download:"Téléchargement" };
const CTYPE_ICO   = { video:"▶", article:"📄", quiz:"📝", exercise:"⚡", download:"📥" };
const QTYPE_MAP   = { multiple_choice:"Choix unique", multiple_select:"Choix multiple", true_false:"Vrai/Faux", short_answer:"Réponse courte", code:"Code", ordering:"Ordre", matching:"Association" };
const SUB_MAP     = { github_url:"GitHub URL", file_upload:"Fichier", both:"GitHub + Fichier" };

const COURSE_BLANK = {
  title:"", slug:"", short_description:"", description:"",
  instructor_id:"", category_id:"", price:0, original_price:"",
  duration_hours:"", level:"beginner", language:"fr",
  thumbnail_url:"", video_preview_url:"",
  is_published:false, is_featured:false, is_free:false,
  is_subscription_included:false, is_forum_enabled:true,
  sequential_mode:false, requires_approval:false,
  instructor_commission_rate:70,
  requirements:"", learning_outcomes:"",
};
const MODULE_BLANK  = { title:"", description:"", order_index:0, is_published:true };
const LESSON_BLANK  = { title:"", content_type:"video", content_url:"", article_content:"", duration_minutes:0, order_index:0, is_published:true, is_preview:false, requires_completion:true, is_downloadable:false };
const RESOURCE_BLANK = { title:"", file_url:"", file_type:"", order_index:0 };
const QUIZ_BLANK    = { title:"", description:"", time_limit_minutes:0, pass_score:80, max_attempts:3, show_correct_answers:true, randomize_questions:false, is_mandatory:false, cooldown_minutes:0 };
const QUESTION_BLANK = { question:"", question_type:"multiple_choice", options:"", correct_answer:"", explanation:"", points:1, order_index:0 };
const PROJECT_BLANK  = { title:"", description:"", instructions:"", submission_type:"github_url", pass_score:70, sla_correction_hours:72, max_file_size_mb:50, is_active:true, evaluation_criteria:"" };

/* ══════════════════════ API HELPER ══════════════════════ */
async function api(token, method, path, body) {
  try {
    const r = await fetch(`/api/admin${path}`, {
      method,
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await r.text();
    try { return JSON.parse(txt); }
    catch { return { success:false, message:`Erreur ${r.status}: réponse non-JSON`, data:[] }; }
  } catch(e) { return { success:false, message:"Erreur réseau", data:[] }; }
}

/* ══════════════════════ TOAST ══════════════════════ */
function Toast({ t }) {
  if (!t) return null;
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:13, color:"#fff", background:t.ok?"#059669":"#dc2626", boxShadow:"0 8px 32px rgba(0,0,0,.18)", display:"flex", alignItems:"center", gap:10, minWidth:260, animation:"slideIn .25s ease" }}>
      <span style={{ fontSize:16 }}>{t.ok?"✓":"✗"}</span> {t.msg}
    </div>
  );
}

/* ══════════════════════ CONFIRM DIALOG ══════════════════════ */
function Confirm({ data, onClose }) {
  if (!data) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.6)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff", borderRadius:18, padding:32, maxWidth:420, width:"90%", boxShadow:"0 24px 80px rgba(0,0,0,.2)" }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⚠️</div>
        <p style={{ fontWeight:700, color:"#0f172a", marginBottom:8, fontSize:15 }}>{data.title||"Confirmer la suppression"}</p>
        <p style={{ color:"#64748b", fontSize:13, marginBottom:24, lineHeight:1.6 }}>{data.msg}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px 0", background:"#f1f5f9", color:"#334155", border:"none", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" }}>Annuler</button>
          <button onClick={data.onOk} style={{ flex:1, padding:"11px 0", background:"#dc2626", color:"#fff", border:"none", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ UI ATOMS ══════════════════════ */
const S = {
  inp: { width:"100%", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"9px 13px", fontSize:13, color:"#1e293b", outline:"none", background:"#fff", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color .15s" },
  card: (accent="#4f46e5") => ({ background:"#fff", borderRadius:16, border:`1px solid #e2e8f0`, borderTop:`3px solid ${accent}`, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }),
  tag: (bg, color) => ({ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:bg, color }),
};

function Field({ label, required, hint, children, col }) {
  return (
    <div style={{ gridColumn: col ? `span ${col}` : undefined, display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.5, display:"flex", gap:6, alignItems:"center" }}>
        {label}{required && <span style={{ color:"#ef4444" }}>*</span>}
        {hint && <span style={{ fontSize:10, fontWeight:400, color:"#94a3b8", textTransform:"none", letterSpacing:0 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, color="#4f46e5" }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none" }}>
      <div onClick={() => onChange(!checked)} style={{ width:46, height:25, borderRadius:13, position:"relative", cursor:"pointer", background:checked?color:"#cbd5e1", transition:"background .2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, width:19, height:19, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,.25)", transition:"left .2s", left:checked?24:3 }} />
      </div>
      <span style={{ fontSize:13, color:"#334155", fontWeight:500 }}>{label}</span>
    </label>
  );
}

function Btn({ children, onClick, color="#4f46e5", light, sm, disabled, style={} }) {
  const bg = light ? color+"18" : color;
  const tc = light ? color : "#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: sm?"6px 14px":"10px 20px", background:disabled?"#e2e8f0":bg, color:disabled?"#94a3b8":tc, border:"none", borderRadius:10, fontWeight:600, fontSize:sm?12:13, cursor:disabled?"not-allowed":"pointer", transition:"opacity .15s", ...style }}>
      {children}
    </button>
  );
}

function Pill({ children, color="#4f46e5" }) {
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:color+"22", color, whiteSpace:"nowrap" }}>{children}</span>;
}

function Section({ icon, title, count, accent="#4f46e5", children, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,.04)" }}>
      <div onClick={() => setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", background:"#f8fafc", cursor:"pointer", userSelect:"none", borderLeft:`4px solid ${accent}` }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ flex:1, fontWeight:700, fontSize:14, color:"#1e293b" }}>{title}</span>
        {count !== undefined && <Pill color={accent}>{count} élément{count!==1?"s":""}</Pill>}
        <span style={{ color:"#94a3b8", fontSize:12, transition:"transform .2s", display:"inline-block", transform:open?"rotate(180deg)":"rotate(0deg)" }}>▼</span>
      </div>
      {open && <div style={{ padding:"18px 18px 20px" }}>{children}</div>}
    </div>
  );
}

function InlineForm({ title, onSave, onCancel, children, saving }) {
  return (
    <div style={{ background:"#f0f4ff", border:"1px solid #c7d2fe", borderRadius:12, padding:16, marginBottom:14 }}>
      <p style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:.5 }}>{title}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{children}</div>
      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        <Btn onClick={onSave} disabled={saving}>{saving ? "Enregistrement..." : "✓ Enregistrer"}</Btn>
        <Btn onClick={onCancel} color="#64748b" light>Annuler</Btn>
      </div>
    </div>
  );
}

/* ══════════════════════ COMPOSANT PRINCIPAL ══════════════════════ */
export default function AdminCourses() {
  const { token } = useAuth();

  /* — Données globales — */
  const [courses,      setCourses]      = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [instructors,  setInstructors]  = useState([]);

  /* — Données d'un cours sélectionné — */
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules,        setModules]         = useState([]);
  const [lessons,        setLessons]         = useState({});   // { [moduleId]: [...] }
  const [resources,      setResources]       = useState({});   // { [lessonId]: [...] }
  const [quizData,       setQuizData]        = useState({});   // { [lessonId]: quiz }
  const [questions,      setQuestions]       = useState({});   // { [quizId]: [...] }
  const [projects,       setProjects]        = useState([]);

  /* — Navigation — */
  const [view,    setView]    = useState("list"); // "list" | "form" | "detail"
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filterSt, setFilterSt] = useState("all");

  /* — Formulaire cours — */
  const [courseForm,  setCourseForm]  = useState(COURSE_BLANK);
  const [isNewCourse, setIsNewCourse] = useState(true);
  const [saving,      setSaving]      = useState(false);

  /* — États formulaires inline — */
  const [editingModule,   setEditingModule]   = useState(null);
  const [moduleForm,      setModuleForm]       = useState(MODULE_BLANK);
  const [showModForm,     setShowModForm]      = useState(false);
  const [savingMod,       setSavingMod]        = useState(false);

  const [openModId,       setOpenModId]        = useState(null);
  const [editingLesson,   setEditingLesson]     = useState(null);
  const [lessonForm,      setLessonForm]        = useState(LESSON_BLANK);
  const [showLessonForm,  setShowLessonForm]    = useState(null); // moduleId
  const [savingLesson,    setSavingLesson]      = useState(false);

  const [editingResource, setEditingResource]   = useState(null);
  const [resourceForm,    setResourceForm]      = useState(RESOURCE_BLANK);
  const [showResForm,     setShowResForm]       = useState(null); // lessonId
  const [savingRes,       setSavingRes]         = useState(false);

  const [editingQuiz,     setEditingQuiz]       = useState(null);
  const [quizForm,        setQuizForm]          = useState(QUIZ_BLANK);
  const [showQuizForm,    setShowQuizForm]      = useState(null); // lessonId
  const [savingQuiz,      setSavingQuiz]        = useState(false);

  const [editingQuestion, setEditingQuestion]   = useState(null);
  const [questionForm,    setQuestionForm]      = useState(QUESTION_BLANK);
  const [showQForm,       setShowQForm]         = useState(null); // quizId
  const [savingQ,         setSavingQ]           = useState(false);
  const [openQuizId,      setOpenQuizId]        = useState(null);

  const [editingProject,  setEditingProject]    = useState(null);
  const [projectForm,     setProjectForm]       = useState(PROJECT_BLANK);
  const [showProjForm,    setShowProjForm]      = useState(false);
  const [savingProj,      setSavingProj]        = useState(false);

  /* — Toast & Confirm — */
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const tmr = useRef(null);

  /* ——— Helpers ——— */
  const t$ = (msg, ok=true) => { clearTimeout(tmr.current); setToast({msg,ok}); tmr.current = setTimeout(()=>setToast(null),3500); };
  const ask = (title, msg, fn) => setConfirm({ title, msg, onOk:()=>{ setConfirm(null); fn(); } });

  const cf = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter(p => ({ ...p, [name]: type==="checkbox" ? checked : value }));
  };

  /* ══════════ CHARGEMENT INITIAL ══════════ */
  const loadCourses = useCallback(async () => {
    setLoading(true);
    const [rC, rCat, rI] = await Promise.all([
      api(token,"GET","/courses"),
      api(token,"GET","/categories"),
      api(token,"GET","/instructors"),
    ]);
    setCourses(rC.data||[]);
    setCategories(rCat.data||[]);
    setInstructors(rI.data||[]);
    setLoading(false);
  }, [token]);

  useEffect(() => { if (token) loadCourses(); }, [token, loadCourses]);

  /* ══════════ LOADERS PROFONDS ══════════ */
  const loadModules  = async (cid)  => { const r = await api(token,"GET",`/courses/${cid}/modules`);  setModules(r.data||[]); };
  const loadLessons  = async (mid)  => { const r = await api(token,"GET",`/modules/${mid}/lessons`);  setLessons(p=>({...p,[mid]:r.data||[]})); };
  const loadResources= async (lid)  => { const r = await api(token,"GET",`/lessons/${lid}/resources`);setResources(p=>({...p,[lid]:r.data||[]})); };
  const loadQuiz     = async (lid)  => { const r = await api(token,"GET",`/lessons/${lid}/quiz`);     setQuizData(p=>({...p,[lid]:r.data||null})); return r.data||null; };
  const loadQuestions= async (qid)  => { const r = await api(token,"GET",`/quizzes/${qid}/questions`);setQuestions(p=>({...p,[qid]:r.data||[]})); };
  const loadProjects = async (cid)  => { const r = await api(token,"GET",`/courses/${cid}/projects`); setProjects(r.data||[]); };

  const openDetail = async (course) => {
    setSelectedCourse(course);
    setModules([]); setLessons({}); setResources({}); setQuizData({}); setQuestions({}); setProjects([]);
    setOpenModId(null); setShowModForm(false); setShowProjForm(false);
    setView("detail");
    await Promise.all([loadModules(course.id), loadProjects(course.id)]);
  };

  const toggleModule = async (mid) => {
    if (openModId===mid) { setOpenModId(null); return; }
    setOpenModId(mid);
    if (!lessons[mid]) await loadLessons(mid);
  };

  const openQuiz = async (lid, qid) => {
    if (openQuizId===qid) { setOpenQuizId(null); return; }
    setOpenQuizId(qid);
    if (!questions[qid]) await loadQuestions(qid);
  };

  /* ══════════ COURS CRUD ══════════ */
  const startCreate = () => { setIsNewCourse(true); setCourseForm(COURSE_BLANK); setView("form"); };
  const startEdit   = (c) => {
    setIsNewCourse(false);
    setCourseForm({
      title:c.title||"", slug:c.slug||"", short_description:c.short_description||"",
      description:c.description||"", instructor_id:c.instructor_id||"", category_id:c.category_id||"",
      price:c.price??0, original_price:c.original_price||"", duration_hours:c.duration_hours||"",
      level:c.level||"beginner", language:c.language||"fr",
      thumbnail_url:c.thumbnail_url||"", video_preview_url:c.video_preview_url||"",
      is_published:!!c.is_published, is_featured:!!c.is_featured, is_free:!!c.is_free,
      is_subscription_included:!!c.is_subscription_included, is_forum_enabled:!!c.is_forum_enabled,
      sequential_mode:!!c.sequential_mode, requires_approval:!!c.requires_approval,
      instructor_commission_rate:c.instructor_commission_rate||70,
      requirements: Array.isArray(c.requirements) ? c.requirements.join("\n") : (c.requirements||""),
      learning_outcomes: Array.isArray(c.learning_outcomes) ? c.learning_outcomes.join("\n") : (c.learning_outcomes||""),
    });
    setSelectedCourse(c);
    setView("form");
  };

  const saveCourse = async () => {
    if (!courseForm.title.trim())  { t$("Titre requis",false); return; }
    if (!courseForm.instructor_id) { t$("Instructeur requis",false); return; }
    setSaving(true);
    const payload = {
      ...courseForm,
      price: Number(courseForm.price)||0,
      requirements: courseForm.requirements ? courseForm.requirements.split("\n").filter(Boolean) : [],
      learning_outcomes: courseForm.learning_outcomes ? courseForm.learning_outcomes.split("\n").filter(Boolean) : [],
    };
    const r = isNewCourse
      ? await api(token,"POST","/courses",payload)
      : await api(token,"PATCH",`/courses/${selectedCourse.id}`,payload);
    setSaving(false);
    if (r.success) { t$(r.message||"Cours enregistré ✓"); loadCourses(); setView("list"); }
    else t$(r.message||"Erreur",false);
  };

  const togglePublish = async (c,e) => {
    e?.stopPropagation();
    const r = await api(token,"PATCH",`/courses/${c.id}/publish`,{is_published:!c.is_published});
    if (r.success) { t$(r.message); loadCourses(); if(selectedCourse?.id===c.id) setSelectedCourse({...selectedCourse,is_published:!c.is_published}); }
    else t$(r.message||"Erreur",false);
  };

  const deleteCourse = (c) => ask("Supprimer ce cours", `"${c.title}" et tout son contenu (modules, leçons, quiz, projets) sera définitivement supprimé.`, async () => {
    const r = await api(token,"DELETE",`/courses/${c.id}`);
    if (r.success) { t$("Cours supprimé"); loadCourses(); if(view!=="list") setView("list"); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ MODULES CRUD ══════════ */
  const startModEdit = (mod) => { setEditingModule(mod); setModuleForm({title:mod.title,description:mod.description||"",order_index:mod.order_index||0,is_published:!!mod.is_published}); setShowModForm(false); };
  const cancelModEdit = () => { setEditingModule(null); setModuleForm(MODULE_BLANK); };

  const saveModule = async () => {
    if (!moduleForm.title.trim()) { t$("Titre du module requis",false); return; }
    setSavingMod(true);
    const r = editingModule
      ? await api(token,"PATCH",`/modules/${editingModule.id}`,moduleForm)
      : await api(token,"POST","/modules",{...moduleForm,course_id:selectedCourse.id});
    setSavingMod(false);
    if (r.success) { t$(r.message||"Module enregistré"); cancelModEdit(); setShowModForm(false); setModuleForm(MODULE_BLANK); loadModules(selectedCourse.id); }
    else t$(r.message||"Erreur",false);
  };

  const deleteModule = (mod) => ask("Supprimer ce module", `"${mod.title}" et toutes ses leçons seront supprimés.`, async () => {
    const r = await api(token,"DELETE",`/modules/${mod.id}`);
    if (r.success) { t$("Module supprimé"); loadModules(selectedCourse.id); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ LEÇONS CRUD ══════════ */
  const startLessonEdit = (lesson, mid) => {
    setEditingLesson(lesson);
    setLessonForm({
      title:lesson.title||"", content_type:lesson.content_type||"video",
      content_url:lesson.content_url||"", article_content:lesson.article_content||"",
      duration_minutes:lesson.duration_minutes||0, order_index:lesson.order_index||0,
      is_published:lesson.is_published!==0, is_preview:!!lesson.is_preview,
      requires_completion:!!lesson.requires_completion, is_downloadable:!!lesson.is_downloadable,
    });
    setShowLessonForm(mid);
  };

  const cancelLessonEdit = () => { setEditingLesson(null); setLessonForm(LESSON_BLANK); setShowLessonForm(null); };

  const saveLesson = async (mid) => {
    if (!lessonForm.title.trim()) { t$("Titre de la leçon requis",false); return; }
    setSavingLesson(true);
    const r = editingLesson
      ? await api(token,"PATCH",`/lessons/${editingLesson.id}`,lessonForm)
      : await api(token,"POST","/lessons",{...lessonForm,module_id:mid});
    setSavingLesson(false);
    if (r.success) { t$(r.message||"Leçon enregistrée"); cancelLessonEdit(); loadLessons(mid); }
    else t$(r.message||"Erreur",false);
  };

  const deleteLesson = (l, mid) => ask("Supprimer cette leçon", `"${l.title}" et ses ressources/quiz seront supprimés.`, async () => {
    const r = await api(token,"DELETE",`/lessons/${l.id}`);
    if (r.success) { t$("Leçon supprimée"); loadLessons(mid); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ RESSOURCES CRUD ══════════ */
  const startResEdit = (res, lid) => { setEditingResource(res); setResourceForm({title:res.title,file_url:res.file_url,file_type:res.file_type||"",order_index:res.order_index||0}); setShowResForm(lid); };
  const cancelResEdit = () => { setEditingResource(null); setResourceForm(RESOURCE_BLANK); setShowResForm(null); };

  const saveResource = async (lid) => {
    if (!resourceForm.title.trim() || !resourceForm.file_url.trim()) { t$("Titre et URL requis",false); return; }
    setSavingRes(true);
    const r = editingResource
      ? await api(token,"PATCH",`/lesson-resources/${editingResource.id}`,resourceForm)
      : await api(token,"POST","/lessons/resources",{...resourceForm,lesson_id:lid});
    setSavingRes(false);
    if (r.success) { t$(r.message||"Ressource enregistrée"); cancelResEdit(); loadResources(lid); }
    else t$(r.message||"Erreur",false);
  };

  const deleteResource = (res, lid) => ask("Supprimer cette ressource", `"${res.title}" sera supprimée.`, async () => {
    const r = await api(token,"DELETE",`/lesson-resources/${res.id}`);
    if (r.success) { t$("Ressource supprimée"); loadResources(lid); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ QUIZ CRUD ══════════ */
  const startQuizEdit = (quiz, lid) => { setEditingQuiz({...quiz,lid}); setQuizForm({title:quiz.title,description:quiz.description||"",time_limit_minutes:quiz.time_limit_minutes||0,pass_score:quiz.pass_score||80,max_attempts:quiz.max_attempts||3,show_correct_answers:!!quiz.show_correct_answers,randomize_questions:!!quiz.randomize_questions,is_mandatory:!!quiz.is_mandatory,cooldown_minutes:quiz.cooldown_minutes||0}); setShowQuizForm(lid); };
  const cancelQuizEdit = () => { setEditingQuiz(null); setQuizForm(QUIZ_BLANK); setShowQuizForm(null); };

  const saveQuiz = async (lid) => {
    if (!quizForm.title.trim()) { t$("Titre du quiz requis",false); return; }
    setSavingQuiz(true);
    const r = editingQuiz
      ? await api(token,"PATCH",`/quizzes/${editingQuiz.id}`,quizForm)
      : await api(token,"POST","/quizzes",{...quizForm,lesson_id:lid});
    setSavingQuiz(false);
    if (r.success) { t$(r.message||"Quiz enregistré"); cancelQuizEdit(); const q = await loadQuiz(lid); if(q) await loadQuestions(q.id); }
    else t$(r.message||"Erreur",false);
  };

  /* ══════════ QUESTIONS CRUD ══════════ */
  const startQEdit = (q, qid) => { setEditingQuestion({...q,qid}); setQuestionForm({question:q.question,question_type:q.question_type||"multiple_choice",options:typeof q.options==="string"?q.options:JSON.stringify(q.options||""),correct_answer:typeof q.correct_answer==="string"?q.correct_answer:JSON.stringify(q.correct_answer),explanation:q.explanation||"",points:q.points||1,order_index:q.order_index||0}); setShowQForm(qid); };
  const cancelQEdit = () => { setEditingQuestion(null); setQuestionForm(QUESTION_BLANK); setShowQForm(null); };

  const saveQuestion = async (qid) => {
    if (!questionForm.question.trim()) { t$("Question requise",false); return; }
    setSavingQ(true);
    let payload = { ...questionForm };
    try { payload.options = JSON.parse(questionForm.options); } catch {}
    try { payload.correct_answer = JSON.parse(questionForm.correct_answer); } catch {}
    const r = editingQuestion
      ? await api(token,"PATCH",`/quiz-questions/${editingQuestion.id}`,payload)
      : await api(token,"POST","/quiz-questions",{...payload,quiz_id:qid});
    setSavingQ(false);
    if (r.success) { t$(r.message||"Question enregistrée"); cancelQEdit(); loadQuestions(qid); }
    else t$(r.message||"Erreur",false);
  };

  const deleteQuestion = (q, qid) => ask("Supprimer cette question", `Cette question sera supprimée définitivement.`, async () => {
    const r = await api(token,"DELETE",`/quiz-questions/${q.id}`);
    if (r.success) { t$("Question supprimée"); loadQuestions(qid); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ PROJETS CRUD ══════════ */
  const startProjEdit = (proj) => { setEditingProject(proj); setProjectForm({title:proj.title,description:proj.description,instructions:proj.instructions||"",submission_type:proj.submission_type||"github_url",pass_score:proj.pass_score||70,sla_correction_hours:proj.sla_correction_hours||72,max_file_size_mb:proj.max_file_size_mb||50,is_active:!!proj.is_active,evaluation_criteria:typeof proj.evaluation_criteria==="string"?proj.evaluation_criteria:JSON.stringify(proj.evaluation_criteria||"")}); setShowProjForm(false); };
  const cancelProjEdit = () => { setEditingProject(null); setProjectForm(PROJECT_BLANK); };

  const saveProject = async () => {
    if (!projectForm.title.trim()) { t$("Titre du projet requis",false); return; }
    setSavingProj(true);
    let payload = { ...projectForm };
    try { payload.evaluation_criteria = JSON.parse(projectForm.evaluation_criteria); } catch {}
    const r = editingProject
      ? await api(token,"PATCH",`/projects/${editingProject.id}`,payload)
      : await api(token,"POST","/projects",{...payload,course_id:selectedCourse.id});
    setSavingProj(false);
    if (r.success) { t$(r.message||"Projet enregistré"); cancelProjEdit(); setShowProjForm(false); loadProjects(selectedCourse.id); }
    else t$(r.message||"Erreur",false);
  };

  const deleteProject = (proj) => ask("Supprimer ce projet", `"${proj.title}" sera supprimé.`, async () => {
    const r = await api(token,"DELETE",`/projects/${proj.id}`);
    if (r.success) { t$("Projet supprimé"); loadProjects(selectedCourse.id); }
    else t$(r.message||"Erreur",false);
  });

  /* ══════════ FILTRES ══════════ */
  const filtered = courses.filter(c => {
    const s = c.title?.toLowerCase().includes(search.toLowerCase());
    if (filterSt==="published") return s && c.is_published;
    if (filterSt==="draft")     return s && !c.is_published;
    if (filterSt==="free")      return s && c.is_free;
    if (filterSt==="featured")  return s && c.is_featured;
    return s;
  });

  const totalLessons = (courseId) => {
    const mods = modules.filter ? modules : [];
    return Object.values(lessons).flat().length;
  };

  /* ══════════════════════════════════════════════════════
     ██████  RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ padding:"24px 28px", maxWidth:1280, margin:"0 auto", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      <Toast t={toast} />
      <Confirm data={confirm} onClose={() => setConfirm(null)} />
      <style>{`
        @keyframes slideIn { from { transform:translateX(100%); opacity:0 } to { transform:translateX(0); opacity:1 } }
        @keyframes spin { to { transform:rotate(360deg) } }
        .row-hover:hover { background:#f8fafc !important; }
        input:focus, select:focus, textarea:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px #6366f122 !important; }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━ VUE LISTE ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {view==="list" && <>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>🎓 Cours</h1>
            <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:13 }}>{courses.length} cours · {courses.filter(c=>c.is_published).length} publiés · {courses.filter(c=>c.is_featured).length} mis en avant</p>
          </div>
          <Btn onClick={startCreate}>＋ Nouveau cours</Btn>
        </div>

        {/* Filtres */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher par titre…" style={{ ...S.inp, flex:1, minWidth:220 }} />
          {["all","published","draft","free","featured"].map(v=>(
            <button key={v} onClick={()=>setFilterSt(v)} style={{ padding:"8px 16px", background:filterSt===v?"#4f46e5":"#f1f5f9", color:filterSt===v?"#fff":"#64748b", border:"none", borderRadius:10, fontWeight:600, fontSize:12, cursor:"pointer" }}>
              {v==="all"?"Tous":v==="published"?"✅ Publiés":v==="draft"?"○ Brouillons":v==="free"?"🆓 Gratuits":"⭐ Vedette"}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"80px 0" }}>
            <div style={{ width:40, height:40, border:"4px solid #e0e7ff", borderTopColor:"#4f46e5", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:"#94a3b8" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>📭</div>
            <p style={{ fontWeight:600, fontSize:15 }}>Aucun cours trouvé</p>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.06)" }}>
            {/* Thead */}
            <div style={{ display:"grid", gridTemplateColumns:"2.5fr 1.2fr 1fr 140px 160px 170px", padding:"10px 18px", background:"#f8fafc", borderBottom:"2px solid #e2e8f0" }}>
              {["Cours","Instructeur","Catégorie","Prix / Niveau","Statut","Actions"].map(h=>(
                <span key={h} style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1 }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((c, i) => (
              <div key={c.id} className="row-hover" onClick={()=>openDetail(c)} style={{ display:"grid", gridTemplateColumns:"2.5fr 1.2fr 1fr 140px 160px 170px", padding:"13px 18px", alignItems:"center", borderBottom:i<filtered.length-1?"1px solid #f1f5f9":"none", cursor:"pointer", transition:"background .12s" }}>
                {/* Cours */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:36, borderRadius:10, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${LEVEL_CLR[c.level]||"#4f46e5"}88,${LEVEL_CLR[c.level]||"#7c3aed"})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,.1)" }}>
                    {c.thumbnail_url
                      ? <img src={c.thumbnail_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none";}} />
                      : <span style={{ color:"#fff", fontWeight:800, fontSize:15 }}>{c.title?.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:700, color:"#1e293b", fontSize:13 }}>{c.title}</p>
                    <p style={{ margin:0, fontSize:11, color:"#94a3b8", maxWidth:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.short_description||"—"}</p>
                  </div>
                </div>
                {/* Instructeur */}
                <span style={{ fontSize:13, color:"#475569" }}>{c.instructor_name||"—"}</span>
                {/* Catégorie */}
                <span style={{ fontSize:12, color:"#475569" }}>{c.category_name||"—"}</span>
                {/* Prix / Niveau */}
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:13, color:c.is_free?"#059669":"#1e293b" }}>
                    {c.is_free?"GRATUIT":`${Number(c.price||0).toLocaleString()} XAF`}
                  </p>
                  <span style={{ ...S.tag(LEVEL_CLR[c.level]+"22", LEVEL_CLR[c.level]||"#6b7280") }}>{LEVEL_MAP[c.level]||c.level}</span>
                </div>
                {/* Statut */}
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <Pill color={c.is_published?"#059669":"#94a3b8"}>{c.is_published?"✓ Publié":"○ Brouillon"}</Pill>
                  {c.is_featured && <Pill color="#d97706">⭐ Vedette</Pill>}
                  {c.is_subscription_included && <Pill color="#7c3aed">📦 Abonnement</Pill>}
                </div>
                {/* Actions */}
                <div style={{ display:"flex", gap:5 }} onClick={e=>e.stopPropagation()}>
                  <IcoBtn onClick={()=>openDetail(c)} color="#3b82f6" title="Voir le contenu">👁</IcoBtn>
                  <IcoBtn onClick={()=>togglePublish(c)} color={c.is_published?"#f97316":"#10b981"} title={c.is_published?"Dépublier":"Publier"}>{c.is_published?"⊘":"▶"}</IcoBtn>
                  <IcoBtn onClick={()=>startEdit(c)} color="#6366f1" title="Modifier">✏️</IcoBtn>
                  <IcoBtn onClick={()=>deleteCourse(c)} color="#ef4444" title="Supprimer">🗑</IcoBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </>}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━ VUE FORMULAIRE COURS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {view==="form" && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
            <Btn onClick={()=>setView(selectedCourse&&!isNewCourse?"detail":"list")} color="#64748b" light>← Retour</Btn>
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#0f172a" }}>{isNewCourse?"🆕 Nouveau cours":`✏️ ${selectedCourse?.title}`}</h1>
              {!isNewCourse && <p style={{ margin:"3px 0 0", fontSize:12, color:"#94a3b8" }}>ID #{selectedCourse?.id} · Modifié le {new Date(selectedCourse?.updated_at).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>
            {/* ── Colonne principale ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              <div style={S.card("#4f46e5")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:.5 }}>📋 Informations générales</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Titre" required><input name="title" style={S.inp} value={courseForm.title} onChange={cf(setCourseForm)} placeholder="Ex: Docker Fondamentaux" /></Field>
                  <Field label="Slug URL"><input name="slug" style={S.inp} value={courseForm.slug} onChange={cf(setCourseForm)} placeholder="docker-fondamentaux" /></Field>
                  <Field label="Résumé court" col={2}><input name="short_description" style={S.inp} value={courseForm.short_description} onChange={cf(setCourseForm)} placeholder="Description affichée dans les listes" /></Field>
                  <Field label="Description complète" col={2}><textarea name="description" style={{...S.inp,resize:"vertical"}} rows={5} value={courseForm.description} onChange={cf(setCourseForm)} placeholder="Description détaillée du cours…" /></Field>
                </div>
              </div>

              <div style={S.card("#0ea5e9")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#0ea5e9", textTransform:"uppercase", letterSpacing:.5 }}>📝 Contenu pédagogique</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Prérequis" hint="1 par ligne" col={2}><textarea name="requirements" style={{...S.inp,resize:"vertical"}} rows={3} value={courseForm.requirements} onChange={cf(setCourseForm)} placeholder="Bases de Linux&#10;Connaissance Docker" /></Field>
                  <Field label="Objectifs d'apprentissage" hint="1 par ligne" col={2}><textarea name="learning_outcomes" style={{...S.inp,resize:"vertical"}} rows={3} value={courseForm.learning_outcomes} onChange={cf(setCourseForm)} placeholder="Déployer des conteneurs&#10;Maîtriser Docker Compose" /></Field>
                </div>
              </div>

              <div style={S.card("#f59e0b")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:.5 }}>🖼 Médias</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="URL Image de couverture">
                    <input name="thumbnail_url" style={S.inp} value={courseForm.thumbnail_url} onChange={cf(setCourseForm)} placeholder="https://…" />
                    {courseForm.thumbnail_url && <img src={courseForm.thumbnail_url} alt="" style={{ marginTop:8, height:70, borderRadius:8, objectFit:"cover", border:"1px solid #e2e8f0" }} onError={e=>e.target.style.display="none"} />}
                  </Field>
                  <Field label="URL Vidéo de prévisualisation"><input name="video_preview_url" style={S.inp} value={courseForm.video_preview_url} onChange={cf(setCourseForm)} placeholder="https://youtube.com/…" /></Field>
                </div>
              </div>
            </div>

            {/* ── Colonne latérale ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              <div style={S.card("#8b5cf6")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#8b5cf6", textTransform:"uppercase", letterSpacing:.5 }}>👤 Assignation</p>
                <Field label="Instructeur" required>
                  <select name="instructor_id" style={S.inp} value={courseForm.instructor_id} onChange={cf(setCourseForm)}>
                    <option value="">— Sélectionner —</option>
                    {instructors.map(i=><option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>)}
                  </select>
                </Field>
                <Field label="Catégorie">
                  <select name="category_id" style={S.inp} value={courseForm.category_id} onChange={cf(setCourseForm)}>
                    <option value="">— Aucune —</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>

              <div style={S.card("#10b981")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:.5 }}>⚙️ Paramètres</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Field label="Niveau"><select name="level" style={S.inp} value={courseForm.level} onChange={cf(setCourseForm)}>{Object.entries(LEVEL_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>
                  <Field label="Langue"><select name="language" style={S.inp} value={courseForm.language} onChange={cf(setCourseForm)}><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 Anglais</option><option value="ar">🇸🇦 Arabe</option></select></Field>
                  <Field label="Durée (h)"><input type="number" name="duration_hours" min="0" style={S.inp} value={courseForm.duration_hours} onChange={cf(setCourseForm)} /></Field>
                  <Field label="Commission %"><input type="number" name="instructor_commission_rate" min="0" max="100" style={S.inp} value={courseForm.instructor_commission_rate} onChange={cf(setCourseForm)} /></Field>
                </div>
              </div>

              <div style={S.card("#f97316")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#ea580c", textTransform:"uppercase", letterSpacing:.5 }}>💰 Tarification</p>
                <Toggle label="Cours gratuit" checked={courseForm.is_free} onChange={v=>setCourseForm(p=>({...p,is_free:v,price:v?0:p.price}))} color="#059669" />
                {!courseForm.is_free && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}>
                    <Field label="Prix XAF"><input type="number" name="price" min="0" style={S.inp} value={courseForm.price} onChange={cf(setCourseForm)} /></Field>
                    <Field label="Prix barré"><input type="number" name="original_price" min="0" style={S.inp} value={courseForm.original_price} onChange={cf(setCourseForm)} /></Field>
                  </div>
                )}
              </div>

              <div style={S.card("#6366f1")}>
                <p style={{ margin:"0 0 14px", fontSize:12, fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:.5 }}>👁 Visibilité & Options</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <Toggle label="Publié" checked={courseForm.is_published} onChange={v=>setCourseForm(p=>({...p,is_published:v}))} />
                  <Toggle label="Mis en avant" checked={courseForm.is_featured} onChange={v=>setCourseForm(p=>({...p,is_featured:v}))} color="#d97706" />
                  <Toggle label="Dans l'abonnement" checked={courseForm.is_subscription_included} onChange={v=>setCourseForm(p=>({...p,is_subscription_included:v}))} color="#7c3aed" />
                  <Toggle label="Forum activé" checked={courseForm.is_forum_enabled} onChange={v=>setCourseForm(p=>({...p,is_forum_enabled:v}))} color="#0ea5e9" />
                  <Toggle label="Mode séquentiel" checked={courseForm.sequential_mode} onChange={v=>setCourseForm(p=>({...p,sequential_mode:v}))} color="#f59e0b" />
                  <Toggle label="Approbation requise" checked={courseForm.requires_approval} onChange={v=>setCourseForm(p=>({...p,requires_approval:v}))} color="#ef4444" />
                </div>
              </div>

              <button onClick={saveCourse} disabled={saving} style={{ width:"100%", padding:14, background:saving?"#a5b4fc":"#4f46e5", color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor:saving?"not-allowed":"pointer", boxShadow:"0 4px 14px #4f46e566" }}>
                {saving ? "Enregistrement…" : isNewCourse ? "✓ Créer le cours" : "✓ Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━ VUE DÉTAIL COURS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {view==="detail" && selectedCourse && (
        <div>
          {/* Header cours */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:24, padding:20, background:"#fff", borderRadius:18, border:"1px solid #e2e8f0", boxShadow:"0 4px 20px rgba(0,0,0,.06)", flexWrap:"wrap" }}>
            <button onClick={()=>setView("list")} style={{ padding:"8px 14px", background:"#f1f5f9", border:"none", borderRadius:10, cursor:"pointer", color:"#475569", fontWeight:600, fontSize:13, flexShrink:0 }}>← Retour</button>
            <div style={{ width:60, height:48, borderRadius:12, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${LEVEL_CLR[selectedCourse.level]||"#4f46e5"}88,${LEVEL_CLR[selectedCourse.level]||"#7c3aed"})` }}>
              {selectedCourse.thumbnail_url && <img src={selectedCourse.thumbnail_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a" }}>{selectedCourse.title}</h1>
                <Pill color={selectedCourse.is_published?"#059669":"#94a3b8"}>{selectedCourse.is_published?"✓ Publié":"○ Brouillon"}</Pill>
                {selectedCourse.is_featured && <Pill color="#d97706">⭐ Vedette</Pill>}
              </div>
              <p style={{ margin:"4px 0 8px", fontSize:12, color:"#64748b" }}>ID #{selectedCourse.id} · {selectedCourse.instructor_name||"—"} · {selectedCourse.category_name||"—"} · {LEVEL_MAP[selectedCourse.level]} · {selectedCourse.language?.toUpperCase()}</p>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Pill color="#1e293b">{selectedCourse.is_free?"GRATUIT":`${Number(selectedCourse.price||0).toLocaleString()} XAF`}</Pill>
                <Pill color="#475569">⏱ {selectedCourse.duration_hours||0}h</Pill>
                <Pill color="#475569">👥 {selectedCourse.student_count||0} étudiants</Pill>
                <Pill color="#d97706">⭐ {selectedCourse.rating||0} ({selectedCourse.review_count||0} avis)</Pill>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <Btn onClick={()=>togglePublish(selectedCourse)} color={selectedCourse.is_published?"#f97316":"#10b981"} sm>{selectedCourse.is_published?"⊘ Dépublier":"▶ Publier"}</Btn>
              <Btn onClick={()=>startEdit(selectedCourse)} color="#6366f1" sm>✏️ Modifier</Btn>
              <Btn onClick={()=>deleteCourse(selectedCourse)} color="#ef4444" sm>🗑 Supprimer</Btn>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* ════════ SECTION MODULES ════════ */}
            <Section icon="📦" title="Modules" count={modules.length} accent="#4f46e5" defaultOpen={true}>

              {/* Formulaire ajout/édition module */}
              {(showModForm || editingModule) && (
                <InlineForm title={editingModule?`Modifier : ${editingModule.title}`:"Nouveau module"} onSave={saveModule} onCancel={()=>{setShowModForm(false);cancelModEdit();}} saving={savingMod}>
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 80px", gap:10 }}>
                    <Field label="Titre *"><input style={S.inp} value={moduleForm.title} onChange={e=>setModuleForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Introduction et Prérequis" autoFocus /></Field>
                    <Field label="Ordre"><input type="number" min="0" style={S.inp} value={moduleForm.order_index} onChange={e=>setModuleForm(p=>({...p,order_index:e.target.value}))} /></Field>
                  </div>
                  <Field label="Description"><input style={S.inp} value={moduleForm.description} onChange={e=>setModuleForm(p=>({...p,description:e.target.value}))} placeholder="Description du module" /></Field>
                  <Toggle label="Module publié" checked={moduleForm.is_published} onChange={v=>setModuleForm(p=>({...p,is_published:v}))} />
                </InlineForm>
              )}

              {!showModForm && !editingModule && (
                <Btn onClick={()=>{setShowModForm(true);cancelModEdit();}} color="#4f46e5" light sm style={{ marginBottom:14 }}>＋ Ajouter un module</Btn>
              )}

              {/* Liste modules */}
              {modules.length===0 ? (
                <div style={{ textAlign:"center", padding:"30px 0", color:"#94a3b8" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
                  <p style={{ fontWeight:500, fontSize:13 }}>Aucun module — ajoutez le premier</p>
                </div>
              ) : modules.map((mod, mi) => (
                <div key={mod.id} style={{ border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden", marginBottom:10 }}>

                  {/* Header module */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background: openModId===mod.id?"#eff6ff":"#f8fafc", borderBottom:openModId===mod.id?"1px solid #e2e8f0":"none" }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:"#dbeafe", color:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, flexShrink:0 }}>{mi+1}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontWeight:700, color:"#1e293b", fontSize:13 }}>{mod.title}</p>
                      {mod.description && <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{mod.description}</p>}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Pill color={mod.is_published?"#059669":"#94a3b8"}>{mod.is_published?"✓":"○"}</Pill>
                      <Btn onClick={()=>toggleModule(mod.id)} color="#2563eb" light sm>{openModId===mod.id?"▲ Masquer":"▼ Leçons"}</Btn>
                      <IcoBtn onClick={()=>startModEdit(mod)} color="#6366f1" title="Modifier">✏️</IcoBtn>
                      <IcoBtn onClick={()=>deleteModule(mod)} color="#ef4444" title="Supprimer">🗑</IcoBtn>
                    </div>
                  </div>

                  {/* Formulaire édition module inline */}
                  {editingModule?.id===mod.id && (
                    <div style={{ padding:"14px 16px", background:"#f0f4ff", borderBottom:"1px solid #e2e8f0" }}>
                      <InlineForm title={`✏️ Modifier : ${editingModule.title}`} onSave={saveModule} onCancel={cancelModEdit} saving={savingMod}>
                        <div style={{ display:"grid", gridTemplateColumns:"2fr 80px", gap:10 }}>
                          <Field label="Titre *"><input style={S.inp} value={moduleForm.title} onChange={e=>setModuleForm(p=>({...p,title:e.target.value}))} autoFocus /></Field>
                          <Field label="Ordre"><input type="number" min="0" style={S.inp} value={moduleForm.order_index} onChange={e=>setModuleForm(p=>({...p,order_index:e.target.value}))} /></Field>
                        </div>
                        <Field label="Description"><input style={S.inp} value={moduleForm.description} onChange={e=>setModuleForm(p=>({...p,description:e.target.value}))} /></Field>
                        <Toggle label="Publié" checked={moduleForm.is_published} onChange={v=>setModuleForm(p=>({...p,is_published:v}))} />
                      </InlineForm>
                    </div>
                  )}

                  {/* ════ PANEL LEÇONS ════ */}
                  {openModId===mod.id && (
                    <div style={{ padding:"16px 16px 20px", background:"#fff" }}>

                      {/* Formulaire leçon */}
                      {showLessonForm===mod.id && (
                        <InlineForm title={editingLesson?`✏️ Modifier : ${editingLesson.title}`:"Nouvelle leçon"} onSave={()=>saveLesson(mod.id)} onCancel={cancelLessonEdit} saving={savingLesson}>
                          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
                            <Field label="Titre *"><input style={S.inp} value={lessonForm.title} onChange={e=>setLessonForm(p=>({...p,title:e.target.value}))} placeholder="Titre de la leçon" autoFocus /></Field>
                            <Field label="Type de contenu">
                              <select style={S.inp} value={lessonForm.content_type} onChange={e=>setLessonForm(p=>({...p,content_type:e.target.value}))}>
                                {Object.entries(CTYPE_MAP).map(([v,l])=><option key={v} value={v}>{CTYPE_ICO[v]} {l}</option>)}
                              </select>
                            </Field>
                          </div>
                          <Field label="URL vidéo / lien"><input style={S.inp} value={lessonForm.content_url} onChange={e=>setLessonForm(p=>({...p,content_url:e.target.value}))} placeholder="https://…" /></Field>
                          {lessonForm.content_type==="article" && <Field label="Contenu article (HTML)"><textarea style={{...S.inp,resize:"vertical"}} rows={4} value={lessonForm.article_content} onChange={e=>setLessonForm(p=>({...p,article_content:e.target.value}))} placeholder="<p>Contenu…</p>" /></Field>}
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                            <Field label="Durée (min)"><input type="number" min="0" style={S.inp} value={lessonForm.duration_minutes} onChange={e=>setLessonForm(p=>({...p,duration_minutes:e.target.value}))} /></Field>
                            <Field label="Ordre"><input type="number" min="0" style={S.inp} value={lessonForm.order_index} onChange={e=>setLessonForm(p=>({...p,order_index:e.target.value}))} /></Field>
                          </div>
                          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                            <Toggle label="Publiée" checked={lessonForm.is_published} onChange={v=>setLessonForm(p=>({...p,is_published:v}))} />
                            <Toggle label="Aperçu gratuit" checked={lessonForm.is_preview} onChange={v=>setLessonForm(p=>({...p,is_preview:v}))} color="#d97706" />
                            <Toggle label="Complétion requise" checked={lessonForm.requires_completion} onChange={v=>setLessonForm(p=>({...p,requires_completion:v}))} color="#0ea5e9" />
                            <Toggle label="Téléchargeable" checked={lessonForm.is_downloadable} onChange={v=>setLessonForm(p=>({...p,is_downloadable:v}))} color="#7c3aed" />
                          </div>
                        </InlineForm>
                      )}

                      {!showLessonForm && (
                        <Btn onClick={()=>{setShowLessonForm(mod.id);setEditingLesson(null);setLessonForm(LESSON_BLANK);}} color="#2563eb" light sm style={{ marginBottom:12 }}>＋ Ajouter une leçon</Btn>
                      )}

                      {/* Liste leçons */}
                      {lessons[mod.id]===undefined ? (
                        <div style={{ textAlign:"center", padding:12 }}><div style={{ width:20, height:20, border:"3px solid #dbeafe", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" }} /></div>
                      ) : lessons[mod.id].length===0 ? (
                        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"8px 0" }}>Aucune leçon dans ce module</p>
                      ) : lessons[mod.id].map((l, li) => (
                        <div key={l.id} style={{ border:"1px solid #f1f5f9", borderRadius:12, marginBottom:8, overflow:"hidden" }}>
                          {/* Leçon header */}
                          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#fafafa" }}>
                            <span style={{ width:22, height:22, borderRadius:"50%", background:"#f1f5f9", color:"#64748b", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{li+1}</span>
                            <span style={{ fontSize:16, flexShrink:0 }}>{CTYPE_ICO[l.content_type]||"▶"}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ margin:0, fontWeight:600, color:"#1e293b", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</p>
                              <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{CTYPE_MAP[l.content_type]} · {l.duration_minutes||0} min{l.content_url?` · 🔗`:""}</p>
                            </div>
                            <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
                              {l.is_preview && <Pill color="#d97706">Aperçu</Pill>}
                              {!l.is_published && <Pill color="#94a3b8">Brouillon</Pill>}
                              {l.is_downloadable && <Pill color="#7c3aed">📥</Pill>}
                              <IcoBtn onClick={()=>{ loadResources(l.id); loadQuiz(l.id); }} color="#0ea5e9" title="Voir ressources & quiz">📎</IcoBtn>
                              <IcoBtn onClick={()=>startLessonEdit(l,mod.id)} color="#6366f1" title="Modifier">✏️</IcoBtn>
                              <IcoBtn onClick={()=>deleteLesson(l,mod.id)} color="#ef4444" title="Supprimer">🗑</IcoBtn>
                            </div>
                          </div>

                          {/* Ressources & Quiz de la leçon */}
                          {(resources[l.id]!==undefined || quizData[l.id]!==undefined) && (
                            <div style={{ padding:"12px 14px", background:"#fff", borderTop:"1px solid #f1f5f9" }}>

                              {/* ── Ressources ── */}
                              {resources[l.id]!==undefined && (
                                <div style={{ marginBottom:12 }}>
                                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                                    <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.5 }}>📎 Ressources ({resources[l.id]?.length||0})</span>
                                    <Btn onClick={()=>{setShowResForm(l.id);setEditingResource(null);setResourceForm(RESOURCE_BLANK);}} color="#0ea5e9" light sm>＋ Ajouter</Btn>
                                  </div>

                                  {showResForm===l.id && (
                                    <InlineForm title={editingResource?"✏️ Modifier la ressource":"Nouvelle ressource"} onSave={()=>saveResource(l.id)} onCancel={cancelResEdit} saving={savingRes}>
                                      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
                                        <Field label="Titre *"><input style={S.inp} value={resourceForm.title} onChange={e=>setResourceForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Slides du cours" autoFocus /></Field>
                                        <Field label="Type"><input style={S.inp} value={resourceForm.file_type} onChange={e=>setResourceForm(p=>({...p,file_type:e.target.value}))} placeholder="pdf, zip, png…" /></Field>
                                      </div>
                                      <Field label="URL du fichier *"><input style={S.inp} value={resourceForm.file_url} onChange={e=>setResourceForm(p=>({...p,file_url:e.target.value}))} placeholder="https://…" /></Field>
                                      <Field label="Ordre"><input type="number" min="0" style={{...S.inp,width:100}} value={resourceForm.order_index} onChange={e=>setResourceForm(p=>({...p,order_index:e.target.value}))} /></Field>
                                    </InlineForm>
                                  )}

                                  {resources[l.id]?.map(res=>(
                                    <div key={res.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 12px", borderRadius:8, background:"#f8fafc", marginBottom:5 }}>
                                      <span style={{ fontSize:14 }}>📎</span>
                                      <div style={{ flex:1 }}>
                                        <p style={{ margin:0, fontWeight:600, fontSize:12, color:"#1e293b" }}>{res.title}</p>
                                        <p style={{ margin:0, fontSize:10, color:"#94a3b8" }}>{res.file_type||"fichier"}{res.file_size?` · ${(res.file_size/1024/1024).toFixed(1)}Mo`:""} · {res.download_count||0} téléch.</p>
                                      </div>
                                      <IcoBtn onClick={()=>startResEdit(res,l.id)} color="#6366f1" title="Modifier" small>✏️</IcoBtn>
                                      <IcoBtn onClick={()=>deleteResource(res,l.id)} color="#ef4444" title="Supprimer" small>🗑</IcoBtn>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* ── Quiz ── */}
                              {quizData[l.id]!==undefined && (
                                <div>
                                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                                    <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.5 }}>📝 Quiz</span>
                                    {!quizData[l.id] && <Btn onClick={()=>{setShowQuizForm(l.id);setEditingQuiz(null);setQuizForm(QUIZ_BLANK);}} color="#7c3aed" light sm>＋ Créer un quiz</Btn>}
                                  </div>

                                  {showQuizForm===l.id && (
                                    <InlineForm title={editingQuiz?"✏️ Modifier le quiz":"Nouveau quiz"} onSave={()=>saveQuiz(l.id)} onCancel={cancelQuizEdit} saving={savingQuiz}>
                                      <Field label="Titre *"><input style={S.inp} value={quizForm.title} onChange={e=>setQuizForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Quiz de compréhension" autoFocus /></Field>
                                      <Field label="Description"><input style={S.inp} value={quizForm.description} onChange={e=>setQuizForm(p=>({...p,description:e.target.value}))} /></Field>
                                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                                        <Field label="Score min (%)"><input type="number" min="0" max="100" style={S.inp} value={quizForm.pass_score} onChange={e=>setQuizForm(p=>({...p,pass_score:e.target.value}))} /></Field>
                                        <Field label="Tentatives max"><input type="number" min="0" style={S.inp} value={quizForm.max_attempts} onChange={e=>setQuizForm(p=>({...p,max_attempts:e.target.value}))} /></Field>
                                        <Field label="Limite temps (min)"><input type="number" min="0" style={S.inp} value={quizForm.time_limit_minutes} onChange={e=>setQuizForm(p=>({...p,time_limit_minutes:e.target.value}))} /></Field>
                                      </div>
                                      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                                        <Toggle label="Afficher réponses" checked={quizForm.show_correct_answers} onChange={v=>setQuizForm(p=>({...p,show_correct_answers:v}))} />
                                        <Toggle label="Questions aléatoires" checked={quizForm.randomize_questions} onChange={v=>setQuizForm(p=>({...p,randomize_questions:v}))} />
                                        <Toggle label="Obligatoire" checked={quizForm.is_mandatory} onChange={v=>setQuizForm(p=>({...p,is_mandatory:v}))} color="#ef4444" />
                                      </div>
                                    </InlineForm>
                                  )}

                                  {quizData[l.id] && (
                                    <div style={{ border:"1px solid #ede9fe", borderRadius:12, overflow:"hidden" }}>
                                      {/* Quiz info */}
                                      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#faf5ff", cursor:"pointer" }} onClick={()=>openQuiz(l.id, quizData[l.id].id)}>
                                        <span style={{ fontSize:16 }}>📝</span>
                                        <div style={{ flex:1 }}>
                                          <p style={{ margin:0, fontWeight:700, color:"#1e293b", fontSize:13 }}>{quizData[l.id].title}</p>
                                          <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>Score min: {quizData[l.id].pass_score}% · Max {quizData[l.id].max_attempts} essais{quizData[l.id].time_limit_minutes?" · ⏱"+quizData[l.id].time_limit_minutes+"min":""}</p>
                                        </div>
                                        <div style={{ display:"flex", gap:5 }}>
                                          {quizData[l.id].is_mandatory && <Pill color="#ef4444">Obligatoire</Pill>}
                                          <Btn onClick={e=>{e.stopPropagation();openQuiz(l.id,quizData[l.id].id);}} color="#7c3aed" light sm>{openQuizId===quizData[l.id].id?"▲":"▼ Questions"}</Btn>
                                          <IcoBtn onClick={e=>{e.stopPropagation();startQuizEdit(quizData[l.id],l.id);}} color="#6366f1" title="Modifier">✏️</IcoBtn>
                                        </div>
                                      </div>

                                      {/* Questions */}
                                      {openQuizId===quizData[l.id].id && (
                                        <div style={{ padding:"12px 14px", background:"#fff", borderTop:"1px solid #ede9fe" }}>
                                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:.5 }}>Questions ({questions[quizData[l.id].id]?.length||0})</span>
                                            <Btn onClick={()=>{setShowQForm(quizData[l.id].id);setEditingQuestion(null);setQuestionForm(QUESTION_BLANK);}} color="#7c3aed" light sm>＋ Question</Btn>
                                          </div>

                                          {showQForm===quizData[l.id].id && (
                                            <InlineForm title={editingQuestion?"✏️ Modifier la question":"Nouvelle question"} onSave={()=>saveQuestion(quizData[l.id].id)} onCancel={cancelQEdit} saving={savingQ}>
                                              <Field label="Question *"><textarea style={{...S.inp,resize:"vertical"}} rows={2} value={questionForm.question} onChange={e=>setQuestionForm(p=>({...p,question:e.target.value}))} placeholder="Quelle commande Docker permet de…" autoFocus /></Field>
                                              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
                                                <Field label="Type">
                                                  <select style={S.inp} value={questionForm.question_type} onChange={e=>setQuestionForm(p=>({...p,question_type:e.target.value}))}>
                                                    {Object.entries(QTYPE_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                                                  </select>
                                                </Field>
                                                <Field label="Points"><input type="number" min="1" style={S.inp} value={questionForm.points} onChange={e=>setQuestionForm(p=>({...p,points:e.target.value}))} /></Field>
                                              </div>
                                              <Field label="Options (JSON)" hint='[{"id":"a","text":"Opt A"},...]'><textarea style={{...S.inp,resize:"vertical",fontFamily:"monospace",fontSize:12}} rows={3} value={questionForm.options} onChange={e=>setQuestionForm(p=>({...p,options:e.target.value}))} placeholder='[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]' /></Field>
                                              <Field label="Bonne réponse (JSON)" hint='"a" ou ["a","b"] ou true'><input style={{...S.inp,fontFamily:"monospace"}} value={questionForm.correct_answer} onChange={e=>setQuestionForm(p=>({...p,correct_answer:e.target.value}))} placeholder='"a"' /></Field>
                                              <Field label="Explication"><textarea style={{...S.inp,resize:"vertical"}} rows={2} value={questionForm.explanation} onChange={e=>setQuestionForm(p=>({...p,explanation:e.target.value}))} placeholder="Explication de la réponse…" /></Field>
                                            </InlineForm>
                                          )}

                                          {questions[quizData[l.id].id]?.map((q,qi)=>(
                                            <div key={q.id} style={{ display:"flex", gap:10, padding:"9px 12px", borderRadius:8, background:"#f5f3ff", marginBottom:6 }}>
                                              <span style={{ width:22, height:22, borderRadius:"50%", background:"#ede9fe", color:"#7c3aed", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{qi+1}</span>
                                              <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontWeight:600, fontSize:12, color:"#1e293b" }}>{q.question}</p>
                                                <p style={{ margin:0, fontSize:10, color:"#94a3b8" }}>{QTYPE_MAP[q.question_type]} · {q.points} pt{q.points>1?"s":""}</p>
                                              </div>
                                              <IcoBtn onClick={()=>startQEdit(q,quizData[l.id].id)} color="#6366f1" title="Modifier" small>✏️</IcoBtn>
                                              <IcoBtn onClick={()=>deleteQuestion(q,quizData[l.id].id)} color="#ef4444" title="Supprimer" small>🗑</IcoBtn>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Section>

            {/* ════════ SECTION PROJETS ════════ */}
            <Section icon="🚀" title="Projets pratiques" count={projects.length} accent="#f97316">

              {(showProjForm || editingProject) && (
                <InlineForm title={editingProject?`✏️ Modifier : ${editingProject.title}`:"Nouveau projet"} onSave={saveProject} onCancel={()=>{setShowProjForm(false);cancelProjEdit();}} saving={savingProj}>
                  <Field label="Titre *"><input style={S.inp} value={projectForm.title} onChange={e=>setProjectForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Déploiement d'une app en production" autoFocus /></Field>
                  <Field label="Description *"><textarea style={{...S.inp,resize:"vertical"}} rows={2} value={projectForm.description} onChange={e=>setProjectForm(p=>({...p,description:e.target.value}))} /></Field>
                  <Field label="Instructions complètes"><textarea style={{...S.inp,resize:"vertical"}} rows={4} value={projectForm.instructions} onChange={e=>setProjectForm(p=>({...p,instructions:e.target.value}))} placeholder="Instructions détaillées pour les étudiants…" /></Field>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                    <Field label="Type de soumission"><select style={S.inp} value={projectForm.submission_type} onChange={e=>setProjectForm(p=>({...p,submission_type:e.target.value}))}>{Object.entries(SUB_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>
                    <Field label="Score min /100"><input type="number" min="0" max="100" style={S.inp} value={projectForm.pass_score} onChange={e=>setProjectForm(p=>({...p,pass_score:e.target.value}))} /></Field>
                    <Field label="SLA correction (h)"><input type="number" min="0" style={S.inp} value={projectForm.sla_correction_hours} onChange={e=>setProjectForm(p=>({...p,sla_correction_hours:e.target.value}))} /></Field>
                    <Field label="Taille max (Mo)"><input type="number" min="1" style={S.inp} value={projectForm.max_file_size_mb} onChange={e=>setProjectForm(p=>({...p,max_file_size_mb:e.target.value}))} /></Field>
                  </div>
                  <Field label="Critères d'évaluation (JSON)" hint='[{"criterion":"Architecture","weight":30,"description":"..."}]'>
                    <textarea style={{...S.inp,resize:"vertical",fontFamily:"monospace",fontSize:11}} rows={3} value={projectForm.evaluation_criteria} onChange={e=>setProjectForm(p=>({...p,evaluation_criteria:e.target.value}))} />
                  </Field>
                  <Toggle label="Projet actif" checked={projectForm.is_active} onChange={v=>setProjectForm(p=>({...p,is_active:v}))} />
                </InlineForm>
              )}

              {!showProjForm && !editingProject && (
                <Btn onClick={()=>{setShowProjForm(true);cancelProjEdit();}} color="#f97316" light sm style={{ marginBottom:12 }}>＋ Ajouter un projet</Btn>
              )}

              {projects.length===0 ? (
                <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>Aucun projet pratique pour ce cours</div>
              ) : projects.map(proj=>(
                <div key={proj.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, border:"1px solid #fed7aa", background:"#fff7ed", marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>🚀</span>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:700, color:"#1e293b", fontSize:13 }}>{proj.title}</p>
                    <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{SUB_MAP[proj.submission_type]} · Score min: {proj.pass_score}/100 · SLA: {proj.sla_correction_hours}h</p>
                  </div>
                  <Pill color={proj.is_active?"#059669":"#94a3b8"}>{proj.is_active?"Actif":"Inactif"}</Pill>
                  <IcoBtn onClick={()=>startProjEdit(proj)} color="#6366f1" title="Modifier">✏️</IcoBtn>
                  <IcoBtn onClick={()=>deleteProject(proj)} color="#ef4444" title="Supprimer">🗑</IcoBtn>
                </div>
              ))}
            </Section>

          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ ICONE BTN ══════════════════════ */
function IcoBtn({ onClick, color, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", background:color+"18", color, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, flexShrink:0, transition:"background .15s" }}
      onMouseEnter={e=>e.currentTarget.style.background=color+"33"}
      onMouseLeave={e=>e.currentTarget.style.background=color+"18"}>
      {children}
    </button>
  );
}