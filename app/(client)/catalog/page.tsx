import {ClientPage} from "@/fsd/app/providers/ClientPage";
import {CatalogPage} from "@/fsd/pages/client/CatalogPage";

export default function Page(){
    return(
        <ClientPage hideMenuButton={true}>
            <CatalogPage/>
        </ClientPage>
    )
}