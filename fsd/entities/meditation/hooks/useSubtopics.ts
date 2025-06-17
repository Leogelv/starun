import { useQuery } from '@tanstack/react-query';
import { subtopicsApi } from '@/fsd/shared/api/subtopics';

export const useSubtopics = () => {
  return useQuery({
    queryKey: ['subtopics'],
    queryFn: () => subtopicsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};