// Fonctions utilitaires pour les permissions

/**
 * Vérifie si l'utilisateur peut accéder à une route
 * @param {Object} user - Utilisateur actuel
 * @param {string} requiredRole - Rôle requis
 * @returns {boolean}
 */
export const canAccess = (user, requiredRole) => {
  if (!user) return false;
  
  // Hiérarchie des rôles
  const roleHierarchy = {
    'admin': 3,
    'instructor': 2,
    'student': 1
  };
  
  const userRoleLevel = roleHierarchy[user.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Détermine l'URL de redirection selon le statut
 * @param {string} status - Statut d'inscription
 * @param {number} courseId - ID du cours
 * @returns {Object} {path: string, message: string}
 */
export const getRedirectForStatus = (status, courseId) => {
  switch(status) {
    case 'not_authenticated':
      return {
        path: '/login',
        message: 'Veuillez vous connecter pour accéder au contenu',
        state: { from: `/courses/${courseId}/learn` }
      };
    
    case 'not_enrolled':
      return {
        path: `/courses/${courseId}`,
        message: 'Vous devez vous inscrire à ce cours',
        state: { showEnrollButton: true }
      };
    
    case 'pending':
      return {
        path: `/courses/${courseId}`,
        message: 'Votre inscription est en attente de validation',
        state: { showStatus: true }
      };
    
    case 'approved':
      return {
        path: `/courses/${courseId}/learn`,
        message: 'Accès autorisé'
      };
    
    default:
      return {
        path: `/courses/${courseId}`,
        message: 'Accès non autorisé'
      };
  }
};

/**
 * Formate le message selon le niveau d'accès
 * @param {string} status - Statut d'inscription
 * @returns {string} Message formaté
 */
export const getAccessMessage = (status) => {
  const messages = {
    'not_authenticated': '🔒 Connectez-vous pour accéder',
    'not_enrolled': '📝 Inscrivez-vous au cours',
    'pending': '⏳ Inscription en attente',
    'approved': '✅ Accès autorisé',
    'denied': '🚫 Accès refusé'
  };
  
  return messages[status] || 'Accès inconnu';
};

/**
 * Détermine la couleur selon le statut
 * @param {string} status - Statut d'inscription
 * @returns {string} Classes Tailwind CSS
 */
export const getStatusColor = (status) => {
  const colors = {
    'not_authenticated': 'bg-blue-100 text-blue-800',
    'not_enrolled': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-orange-100 text-orange-800',
    'approved': 'bg-green-100 text-green-800',
    'denied': 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};