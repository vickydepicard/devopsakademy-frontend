import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"];

    // 🚨 BLOQUE toute réponse HTML
    if (contentType && contentType.includes("text/html")) {
      console.error("Réponse HTML reçue :", response);
      return Promise.reject(
        new Error("Réponse serveur invalide (HTML reçu)")
      );
    }

    return response;
  },
  (error) => {
    // Cas token expiré / non valide
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(
      error.response?.data?.message ||
        "Erreur serveur, veuillez réessayer"
    );
  }
);

export default api;
