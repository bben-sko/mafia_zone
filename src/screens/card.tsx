'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui';
import { ROLES } from '@/lib/roles';
import { RoleKey } from '@/lib/game-types';
import styles from './card.module.css';

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
      gsap.fromTo('#card-next-btn-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' });
    }, 750);
  };

  return (
    <section className={`view active ${styles.container}`} dir="rtl">
      <div ref={containerRef} className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerSub}>دور اللاعب</div>
          <div className={styles.headerTitle}>{player}</div>
          <p className={styles.headerDesc}>اضغط على البطاقة باش تشوف دورك 👇</p>
        </div>

        <div className={`card-scene ${styles.cardContainer}`} onClick={flipCard}>
          <div ref={cardRef} className={`card-3d ${styles.cardContent}`} id="card-scene-3d">
            <div className={`card-face card-back ${styles.cardFace}`}>
              <div className={styles.cardBackBg} />
              <div className={styles.cardBackInner}>
                <div className={styles.cardIconWrapper}>
                  <span className={styles.cardIcon}>🎭</span>
                </div>
                <div className={styles.cardMafiaText}>MAFIA</div>
                <div className={styles.cardTapText}>اضغط للفتح</div>
              </div>
            </div>
            <div className={`card-face card-front ${styles.cardFace}`} style={{overflow: 'hidden'}}>
              <div className={styles.cardFrontBg} style={{
                background: role === 'mafia' ? 'radial-gradient(circle at top, var(--color-red) 0%, transparent 70%)' :
                            role === 'civil' ? 'radial-gradient(circle at top, var(--color-green) 0%, transparent 70%)' :
                            role === 'detective' ? 'radial-gradient(circle at top, var(--color-blue) 0%, transparent 70%)' :
                            role === 'doctor' ? 'radial-gradient(circle at top, var(--color-amber) 0%, transparent 70%)' :
                            role === 'chouafa' ? 'radial-gradient(circle at top, var(--color-teal) 0%, transparent 70%)' :
                            role === 'laadoul' ? 'radial-gradient(circle at top, var(--color-rose) 0%, transparent 70%)' :
                            'radial-gradient(circle at top, var(--color-text-muted) 0%, transparent 70%)'
              }} />
              
              <div className={styles.cardFrontIconWrapper}>
                <svg className={styles.cardFrontIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: rc.icon }} />
              </div>
              <div className={styles.cardRoleLabel} style={{
                color: role === 'mafia' ? 'var(--color-red)' :
                       role === 'civil' ? 'var(--color-green)' :
                       role === 'detective' ? 'var(--color-blue)' :
                       role === 'doctor' ? 'var(--color-amber)' : 'var(--color-text)'
              }}>
                {rc.label}
              </div>
              <div className={styles.cardRoleDesc}>{rc.description}</div>
              <div className={styles.cardPlayerInfo}>
                <div className={styles.cardPlayerLabel}>دور اللاعب</div>
                <div className={styles.cardPlayerName}>{player}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="card-next-btn-container" className={styles.footer} style={{ opacity: 0 }}>
        <div className={styles.footerInner}>
          <Button
            size="lg"
            className={styles.footerBtn}
            style={{ pointerEvents: showNext ? 'auto' : 'none' }}
            onClick={() => dispatch({ type: 'AFTER_CARD_FLIP' })}
          >
            {state.currentIndex === state.shuffled.length - 1 ? 'إنهاء التوزيع ✓' : 'متابعة لللاعب التالي →'}
          </Button>
        </div>
      </div>
    </section>
  );
}
