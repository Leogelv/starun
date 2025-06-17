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
    <div className="fixed top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-xl" style={{ paddingTop: '95px' }}>
      <div className="w-full px-4 pb-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-glow font-poppins text-center">Материалы</h2>
      </div>
      
      {/* Category pills - full viewport width, no safe area */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-4 pl-4" style={{ scrollSnapType: 'x mandatory' }}>
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
          {/* Spacer for scrolling to edge */}
          <div className="flex-shrink-0 w-4"></div>
        </div>
      </div>
    </div>
  );
};