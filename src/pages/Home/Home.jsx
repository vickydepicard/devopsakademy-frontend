import { useEffect } from "react";
import HeroSection from "../../components/UI/HeroSection";
import FeaturesSection from "../../components/UI/FeaturesSection";
import PopularCourses from "../../components/UI/PopularCourses";
import Testimonials from "../../components/UI/Testimonials";
import CallToAction from "../../components/UI/CallToAction";


export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
  }, []);

  return (
    <div className="bg-neutral-bg w-full flex flex-col min-h-screen">
      <HeroSection />
      <PopularCourses />
      <FeaturesSection />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
