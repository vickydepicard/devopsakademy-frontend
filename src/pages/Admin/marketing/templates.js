// Modèles de campagnes : offres (cours gratuit, moitié prix, vente flash), webinaire, nouveauté, newsletter, réactivation.
// Les blocs « course » / « webinar » sont à relier à un cours / un live depuis l'éditeur.

const course = () => ({ type: "course", course_id: null });

export const TEMPLATES = [
  {
    id: "free_course", icon: "Gift", kind: "offer",
    promo: { type: "free", days: 3 },
    audience: { roles: ["student"], never_enrolled: false },
    banner_tone: "success",
    fr: {
      name: "Cours gratuit — durée limitée",
      subject: "🎁 {{first_name}}, un cours offert pendant 72 h",
      preheader: "Offre limitée : inscrivez-vous avant la fin.",
      social: "🎁 Cours gratuit pendant 72 h sur DevOpsAkademy ! Profitez-en avant la fin de l'offre.",
      blocks: [
        { type: "heading", text: "Un cours offert, rien que pour vous" },
        { type: "text", text: "Bonjour {{first_name}},\n\nPendant 72 heures seulement, ce cours est entièrement gratuit. Inscrivez-vous maintenant et apprenez à votre rythme." },
        course(),
        { type: "button", label: "Je profite de l'offre", url: "/courses" },
        { type: "text", text: "L'offre se termine automatiquement : ne tardez pas !" },
      ],
    },
    en: {
      name: "Free course — limited time",
      subject: "🎁 {{first_name}}, a free course for 72 hours",
      preheader: "Limited offer: enrol before it ends.",
      social: "🎁 Free course for 72 hours on DevOpsAkademy! Grab it before the offer ends.",
      blocks: [
        { type: "heading", text: "A free course, just for you" },
        { type: "text", text: "Hello {{first_name}},\n\nFor 72 hours only, this course is completely free. Enrol now and learn at your own pace." },
        course(),
        { type: "button", label: "Get the offer", url: "/courses" },
        { type: "text", text: "The offer ends automatically — don't wait!" },
      ],
    },
  },
  {
    id: "half_price", icon: "Percent", kind: "offer",
    promo: { type: "percent", percent: 50, days: 3 },
    audience: { roles: ["student"] },
    banner_tone: "promo",
    fr: {
      name: "Moitié prix (-50 %)",
      subject: "-50 % sur votre prochain cours, {{first_name}}",
      preheader: "Le prix est divisé par deux pendant 72 h.",
      social: "🔥 -50 % sur un cours DevOpsAkademy pendant 72 h seulement !",
      blocks: [
        { type: "heading", text: "Le prix divisé par deux" },
        { type: "text", text: "Bonjour {{first_name}},\n\nPendant 72 heures, ce cours est à moitié prix. C'est le moment de passer à l'action." },
        course(),
        { type: "button", label: "Profiter de -50 %", url: "/courses" },
      ],
    },
    en: {
      name: "Half price (-50%)",
      subject: "-50% on your next course, {{first_name}}",
      preheader: "The price is cut in half for 72 hours.",
      social: "🔥 -50% on a DevOpsAkademy course for 72 hours only!",
      blocks: [
        { type: "heading", text: "Half the price" },
        { type: "text", text: "Hello {{first_name}},\n\nFor 72 hours, this course is half price. Now is the time to act." },
        course(),
        { type: "button", label: "Get -50%", url: "/courses" },
      ],
    },
  },
  {
    id: "flash_sale", icon: "Zap", kind: "offer",
    promo: { type: "percent", percent: 30, days: 1 },
    audience: { roles: ["student"] },
    banner_tone: "urgent",
    fr: {
      name: "Vente flash 24 h",
      subject: "⚡ Vente flash : 24 h pour en profiter",
      preheader: "-30 % jusqu'à demain.",
      social: "⚡ Vente flash 24 h sur DevOpsAkademy : -30 % sur un cours !",
      blocks: [
        { type: "heading", text: "⚡ Vente flash — 24 heures seulement" },
        { type: "text", text: "Bonjour {{first_name}},\n\n-30 % sur ce cours jusqu'à demain. Ensuite, retour au prix normal." },
        course(),
        { type: "button", label: "J'en profite maintenant", url: "/courses" },
      ],
    },
    en: {
      name: "24-hour flash sale",
      subject: "⚡ Flash sale: 24 hours only",
      preheader: "-30% until tomorrow.",
      social: "⚡ 24-hour flash sale on DevOpsAkademy: -30% on a course!",
      blocks: [
        { type: "heading", text: "⚡ Flash sale — 24 hours only" },
        { type: "text", text: "Hello {{first_name}},\n\n-30% on this course until tomorrow. Then back to the regular price." },
        course(),
        { type: "button", label: "Get it now", url: "/courses" },
      ],
    },
  },
  {
    id: "webinar", icon: "Video", kind: "webinar",
    audience: { roles: ["student", "instructor"] },
    banner_tone: "info",
    fr: {
      name: "Invitation à un webinaire",
      subject: "📅 Webinaire en direct : réservez votre place",
      preheader: "Places limitées — inscription gratuite.",
      social: "📅 Webinaire en direct sur DevOpsAkademy — réservez votre place !",
      blocks: [
        { type: "heading", text: "Rejoignez-nous en direct" },
        { type: "text", text: "Bonjour {{first_name}},\n\nNous organisons un webinaire en direct. Posez vos questions à nos experts et repartez avec des conseils concrets." },
        { type: "webinar", bootcamp_id: null },
        { type: "text", text: "Un rappel vous sera envoyé avant le début." },
      ],
    },
    en: {
      name: "Webinar invitation",
      subject: "📅 Live webinar: save your seat",
      preheader: "Limited seats — free registration.",
      social: "📅 Live webinar on DevOpsAkademy — save your seat!",
      blocks: [
        { type: "heading", text: "Join us live" },
        { type: "text", text: "Hello {{first_name}},\n\nWe are hosting a live webinar. Ask our experts your questions and leave with practical advice." },
        { type: "webinar", bootcamp_id: null },
        { type: "text", text: "A reminder will be sent before it starts." },
      ],
    },
  },
  {
    id: "new_course", icon: "Sparkles", kind: "announcement",
    audience: { roles: ["student"] },
    banner_tone: "promo",
    fr: {
      name: "Nouveau cours disponible",
      subject: "🆕 Un nouveau cours vient d'arriver",
      preheader: "Découvrez-le dès maintenant.",
      social: "🆕 Nouveau cours sur DevOpsAkademy — découvrez-le !",
      blocks: [
        { type: "heading", text: "Nouveau sur DevOpsAkademy" },
        { type: "text", text: "Bonjour {{first_name}},\n\nUn nouveau cours vient d'être publié. Voici ce qu'il vous apportera." },
        course(),
        { type: "button", label: "Découvrir le cours", url: "/courses" },
      ],
    },
    en: {
      name: "New course available",
      subject: "🆕 A new course has just landed",
      preheader: "Discover it now.",
      social: "🆕 New course on DevOpsAkademy — check it out!",
      blocks: [
        { type: "heading", text: "New on DevOpsAkademy" },
        { type: "text", text: "Hello {{first_name}},\n\nA new course has just been published. Here is what it will bring you." },
        course(),
        { type: "button", label: "Discover the course", url: "/courses" },
      ],
    },
  },
  {
    id: "newsletter", icon: "Newspaper", kind: "newsletter",
    audience: { roles: ["student", "instructor"] },
    banner_tone: "info",
    fr: {
      name: "Newsletter du mois",
      subject: "Les nouveautés DevOpsAkademy du mois",
      preheader: "Cours, conseils et événements à ne pas manquer.",
      social: "📰 La newsletter DevOpsAkademy du mois est là !",
      blocks: [
        { type: "heading", text: "Les nouveautés du mois" },
        { type: "text", text: "Bonjour {{first_name}},\n\nVoici ce qu'il faut retenir ce mois-ci sur la plateforme." },
        { type: "divider" },
        { type: "heading", text: "À la une" },
        course(),
        { type: "divider" },
        { type: "heading", text: "Notre conseil du mois" },
        { type: "text", text: "Écrivez ici un conseil pratique ou une actualité DevOps." },
        { type: "button", label: "Voir tous les cours", url: "/courses" },
      ],
    },
    en: {
      name: "Monthly newsletter",
      subject: "What's new at DevOpsAkademy this month",
      preheader: "Courses, tips and events you shouldn't miss.",
      social: "📰 The DevOpsAkademy monthly newsletter is out!",
      blocks: [
        { type: "heading", text: "This month's news" },
        { type: "text", text: "Hello {{first_name}},\n\nHere is what to remember this month on the platform." },
        { type: "divider" },
        { type: "heading", text: "Featured" },
        course(),
        { type: "divider" },
        { type: "heading", text: "Our tip of the month" },
        { type: "text", text: "Write a practical tip or a DevOps news item here." },
        { type: "button", label: "Browse all courses", url: "/courses" },
      ],
    },
  },
  {
    id: "reengage", icon: "RotateCcw", kind: "newsletter",
    audience: { roles: ["student"], inactive_days: 30 },
    banner_tone: "info",
    fr: {
      name: "Réactivation — vous nous manquez",
      subject: "{{first_name}}, vos cours vous attendent",
      preheader: "Reprenez là où vous vous êtes arrêté.",
      social: "",
      blocks: [
        { type: "heading", text: "Vous nous manquez !" },
        { type: "text", text: "Bonjour {{first_name}},\n\nCela fait un moment que nous ne vous avons pas vu. Votre progression est sauvegardée : reprenez en quelques minutes." },
        { type: "button", label: "Reprendre mes cours", url: "/my-courses" },
      ],
    },
    en: {
      name: "Re-engagement — we miss you",
      subject: "{{first_name}}, your courses are waiting",
      preheader: "Pick up where you left off.",
      social: "",
      blocks: [
        { type: "heading", text: "We miss you!" },
        { type: "text", text: "Hello {{first_name}},\n\nIt has been a while. Your progress is saved — pick up again in a few minutes." },
        { type: "button", label: "Resume my courses", url: "/my-courses" },
      ],
    },
  },
  {
    id: "blank", icon: "FileText", kind: "newsletter",
    audience: { roles: ["student", "instructor"] },
    banner_tone: "info",
    fr: { name: "Campagne vierge", subject: "", preheader: "", social: "", blocks: [{ type: "heading", text: "" }, { type: "text", text: "Bonjour {{first_name}}," }] },
    en: { name: "Blank campaign", subject: "", preheader: "", social: "", blocks: [{ type: "heading", text: "" }, { type: "text", text: "Hello {{first_name}}," }] },
  },
];

