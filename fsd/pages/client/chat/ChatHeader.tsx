'use client';

import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <div 
      className="flex-shrink-0 pb-4 text-center bg-gradient-to-b from-blue-950/90 via-blue-900/50 to-transparent" 
      style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}
    >
      <h2 className="text-2xl font-bold text-white mb-2 text-glow font-poppins">
        STARUNITY AI HELPER
      </h2>
    </div>
  );
};