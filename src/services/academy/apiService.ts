import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/academy';

const API_BASE_URL = '/api/academy';

export const academyApiService = {
  /**
   * Récupère la liste de tous les cours
   */
  async getCourses(): Promise<Course[]> {
    return apiFetch<Course[]>(`${API_BASE_URL}/courses`);
  },

  /**
   * Récupère les détails d'un cours spécifique (incluant modules et QCM)
   */
  async getCourse(id: string): Promise<Course> {
    return apiFetch<Course>(`${API_BASE_URL}/courses/${id}`);
  },

  /**
   * Sauvegarde un nouveau cours dans la base de données
   */
  async createCourse(courseData: unknown): Promise<Course> {
    return apiFetch<Course>(`${API_BASE_URL}/courses`, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  /**
   * Supprime un cours de la base de données
   */
  async deleteCourse(id: string): Promise<void> {
    await apiFetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE'
    });
  }
};