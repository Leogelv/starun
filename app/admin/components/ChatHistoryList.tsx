'use client';

import { useState, useEffect } from 'react';
import { MessageModal } from './MessageModal';

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


export const ChatHistoryList = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [telegramIdFilter, setTelegramIdFilter] = useState('');
  const [sessionIdFilter, setSessionIdFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<{ sessionId: string; telegramId: number; messages: ChatMessage[] } | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (telegramIdFilter) {
        params.append('telegram_id', telegramIdFilter);
      }
      
      if (sessionIdFilter) {
        params.append('session_id', sessionIdFilter);
      }

      const response = await fetch(`/api/chat-history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramIdFilter, sessionIdFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Group messages by user and session
  const groupedData = messages.reduce((acc, msg) => {
    if (!acc[msg.telegram_id]) {
      acc[msg.telegram_id] = new Map();
    }
    
    if (!acc[msg.telegram_id].has(msg.session_id)) {
      acc[msg.telegram_id].set(msg.session_id, []);
    }
    
    acc[msg.telegram_id].get(msg.session_id)!.push(msg);
    return acc;
  }, {} as Record<number, Map<string, ChatMessage[]>>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-2 border-electric-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="number"
            placeholder="Telegram ID"
            value={telegramIdFilter}
            onChange={(e) => setTelegramIdFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
            style={{ background: 'var(--smoky-cards)/10' }}
          />
          
          <input
            type="text"
            placeholder="Session ID"
            value={sessionIdFilter}
            onChange={(e) => setSessionIdFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
            style={{ background: 'var(--smoky-cards)/10' }}
          />

          <button
            onClick={() => {
              setTelegramIdFilter('');
              setSessionIdFilter('');
            }}
            className="px-4 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-arctic-light/50 transition-all"
            style={{ background: 'var(--smoky-cards)/10' }}
          >
            Сбросить
          </button>
        </div>

        <div className="mt-4 text-sm text-white/70">
          Всего сообщений: {messages.length}
        </div>
      </div>

      {/* Users with Sessions */}
      <div className="space-y-6">
        {Object.entries(groupedData).map(([telegramId, userSessions]) => (
          <div key={telegramId} className="glass rounded-2xl border border-arctic-light/20 p-6">
            {/* User Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
                U{telegramId}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">User {telegramId}</h3>
                <p className="text-sm text-white/60">
                  {userSessions.size} {userSessions.size === 1 ? 'сессия' : 'сессий'} • {Array.from(userSessions.values()).flat().length} сообщений
                </p>
              </div>
            </div>

            {/* Horizontal Scroll Sessions */}
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                {Array.from(userSessions.entries()).map(([sessionId, sessionMessages]) => {
                  const sortedMessages = sessionMessages.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  );
                  const firstUserMessage = sortedMessages.find(m => m.message_type === 'user');
                  
                  return (
                    <div
                      key={sessionId}
                      className="bg-white/5 rounded-xl p-4 flex-shrink-0 hover:bg-white/10 transition-all cursor-pointer"
                      style={{ width: '300px' }}
                      onClick={() => setSelectedSession({ sessionId, telegramId: parseInt(telegramId), messages: sortedMessages })}
                    >
                      {/* Session Header */}
                      <div className="mb-3">
                        <p className="text-xs text-white/40 mb-1">Session ID</p>
                        <p className="text-xs text-white/60 font-mono truncate">{sessionId}</p>
                      </div>

                      {/* First Message Preview */}
                      <div className="mb-3">
                        <p className="text-white/80 text-sm line-clamp-2">
                          {firstUserMessage?.content || 'Нет сообщений'}
                        </p>
                      </div>

                      {/* Session Stats */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/50">
                          {sortedMessages.length} сообщений
                        </span>
                        <span className="text-white/40">
                          {formatDate(sortedMessages[0]?.created_at || '')}
                        </span>
                      </div>

                      {/* Messages Preview */}
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {sortedMessages.slice(0, 3).map((msg) => (
                          <div key={msg.id} className="text-xs">
                            <span className={msg.message_type === 'user' ? 'text-blue-400' : 'text-green-400'}>
                              {msg.message_type === 'user' ? '👤' : '🤖'}
                            </span>
                            <span className="text-white/60 ml-1 line-clamp-1">
                              {msg.content}
                            </span>
                          </div>
                        ))}
                        {sortedMessages.length > 3 && (
                          <div className="text-xs text-white/40">+{sortedMessages.length - 3} еще...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Нет сообщений</h3>
          <p className="text-white/70">История чатов пуста</p>
        </div>
      )}

      {/* Message Modal */}
      {selectedSession && (
        <MessageModal 
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};