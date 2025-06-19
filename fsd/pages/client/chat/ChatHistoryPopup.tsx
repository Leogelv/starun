'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseURL } from '@/fsd/shared/api';

interface ChatMessage {
  id: number;
  telegram_id: number;
  message_type: 'user' | 'assistant';
  content: string;
  material_ids?: number[];
  session_id: string;
  created_at: string;
  updated_at: string;
}

interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  first_message: string;
  created_at: string;
}

interface ChatHistoryPopupProps {
  onSessionSelect?: (sessionId: string) => void;
}

export const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({ onSessionSelect }) => {
  const { user } = useTelegramUser();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!user?.telegram_id) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching chat history for user:', user.telegram_id);
      
      const response = await fetch(`https://primary-production-ee24.up.railway.app/webhook/my_chats?telegram_id=${user.telegram_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const messages: ChatMessage[] = await response.json();
        console.log('Received messages:', messages);
        
        // Group messages by session
        const sessionMap = new Map<string, ChatMessage[]>();
        messages.forEach(msg => {
          if (!sessionMap.has(msg.session_id)) {
            sessionMap.set(msg.session_id, []);
          }
          sessionMap.get(msg.session_id)!.push(msg);
        });
        
        console.log('Grouped sessions:', sessionMap.size);
        
        // Convert to session format
        const sessionsList: ChatSession[] = Array.from(sessionMap.entries()).map(([sessionId, msgs]) => {
          const sortedMsgs = msgs.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          const firstUserMsg = sortedMsgs.find(m => m.message_type === 'user');
          
          return {
            session_id: sessionId,
            messages: sortedMsgs,
            first_message: firstUserMsg?.content || 'Новый чат',
            created_at: sortedMsgs[sortedMsgs.length - 1]?.created_at || new Date().toISOString()
          };
        });
        
        // Sort by most recent
        sessionsList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Take only last 10 sessions for popup
        setSessions(sessionsList.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.telegram_id]);

  // Fetch sessions when component mounts and when popup opens
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  useEffect(() => {
    if (isOpen) {
      fetchSessions(); // Refresh when opening popup
    }
  }, [isOpen, fetchSessions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else if (diffInHours < 48) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
      setIsOpen(false);
    } else {
      // Fallback to navigation if no handler provided
      window.location.href = `/history`;
    }
  };

  return (
    <>
      {/* History Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20 z-20"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24"
          className="text-white"
        >
          <path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18m-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8z"/>
        </svg>
      </button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50, y: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50, y: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="absolute top-20 right-4 w-80 max-h-96 bg-black/80 backdrop-blur-xl rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ marginTop: 'env(safe-area-inset-top)' }}
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-lg">История чатов</h3>
              </div>

              <div className="overflow-y-auto max-h-80">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-white/60">Нет предыдущих чатов</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {sessions.map((session) => (
                      <motion.div
                        key={session.session_id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSessionClick(session.session_id)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer mb-2"
                      >
                        <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                          {session.first_message}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-white/40 text-xs">
                            {formatDate(session.created_at)}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-white/40 text-xs">{session.messages.length}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/40">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {sessions.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/history';
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                  >
                    Показать все
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};