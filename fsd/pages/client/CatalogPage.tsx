'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { useSubtopics } from '@/fsd/entities/meditation/hooks/useSubtopics';
import { openLink } from '@telegram-apps/sdk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';

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
    truncateText(material.description || '', 120),
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
    <div className="relative">
      <div 
        onClick={handleCardClick}
        className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-white/50 hover:shadow-lg hover:shadow-white/20 group will-change-transform"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-white pr-3 leading-snug line-clamp-2">
            {material.material_name}
          </h3>
          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-purple-500/80 to-blue-500/80 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {material.description && (
          <div className="space-y-2">
            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
              {displayText}
            </p>
            
            {material.description.length > 120 && (
              <button
                onClick={handleExpandClick}
                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
            <div className="bg-black/40 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg shadow-white/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center transition-all hover:bg-white/30 hover:scale-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <h3 className="text-xl font-bold text-white mb-4 pr-8">
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
                className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-3 px-6 rounded-2xl font-medium transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Открыть материал
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
    <div className="min-h-screen overflow-hidden">
      {/* Background with cosmic purple gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/40 via-blue-900/50 to-purple-900/60"></div>
      <div className="fixed inset-0 backdrop-blur-[0.5px]"></div>
      
      {/* Background with fixed positioning */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-96 -right-32 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]"></div>
      </div>

      {/* Scrollable content with optimized rendering */}
      <div className="relative z-10 min-h-screen pb-32 transform-gpu">
        {/* Fixed header with categories */}
        <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-white/10" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold text-white mb-4 text-glow font-poppins">Материалы</h2>
            
            {/* Category pills - full width container */}
            <div className="w-full -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-max">
                <button
                  onClick={() => setActiveSubtopic(undefined)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    !activeSubtopic 
                      ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-white/10 backdrop-blur-lg border border-white/30 text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Все
                </button>
                {subtopics?.map((subtopic) => (
                  <button
                    key={subtopic.id}
                    onClick={() => setActiveSubtopic(subtopic.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeSubtopic === subtopic.id
                        ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-white/10 backdrop-blur-lg border border-white/30 text-white/80 hover:text-white hover:border-white/50'
                    }`}
                  >
                    {subtopic.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Materials grid - optimized */}
        <div className="px-4 pt-6">
          {materialsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 will-change-scroll">
              {materials?.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onExpand={handleExpand}
                  onNavigate={handleMaterialClick}
                />
              ))}
            </div>
          )}

          {materials?.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500/80 to-blue-500/80 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-purple-500/30">
                  <span className="text-3xl">✨</span>
                </div>
                <p className="text-white/80">
                  {activeSubtopic ? 'Нет практик в этой категории' : 'Практики скоро появятся'}
                </p>
                {activeSubtopic && (
                  <button
                    onClick={() => setActiveSubtopic(undefined)}
                    className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/30 text-white/80 rounded-full text-sm font-medium hover:text-white transition-colors"
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
      <GlassBottomBar />
    </div>
  );
};