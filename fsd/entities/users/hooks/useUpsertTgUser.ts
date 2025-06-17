import {useQuery} from "@tanstack/react-query";
import {upsertTgUser, UpsertUserPayload} from "@/fsd/shared/api/users";
import {TgUser} from "@/fsd/entities/types";


export const useUpsertTgUser = (values: UpsertUserPayload) => {
    return useQuery<TgUser>({
        queryKey: ["user", values.telegram_id],
        queryFn: () => upsertTgUser(values),
        enabled: !!values.telegram_id
    });
};