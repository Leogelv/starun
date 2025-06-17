import {ClientPage} from "@/fsd/app/providers/ClientPage";
import {LessonsPage} from "@/fsd/pages/client/LessonsPage";

export default function Page(){
    return(
        <ClientPage displayBackButton={true}>
            <LessonsPage/>
        </ClientPage>
    )
}