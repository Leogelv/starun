'use client';

import { useState } from 'react';
import { openLink } from '@telegram-apps/sdk-react';

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
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 cursor-pointer transition-all hover:border-white/20 h-full"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white pr-3 line-clamp-2`}>
            {material.material_name}
          </h3>
          <div className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {material.description && !compact && (
          <p className="text-gray-400 text-sm leading-relaxed">
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
          className="absolute bottom-2 right-2 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        >
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 24 24" 
            fill="none"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};