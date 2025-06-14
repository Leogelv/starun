"use client"
import {useLaunchParams} from "@telegram-apps/sdk-react";
import React, {createContext, ReactNode, useContext} from "react";
import {TgUser} from "@/fsd/entities/types";
import {useUpsertTgUser} from "@/fsd/entities/users/hooks/useUpsertTgUser";

interface ContextValue {
    user?: TgUser;
}

const TelegramUserContext = createContext<ContextValue>({
    user: undefined,
});

export const useTelegramUser = () => useContext(TelegramUserContext);

export const TelegramUser: React.FC<{ children: ReactNode }> = ({children}) => {
    const {tgWebAppData} = useLaunchParams()
    const {data} = useUpsertTgUser({
        telegram_id: tgWebAppData?.user?.id || 0,
        username: tgWebAppData?.user?.username,
        first_name: tgWebAppData?.user?.first_name,
        last_name: tgWebAppData?.user?.last_name,
        photo_url: tgWebAppData?.user?.photo_url,
    })

    return (<TelegramUserContext.Provider value={{user: data}}>
        {children}
    </TelegramUserContext.Provider>)
}
export default TelegramUser