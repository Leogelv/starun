"use client"
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { hapticFeedback } from "@telegram-apps/sdk-react";
import Image from 'next/image';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { ExternalLink, Layers, Heart } from 'lucide-react';

export const ProfilePage = () => {
    const { user } = useTelegramUser();
    const launchParams = useLaunchParams();
    const telegramUser = launchParams?.tgWebAppData?.user;
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    
    // Use data from launchParams if DB data not loaded yet
    const displayName = user?.first_name || telegramUser?.first_name || 'User';
    const displayUsername = user?.username || telegramUser?.username;
    const displayTelegramId = user?.telegram_id || telegramUser?.id;
    const displayAvatarUrl = telegramUser?.photo_url || user?.photo_url;

    // Update user data in Supabase when component mounts - run only once
    useEffect(() => {
        const updateUserData = async () => {
            if (telegramUser?.id && !user && !isUpdatingAvatar) {
                setIsUpdatingAvatar(true);
                try {
                    const response = await fetch(`/api/user/${telegramUser.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            photo_url: telegramUser.photo_url,
                            first_name: telegramUser.first_name,
                            last_name: telegramUser.last_name,
                            username: telegramUser.username,
                        }),
                    });
                    
                    if (!response.ok) {
                        console.error('Failed to update user data');
                    }
                } catch (error) {
                    console.error('Error updating user data:', error);
                } finally {
                    setIsUpdatingAvatar(false);
                }
            }
        };

        // Only run ONCE when telegramUser is available and no user in DB yet
        if (telegramUser?.id && !user && !isUpdatingAvatar) {
            updateUserData();
        }
    }, [telegramUser?.id]);
    
    return (
        <div className="fixed inset-0 flex flex-col bg-black">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <Image
                    src="/img/profilescreen.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="gradient-overlay-dark" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-4 pb-32 pt-20">
                {/* Profile header - glass design */}
                <div className="text-center mb-8">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                        <div className="absolute inset-0 glow-blue rounded-full animate-pulse opacity-50"></div>
                        {displayAvatarUrl ? (
                            <img 
                                src={displayAvatarUrl} 
                                alt={`${displayName}'s avatar`}
                                className="relative w-full h-full rounded-full object-cover border-2 border-white/30 shadow-2xl"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div 
                            className={`${displayAvatarUrl ? 'hidden' : 'flex'} relative w-full h-full glass-gradient rounded-full items-center justify-center shadow-2xl`}
                        >
                            <span className="text-5xl text-white font-bold">
                                {displayName[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        {isUpdatingAvatar && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 glass-gradient rounded-full flex items-center justify-center glow">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-2">{displayName}</h1>
                    
                    {displayUsername && (
                        <p className="text-white/70 text-lg mb-2">@{displayUsername}</p>
                    )}
                    
                    <p className="text-white/50 text-sm font-mono">ID: {displayTelegramId || 'Unknown'}</p>
                </div>

                {/* Channel buttons with glass design */}
                <div className="space-y-4 max-w-sm mx-auto">
                    <a 
                        href="https://t.me/+CgWZpf-8DVUwY2Qy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative glass-gradient rounded-2xl p-6 transition-all duration-300 hover:glass-light group-hover:scale-[1.02]">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 glass-heavy rounded-xl flex items-center justify-center glow-blue">
                                        <Layers size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1">Зал созвездий</h3>
                                        <p className="text-white/70 text-sm">Присоединяйся к сообществу</p>
                                    </div>
                                </div>
                                <ExternalLink size={20} className="text-white/60 transform group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform" />
                            </div>
                        </div>
                    </a>

                    <a 
                        href="https://t.me/+0zxZzcja4b40YmQy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative glass-gradient rounded-2xl p-6 transition-all duration-300 hover:glass-light group-hover:scale-[1.02]">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 glass-heavy rounded-xl flex items-center justify-center glow-cyan">
                                        <Heart size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1">Канал</h3>
                                        <p className="text-white/70 text-sm">Новости и обновления</p>
                                    </div>
                                </div>
                                <ExternalLink size={20} className="text-white/60 transform group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform" />
                            </div>
                        </div>
                    </a>
                </div>

                {/* Version info */}
                <div className="mt-12 text-center">
                    <p className="text-white/30 text-xs">StarUnity v1.0</p>
                </div>
            </div>
            
            {/* Glass Bottom Bar */}
            <GlassBottomBar />
        </div>
    );
};