'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import styles from './turn.module.css';

export default function Turn() {
  const { state, dispatch } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const total = state.shuffled.length;

  useEffect(() => {
    gsap.fromTo(containerRef.current?.children || [], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
  }, [state.currentIndex]);

  const progress = total > 0 ? (state.currentIndex / total) * 100 : 0;

  return (
    <section className={`view active ${styles.container}`} dir="rtl">
      
      {/* Top Progress Bar */}
      <div className={styles.progressWrapper}>
        <div className={styles.progressHeader}>
          <div className={styles.progressLabel}>تقدم التوزيع</div>
          <div className={styles.progressVal}>{state.currentIndex + 1} / {total}</div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div ref={containerRef} className={styles.inner}>
        <div className={styles.nameWrapper}>
          <div className={styles.nameGlow} />
          <h2 className={styles.name}>
            {state.shuffled[state.currentIndex]}
          </h2>
        </div>
        <div className={`card-base ${styles.card}`}>
          <p className={styles.cardText}>اعطيه التلفون باش يشوف دوره</p>
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <Button size="lg" className={styles.btn} onClick={() => dispatch({ type: 'GO_TO_CARD' })}>
            عرض البطاقة 🃏
          </Button>
        </div>
      </div>
    </section>
  );
}
