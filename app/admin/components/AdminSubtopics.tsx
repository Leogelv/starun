'use client';

import { useState, useEffect } from 'react';
import { SubtopicModal } from './SubtopicModal';

interface Subtopic {
  id: number;
  name: string;
  created_at: string;
  material_count?: number;
}

export const AdminSubtopics = () => {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [filteredSubtopics, setFilteredSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);

  useEffect(() => {
    fetchSubtopics();
  }, []);

  useEffect(() => {
    filterAndSortSubtopics();
  }, [subtopics, searchTerm, sortBy, sortOrder]);

  const fetchSubtopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subtopics?include_count=true');
      
      if (response.ok) {
        const data = await response.json();
        setSubtopics(data);
      }
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubtopics = () => {
    let filtered = [...subtopics];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'count':
          comparison = (a.material_count || 0) - (b.material_count || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredSubtopics(filtered);
  };

  const handleEdit = (subtopic: Subtopic) => {
    setEditingSubtopic(subtopic);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const subtopic = subtopics.find(s => s.id === id);
    if (subtopic?.material_count && subtopic.material_count > 0) {
      alert('Нельзя удалить категорию, которая содержит материалы. Сначала удалите или переместите все материалы.');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
      const response = await fetch(`/api/subtopics/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSubtopics();
      } else {
        alert('Ошибка при удалении категории');
      }
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const handleSave = async () => {
    await fetchSubtopics();
    setShowModal(false);
    setEditingSubtopic(null);
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
      {/* Controls */}
      <div className="glass rounded-2xl p-6 border border-arctic-light/20">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск категорий..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
                style={{ background: 'var(--smoky-cards)/10' }}
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white focus:outline-none focus:border-electric-blue/50"
                style={{ background: 'var(--smoky-cards)/10' }}
              >
                <option value="name" style={{ background: 'var(--night-sky-base)' }}>По названию</option>
                <option value="date" style={{ background: 'var(--night-sky-base)' }}>По дате</option>
                <option value="count" style={{ background: 'var(--night-sky-base)' }}>По кол-ву материалов</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-electric-blue/50 transition-all"
                style={{ background: 'var(--smoky-cards)/10' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={() => {
              setEditingSubtopic(null);
              setShowModal(true);
            }}
            className="px-6 py-2 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--gradient-accent)',
              boxShadow: '0 0 20px var(--electric-blue)/40'
            }}
          >
            + Добавить категорию
          </button>
        </div>

        <div className="mt-4 text-sm text-white/70">
          Найдено: {filteredSubtopics.length} из {subtopics.length} категорий
        </div>
      </div>

      {/* Subtopics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubtopics.map((subtopic) => (
          <div
            key={subtopic.id}
            className="glass rounded-2xl p-6 border border-arctic-light/20 hover:border-electric-blue/30 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {subtopic.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{subtopic.material_count || 0} материалов</span>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(subtopic)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(subtopic.id)}
                  disabled={!!subtopic.material_count && subtopic.material_count > 0}
                  className={`p-2 rounded-lg transition-all ${
                    subtopic.material_count && subtopic.material_count > 0
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-xs text-white/50">
              Создана: {new Date(subtopic.created_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
        ))}
      </div>

      {filteredSubtopics.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">Категории не найдены</h3>
          <p className="text-white/70">Попробуйте изменить поиск или добавить новую категорию</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SubtopicModal
          subtopic={editingSubtopic}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingSubtopic(null);
          }}
        />
      )}
    </div>
  );
};