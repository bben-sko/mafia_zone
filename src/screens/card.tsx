'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import { ROLES } from '@/lib/roles';
import { RoleKey } from '@/lib/game-types';

export default function CardScreen() {
  const { state, dispatch } = useGame();
  const player = state.shuffled[state.currentIndex];
  const role = state.roles[state.currentIndex] as RoleKey;
  const rc = ROLES[role];
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showNext = revealedIndex === state.currentIndex;

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    gsap.fromTo('#card-scene-3d', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.2 });

    const card3d = cardRef.current;
    if (card3d) {
      card3d.style.transition = 'none';
      card3d.classList.remove('flipped');
      const timer = setTimeout(() => { card3d.style.transition = ''; }, 50);
      return () => clearTimeout(timer);
    }
  }, [state.currentIndex]);

  const flipCard = () => {
    if (state.flipped) return;
    dispatch({ type: 'FLIP_CARD' });
    const card3d = cardRef.current;
    if (card3d) card3d.classList.add('flipped');
    setTimeout(() => {
      setRevealedIndex(state.currentIndex);
      gsap.fromTo('#card-next-btn', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }, 750);
  };

  return (
    <section className="view active relative z-10 flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-8" dir="rtl">
      <div ref={containerRef} className="flex flex-col items-center gap-6">
        <div className="font-display text-xl text-[var(--color-text)] text-center">{player}</div>
        <p className="text-sm text-[var(--color-text-muted)] text-center">اقلب البطاقة باش تشوف دورك 👇</p>

        <div className="card-scene" onClick={flipCard}>
          <div ref={cardRef} className="card-3d" id="card-scene-3d">
            <div className="card-face card-back">
              <div className="card-back-pattern" />
              <div className="card-back-title relative z-10 font-display text-xl uppercase tracking-wider text-[var(--color-primary)]">MAFIA</div>
              <div className="card-back-hint relative z-10 text-xs uppercase tracking-wider text-[var(--color-text-faint)]">اقلب للكشف</div>
            </div>
            <div className={`card-face card-front ${rc.class}`} style={{
              background: role === 'mafia' ? 'linear-gradient(160deg,#1a0808,#2d0f0f,#1a0808)' :
                          role === 'civil' ? 'linear-gradient(160deg,#0a150a,#0f2010,#0a150a)' :
                          role === 'detective' ? 'linear-gradient(160deg,#080a1a,#0f112d,#080a1a)' :
                          role === 'doctor' ? 'linear-gradient(160deg,#15100a,#251a0a,#15100a)' :
                          role === 'chouafa' ? 'linear-gradient(160deg,#0f081a,#1a0d2d,#0f081a)' :
                          role === 'laadoul' ? 'linear-gradient(160deg,#121214,#1a1a1d,#121214)' :
                          role === 'spy' ? 'linear-gradient(160deg,#0a1a0a,#0f2a10,#0a1a0a)' :
                          role === 'mayor' ? 'linear-gradient(160deg,#1a140a,#2a1f0a,#1a140a)' :
                          'linear-gradient(160deg,#1a0808,#2d0f0f,#1a0808)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                background: 'rgba(192,57,43,0.2)',
                border: '1px solid rgba(192,57,43,0.4)'
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: rc.icon }} />
              </div>
              <div className={`font-display text-xl font-bold text-center tracking-wider`} style={{
                color: role === 'mafia' ? '#e05555' :
                       role === 'civil' ? '#5dba6e' :
                       role === 'detective' ? '#5599dd' :
                       role === 'doctor' ? '#ddbb55' : '#e05555'
              }}>
                {rc.label}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed">{rc.description}</div>
              <div className="text-xs text-[var(--color-text-faint)] tracking-wider uppercase pt-2 px-4 border-t border-[var(--color-divider)] w-full text-center">{player}</div>
            </div>
          </div>
        </div>

        <div id="card-next-btn" style={{ display: showNext ? 'inline-flex' : 'none' }}>
          <Button
            size="lg"
            onClick={() => dispatch({ type: 'AFTER_CARD_FLIP' })}
          >
            {state.currentIndex === state.shuffled.length - 1 ? 'تأكيد ✓' : 'التالي →'}
          </Button>
        </div>
      </div>
    </section>
  );
}
