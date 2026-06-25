'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';

export default function Turn() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const total = state.shuffled.length;

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
  }, [state.currentIndex]);

  const progress = total > 0 ? (state.currentIndex / total) * 100 : 0;

  return (
    <section className="view active relative z-10 flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-8 text-center" dir="rtl">
      <div ref={containerRef} className="w-full max-w-[400px]">
        <div className="text-xs text-[var(--color-text-faint)] tracking-wider uppercase">
          اللاعب {state.currentIndex + 1} من {total}
        </div>
        <div className="my-4">
          <div className="w-full max-w-[300px] mx-auto">
            <div className="h-[3px] bg-[var(--color-surface-dynamic)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <h2 className="font-display text-[clamp(2rem,1.2rem+2.5vw,3.5rem)] text-[var(--color-text)] mb-2">
          {state.shuffled[state.currentIndex]}
        </h2>
        <p className="text-base text-[var(--color-text-muted)] mb-2">اعطيه التلفون باش يشوف دوره</p>
      </div>
      <Button size="lg" onClick={() => dispatch({ type: 'GO_TO_CARD' })}>عرض البطاقة 🃏</Button>
    </section>
  );
}
