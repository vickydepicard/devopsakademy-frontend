import { FaLaptopCode, FaUserGraduate, FaUsers } from "react-icons/fa";

export default function FeaturesSection() {
  const features = [
    {
      icon: <FaLaptopCode className="text-accent text-5xl mb-6 mx-auto" />,
      title: "Formations pratiques",
      desc: "Cours orientés pratique basés sur des projets réels, pour apprendre en faisant."
    },
    {
      icon: <FaUserGraduate className="text-accent text-5xl mb-6 mx-auto" />,
      title: "Experts certifiés",
      desc: "Formateurs expérimentés, certifiés AWS, Azure, Kubernetes, Terraform et plus encore."
    },
    {
      icon: <FaUsers className="text-accent text-5xl mb-6 mx-auto" />,
      title: "Communauté active",
      desc: "Rejoins une communauté de passionnés pour échanger et collaborer sur tes projets."
    },
  ];

  return (
    <section className="py-24 bg-neutral-bg">
      <div className="w-full px-6 grid gap-12 md:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white to-neutral-bg p-10 rounded-3xl shadow-2xl hover:shadow-primary/30 transition transform hover:-translate-y-2 duration-300 text-center fade-up opacity-0 translate-y-10"
          >
            {f.icon}
            <h3 className="text-2xl font-bold mb-4 text-primary">{f.title}</h3>
            <p className="text-neutral-light text-lg">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
