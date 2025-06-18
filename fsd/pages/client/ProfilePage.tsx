"use client"
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { hapticFeedback } from "@telegram-apps/sdk-react";
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { getApiBaseURL } from '@/fsd/shared/api';

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
                    const response = await fetch(`${getApiBaseURL()}/user/${telegramUser.id}`, {
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
        <div className="min-h-screen overflow-hidden pb-24">
            {/* Background image with gradient overlay */}
            <div 
                className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/img/profilescreen.jpg)',
                }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-blue-900/50 via-green-800/40 to-blue-900/60"></div>
            <div className="fixed inset-0 backdrop-blur-[0.5px]"></div>
            
            {/* Reduced gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 -left-32 w-64 h-64 bg-green-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-96 -right-32 w-96 h-96 bg-blue-400/15 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-500/15 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 px-4 pb-4" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
                {/* Profile header - minimal design */}
                <div className="text-center mb-8">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-accent rounded-full animate-pulse opacity-30 blur-xl"></div>
                        <img 
                            src={displayAvatarUrl || '/img/nophoto.png'} 
                            alt={`${displayName}'s avatar`}
                            className="relative w-full h-full rounded-full object-cover shadow-glow"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/img/nophoto.png';
                                target.onerror = null;
                            }}
                        />
                        {isUpdatingAvatar && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center shadow-glow-sm">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    
                    {displayUsername && (
                        <p className="text-green-300 text-lg font-medium mb-2 font-poppins">@{displayUsername}</p>
                    )}
                    
                    <p className="text-white/60 text-sm font-mono">ID: {displayTelegramId || 'Unknown'}</p>
                </div>

                {/* Channel buttons with new images and cosmic theme */}
                <div className="space-y-4 max-w-sm mx-auto">
                    {/* Зал Созвездий */}
                    <a 
                        href="https://t.me/+CgWZpf-8DVUwY2Qy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                                        <img 
                                            src="/img/zalsozvezdii.png" 
                                            alt="Зал созвездий"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1 font-poppins">Зал Созвездий</h3>
                                        <p className="text-purple-300 text-sm">пространство StarЮнитцев</p>
                                    </div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400 transform group-hover:translate-x-1 transition-transform">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            
                            {/* Animated cosmic particles */}
                            <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
                            <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-6 right-12 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
                        </div>
                    </a>

                    {/* Канал StarUnity */}
                    <a 
                        href="https://t.me/+0zxZzcja4b40YmQy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                                        <img 
                                            src="/img/channelimage.png" 
                                            alt="Канал StarUnity"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1 font-poppins">Канал StarUnity</h3>
                                        <p className="text-blue-300 text-sm">пульс вселенной</p>
                                    </div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400 transform group-hover:translate-x-1 transition-transform">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            
                            {/* Animated cosmic particles */}
                            <div className="absolute bottom-2 left-4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                            <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s' }}></div>
                            <div className="absolute bottom-6 left-16 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                    </a>
                </div>

                {/* Version info */}
                <div className="mt-12 text-center">
                   
                </div>
            </div>
            
            {/* Glass Bottom Bar */}
            <GlassBottomBar showTextInput={false} />
        </div>
    );
};