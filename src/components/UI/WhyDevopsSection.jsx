const WhyDevopsSection = () => {
  const items = [
    {
      title: "Apprentissage par la pratique",
      desc: "Des projets concrets basés sur des environnements réels DevOps.",
    },
    {
      title: "Encadrement expert",
      desc: "Des formateurs certifiés avec expérience sur Docker, Kubernetes, CI/CD.",
    },
    {
      title: "Certifications reconnues",
      desc: "Obtenez des certificats téléchargeables pour chaque parcours.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">
        Pourquoi choisir DevOpsAkademy ?
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyDevopsSection;
