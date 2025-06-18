'use client';

import React, { useMemo } from 'react';
import { MarkdownMessage } from '@/fsd/shared/components/MarkdownMessage';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  materialIds?: number[];
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  allMaterials?: any[];
  userAvatarUrl?: string;
  userName?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({
  messages,
  isLoading,
  allMaterials,
  userAvatarUrl,
  userName
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      <div className="w-full max-w-lg mx-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-3">
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
                  {userAvatarUrl ? (
                    <img 
                      src={userAvatarUrl} 
                      alt={`${userName || 'User'}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/nophoto.png';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <img 
                      src="/img/nophoto.png" 
                      alt="Default avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl backdrop-blur-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-sky text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/10 text-white shadow-lg shadow-white/20'
              }`}>
                <MarkdownMessage content={msg.content} className="text-sm" />
              </div>
            </div>
            
            {/* Material cards carousel */}
            {msg.role === 'assistant' && msg.materialIds && msg.materialIds.length > 0 && allMaterials && (
              <MaterialCarousel 
                materialIds={msg.materialIds}
                allMaterials={allMaterials}
              />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-lg px-4 py-3 rounded-2xl shadow-lg shadow-white/20">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce shadow-sm shadow-blue-300/50"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-sm shadow-blue-400/50" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce shadow-sm shadow-white/50" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Memoized material carousel component
const MaterialCarousel: React.FC<{ materialIds: number[], allMaterials: any[] }> = React.memo(({ materialIds, allMaterials }) => {
  const filteredMaterials = useMemo(() => 
    allMaterials?.filter(m => materialIds?.includes(m.id)) || [],
    [allMaterials, materialIds]
  );

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2">
        {filteredMaterials.map(material => (
          <MaterialCard 
            key={material.id} 
            material={material} 
            compact 
          />
        ))}
      </div>
    </div>
  );
});