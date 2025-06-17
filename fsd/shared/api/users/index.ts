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
    } catch (error: unknown) {
        const isAxiosError = error && typeof error === 'object' && 'response' in error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error('❌ API error details:', {
            status: isAxiosError ? (error as any).response?.status : undefined,
            statusText: isAxiosError ? (error as any).response?.statusText : undefined,
            data: isAxiosError ? (error as any).response?.data : undefined,
            message: errorMessage,
            url: isAxiosError ? (error as any).config?.url : undefined,
            method: isAxiosError ? (error as any).config?.method : undefined
        });
        throw error;
    }
}