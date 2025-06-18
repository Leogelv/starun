import {useQuery, useQueryClient} from "@tanstack/react-query";
import {upsertTgUser, UpsertUserPayload} from "@/fsd/shared/api/users";
import {TgUser} from "@/fsd/entities/types";


export const useUpsertTgUser = (values: UpsertUserPayload) => {
    const queryClient = useQueryClient();
    
    return useQuery<TgUser>({
        queryKey: ["user", values.telegram_id],
        queryFn: async () => {
            console.log('🔄 Making upsertTgUser request with:', values);
            try {
                const result = await upsertTgUser(values);
                console.log('✅ upsertTgUser success:', result);
                
                // Invalidate and refetch user queries to update cache
                queryClient.invalidateQueries({ queryKey: ["user"] });
                
                return result;
            } catch (error: any) {
                console.error('❌ upsertTgUser error:', error);
                
                // If it's a 404 or network error, don't retry aggressively
                if (error?.response?.status === 404 || error?.code === 'NETWORK_ERROR') {
                    console.warn('🚫 API endpoint not available, skipping user upsert');
                    // Return a minimal user object to prevent infinite retries
                    return {
                        telegram_id: values.telegram_id,
                        username: values.username,
                        first_name: values.first_name,
                        last_name: values.last_name,
                        photo_url: values.photo_url
                    } as TgUser;
                }
                
                throw error;
            }
        },
        enabled: !!values.telegram_id && values.telegram_id > 0,
        retry: (failureCount, error: any) => {
            console.log('🔄 Retry attempt:', failureCount, 'Error:', error);
            
            // Don't retry for 404 or network errors
            if (error?.response?.status === 404 || error?.code === 'NETWORK_ERROR') {
                console.warn('🚫 Not retrying for 404/network error');
                return false;
            }
            
            // Only retry once for other errors
            return failureCount < 1;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    });
};