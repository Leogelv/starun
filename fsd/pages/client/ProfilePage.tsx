"use client"
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

export const ProfilePage = () => {
    const { user } = useTelegramUser();
    const launchParams = useLaunchParams();
    const telegramUser = launchParams?.tgWebAppData?.user;
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    
    // Use data from launchParams if DB data not loaded yet
    const displayName = user?.first_name || telegramUser?.first_name || 'User';
    const displayLastName = user?.last_name || telegramUser?.last_name || '';
    const displayUsername = user?.username || telegramUser?.username;
    const displayTelegramId = user?.telegram_id || telegramUser?.id;
    const displayAvatarUrl = telegramUser?.photo_url || user?.photo_url;
    
    console.log('ProfilePage - LaunchParams:', launchParams);
    console.log('ProfilePage - TelegramUser from launchParams:', telegramUser);
    console.log('ProfilePage - User from DB:', user);
    console.log('ProfilePage - Display Avatar URL:', displayAvatarUrl);
    console.log('ProfilePage - Telegram photo_url:', telegramUser?.photo_url);
    console.log('ProfilePage - DB photo_url:', user?.photo_url);

    // Update user data in Supabase when component mounts - run only once
    useEffect(() => {
        const updateUserData = async () => {
            if (telegramUser?.id && !user && !isUpdatingAvatar) {
                console.log('Updating user data in Supabase - ONE TIME ONLY:', {
                    telegram_id: telegramUser.id,
                    photo_url: telegramUser.photo_url,
                    first_name: telegramUser.first_name,
                    last_name: telegramUser.last_name,
                    username: telegramUser.username
                });
                
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
                    
                    console.log('User update response:', response.status);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Failed to update user data:', errorData);
                    } else {
                        const userData = await response.json();
                        console.log('User data updated successfully:', userData);
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
    }, [telegramUser?.id]); // Remove user?.id dependency to prevent loop
    
    return (
        <div className="min-h-screen bg-[#0A0A0F] pb-24">
            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>
                <div className="absolute top-96 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 px-4 pb-4" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
                {/* Profile header */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                        {displayAvatarUrl ? (
                            <img 
                                src={displayAvatarUrl} 
                                alt={`${displayName}'s avatar`}
                                className="w-full h-full rounded-full object-cover border-2 border-purple-500/50"
                                onError={(e) => {
                                    console.error('Avatar failed to load:', displayAvatarUrl);
                                    // Fallback to initials if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                                onLoad={() => {
                                    console.log('Avatar loaded successfully:', displayAvatarUrl);
                                }}
                            />
                        ) : null}
                        <div 
                            className={`${displayAvatarUrl ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full items-center justify-center`}
                        >
                            <span className="text-4xl text-white font-bold">
                                {displayName[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        {isUpdatingAvatar && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-white font-['Inter_Tight'] mb-2">
                        {displayName} {displayLastName}
                    </h1>
                    {displayUsername && (
                        <p className="text-gray-400 text-sm">@{displayUsername}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white mb-1">0</p>
                        <p className="text-xs text-gray-400">Sessions</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white mb-1">0</p>
                        <p className="text-xs text-gray-400">Minutes</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white mb-1">0</p>
                        <p className="text-xs text-gray-400">Streak</p>
                    </div>
                </div>

                {/* Menu items */}
                <div className="space-y-3">
                    <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <span className="text-white font-medium">Favorites</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    
                    <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <span className="text-white font-medium">Settings</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    
                    <button className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <span className="text-white font-medium">About</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* User info */}
                <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Telegram ID</p>
                    <p className="text-white font-mono">{displayTelegramId || 'Unknown'}</p>
                    
                    {telegramUser?.is_premium && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-400 mb-2">Premium Status</p>
                            <p className="text-white">✨ Premium User</p>
                        </div>
                    )}
                    
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-400">Debug: User from DB</p>
                            <pre className="text-xs text-white/60 mt-1 overflow-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                            <p className="text-xs text-gray-400 mt-4">Debug: Telegram User from LaunchParams</p>
                            <pre className="text-xs text-white/60 mt-1 overflow-auto">
                                {JSON.stringify(telegramUser, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};