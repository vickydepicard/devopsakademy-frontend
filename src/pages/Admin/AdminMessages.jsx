import { useEffect, useState } from "react";
import api from "../../api/api";
import { Trash2, X } from "lucide-react";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // 🔁 Charger les messages
  const fetchMessages = async () => {
    try {
      const res = await api.get("/contacts");
      if (res.data?.success) {
        setMessages(res.data.data);
      } else {
        setError("Erreur de récupération des messages.");
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des messages :", err);
      setError("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ⚡ Ouvrir la modale
  const openModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  // 🧹 Supprimer un message
  const handleDelete = async () => {
    if (!selectedMessage) return;
    try {
      const res = await api.delete(`/contacts/${selectedMessage.id}`);
      if (res.data?.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== selectedMessage.id));
      }
      setShowModal(false);
    } catch (err) {
      console.error("❌ Erreur lors de la suppression :", err);
      alert("Erreur de suppression du message.");
      setShowModal(false);
    }
  };

  if (loading) return <p>Chargement des messages...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg relative">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">📩 Messages reçus</h2>

      {messages.length === 0 ? (
        <p className="text-gray-500">Aucun message reçu pour le moment.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Sujet</th>
              <th className="px-4 py-2 border">Message</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{msg.name}</td>
                <td className="px-4 py-2 border">{msg.email}</td>
                <td className="px-4 py-2 border">{msg.subject}</td>
                <td className="px-4 py-2 border">{msg.message}</td>
                <td className="px-4 py-2 border">
                  {new Date(msg.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => openModal(msg)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 mx-auto"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🌟 Modale de confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-2xl w-96 p-6 text-center animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer le message de{" "}
              <strong>{selectedMessage?.name}</strong> ?
              <br />
              Cette action est <span className="text-red-600 font-semibold">irréversible</span>.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
