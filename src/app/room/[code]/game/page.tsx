'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { ROLES } from '@/lib/roles';
import { RoleKey } from '@/lib/game-types';
import { getSavedPlayer } from '@/lib/player-storage';
import styles from './game.module.css';

interface Player { id: string; name: string; isHost: boolean; }

function GameContent() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const savedPlayer = getSavedPlayer();
  const playerId = savedPlayer.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<RoleKey | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!playerId) {
      router.replace(`/room?code=${code}`);
      return;
    }

    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (data.status !== 'playing') {
          // Game hasn't started yet, go back to lobby
          router.push(`/room/${code}`);
          return;
        }

        const myRole = data.gameState?.roles?.[playerId];
        if (!myRole) throw new Error('Role not found');

        const p = data.players.find((pl: Player) => pl.id === playerId);
        setPlayerName(p?.name || '');
        setIsHost(p?.isHost || false);
        setRole(myRole);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
    const interval = setInterval(fetchRole, 3000);
    return () => clearInterval(interval);
  }, [code, playerId]);

  if (!playerId) return null;
  if (loading) return (
    <section className={styles.centerMsg}>
      <p className={styles.hint}>جاري تحميل دورك...</p>
    </section>
  );
  if (error || !role) return (
    <section className={styles.errorMsg} dir="rtl">
      <p className={styles.errorText}>{error || 'لم يتم العثور على الدور'}</p>
      <button onClick={() => router.push('/')} className={styles.link}>الرجوع</button>
    </section>
  );

  const rc = ROLES[role];

  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <section className={styles.container} dir="rtl">
        <div className={styles.inner}>
          <div className={styles.title}>دورك في اللعبة</div>

          {/* card */}
          <div className="card-scene" onClick={() => setFlipped(true)}>
            <div className={`card-3d ${flipped ? 'flipped' : ''}`}>
              <div className={`card-face card-back ${styles.cardFaceBack}`}>
                <div className="card-back-title font-display text-xl text-[var(--color-primary)] tracking-wider uppercase relative z-1">MAFIA</div>
                <div className="card-back-hint text-xs text-[var(--color-text-faint)] tracking-wider uppercase relative z-1">
                  {flipped ? '' : 'اقلب للكشف'}
                </div>
              </div>
              <div className={`card-face card-front ${styles.cardFaceFront}`} style={{
                background: role === 'mafia' ? 'linear-gradient(160deg,#1a0808,#2d0f0f,#1a0808)' :
                  'linear-gradient(160deg,#0a150a,#0f2010,#0a150a)',
                border: role === 'mafia' ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(39,174,96,0.4)',
              }}>
                <div className={styles.roleIconBox} style={{
                  background: role === 'mafia' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)',
                  border: role === 'mafia' ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(39,174,96,0.4)',
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    dangerouslySetInnerHTML={{ __html: rc.icon }}
                  />
                </div>
                <div className={styles.roleTitle} style={{ color: role === 'mafia' ? '#e05555' : '#5dba6e' }}>
                  {rc.label}
                </div>
                <div className={styles.roleDesc}>{rc.description}</div>
                <div className={styles.playerName}>{playerName}</div>
              </div>
            </div>
          </div>

          {!flipped && <p className={styles.hint}>اضغط على البطاقة لرؤية دورك</p>}

          {flipped && (
            <div className={styles.actions}>
              <button onClick={() => router.push(`/room/${code}`)} className={styles.actionBtn}>
                العودة للغرفة
              </button>
              {isHost && (
                <button onClick={async () => {
                  await fetch(`/api/rooms/${code}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset_game' }),
                  });
                  router.push(`/room/${code}`);
                }} className={styles.primaryBtn}>
                  إعادة اللعبة
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameContent />
    </Suspense>
  );
}
