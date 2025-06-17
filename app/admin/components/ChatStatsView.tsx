'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  total_sessions: number;
  first_message_at: string;
  last_message_at: string;
}

interface OverallStats {
  totalMessages: number;
  totalUsers: number;
  dailyStats: Record<string, number>;
}

export const ChatStatsView = () => {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat-history/stats');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats || []);
        setOverallStats(data.overallStats || null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'сегодня' : days === 1 ? 'вчера' : `${days} дней назад`;
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
      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 border border-arctic-light/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {overallStats.totalMessages.toLocaleString()}
            </div>
            <div className="text-white/70">Всего сообщений</div>
            <div className="mt-2 text-sm text-white/50">
              📝 За все время
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-arctic-light/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {overallStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-white/70">Активных пользователей</div>
            <div className="mt-2 text-sm text-white/50">
              👥 Уникальных
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-arctic-light/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {userStats.reduce((acc, user) => acc + user.total_sessions, 0).toLocaleString()}
            </div>
            <div className="text-white/70">Сессий чатов</div>
            <div className="mt-2 text-sm text-white/50">
              💬 Диалогов
            </div>
          </div>
        </div>
      )}

      {/* Daily Activity Chart */}
      {overallStats?.dailyStats && Object.keys(overallStats.dailyStats).length > 0 && (
        <div className="glass rounded-2xl p-6 border border-arctic-light/20">
          <h3 className="text-lg font-semibold text-white mb-4">Активность за 30 дней</h3>
          <div className="h-32 flex items-end gap-1 overflow-x-auto">
            {Object.entries(overallStats.dailyStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-30)
              .map(([date, count]) => {
                const maxCount = Math.max(...Object.values(overallStats.dailyStats));
                const height = Math.max((count / maxCount) * 100, 5);
                
                return (
                  <div key={date} className="flex flex-col items-center min-w-6">
                    <div
                      className="w-4 rounded-t transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${height}%`,
                        background: 'var(--gradient-accent)'
                      }}
                      title={`${date}: ${count} сообщений`}
                    />
                    <div className="text-xs text-white/50 mt-1 transform rotate-45 origin-left">
                      {new Date(date).getDate()}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top Users */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <h3 className="text-lg font-semibold text-white mb-4">Топ пользователей</h3>
        <div className="space-y-4">
          {userStats.slice(0, 10).map((user, index) => (
            <div key={user.telegram_id} className="flex items-center justify-between p-4 rounded-xl" 
                 style={{ background: 'var(--smoky-cards)/10' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                     style={{ background: 'var(--gradient-accent)' }}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-white font-medium">
                    {user.first_name || user.username || `User ${user.telegram_id}`}
                  </h4>
                  {user.username && (
                    <p className="text-sm text-white/60">@{user.username}</p>
                  )}
                  <p className="text-xs text-white/50">ID: {user.telegram_id}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  {user.total_messages}
                </div>
                <div className="text-sm text-white/70">сообщений</div>
                <div className="text-xs text-white/50">
                  {user.total_sessions} сессий
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Activity Details */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <h3 className="text-lg font-semibold text-white mb-4">Детальная статистика пользователей</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arctic-light/20">
                <th className="text-left py-3 px-2 text-white/70 font-medium">Пользователь</th>
                <th className="text-center py-3 px-2 text-white/70 font-medium">Сообщений</th>
                <th className="text-center py-3 px-2 text-white/70 font-medium">Сессий</th>
                <th className="text-center py-3 px-2 text-white/70 font-medium">Первое сообщение</th>
                <th className="text-center py-3 px-2 text-white/70 font-medium">Последнее сообщение</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((user) => (
                <tr key={user.telegram_id} className="border-b border-arctic-light/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2">
                    <div>
                      <div className="text-white font-medium">
                        {user.first_name || user.username || `User ${user.telegram_id}`}
                      </div>
                      {user.username && (
                        <div className="text-xs text-white/60">@{user.username}</div>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="text-white">{user.total_messages}</div>
                    <div className="text-xs text-white/60">
                      {user.user_messages} / {user.assistant_messages}
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-white">
                    {user.total_sessions}
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="text-white/80">{formatDate(user.first_message_at)}</div>
                    <div className="text-xs text-white/50">{getDaysAgo(user.first_message_at)}</div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="text-white/80">{formatDate(user.last_message_at)}</div>
                    <div className="text-xs text-white/50">{getDaysAgo(user.last_message_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userStats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">Нет данных для статистики</h3>
          <p className="text-white/70">Статистика появится после первых диалогов</p>
        </div>
      )}
    </div>
  );
};