import {useQuery} from "@tanstack/react-query";
import {upsertTgUser, UpsertUserPayload} from "@/fsd/shared/api/users";
import {TgUser} from "@/fsd/entities/types";


export const useUpsertTgUser = (values: UpsertUserPayload) => {
    return useQuery<TgUser>({
        queryKey: ["user", values.telegram_id],
        queryFn: async () => {
            console.log('🔄 Making upsertTgUser request with:', values);
            try {
                const result = await upsertTgUser(values);
                console.log('✅ upsertTgUser success:', result);
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
        }
    });
};