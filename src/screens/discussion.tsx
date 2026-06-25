'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import styles from './discussion.module.css';

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

  const r = 140; // larger radius for viewBox 320
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
        gsap.to(fill, { attr: { strokeWidth: 20 }, duration: 0.3, yoyo: true, repeat: 5, ease: 'power1.inOut', onComplete: () => gsap.set(fill, { attr: { strokeWidth: 12 } }) });
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
    <section className={`view active ${styles.container}`} dir="rtl">
      <div ref={containerRef} className={styles.header}>
        <div className={styles.headerSub}>المرحلة الحالية</div>
        <div className={styles.headerTitle}>وقت النقاش 🗣️</div>
        <p className={styles.headerDesc}>ناقشو بيناتكم وحاولو تعرفو المافيا!</p>
      </div>

      <div className={styles.content}>
        
        {/* Timer UI */}
        <div className={styles.timerWrapper}>
          <svg width="100%" height="100%" viewBox="0 0 320 320" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="160" cy="160" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
            <circle
              id="timer-fill"
              cx="160"
              cy="160"
              r={r}
              fill="none"
              stroke={fillColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              style={{ transition: 'stroke 0.5s ease', filter: pct <= 0.25 ? 'drop-shadow(0 0 8px rgba(224,85,85,0.4))' : 'none' }}
            />
          </svg>
          <div className={styles.timerDisplay}>
            <div className={styles.timerValue} style={{ color: timeColor }}>
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
            <div className={styles.timerStatus}>
              {state.timerRunning ? 'يشتغل...' : state.timerStarted ? 'موقوف' : 'جاهز للبدء'}
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className={styles.controlsWrapper}>
          {!state.timerStarted ? (
            <div className={styles.durationCard}>
              <div className={styles.durationTitle}>اختر مدة النقاش</div>
              <div className={styles.durationGrid}>
                {[60, 120, 180, 300].map(secs => (
                  <button
                    key={secs}
                    className={`${styles.durationBtn} ${state.timerDuration === secs ? styles.durationBtnActive : styles.durationBtnInactive}`}
                    onClick={() => dispatch({ type: 'SELECT_DURATION', val: secs })}
                  >
                    {secs === 60 ? 'دقيقة واحدة' : secs === 120 ? 'دقيقتين' : secs === 180 ? '3 دقائق' : '5 دقائق'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.activeControls}>
              <div className={styles.activeButtons}>
                <button
                  className={styles.adjustBtn}
                  onClick={() => dispatch({ type: 'ADJUST_TIMER', delta: -30 })}
                  disabled={state.timerRemaining <= 10}
                >
                  −30
                </button>
                
                <button 
                  className={`${styles.playPauseBtn} ${state.timerRunning ? styles.playPauseRunning : styles.playPauseStopped}`}
                  onClick={() => dispatch({ type: 'TOGGLE_TIMER' })}
                >
                  {state.timerRunning ? '⏸' : '▶'}
                </button>
                
                <button
                  className={styles.adjustBtn}
                  onClick={() => dispatch({ type: 'ADJUST_TIMER', delta: 30 })}
                  disabled={state.timerRemaining >= state.timerDuration + 120}
                >
                  +30
                </button>
              </div>
              <button 
                className={styles.resetBtn}
                onClick={() => dispatch({ type: 'RESTART_TIMER' })}
              >
                ↺ إعادة ضبط الوقت
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className={styles.footer}>
        <button 
          className={styles.endBtn}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'end' })}
        >
          إنهاء النقاش والتصويت →
        </button>
      </div>

      {/* Time up banner */}
      <div
        id="timeup-banner"
        className={styles.timeupBanner}
        style={{ transform: state.timerRemaining === 0 && state.timerStarted ? 'translateY(0)' : 'translateY(100%)' }}
      >
        ⏰ انتهى الوقت! ابداو التصويت
      </div>
    </section>
  );
}
