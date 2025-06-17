import {ClientPage} from "@/fsd/app/providers/ClientPage";
import {ProfilePage} from "@/fsd/pages/client/ProfilePage";

export default function Page(){
    return(
        <ClientPage hideMenuButton={true}>
            <ProfilePage/>
        </ClientPage>
    )
}