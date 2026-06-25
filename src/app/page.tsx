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
import { Button } from '@/components/ui';
import styles from './page.module.css';

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
      <section className={`screen-container ${styles.container}`} dir="rtl">
        <div className={styles.ambientGlow} />
        
        <div className={styles.content}>
          <div className={styles.heroWrapper}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}>
                <span className={styles.heroBadgeDotPing}></span>
                <span className={styles.heroBadgeDotInner}></span>
              </span>
              <span className={styles.heroBadgeText}>لعبة الشك والخداع</span>
            </div>

            <h1 className={styles.heroTitle}>MAFIA</h1>
            <p className={styles.heroSubtitle}>
              المدينة ناعسة... والمافيا كتخطط. شكون غايبقى حي حتى للصباح؟
            </p>
          </div>

          <div className={styles.heroActions}>
            <Button
              onClick={() => router.push('/room/create')}
              className={styles.actionBtnOutline}
            >
              إنشاء غرفة جديدة <span>🏰</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/room')}
              className={styles.actionBtnOutline}
            >
              انضم إلى غرفة <span>🔗</span>
            </Button>
            
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <div className={styles.dividerTextWrapper}>
                <span className={styles.dividerText}>أو</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => { window.location.href = '/local'; }}
              className={styles.actionBtnGhost}
            >
              لعبة محلية (هاتف واحد) 📱
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
