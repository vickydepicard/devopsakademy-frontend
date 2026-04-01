import { useEffect, useState } from "react";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/users/instructors")
      .then(res => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(data => {
        setInstructors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Impossible de charger les instructeurs");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center py-10 text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-primary mb-12 text-center">Nos Instructeurs</h1>
      {instructors.length === 0 ? (
        <p className="text-center text-gray-500">Aucun instructeur disponible.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {instructors.map(inst => (
            <div key={inst.id} className="bg-white p-6 rounded-xl shadow hover:shadow-primary/30 transition">
              <img src={inst.avatar_url || "/default-avatar.png"} alt={inst.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-accent object-contain" />
              <h2 className="text-xl font-semibold text-center text-primary">{inst.name}</h2>
              <p className="text-neutral-light text-center">{inst.bio || "Pas encore de bio"}</p>
              <p className="text-sm text-gray-500 text-center mt-2">{inst.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
