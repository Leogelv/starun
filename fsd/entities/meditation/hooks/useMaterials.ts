import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/fsd/shared/api/materials';

export const useMaterials = (subtopicId?: number) => {
  return useQuery({
    queryKey: ['materials', subtopicId],
    queryFn: () => materialsApi.getAll(subtopicId),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};