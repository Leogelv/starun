'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Mic } from 'lucide-react';
import Image from 'next/image';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';

interface GlassBottomBarProps {
  onMicPress?: () => void;
  isRecording?: boolean;
}

export const GlassBottomBar: React.FC<GlassBottomBarProps> = ({ onMicPress, isRecording }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useTelegramUser();
  
  const isChat = pathname === '/chat';
  const isProfile = pathname === '/profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 px-6">
      <div className="glass-gradient rounded-full p-3 flex items-center justify-between max-w-sm mx-auto">
        {/* Profile Button */}
        <button
          onClick={() => router.push('/profile')}
          className={`relative p-3 rounded-full transition-all duration-300 ${
            isProfile ? 'glass-light' : 'hover:bg-white/10'
          }`}
        >
          {user?.photo_url ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={user.photo_url}
                alt="Profile"
                fill
                className="object-cover"
              />
              {isProfile && (
                <div className="absolute -inset-1 rounded-full glow-blue animate-pulse" />
              )}
            </div>
          ) : (
            <User
              size={32}
              className={`${isProfile ? 'text-blue-400' : 'text-white/70'} transition-colors`}
            />
          )}
        </button>

        {/* Mic Button */}
        {isChat && (
          <button
            onClick={onMicPress}
            className={`p-6 rounded-full glass-gradient transition-all duration-300 transform hover:scale-105 ${
              isRecording ? 'glow pulse-animation bg-purple-600/30' : 'glow-blue'
            }`}
          >
            <Mic
              size={40}
              className={`${
                isRecording ? 'text-purple-300' : 'text-white'
              } transition-colors`}
            />
          </button>
        )}

        {/* Chat/Home Button */}
        <button
          onClick={() => router.push('/chat')}
          className={`p-3 rounded-full transition-all duration-300 ${
            isChat ? 'glass-light glow-cyan' : 'hover:bg-white/10'
          }`}
        >
          <Home
            size={32}
            className={`${isChat ? 'text-cyan-400' : 'text-white/70'} transition-colors`}
          />
        </button>
      </div>
    </div>
  );
}; 