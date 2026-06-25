'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';

export default function Discussion() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
  }, []);

  useEffect(() => {
    if (state.timerRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TIMER_TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.timerRunning, dispatch]);

  const r = 88;
  const circ = 2 * Math.PI * r;
  const pct = state.timerDuration > 0 ? state.timerRemaining / state.timerDuration : 0;

  const m = Math.floor(state.timerRemaining / 60);
  const s = state.timerRemaining % 60;

  const fillColor = pct > 0.5 ? '#c8a96e' : pct > 0.25 ? '#d4a017' : '#c0392b';
  const timeColor = pct <= 0.25 || state.timerRemaining === 0 ? '#e05555' : 'var(--color-text)';

  useEffect(() => {
    if (state.timerRemaining === 0 && state.timerStarted) {
      const fill = document.getElementById('timer-fill');
      if (fill) {
        gsap.to(fill, { attr: { strokeWidth: 12 }, duration: 0.3, yoyo: true, repeat: 5, ease: 'power1.inOut', onComplete: () => gsap.set(fill, { attr: { strokeWidth: 8 } }) });
      }
      const banner = document.getElementById('timeup-banner');
      if (banner) {
        gsap.to(banner, { y: 0, duration: 0.4, ease: 'power3.out' });
      }
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch {}
    }
  }, [state.timerRemaining, state.timerStarted]);

  return (
    <section className="view active flex flex-col items-center justify-center min-h-dvh px-4 py-8 relative z-1 gap-8 text-center" dir="rtl">
      <div ref={containerRef}>
        <div className="font-display text-xl text-[var(--color-text)]">وقت النقاش 🗣️</div>
        <p className="text-sm text-[var(--color-text-muted)] max-w-[36ch] mx-auto mt-2">ناقشو بيناتكم !؟</p>
      </div>

      {/* Duration Picker */}
      <div>
        <div className="text-xs text-[var(--color-text-muted)] text-center mb-3 tracking-wider uppercase">مدة النقاش</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[60, 120, 180, 300].map(secs => (
            <button
              key={secs}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider cursor-pointer border transition-all duration-[180ms] ${state.timerDuration === secs && !state.timerStarted ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
              onClick={() => !state.timerStarted && dispatch({ type: 'SELECT_DURATION', val: secs })}
            >
              {secs === 60 ? '1 دقيقة' : secs === 120 ? '2 دقيقة' : secs === 180 ? '3 دقائق' : '5 دقائق'}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-[200px] h-[200px]">
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            <circle className="timer-track" cx="100" cy="100" r={r} fill="none" stroke="var(--color-surface-dynamic)" strokeWidth="8" />
            <circle
              id="timer-fill"
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={fillColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              style={{ transition: 'stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4px]">
            <div className="font-display text-[clamp(2rem,1.2rem+2.5vw,3.5rem)] text-[var(--color-text)] tabular-nums leading-none" style={{ color: timeColor }}>
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
            <div className="text-xs text-[var(--color-text-faint)] tracking-wider uppercase">
              {state.timerRunning ? 'يشتغل' : state.timerStarted ? 'موقوف' : 'جاهز'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost" size="sm"
              onClick={() => dispatch({ type: 'ADJUST_TIMER', delta: -30 })}
              disabled={state.timerRemaining <= 10}
            >
              −30s
            </Button>
            <Button onClick={() => dispatch({ type: 'TOGGLE_TIMER' })}>
              {state.timerRunning ? '⏸ وقف' : state.timerStarted ? '▶ استمر' : '▶ ابدأ'}
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => dispatch({ type: 'ADJUST_TIMER', delta: 30 })}
              disabled={state.timerRemaining >= state.timerDuration + 120}
            >
              +30s
            </Button>
          </div>
          {state.timerStarted && (
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'RESTART_TIMER' })}>
              ↺ إعادة
            </Button>
          )}
        </div>
      </div>

      {/* Time up banner */}
      <div
        id="timeup-banner"
        className="fixed bottom-0 left-0 right-0 z-[999] bg-[var(--color-red)] text-white text-center py-4 font-semibold text-base"
        style={{ transform: state.timerRemaining === 0 && state.timerStarted ? 'translateY(0)' : 'translateY(100%)' }}
      >
        ⏰ انتهى الوقت! ابداو التصويت
      </div>

      <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'end' })}>تخطي</Button>
    </section>
  );
}