export const emptyBlock = (type) => ({
  heading: { type, text: "" }, text: { type, text: "" }, image: { type, url: "", alt: "", link: "" },
  button: { type, label: "", url: "" }, course: { type, course_id: null }, webinar: { type, bootcamp_id: null },
  coupon: { type, code: "", text: "" }, divider: { type },
}[type]);

/** Campagne pré-remplie à partir d'un modèle. */
export const fromTemplate = (tpl, lang) => ({
  name: tpl[lang].name,
  kind: tpl.kind,
  template: tpl.id,
  subject_fr: tpl.fr.subject, subject_en: tpl.en.subject,
  preheader_fr: tpl.fr.preheader, preheader_en: tpl.en.preheader,
  blocks_fr: JSON.parse(JSON.stringify(tpl.fr.blocks)), blocks_en: JSON.parse(JSON.stringify(tpl.en.blocks)),
  audience: { roles: ["student", "instructor"], lang: "", verified_only: true, subscription: "any", include_contacts: false, ...tpl.audience },
  channels: {
    email: true, inapp: false, inapp_link: "/", telegram: false, social_text: tpl.fr.social || "", social_link: "", social_image: "",
    banner: null,
  },
  _promo: tpl.promo || null, _banner_tone: tpl.banner_tone,
});

