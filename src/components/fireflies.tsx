'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Fireflies() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const flies: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const f = document.createElement('div');
      f.className = 'firefly';
      f.style.cssText = `position:fixed;width:3px;height:3px;border-radius:50%;background:#c8a96e;opacity:0;pointer-events:none;z-index:0;left:${Math.random()*100}vw;top:${Math.random()*100}vh`;
      container.appendChild(f);
      flies.push(f);
      gsap.to(f, { opacity: 0.6, duration: 2, repeat: -1, yoyo: true, delay: Math.random() * 3, ease: 'sine.inOut' });
      gsap.to(f, { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, duration: 6 + Math.random() * 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 4 });
    }
    return () => {
      flies.forEach(f => f.remove());
    };
  }, []);

  return <div ref={containerRef} id="fireflies" />;
}
