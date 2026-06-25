'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { getSavedPlayer } from '@/lib/player-storage';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { ROLE_SPECIALS, RoleConfig, INITIAL_ROLE_CONFIG } from '@/lib/game-types';
import { ROLES } from '@/lib/roles';

interface Player { id: string; name: string; isHost: boolean; }

/* ---------- toggle switch ---------- */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative w-7 h-[15px] rounded-full transition-colors duration-200 flex-shrink-0 ${
        on ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-dynamic)] border border-[var(--color-border)]'
      }`}
    >
      <span className={`absolute top-[1.5px] w-3 h-3 rounded-full bg-white transition-all duration-200 ${
        on ? 'left-[15px]' : 'left-[1px]'
      }`} />
    </button>
  );
}

/* ---------- room lobby ---------- */
function RoomLobby({ code, playerId, players, isHost, gameState, onUpdate }: {
  code: string; playerId: string; players: Player[]; isHost: boolean;
  gameState: Record<string, any>; onUpdate: () => void;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoleConfig>(
    gameState?.settings || { ...INITIAL_ROLE_CONFIG }
  );
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const n = players.length;
  const spec = (r: string) => (settings as any)[r] ? 1 : 0;
  const specialsSum = ROLE_SPECIALS.reduce((s, r) => s + spec(r), 0);
  const civil = n - settings.mafia - specialsSum;
  const canStart = n >= 4 && civil >= 1 && settings.mafia < n - settings.mafia;

  const saveSettings = useCallback(async (newSettings: RoleConfig) => {
    setSettings(newSettings);
    try {
      await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', settings: newSettings }),
      });
    } catch {}
  }, [code]);

  const startGame = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_game' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Navigate to game page
      router.push(`/room/${code}/game?playerId=${playerId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStarting(false);
    }
  };

  const categoryRoles: { label: string; roles: { id: string; label: string }[] }[] = [
    { label: 'Core', roles: [
      { id: 'mafia', label: 'المافيا' }, { id: 'detective', label: 'المحقق' },
      { id: 'doctor', label: 'الطبيب' }, { id: 'chouafa', label: 'الشوافة' },
      { id: 'laadoul', label: 'العَدول' },
    ]},
    { label: 'Support', roles: [
      { id: 'spy', label: 'الجاسوس' }, { id: 'mayor', label: 'العمدة' },
      { id: 'guard', label: 'الحارس' }, { id: 'oracle', label: 'العراف' },
    ]},
    { label: 'Special', roles: [
      { id: 'avenger', label: 'المنتقم' }, { id: 'mirror', label: 'المرآة' },
      { id: 'witch', label: 'الساحرة' },
    ]},
    { label: 'Neutral', roles: [
      { id: 'madman', label: 'المجنون' }, { id: 'loneWolf', label: 'الذئب الوحيد' },
      { id: 'impostor', label: 'المتنكر' },
    ]},
  ];

  const enabledBadges = () => {
    const badges: string[] = [];
    badges.push(`${ROLES.mafia.label}×${settings.mafia}`);
    ROLE_SPECIALS.filter(r => (settings as any)[r]).forEach(r => badges.push(`${ROLES[r].label}×1`));
    if (civil > 0) badges.push(`مدني×${civil}`);
    return badges;
  };

  return (
    <section className="flex flex-col h-dvh relative z-1" dir="rtl">
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
        <div className="max-w-[400px] mx-auto flex flex-col gap-3">

          {/* room code */}
          <div className="text-center">
            <div className="text-[10px] text-[var(--color-text-faint)] tracking-wider uppercase mb-1">كود الغرفة</div>
            <div className="font-display text-4xl tracking-[0.15em] text-[var(--color-primary)] select-all cursor-pointer"
              onClick={() => navigator.clipboard?.writeText(code)}
            >{code}</div>
          </div>

          {/* players */}
          <div className="border border-[var(--color-border)] rounded-md p-2.5">
            <div className="text-[10px] text-[var(--color-text-faint)] font-semibold tracking-wider uppercase mb-1.5">
              اللاعبون ({players.length})
            </div>
            <div className="flex flex-col gap-1">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm text-xs">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary-highlight)] border border-[var(--color-primary)] flex items-center justify-center text-[8px] font-bold text-[var(--color-primary)] flex-shrink-0">
                    {p.name.charAt(0)}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  {p.isHost && <span className="text-[9px] text-[var(--color-primary)]">المضيف</span>}
                  {p.id === playerId && <span className="text-[9px] text-[var(--color-text-faint)]">أنت</span>}
                </div>
              ))}
            </div>
          </div>

          {/* role summary badges */}
          {players.length >= 4 && (
            <div className="flex flex-wrap gap-1">
              {enabledBadges().map((b, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {b}
                </span>
              ))}
            </div>
          )}

          {/* settings (collapsible, host can edit) */}
          <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
            <button type="button" onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-offset)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>إعدادات الأدوار</span>
                {!open && (
                  <span className="text-[9px] text-[var(--color-text-faint)] font-normal normal-case">
                    ({enabledBadges().join(' · ')})
                  </span>
                )}
              </div>
              <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {open && (
              <div className="px-2.5 py-1.5 space-y-2">
                {categoryRoles.map(cat => (
                  <div key={cat.label}>
                    <div className="text-[9px] text-[var(--color-text-faint)] mb-1">{cat.label}</div>
                    {cat.roles.map(r => {
                      if (r.id === 'mafia') {
                        return (
                          <div key={r.id} className="flex items-center justify-between py-0.5">
                            <span className="text-[10px] text-[var(--color-text-muted)]">{r.label}</span>
                            <div className="flex items-center gap-1.5">
                              <button className="w-4 h-4 rounded-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[8px] flex items-center justify-center font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (!isHost) return;
                                  const v = Math.max(1, settings.mafia - 1);
                                  saveSettings({ ...settings, mafia: v });
                                }}
                                disabled={settings.mafia <= 1 || !isHost}
                              >−</button>
                              <span className="font-display text-[11px] text-[var(--color-primary)] min-w-[16px] text-center">{settings.mafia}</span>
                              <button className="w-4 h-4 rounded-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[8px] flex items-center justify-center font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (!isHost) return;
                                  const afterCivil = n - (settings.mafia + 1) - specialsSum;
                                  if (afterCivil < 1) return;
                                  saveSettings({ ...settings, mafia: settings.mafia + 1 });
                                }}
                                disabled={
                                  !isHost || n - (settings.mafia + 1) - specialsSum < 1
                                }
                              >+</button>
                            </div>
                          </div>
                        );
                      }
                      const on = !!(settings as any)[r.id];
                      return (
                        <div key={r.id} className="flex items-center justify-between py-0.5">
                          <span className="text-[10px] text-[var(--color-text-muted)]">{r.label}</span>
                          {isHost ? (
                            <Toggle on={on} onChange={() => {
                              const newS = { ...settings, [r.id]: !on };
                              if (!on) {
                                const s = ROLE_SPECIALS.reduce((sum, role) => sum + ((role === r.id ? true : (newS as any)[role]) ? 1 : 0), 0);
                                const c = n - newS.mafia - s;
                                if (c < 1 && newS.mafia > 1) newS.mafia = Math.max(1, newS.mafia + c - 1);
                              }
                              saveSettings(newS);
                            }} />
                          ) : (
                            <span className={`text-[9px] ${on ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-faint)]'}`}>
                              {on ? 'ON' : 'OFF'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="border-t border-[var(--color-divider)] pt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-[var(--color-text-faint)]">مدنيين</span>
                  <span className="font-display text-[11px]" style={{ color: n >= 4 && civil < 1 ? 'var(--color-red-hover)' : 'var(--color-text-muted)' }}>
                    {n >= 4 ? civil : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* non-host waiting message */}
          {!isHost && (
            <p className="text-center text-[10px] text-[var(--color-text-faint)] py-2">
              انتظر المضيف لبدء اللعبة...
            </p>
          )}
        </div>
      </div>

      {/* sticky bottom */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="max-w-[400px] mx-auto flex flex-col gap-2">
          {players.length < 4 && (
            <p className="text-[10px] text-[var(--color-amber)] text-center">
              انتظر {4 - players.length} لاعبين إضافيين
            </p>
          )}
          <div className="flex gap-2">
            {isHost ? (
              <button onClick={startGame} disabled={!canStart || starting}
                className="flex-1 py-2.5 px-6 text-xs font-semibold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'جاري...' : 'ابدأ اللعبة 🎴'}
              </button>
            ) : (
              <div className="flex-1" />
            )}
            <button onClick={() => router.push('/')}
              className="px-4 py-2.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-transparent text-[var(--color-text-faint)] border border-[var(--color-border)] hover:text-[var(--color-text-muted)] transition-all"
            >مغادرة</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- content ---------- */
function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const playerId = searchParams.get('playerId');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlayers(data.players);
      setGameState(data.gameState || {});
      if (data.status === 'playing') {
        router.push(`/room/${code}/game?playerId=${playerId}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code, playerId, router]);

  useEffect(() => {
    if (!playerId) {
      const saved = getSavedPlayer();
      if (saved.id) {
        router.replace(`/room/${code}?playerId=${saved.id}`);
        return;
      }
      router.replace(`/room?code=${code}`);
      return;
    }
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [code, playerId]);

  if (!playerId) return null;
  if (loading) return (
    <section className="flex items-center justify-center min-h-dvh">
      <p className="text-sm text-[var(--color-text-faint)]">جاري الاتصال...</p>
    </section>
  );
  if (error) return (
    <section className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6" dir="rtl">
      <p className="text-sm text-[var(--color-red-hover)]">{error}</p>
      <button onClick={() => router.push('/')} className="text-xs text-[var(--color-text-faint)] underline">الرجوع للرئيسية</button>
    </section>
  );

  const currentPlayer = players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;

  return (
    <RoomLobby code={code} playerId={playerId} players={players} isHost={isHost}
      gameState={gameState} onUpdate={fetchRoom}
    />
  );
}

export default function RoomPage() {
  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <Suspense fallback={null}>
        <RoomContent />
      </Suspense>
    </>
  );
}
