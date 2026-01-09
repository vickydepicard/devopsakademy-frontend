export default function CourseEnrollButton({ courseId, token }) {
  const handleEnroll = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });
      if (!res.ok) throw new Error("Échec inscription");
      alert("Inscription réussie !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’inscription");
    }
  };

  return (
    <button
      onClick={handleEnroll}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      S’inscrire
    </button>
  );
}
