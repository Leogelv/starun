import Image from "next/image";
import Link from "next/link";
import {hapticFeedback} from "@telegram-apps/sdk-react";


export const BottomMenu = () => {
    const menu = [
        {
            link: '/',
            img: '/footer/home.svg',
            text: 'Главная'
        },
        {
            link: '/lessons',
            img: '/footer/home.svg',
            text: 'Библиотека'
        },
        {
            link: '/w',
            img: '/footer/home.svg',
            text: 'Календарь'
        },
        {
            link: '/w2',
            img: '/footer/home.svg',
            text: 'Профиль'
        }
    ]
    return (
        <div className={'mb-4 grid grid-cols-4 px-3'}>
            {menu.map((item) => (
                <Link onClick={()=>hapticFeedback.impactOccurred('medium')} key={item.link} href={item.link}>
                    <div className={'py-2 flex flex-col items-center gap-1'}>
                        <Image width={24} height={24} src={item.img} alt={''}/>
                        <p>{item.text}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}