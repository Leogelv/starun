import {ClientPage} from "@/fsd/app/providers/ClientPage";
import {ChatPage} from "@/fsd/pages/client/ChatPage";

export default function Page(){
    return(
        <ClientPage hideMenuButton={true}>
            <ChatPage/>
        </ClientPage>
    )
}