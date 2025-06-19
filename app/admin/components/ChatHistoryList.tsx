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
  tg_users?: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
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

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту сессию?')) return;
    
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchMessages();
      } else {
        alert('Ошибка при удалении сессии');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Ошибка при удалении сессии');
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
        {Object.entries(groupedData).map(([telegramId, userSessions]) => {
          // Get user info from first message with user data
          const firstMessageWithUser = Array.from(userSessions.values()).flat().find(msg => msg.tg_users);
          const userInfo = firstMessageWithUser?.tg_users;
          
          return (
            <div key={telegramId} className="glass rounded-2xl border border-arctic-light/20 p-6">
              {/* User Header */}
              <div className="flex items-center gap-4 mb-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img 
                    src={userInfo?.photo_url || '/img/nophoto.png'} 
                    alt={userInfo?.first_name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/img/nophoto.png';
                    }}
                  />
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {userInfo?.first_name || 'Unknown'} {userInfo?.last_name || ''}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    {userInfo?.username && (
                      <span>@{userInfo.username}</span>
                    )}
                    <span>ID: {telegramId}</span>
                  </div>
                  <p className="text-sm text-white/50 mt-1">
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
                      className="bg-white/5 rounded-xl p-4 flex-shrink-0 hover:bg-white/10 transition-all cursor-pointer relative border border-white/5 hover:border-white/10"
                      style={{ width: '320px' }}
                      onClick={() => setSelectedSession({ sessionId, telegramId: parseInt(telegramId), messages: sortedMessages })}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(sessionId);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-all opacity-60 hover:opacity-100"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Session Header */}
                      <div className="mb-3">
                        <p className="text-xs text-white/40 mb-1">ID сессии</p>
                        <p className="text-xs text-white/60 font-mono truncate" title={sessionId}>
                          {sessionId.slice(0, 8)}...{sessionId.slice(-4)}
                        </p>
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
                      <div className="mt-3 space-y-2 max-h-28 overflow-y-auto scrollbar-hide">
                        {sortedMessages.slice(0, 3).map((msg) => (
                          <div key={msg.id} className="flex items-start gap-2">
                            <span className={`text-xs flex-shrink-0 ${msg.message_type === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                              {msg.message_type === 'user' ? '👤' : '🤖'}
                            </span>
                            <span className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                              {msg.content}
                            </span>
                          </div>
                        ))}
                        {sortedMessages.length > 3 && (
                          <div className="text-xs text-white/40 text-center pt-1">
                            +{sortedMessages.length - 3} сообщений...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })}
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
          onMessageDeleted={fetchMessages}
        />
      )}
    </div>
  );
};