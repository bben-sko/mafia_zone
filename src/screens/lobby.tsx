'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';

export default function Lobby() {
  const { dispatch } = useGame();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const children = contentRef.current?.children;
    if (children) {
      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh px-6 py-8" dir="rtl">
      <div ref={contentRef} className="relative z-10 flex w-full max-w-[520px] flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 font-display text-xl text-[var(--color-primary)] tracking-[0.15em] uppercase mb-10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
            <path d="M16 4 L20 12 L28 13 L22 19 L24 27 L16 23 L8 27 L10 19 L4 13 L12 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3" fill="currentColor" />
          </svg>
          Mafia
        </div>

        {/* Divider */}
        <div className="w-[80px] h-[1px] bg-[var(--color-primary)] opacity-30 mb-10" />

        {/* Main Title */}
        <h1
          className="font-display text-[clamp(6rem,12vw,10rem)] text-[var(--color-primary)] leading-[0.85] tracking-[0.02em] mb-8 select-none"
          style={{ textShadow: '0 0 40px rgba(200,169,110,0.15), 0 0 80px rgba(200,169,110,0.08)' }}
        >
          MAFIA
        </h1>

        {/* Subtitle */}
        <p className="text-[var(--color-text-muted)] text-base sm:text-lg leading-relaxed max-w-[34ch] mx-auto mb-12">
          لعبة الشك والخداع — من هو المافيا بين أصحابك؟
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className="!px-14 !py-5 !text-lg tracking-[0.08em] transition-transform duration-[250ms] hover:scale-105 active:scale-95"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'setup' })}
        >
          ابدأ اللعبة 🎴
        </Button>
      </div>
    </section>
  );
}
