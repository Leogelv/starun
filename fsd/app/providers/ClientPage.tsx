"use client"
import {useEffect} from "react";
import {hideBackButton, onBackButtonClick, showBackButton} from "@telegram-apps/sdk-react";
import {useRouter, usePathname} from "next/navigation";
import {BottomMenu} from "@/fsd/shared/components/BottomMenu";
import clsx from "clsx";

interface ClientPageProps {
    children: React.ReactNode;
    hideMenuButton?: boolean;
    displayBackButton?: boolean
}

export const ClientPage = ({
                               children,
                               displayBackButton,
                               hideMenuButton
                           }: ClientPageProps) => {
    const router = useRouter()
    const pathname = usePathname()
    
    // Pages with new glass bottom bar design
    const pagesWithNewDesign = ['/chat', '/profile', '/catalog']
    const shouldHideOldMenu = pagesWithNewDesign.includes(pathname) || hideMenuButton
    
    useEffect(() => {
        if (displayBackButton) {
            showBackButton();
            return onBackButtonClick(() => {
                router.back();
            });
        }
        hideBackButton();
    }, [displayBackButton]);
    
    return (
        <div className={clsx(
            'flex flex-col min-h-screen max-w-[600px] mx-auto',
            !pagesWithNewDesign.includes(pathname) && 'pt-12 px-3'
        )}>
            <div className={clsx('flex-1', !shouldHideOldMenu && 'pb-12')}>
                {children}
            </div>
            {!shouldHideOldMenu && <BottomMenu/>}
        </div>
    )
}
