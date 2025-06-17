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
            } catch (error) {
                console.error('❌ upsertTgUser error:', error);
                throw error;
            }
        },
        enabled: !!values.telegram_id && values.telegram_id > 0,
        retry: (failureCount, error) => {
            console.log('🔄 Retry attempt:', failureCount, 'Error:', error);
            return failureCount < 2; // Only retry once
        },
        staleTime: 0, // Always consider data stale to refetch
        gcTime: 0, // Don't cache for long
    });
};