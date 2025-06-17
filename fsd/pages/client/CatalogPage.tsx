'use client';

import { useState } from 'react';
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { useSubtopics } from '@/fsd/entities/meditation/hooks/useSubtopics';
import { openLink } from '@telegram-apps/sdk-react';

export const CatalogPage = () => {
  const [activeSubtopic, setActiveSubtopic] = useState<number | undefined>();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopics();
  const { data: materials, isLoading: materialsLoading } = useMaterials(activeSubtopic);

  const handleMaterialClick = (messageLink: string) => {
    try {
      openLink(messageLink, { tryInstantView: true });
    } catch (error) {
      console.error('Error opening link:', error);
      window.open(messageLink, '_blank');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (subtopicsLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-96 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 px-4 pt-8 pb-4 safe-area-top">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button
            onClick={() => setActiveSubtopic(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !activeSubtopic 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-white/70 backdrop-blur-sm'
            }`}
          >
            all
          </button>
          {subtopics?.map((subtopic) => (
            <button
              key={subtopic.id}
              onClick={() => setActiveSubtopic(subtopic.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeSubtopic === subtopic.id
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-white/70 backdrop-blur-sm'
              }`}
            >
              {subtopic.name.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Materials */}
        {materialsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materials?.map((material) => {
              const isExpanded = expandedCard === material.id;
              const displayText = isExpanded 
                ? material.description 
                : truncateText(material.description || '', 120);

              return (
                <div
                  key={material.id}
                  className="relative group"
                >
                  <div 
                    onClick={() => handleMaterialClick(material.message_link)}
                    className="bg-gradient-to-br from-white/8 to-white/12 backdrop-blur-xl rounded-2xl p-5 border border-white/15 cursor-pointer transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02] group-hover:bg-white/15"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-white pr-3 leading-snug line-clamp-2">
                        {material.material_name}
                      </h3>
                      <div className="flex-shrink-0 w-7 h-7 bg-white/15 rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-white/25 group-hover:scale-110">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    {material.description && (
                      <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-3">
                        {displayText}
                      </p>
                    )}
                  </div>

                  {/* Expand button */}
                  {material.description && material.description.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(isExpanded ? null : material.id);
                      }}
                      className="absolute bottom-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/30"
                    >
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="M7 10l5 5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {materials?.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-gray-400">
                {activeSubtopic ? 'No practices in this category' : 'Practices coming soon'}
              </p>
              {activeSubtopic && (
                <button
                  onClick={() => setActiveSubtopic(undefined)}
                  className="mt-4 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Show all practices
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};