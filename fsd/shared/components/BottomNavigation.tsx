"use client"
import { BookOpen, MessageCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNavigation() {
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        {
            name: 'Каталог',
            icon: BookOpen,
            path: '/',
        },
        {
            name: 'AI Чат',
            icon: MessageCircle,
            path: '/chat',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-100">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.path;
                    
                    return (
                        <button
                            key={tab.path}
                            onClick={() => router.push(tab.path)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                                isActive 
                                    ? 'text-purple-600' 
                                    : 'text-gray-500 hover:text-purple-500'
                            }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                            <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {tab.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
} 