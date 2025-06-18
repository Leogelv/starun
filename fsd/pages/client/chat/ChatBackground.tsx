'use client';

import React from 'react';

export const ChatBackground: React.FC = () => {

  return (
    <>
      {/* Video background (под всем) */}
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/video/bg_chat.MOV" type="video/quicktime" />
        <source src="/video/bg_chat.mp4" type="video/mp4" />
        <source src="/video/bg_chat.webm" type="video/webm" />
      </video>
      
      {/* Background image with gradient overlay (поверх видео) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/chatscreen.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-blue-900/60 to-blue-950/80"></div>
      <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
    </>
  );
};