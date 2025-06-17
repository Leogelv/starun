'use client';

import { useState, useEffect } from 'react';

interface Subtopic {
  id: number;
  name: string;
  created_at: string;
  material_count?: number;
}

interface SubtopicModalProps {
  subtopic: Subtopic | null;
  onSave: () => void;
  onClose: () => void;
}

export const SubtopicModal: React.FC<SubtopicModalProps> = ({
  subtopic,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subtopic) {
      setFormData({
        name: subtopic.name
      });
    } else {
      setFormData({
        name: ''
      });
    }
    setErrors({});
  }, [subtopic]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название категории обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Название должно содержать минимум 2 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = subtopic ? `/api/subtopics/${subtopic.id}` : '/api/subtopics';
      const method = subtopic ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrors({ name: 'Категория с таким названием уже существует' });
        } else {
          alert(errorData.error || 'Ошибка при сохранении');
        }
      }
    } catch (error) {
      console.error('Error saving subtopic:', error);
      alert('Ошибка при сохранении категории');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="relative w-full max-w-md mx-4 glass rounded-2xl border border-arctic-light/20 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-arctic-light/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {subtopic ? 'Редактировать категорию' : 'Добавить категорию'}
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
          <div className="px-6 py-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Название категории *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border bg-transparent text-white placeholder-white/50 focus:outline-none transition-all ${
                  errors.name 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-arctic-light/30 focus:border-electric-blue/50'
                }`}
                style={{ background: 'var(--smoky-cards)/10' }}
                placeholder="Введите название категории"
                autoFocus
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-white/50 text-xs mt-2">
                Название должно быть уникальным и описательным
              </p>
            </div>

            {subtopic && subtopic.material_count && subtopic.material_count > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Эта категория содержит {subtopic.material_count} материалов</span>
                </div>
              </div>
            )}
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