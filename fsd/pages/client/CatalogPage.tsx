'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { useSubtopics } from '@/fsd/entities/meditation/hooks/useSubtopics';
import { openLink } from '@telegram-apps/sdk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { CategoryFilter } from '@/fsd/shared/components/CategoryFilter';

// Optimized material card component
const MaterialCard = memo(({ 
  material, 
  onExpand, 
  onNavigate 
}: { 
  material: any;
  onExpand: (id: number) => void;
  onNavigate: (link: string) => void;
}) => {
  const truncateText = useCallback((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }, []);

  const displayText = useMemo(() => 
    truncateText(material.description || '', 100),
    [material.description, truncateText]
  );

  const handleCardClick = useCallback(() => {
    onNavigate(material.message_link);
  }, [material.message_link, onNavigate]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(material.id);
  }, [material.id, onExpand]);

  return (
    <div className="w-full">
      <div 
        onClick={handleCardClick}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] group w-full h-full min-h-[140px] flex flex-col"
      >
        <div className="flex items-start justify-between mb-3 flex-1">
          <h3 className="text-base font-semibold text-white pr-3 leading-snug line-clamp-2 font-poppins flex-1">
            {material.material_name}
          </h3>
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-sky rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg shadow-blue-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {material.description && (
          <div className="space-y-3 flex-1">
            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
              {displayText}
            </p>
            
            {material.description.length > 100 && (
              <button
                onClick={handleExpandClick}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/30 hover:shadow-lg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10l5 5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MaterialCard.displayName = 'MaterialCard';

// Modal component for expanded card
const ExpandedCardModal = ({ material, isOpen, onClose, onNavigate }: {
  material: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (link: string) => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && material && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
            style={{ maxWidth: '90vw' }}
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-blue-500/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110 hover:shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <h3 className="text-xl font-bold text-white mb-4 pr-8 font-poppins">
                {material.material_name}
              </h3>
              
              {material.description && (
                <p className="text-white/80 text-base leading-relaxed mb-6">
                  {material.description}
                </p>
              )}
              
              <button
                onClick={() => {
                  onNavigate(material.message_link);
                  onClose();
                }}
                className="w-full bg-gradient-sky text-white py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] flex items-center justify-center gap-3 font-poppins"
              >
                Открыть материал
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const CatalogPage = () => {
  const [activeSubtopic, setActiveSubtopic] = useState<number | undefined>();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopics();
  const { data: materials, isLoading: materialsLoading } = useMaterials(activeSubtopic);

  const handleMaterialClick = useCallback((messageLink: string) => {
    try {
      openLink(messageLink, { tryInstantView: true });
    } catch (error) {
      console.error('Error opening link:', error);
      window.open(messageLink, '_blank');
    }
  }, []);

  const handleExpand = useCallback((id: number) => {
    setExpandedCard(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setExpandedCard(null);
  }, []);

  if (subtopicsLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const expandedMaterial = materials?.find(m => m.id === expandedCard);

  return (
    <div className="min-h-screen overflow-hidden w-full">
      {/* Background with deep blue gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/40 via-blue-900/50 to-blue-950/60"></div>
      <div className="fixed inset-0 backdrop-blur-[0.5px]"></div>
      
      {/* Background with fixed positioning */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-96 -right-32 w-96 h-96 bg-blue-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Scrollable content with optimized rendering */}
      <div className="relative z-10 min-h-screen pb-32 w-full">
        {/* Category Filter Component */}
        <CategoryFilter 
          subtopics={subtopics || []}
          activeSubtopic={activeSubtopic}
          onSubtopicChange={setActiveSubtopic}
        />

        {/* Materials grid - full width optimized with top margin for fixed header */}
        <div className="w-full px-4 pt-44">
          {materialsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shadow-glow"></div>
            </div>
          ) : (
            <div className="w-full max-w-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {materials?.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onExpand={handleExpand}
                    onNavigate={handleMaterialClick}
                  />
                ))}
              </div>
            </div>
          )}

          {materials?.length === 0 && (
            <div className="text-center py-16 w-full">
              <div className="inline-block">
                <div className="w-20 h-20 bg-gradient-sky rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-blue-500/40">
                  <span className="text-3xl">✨</span>
                </div>
                <p className="text-white/80 text-lg font-medium">
                  {activeSubtopic ? 'Нет практик в этой категории' : 'Практики скоро появятся'}
                </p>
                {activeSubtopic && (
                  <button
                    onClick={() => setActiveSubtopic(undefined)}
                    className="mt-6 px-6 py-3 bg-white/10 backdrop-blur-lg text-white/80 rounded-full text-sm font-medium hover:text-white hover:scale-105 transition-all duration-300"
                  >
                    Показать все практики
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded card modal */}
      <ExpandedCardModal
        material={expandedMaterial}
        isOpen={!!expandedCard}
        onClose={handleCloseModal}
        onNavigate={handleMaterialClick}
      />
      
      {/* Glass Bottom Bar */}
      <GlassBottomBar showTextInput={false} />
    </div>
  );
};