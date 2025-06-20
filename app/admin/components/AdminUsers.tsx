'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseURL } from '@/fsd/shared/api';

interface TelegramUser {
  id: number;
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TelegramUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<TelegramUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<TelegramUser | null>(null);

  // Загрузка пользователей
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseURL()}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Поиск пользователей
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.telegram_id.includes(query) ||
      user.id.toString().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Обновление пользователя
  const handleUpdateUser = async () => {
    if (!editedUser) return;

    try {
      const response = await fetch(`${getApiBaseURL()}/users/${editedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser)
      });

      if (response.ok) {
        await loadUsers();
        setIsEditing(false);
        setSelectedUser(null);
        setEditedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const response = await fetch(`${getApiBaseURL()}/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Пользователи</h2>
        
        {/* Search Input */}
        <div className="relative w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, никнейму или ID..."
            className="w-full px-4 py-2 pl-10 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-white/50">
            Загрузка...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-white/50">
            Пользователи не найдены
          </div>
        ) : (
          filteredUsers.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/70">
                      {user.first_name?.[0] || user.username?.[0] || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  {user.username && (
                    <div className="text-sm text-white/50 truncate">@{user.username}</div>
                  )}
                  <div className="text-xs text-white/30">ID: {user.telegram_id}</div>
                </div>

                {/* Premium Badge */}
                {user.is_premium && (
                  <div className="absolute top-2 right-2">
                    <span className="text-yellow-400 text-xs">⭐</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
                setEditedUser(null);
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 top-20 bottom-20 max-w-2xl mx-auto z-50"
            >
              <div className="glass rounded-2xl h-full flex flex-col p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {isEditing ? 'Редактировать пользователя' : 'Информация о пользователе'}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setIsEditing(false);
                      setEditedUser(null);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* User Details */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
                      {selectedUser.photo_url ? (
                        <img src={selectedUser.photo_url} alt={selectedUser.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/70 text-2xl">
                          {selectedUser.first_name?.[0] || selectedUser.username?.[0] || '?'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/50 text-sm">Имя</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.first_name || ''}
                          onChange={(e) => setEditedUser(prev => prev ? {...prev, first_name: e.target.value} : null)}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-white">{selectedUser.first_name || '-'}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Фамилия</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.last_name || ''}
                          onChange={(e) => setEditedUser(prev => prev ? {...prev, last_name: e.target.value} : null)}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-white">{selectedUser.last_name || '-'}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Username</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.username || ''}
                          onChange={(e) => setEditedUser(prev => prev ? {...prev, username: e.target.value} : null)}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-white">@{selectedUser.username || '-'}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Telegram ID</label>
                      <div className="text-white">{selectedUser.telegram_id}</div>
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Premium статус</label>
                      <div className="text-white">{selectedUser.is_premium ? '⭐ Premium' : 'Обычный'}</div>
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Дата регистрации</label>
                      <div className="text-white">{new Date(selectedUser.created_at).toLocaleString('ru-RU')}</div>
                    </div>

                    <div>
                      <label className="text-white/50 text-sm">Последнее обновление</label>
                      <div className="text-white">{new Date(selectedUser.updated_at).toLocaleString('ru-RU')}</div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-6 flex gap-3 justify-end">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedUser(null);
                        }}
                        className="px-6 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleUpdateUser}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
                      >
                        Сохранить
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        Удалить
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditedUser(selectedUser);
                        }}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
                      >
                        Редактировать
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};