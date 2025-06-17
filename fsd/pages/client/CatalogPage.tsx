'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { useSubtopics } from '@/fsd/entities/meditation/hooks/useSubtopics';
import { openLink } from '@telegram-apps/sdk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { ArrowRight, ChevronDown, X, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
        className="glass-gradient rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:glass-light hover:scale-[1.02] group will-change-transform"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-white pr-3 leading-snug line-clamp-2">
            {material.material_name}
          </h3>
          <div className="flex-shrink-0 w-7 h-7 glass-light rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 glow-cyan">
            <ArrowRight size={14} className="text-white" />
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
                className="w-6 h-6 glass rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:glass-light"
              >
                <ChevronDown size={12} className="text-white" />
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
            <div className="glass-heavy rounded-3xl p-6 glow">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 glass rounded-full flex items-center justify-center transition-all hover:glass-light hover:scale-110"
              >
                <X size={16} className="text-white" />
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
                className="w-full glass-gradient text-white py-3 px-6 rounded-2xl font-medium transition-all hover:glass-light hover:scale-[1.02] flex items-center justify-center gap-2 glow-blue"
              >
                Открыть материал
                <ArrowRight size={18} className="text-white" />
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
      <div className="fixed inset-0 bg-black flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
      </div>
    );
  }

  const expandedMaterial = materials?.find(m => m.id === expandedCard);

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background with gradient */}
      <div className="absolute inset-0">
        <Image
          src="/img/zalsozvezdii.png"
          alt="Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="gradient-overlay-dark" />
      </div>

      {/* Scrollable content with optimized rendering */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pb-32 transform-gpu">
        {/* Fixed header with categories */}
        <div className="sticky top-0 z-20 glass-dark backdrop-blur-2xl border-b border-white/10">
          <div className="px-4 pt-6 pb-4">
            <h2 className="text-2xl font-bold text-white mb-4">Материалы</h2>
            
            {/* Category pills - full width container */}
            <div className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 pb-2 min-w-max">
                <button
                  onClick={() => setActiveSubtopic(undefined)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    !activeSubtopic 
                      ? 'glass-gradient text-white glow' 
                      : 'glass text-white/70 hover:text-white hover:glass-light'
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
                        ? 'glass-gradient text-white glow' 
                        : 'glass text-white/70 hover:text-white hover:glass-light'
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
              <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
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
                <div className="w-20 h-20 glass-gradient rounded-full flex items-center justify-center mb-4 mx-auto glow">
                  <Sparkles size={40} className="text-white" />
                </div>
                <p className="text-white/70">
                  {activeSubtopic ? 'Нет практик в этой категории' : 'Практики скоро появятся'}
                </p>
                {activeSubtopic && (
                  <button
                    onClick={() => setActiveSubtopic(undefined)}
                    className="mt-4 px-4 py-2 glass text-white/70 rounded-full text-sm font-medium hover:text-white hover:glass-light transition-all"
                  >
                    Показать все практики
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Glass Bottom Bar */}
      <GlassBottomBar />

      {/* Expanded card modal */}
      <ExpandedCardModal
        material={expandedMaterial}
        isOpen={!!expandedCard}
        onClose={handleCloseModal}
        onNavigate={handleMaterialClick}
      />
    </div>
  );
};