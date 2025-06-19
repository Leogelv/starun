'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveTextInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const AdaptiveTextInput: React.FC<AdaptiveTextInputProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  isLoading = false,
  placeholder = "Напишите ваш запрос...",
  onFocus,
  onBlur
}) => {
  const [inputHeight, setInputHeight] = useState(48);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, 400);
    target.style.height = newHeight + 'px';
    setInputHeight(newHeight);
    
    // Show expand button if content exceeds 400px
    if (target.scrollHeight > 400 && !isExpanded) {
      // Auto-expand if content is too large
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  const handleSend = () => {
    onSendMessage();
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Normal input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-2"
      >
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-3xl p-1 shadow-lg">
            {/* Внешний слой для glass эффекта */}
            <div 
              className="absolute inset-0 rounded-3xl backdrop-blur-lg"
              style={{
                background: 'var(--smoky-cards)/10',
                boxShadow: '0 8px 25px var(--lunar-white)/10'
              }}
            />
            
            {/* Внутренний контейнер для textarea */}
            <div className="relative">
              <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onInput={handleTextareaResize}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={1}
              className="w-full bg-transparent px-5 py-3 pr-24 outline-none resize-none overflow-hidden font-inter placeholder-white/50"
              style={{
                color: 'var(--lunar-white)',
                minHeight: '48px',
                maxHeight: '400px',
                height: `${inputHeight}px`
              }}
              disabled={isLoading}
            />
            </div>
            
            {/* Expand button */}
            {inputHeight >= 120 && (
              <button
                onClick={handleExpand}
                className="absolute z-20 right-16 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--smoky-cards)/30' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </button>
            )}
            
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!message?.trim() || isLoading}
              className="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group overflow-hidden shadow-lg"
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

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={handleCollapse}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-4 top-20 bottom-20 z-50 flex flex-col"
            >
              <div className="glass rounded-2xl border border-arctic-light/20 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-arctic-light/20">
                  <h3 className="text-lg font-semibold text-white">Написать сообщение</h3>
                  <button
                    onClick={handleCollapse}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <textarea
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 w-full bg-transparent text-white placeholder-white/50 outline-none resize-none font-inter"
                    style={{ color: 'var(--lunar-white)' }}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-arctic-light/20 flex justify-end gap-3">
                  <button
                    onClick={handleCollapse}
                    className="px-6 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-arctic-light/50 transition-all"
                    style={{ background: 'var(--smoky-cards)/10' }}
                  >
                    Свернуть
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!message?.trim() || isLoading}
                    className="px-6 py-2 rounded-xl text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                      background: 'var(--gradient-accent)',
                      boxShadow: '0 0 20px var(--electric-blue)/40'
                    }}
                  >
                    {isLoading ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};