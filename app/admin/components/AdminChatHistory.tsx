'use client';

import { useState } from 'react';
import { ChatHistoryList } from './ChatHistoryList';
import { ChatStatsView } from './ChatStatsView';

export const AdminChatHistory = () => {
  const [activeView, setActiveView] = useState<'history' | 'stats'>('history');

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('history')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === 'history'
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:scale-105'
              }`}
              style={{
                background: activeView === 'history' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                boxShadow: activeView === 'history' ? '0 0 20px var(--electric-blue)/40' : 'none'
              }}
            >
              История чатов
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === 'stats'
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:scale-105'
              }`}
              style={{
                background: activeView === 'stats' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                boxShadow: activeView === 'stats' ? '0 0 20px var(--electric-blue)/40' : 'none'
              }}
            >
              Статистика
            </button>
          </div>

        </div>
      </div>

      {/* Content */}
      {activeView === 'history' && <ChatHistoryList />}
      {activeView === 'stats' && <ChatStatsView />}
    </div>
  );
};