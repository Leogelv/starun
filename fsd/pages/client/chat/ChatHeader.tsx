'use client';

import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <div 
      className="w-full bg-blue-950/20 backdrop-blur-xl border-b border-white/10" 
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 80px)',
        paddingBottom: '20px'
      }}
    >
      {/* Content placeholder for header height */}
    </div>
  );
};