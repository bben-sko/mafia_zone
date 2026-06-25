'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';

export default function End() {
  const { dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' });

    const colors = ['#c8a96e', '#e05555', '#5dba6e', '#5599dd'];
    const els: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;width:7px;height:7px;border-radius:50%;background:${colors[i % 4]};left:${Math.random() * 100}vw;top:-10px;z-index:100;pointer-events:none`;
      document.body.appendChild(el);
      els.push(el);
      gsap.to(el, {
        y: window.innerHeight + 20,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 0.8,
        ease: 'power1.in',
        onComplete: () => el.remove()
      });
    }
    return () => {
      els.forEach(el => el.remove());
    };
  }, []);

  return (
    <section className="view active flex flex-col items-center justify-center min-h-dvh px-4 py-8 relative z-1 gap-8 text-center" dir="rtl">
      <div ref={containerRef}>
        <h2 className="font-display text-[clamp(2rem,1.2rem+2.5vw,3.5rem)] text-[var(--color-primary)]">تم التوزيع!</h2>
        <p className="text-base text-[var(--color-text-muted)] max-w-[40ch] mx-auto mt-4">
          كل واحد عارف دوره — بداو اللعبة!
        </p>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <Button size="lg" onClick={() => dispatch({ type: 'RESET_GAME' })}>لعبة جديدة</Button>
      </div>
    </section>
  );
}
