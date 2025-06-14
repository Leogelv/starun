declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                ready: () => void;
                expand: () => void;
                close: () => void;
            };
        };
    }
}
export {};