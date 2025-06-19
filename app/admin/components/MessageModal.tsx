'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface MessageModalProps {
  session: {
    sessionId: string;
    telegramId: number;
    messages: ChatMessage[];
  };
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ session, onClose }) => {
  const { sessionId, telegramId, messages } = session;

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="relative w-full max-w-4xl max-h-[90vh] glass rounded-2xl border border-arctic-light/20 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Сессия: User {telegramId}
              </h2>
              <p className="text-sm text-white/60 font-mono">
                {sessionId}
              </p>
              <p className="text-sm text-white/50 mt-1">
                {messages.length} сообщений
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.message_type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {/* Message header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        message.message_type === 'user' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-green-600 text-white'
                      }`}>
                        {message.message_type === 'user' ? '👤' : '🤖'}
                      </div>
                      <span className="text-xs opacity-70">
                        {formatDate(message.created_at)}
                      </span>
                    </div>

                    {/* Message content */}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Material IDs if present */}
                    {message.material_ids && message.material_ids.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="text-xs opacity-70 mb-1">Материалы:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.material_ids.map((id) => (
                            <span
                              key={id}
                              className="px-2 py-1 rounded-lg bg-white/20 text-xs font-mono"
                            >
                              #{id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex justify-between items-center text-sm text-white/60">
              <span>
                Начало сессии: {formatDate(messages[0]?.created_at || '')}
              </span>
              <span>
                Конец сессии: {formatDate(messages[messages.length - 1]?.created_at || '')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};