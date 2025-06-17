"use client"
import {useTelegramUser} from "@/fsd/app/providers/TelegramUser";

export const MainPage = () => {
    const {user} = useTelegramUser()
    console.log(user)
    return(
        <div>
            {user?.first_name}
        </div>
    )
}