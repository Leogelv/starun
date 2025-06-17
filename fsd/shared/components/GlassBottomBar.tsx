'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';
import { motion } from 'framer-motion';
import { AdaptiveTextInput } from './AdaptiveTextInput';

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

  const handleNavigation = (path: string) => {
    hapticFeedback.impactOccurred('light');
    router.push(path);
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
      {/* Adaptive Text input field (only shown on chat page) */}
      {showTextInput && (
        <AdaptiveTextInput
          message={message || ''}
          onMessageChange={onMessageChange || (() => {})}
          onSendMessage={onSendMessage || (() => {})}
          isLoading={isLoading}
          placeholder="Напишите ваш запрос..."
        />
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