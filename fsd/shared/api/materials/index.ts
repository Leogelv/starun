import { apiClient } from '../index';
import type { Material } from '@/fsd/entities/meditation/types';

export const materialsApi = {
  getAll: async (subtopicId?: number) => {
    const params = subtopicId ? { subtopic_id: subtopicId } : {};
    const response = await apiClient.get<Material[]>('/materials', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Material>(`/materials/${id}`);
    return response.data;
  },

  create: async (material: Omit<Material, 'id' | 'created_at'>) => {
    const response = await apiClient.post<Material>('/materials', material);
    return response.data;
  },

  update: async (id: number, material: Partial<Material>) => {
    const response = await apiClient.put<Material>(`/materials/${id}`, material);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/materials/${id}`);
    return response.data;
  }
};