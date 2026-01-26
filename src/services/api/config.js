import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  handleUnauthorized() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Méthodes HTTP génériques
  async get(endpoint, config = {}) {
    try {
      const response = await this.instance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.instance.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.instance.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await this.instance.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('API Error:', error);
    }
    
    return {
      message: error.response?.data?.message || 'Erreur de connexion',
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

export const apiService = new ApiService();