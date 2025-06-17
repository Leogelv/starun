'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChatSession {
  session_id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  message_count: number;
  session_start: string;
  session_end: string;
  first_message_preview: string;
}

interface ChatSessionsListProps {
  onSessionSelect: (sessionId: string) => void;
}

export const ChatSessionsList: React.FC<ChatSessionsListProps> = ({ onSessionSelect }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [telegramIdFilter, setTelegramIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(telegramIdFilter && { telegram_id: telegramIdFilter })
      });

      const response = await fetch(`/api/chat-history/sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, telegramIdFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.username?.toLowerCase().includes(search) ||
      session.first_name?.toLowerCase().includes(search) ||
      session.first_message_preview.toLowerCase().includes(search) ||
      session.telegram_id.toString().includes(search)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return minutes > 0 ? `${minutes}м ${seconds}с` : `${seconds}с`;
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
      {/* Filters */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              placeholder="Поиск по пользователю или сообщению..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
              style={{ background: 'var(--smoky-cards)/10' }}
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="number"
            placeholder="Telegram ID"
            value={telegramIdFilter}
            onChange={(e) => setTelegramIdFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
            style={{ background: 'var(--smoky-cards)/10' }}
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setTelegramIdFilter('');
              setPage(1);
              fetchSessions();
            }}
            className="px-4 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-arctic-light/50 transition-all"
            style={{ background: 'var(--smoky-cards)/10' }}
          >
            Сбросить
          </button>
        </div>

        <div className="mt-4 text-sm text-white/70">
          Найдено: {filteredSessions.length} сессий
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.session_id}
            onClick={() => onSessionSelect(session.session_id)}
            className="glass rounded-2xl p-6 border border-arctic-light/20 hover:border-electric-blue/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                     style={{ background: 'var(--gradient-accent)' }}>
                  {session.first_name?.[0] || session.username?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {session.first_name || session.username || `User ${session.telegram_id}`}
                  </h3>
                  <p className="text-sm text-white/70">ID: {session.telegram_id}</p>
                  {session.username && (
                    <p className="text-sm text-white/60">@{session.username}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-white/70">
                  {formatDate(session.session_start)}
                </div>
                <div className="text-xs text-white/50">
                  Длительность: {formatDuration(session.session_start, session.session_end)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white/80 line-clamp-2">
                {session.first_message_preview}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {session.message_count} сообщений
                </span>
              </div>

              <div className="text-electric-blue group-hover:text-cyan-neon transition-colors text-sm font-medium">
                Открыть чат →
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Сессии не найдены</h3>
          <p className="text-white/70">Попробуйте изменить фильтры поиска</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass rounded-2xl p-4 border border-arctic-light/20">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-arctic-light/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-arctic-light/50 transition-all"
              style={{ background: 'var(--smoky-cards)/10' }}
            >
              ←
            </button>
            
            <span className="px-4 py-2 text-white">
              {page} из {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-arctic-light/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-arctic-light/50 transition-all"
              style={{ background: 'var(--smoky-cards)/10' }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};