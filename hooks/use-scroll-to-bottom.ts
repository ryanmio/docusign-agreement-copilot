// not in use - was fighting the auto scroll in dev 
// and decided i didnt like the autoscroll anyways

import { useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
  () => void
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  return [containerRef, endRef, scrollToBottom];
} 