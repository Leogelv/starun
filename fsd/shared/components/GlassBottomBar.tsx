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

  // Определяем стиль фона в зависимости от страницы
  const isMainPage = pathname === '/';
  const bottomBarStyle = isMainPage 
    ? { background: 'transparent' } // Полностью прозрачный на главной
    : {
        background: 'rgba(135, 164, 216, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
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
            <div className="relative backdrop-blur-lg rounded-3xl p-1 shadow-lg" style={{
              background: 'var(--smoky-cards)/10',
              boxShadow: '0 8px 25px var(--lunar-white)/10'
            }}>
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
                className="w-full bg-transparent px-5 py-3 pr-14 outline-none resize-none overflow-hidden font-inter placeholder-white/50"
                style={{
                  color: 'var(--lunar-white)',
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: `${inputHeight}px`
                }}
                disabled={isLoading}
              />
              
              <button
                onClick={onSendMessage}
                disabled={!message?.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group overflow-hidden shadow-lg"
                style={{ background: 'var(--gradient-accent)' }}
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
      <div className="pb-safe" style={bottomBarStyle}>
        <div className="flex items-center justify-between px-8 py-4 max-w-lg mx-auto">
          {/* Library/Catalog Button - Left */}
          <button
            onClick={() => handleNavigation('/catalog')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              pathname === '/catalog' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-lg`} style={{
              background: pathname === '/catalog' 
                ? 'rgba(135, 164, 216, 0.25)' 
                : 'rgba(135, 164, 216, 0.12)',
              boxShadow: pathname === '/catalog'
                ? '0 0 20px var(--star-glow), 0 0 40px var(--star-glow)/50'
                : '0 0 15px var(--cyan-neon)/30, 0 0 30px var(--cyan-neon)/20'
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                className="text-white"
                style={{
                  filter: pathname === '/catalog' 
                    ? 'drop-shadow(0 0 8px var(--star-glow))' 
                    : 'drop-shadow(0 0 6px var(--cyan-neon))'
                }}
              >
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            {pathname === '/catalog' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full shadow-sm"
                style={{ 
                  backgroundColor: 'var(--cyan-neon)',
                  boxShadow: '0 2px 8px var(--cyan-neon)/50'
                }}
              />
            )}
          </button>

          {/* Central Microphone Button */}
          <motion.button
            onClick={pathname === '/' ? onMicrophoneClick : () => handleNavigation('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-lg`}
            style={{
              background: isRecording 
                ? 'rgba(239, 68, 68, 0.3)' 
                : 'rgba(135, 164, 216, 0.2)',
              boxShadow: isRecording
                ? '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)'
                : '0 0 25px var(--electric-blue), 0 0 50px var(--electric-blue)/50'
            }}
          >
            {/* Always visible animated circles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-2 rounded-full border border-arctic-light/15"></div>
            </motion.div>
            
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-1 rounded-full border" style={{ borderStyle: 'dashed', borderColor: 'var(--cyan-neon)', opacity: 0.6 }}></div>
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-3 rounded-full border" style={{ borderStyle: 'dotted', borderColor: 'var(--star-glow)', opacity: 0.5 }}></div>
            </motion.div>
            
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
            
            {/* Icon - Microphone on main page, Home on other pages */}
            {pathname === '/' ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                className={`relative z-10 transition-all ${isRecording ? 'text-white animate-pulse' : 'text-white'}`}
                style={{
                  filter: isRecording 
                    ? 'drop-shadow(0 0 12px white) drop-shadow(0 0 24px white)' 
                    : 'drop-shadow(0 0 10px var(--electric-blue)) drop-shadow(0 0 20px var(--electric-blue))'
                }}
              >
                <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
                <path fill="currentColor" d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
                <path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                className="relative z-10 transition-all text-white"
                style={{
                  filter: 'drop-shadow(0 0 10px var(--electric-blue)) drop-shadow(0 0 20px var(--electric-blue))'
                }}
              >
                <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            )}
          </motion.button>

          {/* Profile Button - Right */}
          <button
            onClick={() => handleNavigation('/profile')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              pathname === '/profile' ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden transition-all duration-300`} style={{
              boxShadow: pathname === '/profile'
                ? '0 0 20px var(--cyan-neon), 0 0 40px var(--cyan-neon)/50'
                : '0 0 15px var(--electric-blue)/30, 0 0 30px var(--electric-blue)/20',
              background: 'rgba(135, 164, 216, 0.12)'
            }}>
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
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
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full shadow-sm"
                style={{ 
                  backgroundColor: 'var(--cyan-neon)',
                  boxShadow: '0 2px 8px var(--cyan-neon)/50'
                }}
              />
            )}
          </button>

        </div>
      </div>
    </div>
  );
};