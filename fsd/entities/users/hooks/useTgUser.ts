import {useQuery} from "@tanstack/react-query";
import {TgUser} from "@/fsd/entities/types";
import {fetchTgUser} from "@/fsd/shared/api/users";

export const useTgUser = (telegramId?: number) => {
    return useQuery<TgUser>({
        queryKey: ["user", telegramId],
        queryFn: () => fetchTgUser(telegramId),
        enabled: !!telegramId
    });
};
