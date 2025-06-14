"use client"
import {useEffect} from "react";
import {hideBackButton, onBackButtonClick, showBackButton} from "@telegram-apps/sdk-react";
import {useRouter} from "next/navigation";
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
        <div className={'flex flex-col min-h-screen pt-12 max-w-[600px] mx-auto px-3'}>
            <div className={clsx('flex-1', !hideMenuButton && 'pb-12')}>
                {children}
            </div>
            {!hideMenuButton && <BottomMenu/>}
        </div>
    )
}
