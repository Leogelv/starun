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
                onClick={onMicrophoneClick}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'text-red-400 animate-pulse' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className={`transition-all ${isRecording ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'}`}>
                  <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
                  <path fill="currentColor" d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
                  <path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom navigation bar */}
      <div className="bg-black/20 backdrop-blur-xl border-t border-white/20 safe-area-bottom">
        <div className="flex items-center justify-center px-6 py-3 relative">
          {/* Profile Button */}
          <button
            onClick={() => handleNavigation('/profile')}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              pathname === '/profile' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            {/* User Avatar with Glow */}
            <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all duration-300 ${
              pathname === '/profile' 
                ? 'border-blue-400 shadow-lg shadow-blue-400/50' 
                : 'border-white/30 hover:border-white/50'
            }`}>
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Active indicator */}
            {pathname === '/profile' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"
              />
            )}
          </button>

          {/* Central Microphone Button */}
          <div className="mx-8">
            <motion.button
              onClick={onMicrophoneClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/80 shadow-lg shadow-red-500/50' 
                  : 'bg-white/20 hover:bg-white/30 shadow-lg shadow-white/20'
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
                className={`transition-all ${isRecording ? 'text-white animate-pulse' : 'text-white'}`}
              >
                <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
                <path fill="currentColor" d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
                <path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
              </svg>
            </motion.button>
          </div>

          {/* Materials/Catalog Button */}
          <button
            onClick={() => handleNavigation('/catalog')}
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              pathname === '/catalog' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            {/* Icon background */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              pathname === '/catalog' 
                ? 'bg-purple-500/80 shadow-lg shadow-purple-500/50' 
                : 'bg-white/20 hover:bg-white/30 shadow-lg shadow-white/20'
            } backdrop-blur-lg border border-white/30`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                className="text-white"
              >
                <path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
            
            {/* Active indicator */}
            {pathname === '/catalog' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 w-1 h-1 bg-purple-400 rounded-full shadow-sm shadow-purple-400/50"
              />
            )}
          </button>

          {/* Send button (only visible when there's text and on chat page) */}
          {showTextInput && message.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={onSendMessage}
              disabled={isLoading}
              className="absolute right-4 w-12 h-12 bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group overflow-hidden shadow-lg backdrop-blur-lg"
            >
              {/* Animated rocket icon */}
              <div className="relative z-10 transition-transform group-hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="white" d="M2.81 14.12L5.64 12.5C6.22 10.93 7 9.46 7.91 8.1L1.81 10.87L2.81 14.12M8.88 16.53L7.47 15.12L6.24 22H4.83L8.91 17.91C9.21 18.12 9.54 18.27 9.88 18.36L6.24 22M13.13 22.19L15.9 16.09C14.54 17 13.07 17.78 11.5 18.36L13.13 22.19M21.61 2.39C23.73 7.34 18.07 13 18.07 13C15.88 15.19 13.5 16.53 11.36 17.35C10.61 17.63 9.79 17.45 9.24 16.89L7.11 14.77C6.56 14.21 6.37 13.39 6.65 12.64C7.5 10.53 8.81 8.12 11 5.93C16.66.269 21.61 2.39 21.61 2.39Z"/>
                  <circle cx="14.5" cy="9.5" r="1.3" fill="#60a5fa" className="animate-pulse"/>
                </svg>
              </div>
              
              {/* Particle effects */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}></div>
                <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.8s' }}></div>
                <div className="absolute bottom-1 left-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}></div>
              </div>
              
              {/* Continuous glow animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-full animate-pulse opacity-30"></div>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};