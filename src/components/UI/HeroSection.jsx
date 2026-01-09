import { Link } from "react-router-dom";
import heroIllustration from "../../assets/image.png";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] w-full flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full px-8 md:px-16 py-16 max-w-7xl mx-auto">
        
        <div className="text-center md:text-left md:w-1/2 fade-up transition-all duration-700 opacity-100 translate-y-0">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
            Bienvenue sur <span className="text-accent">DevOps Akademy</span>
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed max-w-lg">
            Formations Cloud, DevOps et CI/CD pour maîtriser les technologies modernes et propulser ta carrière.
          </p>
          <div className="flex justify-center md:justify-start gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-accent hover:bg-accent-light text-primary font-semibold py-3 px-8 rounded-3xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-accent/50"
            >
              Commencer maintenant
            </Link>
            <Link
              to="/login"
              className="border-2 border-white hover:bg-white hover:text-primary font-semibold py-3 px-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Déjà inscrit ?
            </Link>
          </div>
        </div>

        <div className="relative mt-12 md:mt-0 md:w-1/2 flex justify-center md:justify-end fade-right transition-all duration-700 opacity-100 translate-x-0">
          <img
            src={heroIllustration}
            alt="Illustration DevOps"
            className="w-[85%] md:w-[80%] max-w-lg drop-shadow-2xl animate-float"
          />
        </div>
      </div>
    </section>
  );
}
