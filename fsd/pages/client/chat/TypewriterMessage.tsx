'use client';

import React, { useEffect, useState } from 'react';

interface TypewriterMessageProps {
  content: string;
  speed?: number;
  className?: string;
}

export const TypewriterMessage: React.FC<TypewriterMessageProps> = ({ 
  content, 
  speed = 50,
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, speed]);

  return <span className={className}>{displayedText}</span>;
};