'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/game-context';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import Lobby from '@/screens/lobby';
import Setup from '@/screens/setup';
import Turn from '@/screens/turn';
import Handoff from '@/screens/handoff';
import CardScreen from '@/screens/card';
import Discussion from '@/screens/discussion';
import End from '@/screens/end';

function GameApp() {
  const { state } = useGame();
  const { screen } = state;

  return (
    <>
      {screen === 'lobby' && <Lobby />}
      {screen === 'setup' && <Setup />}
      {screen === 'turn' && <Turn />}
      {screen === 'handoff' && <Handoff />}
      {screen === 'card' && <CardScreen />}
      {screen === 'discussion' && <Discussion />}
      {screen === 'end' && <End />}
    </>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <section className="flex flex-col items-center justify-center min-h-dvh px-6" dir="rtl">
        <div className="max-w-[380px] w-full text-center relative z-1">
          <div className="flex items-center justify-center gap-3 font-display text-xl text-[var(--color-primary)] tracking-[0.15em] uppercase mb-6">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
              <path d="M16 4 L20 12 L28 13 L22 19 L24 27 L16 23 L8 27 L10 19 L4 13 L12 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
            </svg>
            Mafia
          </div>
          <div className="w-[60px] h-[1px] bg-[var(--color-primary)] mx-auto mb-6 opacity-30" />
          <h1 className="font-display text-[clamp(3.5rem,10vw,6rem)] text-[var(--color-primary)] leading-[0.9] mb-4"
            style={{ textShadow: '0 0 30px rgba(200,169,110,0.12)' }}
          >
            MAFIA
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-[30ch] mx-auto leading-relaxed">
            لعبة الشك والخداع — من هو المافيا بين أصحابك؟
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/room/create')}
              className="w-full py-3 px-8 text-sm font-semibold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] transition-all duration-[180ms]"
            >
              إنشاء غرفة 🏠
            </button>
            <button
              onClick={() => router.push('/room')}
              className="w-full py-3 px-8 text-sm font-semibold tracking-wider uppercase rounded-md bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-all duration-[180ms]"
            >
              انضم إلى غرفة 🔗
            </button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-divider)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] text-[var(--color-text-faint)] bg-[var(--color-bg)]">أو</span>
              </div>
            </div>
            <button
              onClick={() => {
                // Uses GameProvider from layout
                window.location.href = '/local';
              }}
              className="w-full py-3 px-8 text-xs font-semibold tracking-wider uppercase rounded-md bg-transparent text-[var(--color-text-faint)] border border-[var(--color-divider)] hover:text-[var(--color-text-muted)] hover:border-[var(--color-border)] transition-all duration-[180ms]"
            >
              لعبة محلية 🃏
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
