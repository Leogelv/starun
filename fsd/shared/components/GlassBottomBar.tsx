'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';
import { motion } from 'framer-motion';

interface GlassBottomBarProps {
  onMicrophoneClick?: () => void;
  isRecording?: boolean;
  showTextInput?: boolean;
  message?: string;
  onMessageChange?: (message: string) => void;
  onSendMessage?: () => void;
  isLoading?: boolean;
}

export const GlassBottomBar: React.FC<GlassBottomBarProps> = ({
  onMicrophoneClick,
  isRecording = false,
  showTextInput = false,
  message = '',
  onMessageChange,
  onSendMessage,
  isLoading = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useTelegramUser();
  const [inputHeight, setInputHeight] = useState(48);

  const handleNavigation = (path: string) => {
    hapticFeedback.impactOccurred('light');
    router.push(path);
  };

  const handleTextareaResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, 120);
    target.style.height = newHeight + 'px';
    setInputHeight(newHeight);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Text input field (only shown on chat page) */}
      {showTextInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <div className="max-w-lg mx-auto">
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/30 rounded-3xl p-1 shadow-lg shadow-white/10">
              <textarea
                value={message}
                onChange={(e) => onMessageChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage?.();
                  }
                }}
                onInput={handleTextareaResize}
                placeholder="Напишите ваш запрос..."
                rows={1}
                className="w-full bg-transparent text-white px-5 py-3 pr-14 outline-none resize-none overflow-hidden placeholder-white/50 font-inter"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: `${inputHeight}px`
                }}
                disabled={isLoading}
              />
              <button
                onClick={onSendMessage}
                disabled={!message?.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-sky rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group overflow-hidden shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="white" d="M2.81 14.12L5.64 12.5C6.22 10.93 7 9.46 7.91 8.1L1.81 10.87L2.81 14.12M8.88 16.53L7.47 15.12L6.24 22H4.83L8.91 17.91C9.21 18.12 9.54 18.27 9.88 18.36L6.24 22M13.13 22.19L15.9 16.09C14.54 17 13.07 17.78 11.5 18.36L13.13 22.19M21.61 2.39C23.73 7.34 18.07 13 18.07 13C15.88 15.19 13.5 16.53 11.36 17.35C10.61 17.63 9.79 17.45 9.24 16.89L7.11 14.77C6.56 14.21 6.37 13.39 6.65 12.64C7.5 10.53 8.81 8.12 11 5.93C16.66.269 21.61 2.39 21.61 2.39Z"/>
                  <circle cx="14.5" cy="9.5" r="1.3" fill="#60a5fa" className="animate-pulse"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom navigation bar */}
      <div className="bg-gradient-to-r from-blue-900/20 via-blue-800/30 to-blue-900/20 backdrop-blur-xl border-t border-white/20 safe-area-bottom">
        <div className="flex items-center justify-between px-8 py-4 max-w-lg mx-auto">
          {/* Library/Catalog Button - Left */}
          <button
            onClick={() => handleNavigation('/catalog')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              pathname === '/catalog' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              pathname === '/catalog' 
                ? 'bg-gradient-sky shadow-lg shadow-blue-500/40' 
                : 'bg-white/15 hover:bg-white/25 shadow-lg shadow-white/10'
            } backdrop-blur-lg border border-white/30`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                className="text-white"
              >
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            {pathname === '/catalog' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"
              />
            )}
          </button>

          {/* Central Microphone Button */}
          <motion.button
            onClick={onMicrophoneClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500/80 shadow-lg shadow-red-500/50' 
                : 'bg-gradient-sky hover:shadow-lg hover:shadow-blue-500/30 shadow-lg shadow-blue-500/20'
            } backdrop-blur-lg border border-white/30`}
          >
            {/* Animated rings when recording */}
            {isRecording && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-red-300"
                />
              </>
            )}
            
            {/* Microphone Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className={`transition-all ${isRecording ? 'text-white animate-pulse drop-shadow-glow' : 'text-white'}`}
            >
              <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
              <path fill="currentColor" d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
              <path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
            </svg>
          </motion.button>

          {/* Profile Button - Right */}
          <button
            onClick={() => handleNavigation('/profile')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              pathname === '/profile' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-300 ${
              pathname === '/profile' 
                ? 'border-blue-400 shadow-lg shadow-blue-400/50' 
                : 'border-white/40 hover:border-white/60 shadow-lg shadow-white/10'
            }`}>
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-sky flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
            {pathname === '/profile' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"
              />
            )}
          </button>

        </div>
      </div>
    </div>
  );
};