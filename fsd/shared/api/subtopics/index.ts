import { apiClient } from '../index';
import type { Subtopic } from '@/fsd/entities/meditation/types';

export const subtopicsApi = {
  getAll: async () => {
    const response = await apiClient.get<Subtopic[]>('/subtopics');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Subtopic>(`/subtopics/${id}`);
    return response.data;
  },

  create: async (subtopic: Omit<Subtopic, 'id' | 'created_at'>) => {
    const response = await apiClient.post<Subtopic>('/subtopics', subtopic);
    return response.data;
  },

  update: async (id: number, subtopic: Partial<Subtopic>) => {
    const response = await apiClient.put<Subtopic>(`/subtopics/${id}`, subtopic);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/subtopics/${id}`);
    return response.data;
  }
};