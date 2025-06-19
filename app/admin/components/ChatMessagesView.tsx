'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: number;
  telegram_id: number;
  message_type: 'user' | 'assistant';
  content: string;
  material_ids?: number[];
  session_id: string;
  created_at: string;
  tg_users?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
}

interface UserInfo {
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

interface ChatMessagesViewProps {
  sessionId: string;
  onBack: () => void;
}

export const ChatMessagesView: React.FC<ChatMessagesViewProps> = ({ sessionId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  console.log('ChatMessagesView: Component rendered with sessionId:', sessionId);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('ChatMessagesView: Fetching messages for session:', sessionId);
      const url = `/api/chat-history?session_id=${sessionId}&limit=1000`;
      console.log('ChatMessagesView: Request URL:', url);
      
      const response = await fetch(url);
      console.log('ChatMessagesView: Response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ChatMessagesView: Response data:', data);
        
        const sortedMessages = (data || []).sort((a: ChatMessage, b: ChatMessage) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        console.log('ChatMessagesView: Sorted messages:', sortedMessages.length, 'items');
        setMessages(sortedMessages);
        
        // Set user info from first message
        if (sortedMessages.length > 0) {
          setUserInfo(sortedMessages[0].tg_users || null);
          console.log('ChatMessagesView: User info set:', sortedMessages[0].tg_users);
        }
      } else {
        const errorText = await response.text();
        console.error('ChatMessagesView: Response not ok:', errorText);
      }
    } catch (error) {
      console.error('ChatMessagesView: Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/chat-history/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the message from the local state
        setMessages(messages.filter(msg => msg.id !== messageId));
      } else {
        console.error('Failed to delete message');
        alert('Ошибка при удалении сообщения');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Ошибка при удалении сообщения');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-2 border-electric-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chat Header */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all border border-arctic-light/30 hover:border-arctic-light/50"
              style={{ background: 'var(--smoky-cards)/20' }}
              title="Назад к сессиям"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                 style={{ background: 'var(--gradient-accent)' }}>
              {userInfo?.first_name?.[0] || userInfo?.username?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {userInfo?.first_name || userInfo?.username || 'Неизвестный пользователь'}
              </h2>
              {userInfo?.username && (
                <p className="text-sm text-white/70">@{userInfo.username}</p>
              )}
              <p className="text-xs text-white/50">ID сессии: {sessionId.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/70">
              Сообщений: {messages.length}
            </div>
            {messages.length > 0 && (
              <>
                <div className="text-xs text-white/50">
                  Начато: {formatDate(messages[0].created_at)} в {formatTime(messages[0].created_at)}
                </div>
                <div className="text-xs text-white/50">
                  Последнее: {formatTime(messages[messages.length - 1].created_at)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="glass rounded-2xl border border-arctic-light/20 overflow-hidden">
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
          {messages.map((message, index) => {
            const isUser = message.message_type === 'user';
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = prevMessage && 
              formatDate(message.created_at) !== formatDate(prevMessage.created_at);

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <div className="px-4 py-2 rounded-full text-xs text-white/60"
                         style={{ background: 'var(--smoky-cards)/20' }}>
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
                  <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isUser 
                          ? 'text-white shadow-lg' 
                          : 'text-white border border-arctic-light/20'
                      }`}
                      style={{
                        background: isUser 
                          ? 'var(--gradient-accent)' 
                          : 'var(--smoky-cards)/20'
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      
                      {/* Material IDs */}
                      {message.material_ids && message.material_ids.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-xs text-white/70">
                            Материалы: {message.material_ids.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-white/50">
                        {formatTime(message.created_at)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Удалить это сообщение?')) {
                            handleDeleteMessage(message.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                        title="Удалить сообщение"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isUser ? 'order-2 ml-3' : 'order-1 mr-3'
                  }`} style={{
                    background: isUser ? 'var(--gradient-accent)' : 'var(--smoky-cards)/30'
                  }}>
                    {isUser 
                      ? (userInfo?.first_name?.[0] || userInfo?.username?.[0] || 'U')
                      : '🤖'
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Сообщения не найдены</h3>
          <p className="text-white/70">В этой сессии пока нет сообщений</p>
        </div>
      )}
    </div>
  );
};