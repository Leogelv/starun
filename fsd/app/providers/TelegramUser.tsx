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
    const launchParams = useLaunchParams();
    
    console.log('LaunchParams:', launchParams);
    console.log('tgWebAppData:', launchParams?.tgWebAppData);
    console.log('User from tgWebAppData:', launchParams?.tgWebAppData?.user);
    
    // Get user data from tgWebAppData (correct path!)
    const telegramUser = launchParams?.tgWebAppData?.user;
    
    const {data} = useUpsertTgUser({
        telegram_id: telegramUser?.id || 0,
        username: telegramUser?.username,
        first_name: telegramUser?.first_name,
        last_name: telegramUser?.last_name, 
        photo_url: telegramUser?.photo_url,
    })
    
    console.log('User from DB:', data);

    return (<TelegramUserContext.Provider value={{user: data}}>
        {children}
    </TelegramUserContext.Provider>)
}
export default TelegramUser