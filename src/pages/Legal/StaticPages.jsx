import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Page = ({ title, intro, children }) => (
  <div className="bg-slate-50">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-left">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {intro && <p className="mt-2 text-slate-600">{intro}</p>}
      <div className="mt-8 bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">{children}</div>
    </div>
  </div>
);

const Block = ({ title, text }) => (
  <section className="px-6 py-5">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{text}</p>
  </section>
);

export function Faq() {
  const { t } = useTranslation("legal");
  return <Page title={t("faq_title")} intro={t("faq_intro")}>{t("faq", { returnObjects: true }).map(([q, a]) => <Block key={q} title={q} text={a} />)}</Page>;
}
export function Privacy() {
  const { t } = useTranslation("legal");
  return <Page title={t("privacy_title")}>{t("privacy", { returnObjects: true }).map(([q, a]) => <Block key={q} title={q} text={a} />)}</Page>;
}
export function Terms() {
  const { t } = useTranslation("legal");
  return <Page title={t("terms_title")}>{t("terms", { returnObjects: true }).map(([q, a]) => <Block key={q} title={q} text={a} />)}</Page>;
}
export function NotFound() {
  const { t } = useTranslation("legal");
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">{t("nf_title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("nf_text")}</p>
      <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-700">{t("nf_home")}</Link>
    </div>
  );
}
