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
    console.log('📤 API call: POST /api/user with payload:', payload);
    
    if (!payload.telegram_id || payload.telegram_id <= 0) {
        console.error('❌ Invalid telegram_id:', payload.telegram_id);
        throw new Error('Invalid telegram_id provided');
    }
    
    try {
        const response = await api.post(`/api/user`, payload);
        console.log('✅ API response:', response.status, response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ API error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            method: error.config?.method
        });
        throw error;
    }
}