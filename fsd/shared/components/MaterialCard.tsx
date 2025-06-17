'use client';

import { useState } from 'react';
import { openLink } from '@telegram-apps/sdk-react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface MaterialCardProps {
  material: {
    id: number;
    material_name: string;
    description?: string | null;
    message_link: string;
  };
  compact?: boolean;
}

export const MaterialCard = ({ material, compact = false }: MaterialCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleMaterialClick = (link: string) => {
    openLink(link);
  };

  const displayText = material.description && !isExpanded && material.description.length > 140 
    ? material.description.substring(0, 140) + '...' 
    : material.description;

  return (
    <div className={`relative group ${compact ? 'min-w-[280px]' : 'w-full'}`}>
      <div 
        onClick={() => handleMaterialClick(material.message_link)}
        className="glass-gradient rounded-2xl p-4 cursor-pointer transition-all hover:glass-light hover:scale-[1.02] h-full"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white pr-3 line-clamp-2`}>
            {material.material_name}
          </h3>
          <div className="flex-shrink-0 w-6 h-6 glass-light rounded-full flex items-center justify-center group-hover:scale-110 transition-transform glow-cyan">
            <ArrowRight size={12} className="text-white" />
          </div>
        </div>
        
        {material.description && !compact && (
          <p className="text-white/70 text-sm leading-relaxed">
            {displayText}
          </p>
        )}
      </div>

      {material.description && material.description.length > 140 && !compact && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="absolute bottom-2 right-2 w-5 h-5 glass rounded-full flex items-center justify-center transition-all hover:scale-110 hover:glass-light"
        >
          <ChevronDown 
            size={10} 
            className={`text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
};