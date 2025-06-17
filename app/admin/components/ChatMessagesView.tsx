'use client';

import { useState, useEffect } from 'react';

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

interface ChatMessagesViewProps {
  sessionId: string;
  onBack: () => void;
}

export const ChatMessagesView: React.FC<ChatMessagesViewProps> = ({ sessionId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat-history?session_id=${sessionId}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        const sortedMessages = (data.data || []).sort((a: ChatMessage, b: ChatMessage) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
        
        // Set user info from first message
        if (sortedMessages.length > 0) {
          setUserInfo(sortedMessages[0].tg_users);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
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
                    
                    <div className={`text-xs text-white/50 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.created_at)}
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