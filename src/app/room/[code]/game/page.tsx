'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { ROLES } from '@/lib/roles';
import { RoleKey } from '@/lib/game-types';
import { getSavedPlayer } from '@/lib/player-storage';

interface Player { id: string; name: string; isHost: boolean; }

function GameContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const playerId = searchParams.get('playerId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<RoleKey | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!playerId) {
      const saved = getSavedPlayer();
      if (saved.id) {
        router.replace(`/room/${code}/game?playerId=${saved.id}`);
        return;
      }
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
          router.push(`/room/${code}?playerId=${playerId}`);
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
    <section className="flex items-center justify-center min-h-dvh">
      <p className="text-sm text-[var(--color-text-faint)]">جاري تحميل دورك...</p>
    </section>
  );
  if (error || !role) return (
    <section className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6" dir="rtl">
      <p className="text-sm text-[var(--color-red-hover)]">{error || 'لم يتم العثور على الدور'}</p>
      <button onClick={() => router.push('/')} className="text-xs text-[var(--color-text-faint)] underline">الرجوع</button>
    </section>
  );

  const rc = ROLES[role];

  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <section className="flex flex-col items-center justify-center min-h-dvh px-6" dir="rtl">
        <div className="max-w-[320px] w-full text-center relative z-1 flex flex-col items-center gap-6">
          <div className="text-xs text-[var(--color-text-faint)] tracking-wider uppercase">
            دورك في اللعبة
          </div>

          {/* card */}
          <div className={`card-scene ${flipped ? '' : ''}`} onClick={() => setFlipped(true)}>
            <div className={`card-3d ${flipped ? 'flipped' : ''}`}>
              <div className="card-face card-back">
                <div className="card-back-pattern" />
                <div className="card-back-title font-display text-xl text-[var(--color-primary)] tracking-wider uppercase relative z-1">MAFIA</div>
                <div className="card-back-hint text-xs text-[var(--color-text-faint)] tracking-wider uppercase relative z-1">
                  {flipped ? '' : 'اقلب للكشف'}
                </div>
              </div>
              <div className="card-face card-front" style={{
                background: role === 'mafia' ? 'linear-gradient(160deg,#1a0808,#2d0f0f,#1a0808)' :
                  'linear-gradient(160deg,#0a150a,#0f2010,#0a150a)',
                border: role === 'mafia' ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(39,174,96,0.4)',
              }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                  background: role === 'mafia' ? 'rgba(192,57,43,0.2)' : 'rgba(39,174,96,0.2)',
                  border: role === 'mafia' ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(39,174,96,0.4)',
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    dangerouslySetInnerHTML={{ __html: rc.icon }}
                  />
                </div>
                <div className="font-display text-xl font-bold text-center tracking-wider"
                  style={{ color: role === 'mafia' ? '#e05555' : '#5dba6e' }}
                >
                  {rc.label}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed px-4">
                  {rc.description}
                </div>
                <div className="text-xs text-[var(--color-text-faint)] tracking-wider uppercase pt-2 px-4 border-t border-[var(--color-divider)] w-full text-center">
                  {playerName}
                </div>
              </div>
            </div>
          </div>

          {!flipped && (
            <p className="text-xs text-[var(--color-text-muted)]">اضغط على البطاقة لرؤية دورك</p>
          )}

          {flipped && (
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <button onClick={() => router.push(`/room/${code}?playerId=${playerId}`)}
                className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase rounded-md bg-transparent text-[var(--color-text-faint)] border border-[var(--color-border)] hover:text-[var(--color-text-muted)] transition-all"
              >
                العودة للغرفة
              </button>
              {isHost && (
                <button onClick={async () => {
                  await fetch(`/api/rooms/${code}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset_game' }),
                  });
                  router.push(`/room/${code}?playerId=${playerId}`);
                }}
                  className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] transition-all"
                >
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
