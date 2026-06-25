'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import styles from './end.module.css';

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
    <section className={`screen-container view active ${styles.container}`} dir="rtl">
      <div className={styles.bgGlow} />
      
      <div ref={containerRef} className={styles.inner}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>✓</span>
        </div>
        <h2 className={styles.title}>تم التوزيع!</h2>
        <p className={styles.desc}>
          كل واحد عارف دوره... المافيا كتخطط والمدينة ناعسة.
        </p>
      </div>

      <div className={styles.footer}>
        <Button size="lg" className={styles.btn} onClick={() => dispatch({ type: 'RESET_GAME' })}>لعبة جديدة 🔄</Button>
      </div>
    </section>
  );
}
