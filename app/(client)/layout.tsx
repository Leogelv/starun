import {TelegramContext} from "@/fsd/app/providers/TelegramContext";
export default function ClientLayout({
                                         children,
                                     }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TelegramContext>
            {children}
        </TelegramContext>
    )
}