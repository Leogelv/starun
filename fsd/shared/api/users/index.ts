import api from "@/fsd/shared/api";

export interface UpsertUserPayload {
    telegram_id: number
    username?: string
    first_name?: string
    last_name?: string
    photo_url?: string
}

export const fetchTgUser = async (telegramId?: number) => {
    const response = await api.get(`/api/user/${telegramId}`);
    return response.data;
};

export const upsertTgUser = async (payload: UpsertUserPayload) => {
    const response = await api.post(`/api/user`, payload);
    return response.data
}