'use client';

import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <div 
      className="w-full bg-gradient-to-b from-blue-950/80 via-blue-950/40 to-transparent" 
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 80px)',
        paddingBottom: '20px'
      }}
    >
      {/* Content placeholder for header height */}
    </div>
  );
};