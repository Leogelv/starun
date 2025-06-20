'use client';

import { useState } from 'react';
import { AdminMaterials } from './components/AdminMaterials';
import { AdminSubtopics } from './components/AdminSubtopics';
import { AdminChatHistory } from './components/AdminChatHistory';
import { AdminUsers } from './components/AdminUsers';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'subtopics' | 'chats' | 'users'>('materials');

  return (
    <div className="min-h-screen" style={{ background: 'var(--night-sky-base)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-arctic-light/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--lunar-white)' }}>
              Admin Panel
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'materials'
                    ? 'text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={{
                  background: activeTab === 'materials' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                  boxShadow: activeTab === 'materials' ? '0 0 20px var(--electric-blue)/40' : 'none'
                }}
              >
                Материалы
              </button>
              <button
                onClick={() => setActiveTab('subtopics')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'subtopics'
                    ? 'text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={{
                  background: activeTab === 'subtopics' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                  boxShadow: activeTab === 'subtopics' ? '0 0 20px var(--electric-blue)/40' : 'none'
                }}
              >
                Категории
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'chats'
                    ? 'text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={{
                  background: activeTab === 'chats' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                  boxShadow: activeTab === 'chats' ? '0 0 20px var(--electric-blue)/40' : 'none'
                }}
              >
                История чатов
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={{
                  background: activeTab === 'users' ? 'var(--gradient-accent)' : 'var(--smoky-cards)/20',
                  boxShadow: activeTab === 'users' ? '0 0 20px var(--electric-blue)/40' : 'none'
                }}
              >
                Пользователи
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'materials' && <AdminMaterials />}
        {activeTab === 'subtopics' && <AdminSubtopics />}
        {activeTab === 'chats' && <AdminChatHistory />}
        {activeTab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
}