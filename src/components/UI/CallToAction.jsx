import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white text-center px-6">
      <div className="fade-up opacity-0 translate-y-10 transition-all duration-700">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Prêt à booster ta carrière ?
        </h2>
        <p className="mb-10 text-gray-200 text-lg md:text-xl">
          Inscris-toi dès aujourd'hui et lance-toi dans l'univers DevOps et Cloud avec nos formations professionnelles.
        </p>
        <Link
          to="/register"
          className="bg-accent hover:bg-accent-light text-primary font-semibold py-4 px-12 rounded-3xl shadow-2xl hover:shadow-accent/50 transition-all duration-300 transform hover:-translate-y-1"
        >
          Rejoindre maintenant
        </Link>
      </div>
    </section>
  );
}
