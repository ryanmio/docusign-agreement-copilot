import { useState } from 'react';

export function useToolTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const transition = async (callback: () => Promise<void>) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      await callback();
    } finally {
      setIsTransitioning(false);
    }
  };

  return { isTransitioning, transition };
} 