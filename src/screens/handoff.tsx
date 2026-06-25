'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import styles from './handoff.module.css';

export default function Handoff() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const nextIndex = state.currentIndex + 1;

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
    gsap.fromTo('#handoff-icon', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
  }, []);

  return (
    <section className={`screen-container view active ${styles.container}`} dir="rtl">
      <div className={styles.bgGradient} />
      
      <div ref={containerRef} className={styles.inner}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconGlow} />
          <svg id="handoff-icon" className={styles.icon} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="20" y="30" width="40" height="32" rx="4" strokeOpacity=".8" />
            <path d="M30 30v-8a10 10 0 0 1 20 0v8" strokeOpacity=".8" />
            <circle cx="40" cy="46" r="5" fill="currentColor" opacity=".9" />
            <path d="M40 51v6" strokeLinecap="round" opacity=".9" />
          </svg>
        </div>
        
        <div className={styles.header}>
          <div className={styles.headerSub}>تمرير الهاتف</div>
          <div className={styles.headerTitle}>سلّم التلفون!</div>
        </div>
        
        <div className={`card-base ${styles.card}`}>
          <div className={styles.cardLine} />
          <div className={styles.cardSub}>هاد الشخص كيجي دوره:</div>
          <div className={styles.cardName}>{state.shuffled[nextIndex]}</div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <Button size="lg" className={styles.btn} onClick={() => dispatch({ type: 'NEXT_TURN' })}>
          أنا جاهز 👀
        </Button>
      </div>
    </section>
  );
}