const clone = (v) => JSON.parse(JSON.stringify(v ?? []));
export const DEFAULT_AB = { enabled: false, subject_b_fr: "", subject_b_en: "", preheader_b_fr: "", preheader_b_en: "", sample_percent: 20, wait_hours: 4, metric: "clicks" };

/** Campagne pré-remplie à partir d'un modèle enregistré en base. */
export const fromTemplateRow = (row, lang) => {
  const c = row.content || {};
  return {
    name: lang === "en" ? row.name_en : row.name_fr,
    kind: row.kind || "newsletter", template: row.slug, _tplId: row.id, _tplBuiltin: !!row.is_builtin,
    subject_fr: c.fr?.subject || "", subject_en: c.en?.subject || "",
    preheader_fr: c.fr?.preheader || "", preheader_en: c.en?.preheader || "",
    blocks_fr: clone(c.fr?.blocks), blocks_en: clone(c.en?.blocks),
    audience: { roles: ["student", "instructor"], lang: "", verified_only: true, subscription: "any", include_contacts: false, ...(c.audience || {}) },
    channels: { email: true, inapp: false, inapp_link: "/", telegram: false, social_text: c.fr?.social || "", social_link: "", social_image: "", banner: null },
    ab_test: { ...DEFAULT_AB },
    _promo: c.promo || null, _coupon: c.coupon || null, _banner_tone: c.banner_tone || "info",
  };
};

/** Contenu à enregistrer lorsqu'une campagne devient un modèle. */
export const contentFromCampaign = (c) => ({
  fr: { subject: c.subject_fr, preheader: c.preheader_fr || "", social: c.channels?.social_text || "", blocks: c.blocks_fr },
  en: { subject: c.subject_en, preheader: c.preheader_en || "", social: c.channels?.social_text || "", blocks: c.blocks_en },
  audience: c.audience || {}, promo: c._promo || null, coupon: c._coupon || null, banner_tone: c._banner_tone || "info",
});
