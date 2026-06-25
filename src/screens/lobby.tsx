'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import styles from './lobby.module.css';

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
    <section className={styles.container} dir="rtl">
      <div ref={contentRef} className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
            <path d="M16 4 L20 12 L28 13 L22 19 L24 27 L16 23 L8 27 L10 19 L4 13 L12 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3" fill="currentColor" />
          </svg>
          Mafia
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Main Title */}
        <h1 className={styles.title}>
          MAFIA
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          لعبة الشك والخداع — من هو المافيا بين أصحابك؟
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className={styles.btn}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'setup' })}
        >
          ابدأ اللعبة 🎴
        </Button>
      </div>
    </section>
  );
}
