'use client';

import { useState } from 'react';
import { ChatSessionsList } from './ChatSessionsList';
import { ChatMessagesView } from './ChatMessagesView';
import { ChatStatsView } from './ChatStatsView';

export const AdminChatHistory = () => {
  const [activeView, setActiveView] = useState<'sessions' | 'messages' | 'stats'>('sessions');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  console.log('AdminChatHistory: Current state - activeView:', activeView, 'selectedSession:', selectedSession);

  const handleSessionSelect = (sessionId: string) => {
    console.log('AdminChatHistory: Selecting session:', sessionId);
    setSelectedSession(sessionId);
    setActiveView('messages');
    console.log('AdminChatHistory: State updated - activeView: messages, selectedSession:', sessionId);
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setActiveView('sessions');
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveView('sessions');
                setSelectedSession(null);
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === 'sessions'
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:scale-105'
              }`}
              style={{
                background: activeView === 'sessions' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                boxShadow: activeView === 'sessions' ? '0 0 20px var(--electric-blue)/40' : 'none'
              }}
            >
              Сессии чатов
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

          {selectedSession && (
            <button
              onClick={handleBackToSessions}
              className="px-4 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-arctic-light/50 transition-all flex items-center gap-2"
              style={{ background: 'var(--smoky-cards)/10' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к сессиям
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeView === 'sessions' && !selectedSession && (
        (() => {
          console.log('AdminChatHistory: Rendering ChatSessionsList');
          return <ChatSessionsList onSessionSelect={handleSessionSelect} />;
        })()
      )}
      
      {activeView === 'messages' && selectedSession && (
        (() => {
          console.log('AdminChatHistory: Rendering ChatMessagesView with sessionId:', selectedSession);
          return <ChatMessagesView sessionId={selectedSession} onBack={handleBackToSessions} />;
        })()
      )}
      
      {activeView === 'stats' && (
        (() => {
          console.log('AdminChatHistory: Rendering ChatStatsView');
          return <ChatStatsView />;
        })()
      )}
    </div>
  );
};