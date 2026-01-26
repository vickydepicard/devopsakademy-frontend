import axios from "axios";

class ApiService {
  constructor() {
    // ⚠️ BASE URL FIXE ET SAFE (Apache Proxy /api)
    this.instance = axios.create({
      baseURL: "/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // 🔐 Intercepteur REQUEST
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 🧯 Intercepteur RESPONSE (ANTI HTML)
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const contentType = error.response?.headers?.["content-type"];

        // ❌ Cas critique : l’API retourne du HTML
        if (contentType && contentType.includes("text/html")) {
          console.error("❌ L’API a retourné du HTML au lieu de JSON");
          return Promise.reject({
            message: "Erreur serveur (HTML reçu au lieu de JSON)",
            status: 500,
          });
        }

        // 🔐 Non autorisé
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  handleUnauthorized() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // ======================
  // MÉTHODES HTTP
  // ======================

  async get(endpoint, config = {}) {
    const response = await this.instance.get(endpoint, config);
    return response.data;
  }

  async post(endpoint, data = {}, config = {}) {
    const response = await this.instance.post(endpoint, data, config);
    return response.data;
  }

  async put(endpoint, data = {}, config = {}) {
    const response = await this.instance.put(endpoint, data, config);
    return response.data;
  }

  async delete(endpoint, config = {}) {
    const response = await this.instance.delete(endpoint, config);
    return response.data;
  }

  // ======================
  // FORMAT ERREUR GLOBAL
  // ======================
  formatError(error) {
    return {
      message:
        error.response?.data?.message ||
        error.message ||
        "Erreur de connexion",
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };
  }
}

export const apiService = new ApiService();
