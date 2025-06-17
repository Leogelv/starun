"use client"
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { hapticFeedback } from "@telegram-apps/sdk-react";

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
        <div className="min-h-screen bg-dark-bg pb-24">
            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>
                <div className="absolute top-96 -right-32 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 px-4 pb-4" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
                {/* Profile header - minimal design */}
                <div className="text-center mb-8">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-accent rounded-full animate-pulse opacity-30 blur-xl"></div>
                        {displayAvatarUrl ? (
                            <img 
                                src={displayAvatarUrl} 
                                alt={`${displayName}'s avatar`}
                                className="relative w-full h-full rounded-full object-cover border-3 border-purple-500/50 shadow-glow"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div 
                            className={`${displayAvatarUrl ? 'hidden' : 'flex'} relative w-full h-full bg-gradient-accent rounded-full items-center justify-center shadow-glow`}
                        >
                            <span className="text-5xl text-white font-bold font-unbounded">
                                {displayName[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        {isUpdatingAvatar && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center shadow-glow-sm">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    
                    {displayUsername && (
                        <p className="text-purple-300 text-lg font-medium mb-2">@{displayUsername}</p>
                    )}
                    
                    <p className="text-purple-200/60 text-sm font-mono">ID: {displayTelegramId || 'Unknown'}</p>
                </div>

                {/* Channel buttons with creative design */}
                <div className="space-y-4 max-w-sm mx-auto">
                    <a 
                        href="https://t.me/+CgWZpf-8DVUwY2Qy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative glass border border-purple-500/30 rounded-2xl p-6 transition-all duration-300 group-hover:border-purple-400/50 group-hover:shadow-glow">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-sm transition-shadow">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1">Зал созвездий</h3>
                                        <p className="text-purple-300 text-sm">Присоединяйся к сообществу</p>
                                    </div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400 transform group-hover:translate-x-1 transition-transform">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            
                            {/* Animated particles */}
                            <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-60"></div>
                            <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-6 right-12 w-1 h-1 bg-purple-300 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
                        </div>
                    </a>

                    <a 
                        href="https://t.me/+0zxZzcja4b40YmQy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => hapticFeedback.impactOccurred('medium')}
                        className="block relative overflow-hidden group"
                    >
                        <div className="relative glass border border-purple-500/30 rounded-2xl p-6 transition-all duration-300 group-hover:border-purple-400/50 group-hover:shadow-glow">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-sm transition-shadow">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 4C22 4 22 2.73 20.24 2.73C18.64 2.73 17.5 3.87 17.5 3.87L12 8.5L6.5 3.87S5.36 2.73 3.76 2.73C2 2.73 2 4 2 4L12 21L22 4Z" fill="white"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1">Канал</h3>
                                        <p className="text-purple-300 text-sm">Новости и обновления</p>
                                    </div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400 transform group-hover:translate-x-1 transition-transform">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            
                            {/* Animated particles */}
                            <div className="absolute bottom-2 left-4 w-1 h-1 bg-blue-400 rounded-full animate-float opacity-60"></div>
                            <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1.5s' }}></div>
                            <div className="absolute bottom-6 left-16 w-1 h-1 bg-blue-300 rounded-full animate-float opacity-50" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                    </a>
                </div>

                {/* Version info */}
                <div className="mt-12 text-center">
                    <p className="text-purple-300/40 text-xs">StarUnity v1.0</p>
                </div>
            </div>
        </div>
    );
};