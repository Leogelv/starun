'use client';

import React from 'react';

interface Subtopic {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  subtopics: Subtopic[];
  activeSubtopic: number | undefined;
  onSubtopicChange: (subtopicId: number | undefined) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  subtopics,
  activeSubtopic,
  onSubtopicChange
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-xl border-b border-white/10">
      {/* Заголовок */}
      <div className="pt-24 pb-4 px-4">
        <h2 className="text-2xl font-bold text-white text-center font-poppins text-glow">
          Материалы
        </h2>
      </div>
      
      {/* Категории - полная ширина от края до края */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-6" style={{ scrollSnapType: 'x mandatory', paddingLeft: '0px', paddingRight: '16px' }}>
          <div className="flex-shrink-0 w-4"></div>
          <button
            onClick={() => onSubtopicChange(undefined)}
            className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              !activeSubtopic 
                ? 'bg-gradient-sky text-white shadow-lg shadow-blue-500/40 scale-105' 
                : 'bg-white/10 backdrop-blur-lg text-white/80 hover:text-white hover:scale-105'
            }`}
            style={{ scrollSnapAlign: 'start' }}
          >
            Все
          </button>
          {subtopics?.map((subtopic) => (
            <button
              key={subtopic.id}
              onClick={() => onSubtopicChange(subtopic.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeSubtopic === subtopic.id
                  ? 'bg-gradient-sky text-white shadow-lg shadow-blue-500/40 scale-105' 
                  : 'bg-white/10 backdrop-blur-lg text-white/80 hover:text-white hover:scale-105'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {subtopic.name}
            </button>
          ))}
          <div className="flex-shrink-0 w-4"></div>
        </div>
      </div>
    </div>
  );
};