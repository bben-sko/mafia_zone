'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';

export default function Handoff() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const nextIndex = state.currentIndex + 1;

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    gsap.fromTo('#handoff-icon', { scale: 0.5 }, { scale: 1, duration: 0.5, ease: 'back.out(1.4)', delay: 0.1 });
  }, []);

  return (
    <section className="view active flex flex-col items-center justify-center min-h-dvh px-4 py-8 relative z-1 gap-6 text-center" dir="rtl">
      <div ref={containerRef}>
        <svg id="handoff-icon" className="w-20 h-20 mx-auto text-[var(--color-primary)]" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="20" y="30" width="40" height="32" rx="4" strokeOpacity=".6" />
          <path d="M30 30v-8a10 10 0 0 1 20 0v8" strokeOpacity=".6" />
          <circle cx="40" cy="46" r="5" fill="currentColor" opacity=".7" />
          <path d="M40 51v6" strokeLinecap="round" opacity=".7" />
        </svg>
        <div className="font-display text-xl text-[var(--color-text)]">سلّم التلفون!</div>
        <div className="text-sm text-[var(--color-text-muted)]">هاد الشخص كيجي دوره:</div>
        <div className="font-display text-[clamp(2rem,1.2rem+2.5vw,3.5rem)] text-[var(--color-primary)]">
          {state.shuffled[nextIndex]}
        </div>
      </div>
      <Button size="lg" onClick={() => dispatch({ type: 'NEXT_TURN' })}>أنا جاهز 👀</Button>
    </section>
  );
}
