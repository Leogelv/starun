"use client"
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {init, isTMA, mountBackButton, postEvent, unmountBackButton} from "@telegram-apps/sdk-react";
import {ClientUnsupported} from "@/fsd/shared/components/ClientUnsupported";
import { TelegramUser } from '@/fsd/app/providers/TelegramUser';

// Тип для контекста приложения
interface AppContextType {
    isTelegramApp: boolean;
    allowBrowserAccess: boolean;
    showAppContent: boolean;
}

// Создаем контекст с начальными значениями
const AppContext = createContext<AppContextType>({
    isTelegramApp: false,
    allowBrowserAccess: false,
    showAppContent: false,
});

// Провайдер контекста для оборачивания приложения
export const TelegramContext: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTelegramApp, setIsTelegramApp] = useState<boolean|undefined>();
    const [allowBrowserAccess, setAllowBrowserAccess] = useState<boolean>(false);
    const [showAppContent, setShowAppContent] = useState<boolean>(false);

    useEffect(() => {
        const insideTelegram = isTMA();
        setIsTelegramApp(insideTelegram);
        if(insideTelegram){
            init(); // «поднимает» SDK, биндит WebApp, backButton и т.д.
            // Автоматически включаем полноэкранный режим на всех страницах
            postEvent('web_app_request_fullscreen');

            // Отключаем вертикальные свайпы для закрытия приложения
            postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });

            // Запрашиваем информацию о safe area
            postEvent('web_app_request_safe_area');

            mountBackButton();
            return () => {
                unmountBackButton();
            };
        }
    }, []);

    if (isTelegramApp === undefined) {
        return ('Загрузка...')
    }
    if (!isTelegramApp) {
        return <ClientUnsupported />
    }
    return (
        <AppContext.Provider
            value={{
                isTelegramApp,
                allowBrowserAccess,
                showAppContent,
            }}
        >
            <TelegramUser>
                {children}
            </TelegramUser>
        </AppContext.Provider>
    );
};
