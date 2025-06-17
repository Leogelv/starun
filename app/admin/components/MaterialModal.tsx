'use client';

import { useState, useEffect } from 'react';

interface Material {
  id: number;
  material_name: string;
  description: string;
  message_link: string;
  subtopic_id: number;
  created_at: string;
}

interface Subtopic {
  id: number;
  name: string;
}

interface MaterialModalProps {
  material: Material | null;
  subtopics: Subtopic[];
  onSave: () => void;
  onClose: () => void;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  material,
  subtopics,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    material_name: '',
    description: '',
    message_link: '',
    subtopic_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (material) {
      setFormData({
        material_name: material.material_name,
        description: material.description || '',
        message_link: material.message_link,
        subtopic_id: material.subtopic_id.toString()
      });
    } else {
      setFormData({
        material_name: '',
        description: '',
        message_link: '',
        subtopic_id: ''
      });
    }
    setErrors({});
  }, [material]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.material_name.trim()) {
      newErrors.material_name = 'Название обязательно';
    }

    if (!formData.message_link.trim()) {
      newErrors.message_link = 'Ссылка обязательна';
    } else if (!formData.message_link.startsWith('http')) {
      newErrors.message_link = 'Ссылка должна начинаться с http:// или https://';
    }

    if (!formData.subtopic_id) {
      newErrors.subtopic_id = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = material ? `/api/materials/${material.id}` : '/api/materials';
      const method = material ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subtopic_id: parseInt(formData.subtopic_id)
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Ошибка при сохранении материала');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 glass rounded-2xl border border-arctic-light/20 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-arctic-light/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {material ? 'Редактировать материал' : 'Добавить материал'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Material Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Название материала *
              </label>
              <input
                type="text"
                name="material_name"
                value={formData.material_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border bg-transparent text-white placeholder-white/50 focus:outline-none transition-all ${
                  errors.material_name 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-arctic-light/30 focus:border-electric-blue/50'
                }`}
                style={{ background: 'var(--smoky-cards)/10' }}
                placeholder="Введите название материала"
              />
              {errors.material_name && (
                <p className="text-red-400 text-sm mt-1">{errors.material_name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-arctic-light/30 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-electric-blue/50 transition-all resize-none"
                style={{ background: 'var(--smoky-cards)/10' }}
                placeholder="Введите описание материала (необязательно)"
              />
            </div>

            {/* Message Link */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ссылка на материал *
              </label>
              <input
                type="url"
                name="message_link"
                value={formData.message_link}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border bg-transparent text-white placeholder-white/50 focus:outline-none transition-all ${
                  errors.message_link 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-arctic-light/30 focus:border-electric-blue/50'
                }`}
                style={{ background: 'var(--smoky-cards)/10' }}
                placeholder="https://example.com/material"
              />
              {errors.message_link && (
                <p className="text-red-400 text-sm mt-1">{errors.message_link}</p>
              )}
            </div>

            {/* Subtopic */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Категория *
              </label>
              <select
                name="subtopic_id"
                value={formData.subtopic_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border bg-transparent text-white focus:outline-none transition-all ${
                  errors.subtopic_id 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-arctic-light/30 focus:border-electric-blue/50'
                }`}
                style={{ background: 'var(--smoky-cards)/10' }}
              >
                <option value="" style={{ background: 'var(--night-sky-base)' }}>
                  Выберите категорию
                </option>
                {subtopics.map(subtopic => (
                  <option 
                    key={subtopic.id} 
                    value={subtopic.id}
                    style={{ background: 'var(--night-sky-base)' }}
                  >
                    {subtopic.name}
                  </option>
                ))}
              </select>
              {errors.subtopic_id && (
                <p className="text-red-400 text-sm mt-1">{errors.subtopic_id}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-arctic-light/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-arctic-light/30 text-white hover:border-arctic-light/50 transition-all"
              style={{ background: 'var(--smoky-cards)/10' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: 'var(--gradient-accent)',
                boxShadow: '0 0 20px var(--electric-blue)/40'
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};