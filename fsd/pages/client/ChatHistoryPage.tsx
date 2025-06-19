'use client';

import React, { useState, useEffect } from 'react';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { motion } from 'framer-motion';
import { getApiBaseURL } from '@/fsd/shared/api';

interface ChatSession {
  session_id: string;
  telegram_id: string;
  created_at: string;
  messages: Array<{
    id: number;
    telegram_id: number;
    message_type: 'user' | 'assistant';
    content: string;
    material_ids?: number[];
    session_id: string;
    created_at: string;
  }>;
}

export const ChatHistoryPage = () => {
  const { user } = useTelegramUser();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<any[]>([]);

  // Fetch user's chat sessions
  useEffect(() => {
    if (!user?.telegram_id) return;
    
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${getApiBaseURL()}/chat/sessions/${user.telegram_id}`);
        
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user?.telegram_id]);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    const fetchSessionMessages = async () => {
      try {
        const response = await fetch(`${getApiBaseURL()}/chat/session/${selectedSession}`);
        
        if (response.ok) {
          const data = await response.json();
          setSelectedSessionMessages(data);
        }
      } catch (error) {
        console.error('Error fetching session messages:', error);
      }
    };

    fetchSessionMessages();
  }, [selectedSession]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const renderSessionsList = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6 font-poppins">История чатов</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-sky rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-blue-500/40">
            <span className="text-3xl">💬</span>
          </div>
          <p className="text-white/70 text-lg">У вас пока нет истории чатов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <motion.div
              key={session.session_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedSession(session.session_id)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white font-medium line-clamp-2">
                    {session.messages.find(m => m.message_type === 'user')?.content || 'Новый чат'}
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    {formatDate(session.created_at)}
                  </p>
                </div>
                <div className="ml-4 flex items-center">
                  <span className="text-white/70 text-sm mr-2">{session.messages.length}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSessionMessages = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedSession(null)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center hover:scale-110 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="text-xl font-bold text-white font-poppins">Просмотр чата</h2>
      </div>

      <div className="space-y-4 pb-20">
        {selectedSessionMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-lg ${
              msg.message_type === 'user'
                ? 'bg-gradient-sky text-white shadow-blue-500/20'
                : 'bg-white/10 backdrop-blur-lg text-white'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-white/70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {msg.material_ids && msg.material_ids.length > 0 && (
                <p className="text-xs text-white/50 mt-2">
                  📚 {msg.material_ids.length} рекомендаций
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/img/chatscreen.jpg)' }} />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/40 via-blue-900/60 to-blue-950/80"></div>
      <div className="fixed inset-0 backdrop-blur-[0.5px]"></div>

      {/* Content */}
      <div className="relative z-10 px-4 pt-20 pb-32">
        <div className="max-w-2xl mx-auto">
          {selectedSession ? renderSessionMessages() : renderSessionsList()}
        </div>
      </div>

      {/* Bottom Bar */}
      <GlassBottomBar showTextInput={false} />
    </div>
  );
};