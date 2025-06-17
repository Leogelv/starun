'use client';

import { useState, useEffect } from 'react';
import { MaterialModal } from './MaterialModal';

interface Material {
  id: number;
  material_name: string;
  description: string;
  message_link: string;
  subtopic_id: number;
  created_at: string;
  subtopic?: {
    id: number;
    name: string;
  };
}

interface Subtopic {
  id: number;
  name: string;
}

export const AdminMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'subtopic'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortMaterials();
  }, [materials, selectedSubtopic, searchTerm, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, subtopicsRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/subtopics')
      ]);

      if (materialsRes.ok && subtopicsRes.ok) {
        const materialsData = await materialsRes.json();
        const subtopicsData = await subtopicsRes.json();
        setMaterials(materialsData);
        setSubtopics(subtopicsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMaterials = () => {
    let filtered = [...materials];

    // Filter by subtopic
    if (selectedSubtopic) {
      filtered = filtered.filter(m => m.subtopic_id === selectedSubtopic);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.material_name.localeCompare(b.material_name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'subtopic':
          const subtopicA = subtopics.find(s => s.id === a.subtopic_id)?.name || '';
          const subtopicB = subtopics.find(s => s.id === b.subtopic_id)?.name || '';
          comparison = subtopicA.localeCompare(subtopicB);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMaterials(filtered);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert('Ошибка при удалении материала');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Ошибка при удалении материала');
    }
  };

  const handleSave = async () => {
    await fetchData();
    setShowModal(false);
    setEditingMaterial(null);
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
                placeholder="Поиск материалов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50"
                style={{ background: 'var(--smoky-cards)/10' }}
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Subtopic filter */}
            <select
              value={selectedSubtopic || ''}
              onChange={(e) => setSelectedSubtopic(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white focus:outline-none focus:border-electric-blue/50"
              style={{ background: 'var(--smoky-cards)/10' }}
            >
              <option value="" style={{ background: 'var(--night-sky-base)' }}>Все категории</option>
              {subtopics.map(subtopic => (
                <option key={subtopic.id} value={subtopic.id} style={{ background: 'var(--night-sky-base)' }}>
                  {subtopic.name}
                </option>
              ))}
            </select>

            {/* Sort controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-arctic-light/30 bg-transparent text-white focus:outline-none focus:border-electric-blue/50"
                style={{ background: 'var(--smoky-cards)/10' }}
              >
                <option value="date" style={{ background: 'var(--night-sky-base)' }}>По дате</option>
                <option value="name" style={{ background: 'var(--night-sky-base)' }}>По названию</option>
                <option value="subtopic" style={{ background: 'var(--night-sky-base)' }}>По категории</option>
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
              setEditingMaterial(null);
              setShowModal(true);
            }}
            className="px-6 py-2 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--gradient-accent)',
              boxShadow: '0 0 20px var(--electric-blue)/40'
            }}
          >
            + Добавить материал
          </button>
        </div>

        <div className="mt-4 text-sm text-white/70">
          Найдено: {filteredMaterials.length} из {materials.length} материалов
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const subtopic = subtopics.find(s => s.id === material.subtopic_id);
          
          return (
            <div
              key={material.id}
              className="glass rounded-2xl p-6 border border-arctic-light/20 hover:border-electric-blue/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {material.material_name}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white/80 mb-3"
                       style={{ background: 'var(--smoky-cards)/30' }}>
                    {subtopic?.name || 'Без категории'}
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-4 line-clamp-3">
                {material.description || 'Нет описания'}
              </p>

              <div className="flex items-center justify-between text-xs text-white/50">
                <span>
                  {new Date(material.created_at).toLocaleDateString('ru-RU')}
                </span>
                <a
                  href={material.message_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-blue hover:text-cyan-neon transition-colors"
                >
                  Открыть ссылку ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">Материалы не найдены</h3>
          <p className="text-white/70">Попробуйте изменить фильтры или добавить новый материал</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <MaterialModal
          material={editingMaterial}
          subtopics={subtopics}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMaterial(null);
          }}
        />
      )}
    </div>
  );
};