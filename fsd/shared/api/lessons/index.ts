import api from "@/fsd/shared/api";

export const fetchLessons = async () => {
    const response = await api.get(`/api/lessons`);
    return response.data;
};