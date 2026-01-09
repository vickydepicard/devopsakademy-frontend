import { apiService } from '../api/config';

export const createDynamicService = (endpoint) => ({
  // Récupérer tous les éléments
  getAll: (params = {}) => apiService.get(endpoint, { params }),

  // Récupérer par ID
  getById: (id) => apiService.get(`${endpoint}/${id}`),

  // Créer un nouvel élément
  create: (data) => apiService.post(endpoint, data),

  // Mettre à jour un élément
  update: (id, data) => apiService.put(`${endpoint}/${id}`, data),

  // Supprimer un élément
  delete: (id) => apiService.delete(`${endpoint}/${id}`),

  // Méthodes custom
  custom: (method, url, data = {}) => {
    const fullUrl = `${endpoint}${url}`;
    switch (method.toLowerCase()) {
      case 'get':
        return apiService.get(fullUrl);
      case 'post':
        return apiService.post(fullUrl, data);
      case 'put':
        return apiService.put(fullUrl, data);
      case 'delete':
        return apiService.delete(fullUrl);
      default:
        throw new Error(`Méthode HTTP non supportée: ${method}`);
    }
  }
});

// Services spécifiques
export const authService = createDynamicService('/auth');
export const usersService = createDynamicService('/users');
export const coursesService = createDynamicService('/courses');
export const progressService = createDynamicService('/progress');
export const forumService = createDynamicService('/forum');