const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des cours');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchCourseById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération du cours');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
