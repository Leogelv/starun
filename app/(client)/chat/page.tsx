import { ClientPage } from "@/fsd/app/providers/ClientPage";
import { ChatPage } from "@/fsd/pages/client/ChatPage";
import { BottomNavigation } from "@/fsd/shared/components/BottomNavigation";

export default function Page() {
    return (
        <ClientPage>
            <div className="min-h-screen pb-16">
                <ChatPage />
                <BottomNavigation />
            </div>
        </ClientPage>
    );
} 