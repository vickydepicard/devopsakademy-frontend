import { useEffect, useState } from "react";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  // Simule un appel API ou connecte à ton backend plus tard
  useEffect(() => {
    // Exemple statique, à remplacer par un fetch vers /api/reviews
    setReviews([
      {
        id: 1,
        name: "Jean Dupont",
        comment: "Les cours DevOpsAkademy m’ont permis de décrocher ma première mission Cloud !",
        rating: 5
      },
      {
        id: 2,
        name: "Amina Traoré",
        comment: "Une plateforme claire, complète et très interactive. Les formateurs sont top.",
        rating: 4
      },
      {
        id: 3,
        name: "Lucas M.",
        comment: "J’ai adoré les projets pratiques sur Docker et Kubernetes. Je recommande !",
        rating: 5
      }
    ]);
  }, []);

  return (
    <section className="py-20 bg-neutral-bg">
      <h2 className="text-center text-3xl font-bold mb-10 text-primary">
        Témoignages de nos apprenants
      </h2>
      <div className="grid md:grid-cols-3 gap-6 px-8 max-w-6xl mx-auto">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300 text-center"
          >
            <p className="text-neutral-dark italic mb-4">“{r.comment}”</p>
            <h4 className="font-semibold text-primary">{r.name}</h4>
            <p className="text-yellow-400 mt-2">
              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
