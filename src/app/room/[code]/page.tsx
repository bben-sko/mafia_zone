'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { getSavedPlayer } from '@/lib/player-storage';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { ROLE_SPECIALS, RoleConfig, INITIAL_ROLE_CONFIG } from '@/lib/game-types';
import { ROLES } from '@/lib/roles';

interface Player { id: string; name: string; isHost: boolean; }

import styles from './page.module.css';

/* ---------- toggle switch ---------- */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="toggle" style={{
      position: 'relative', width: '2.75rem', height: '1.5rem', borderRadius: '9999px',
      flexShrink: 0, border: '2px solid transparent', transition: 'all 0.2s',
      backgroundColor: on ? 'var(--color-primary)' : 'var(--color-surface-dynamic)',
      borderColor: on ? 'var(--color-primary)' : 'var(--color-border)',
    }}>
      <span style={{
        position: 'absolute', top: '2px', width: '1rem', height: '1rem', borderRadius: '9999px',
        backgroundColor: 'white', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        left: on ? '4px' : '22px'
      }} />
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

  const kickPlayer = async (targetId: string) => {
    if (!isHost || starting) return;
    try {
      await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kick_player', hostId: playerId, targetId }),
      });
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

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
      router.push(`/room/${code}/game`);
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
    <section className={styles.container} dir="rtl">
      <div className={styles.scrollArea}>
        <div className={styles.inner}>

          {/* room code */}
          <div className={styles.codeBox}>
            <div className={styles.codeLabel}>كود الغرفة</div>
            <div className={styles.codeValue} onClick={() => navigator.clipboard?.writeText(code)}>{code}</div>
          </div>

          <div className={`card-base ${styles.card}`}>
            <div className={styles.cardHeader}>اللاعبون ({players.length})</div>
            <div className={styles.playerList}>
              {players.map(p => (
                <div key={p.id} className={styles.playerItem}>
                  <span className={styles.playerAvatar}>{p.name.charAt(0)}</span>
                  <span className={styles.playerName}>{p.name}</span>
                  {p.isHost && <span className={styles.tagHost}>المضيف</span>}
                  {p.id === playerId && <span className={styles.tagYou}>أنت</span>}
                  {isHost && !p.isHost && p.id !== playerId && (
                    <button 
                      onClick={() => kickPlayer(p.id)} 
                      className={styles.kickBtn}
                      title="طرد اللاعب"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* role summary badges */}
          {players.length >= 4 && (
            <div className={styles.badges}>
              {enabledBadges().map((b, i) => (
                <span key={i} className={styles.badge}>{b}</span>
              ))}
            </div>
          )}

          {/* settings (collapsible, host can edit) */}
          <div className={`card-base ${styles.settingsCard}`}>
            <button type="button" onClick={() => setOpen(!open)} className={styles.settingsBtn}>
              <span>إعدادات الأدوار</span>
              <svg className={`${styles.settingsIcon} ${open ? styles.settingsIconOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {open && (
              <div className={styles.settingsBody}>
                {categoryRoles.map(cat => (
                  <div key={cat.label}>
                    <div className={styles.catLabel}>{cat.label}</div>
                    <div className={styles.roleList}>
                      {cat.roles.map(r => {
                        if (r.id === 'mafia') {
                          return (
                            <div key={r.id} className={styles.roleRow}>
                              <span className={styles.roleLabel}>{r.label}</span>
                              <div className={styles.counter} dir="ltr">
                                <button className={styles.counterBtn}
                                  onClick={() => {
                                    if (!isHost) return;
                                    const v = Math.max(1, settings.mafia - 1);
                                    saveSettings({ ...settings, mafia: v });
                                  }}
                                  disabled={settings.mafia <= 1 || !isHost}
                                >−</button>
                                <span className={styles.counterVal}>{settings.mafia}</span>
                                <button className={styles.counterBtn}
                                  onClick={() => {
                                    if (!isHost) return;
                                    const afterCivil = n - (settings.mafia + 1) - specialsSum;
                                    if (afterCivil < 1) return;
                                    saveSettings({ ...settings, mafia: settings.mafia + 1 });
                                  }}
                                  disabled={!isHost || n - (settings.mafia + 1) - specialsSum < 1}
                                >+</button>
                              </div>
                            </div>
                          );
                        }
                        const on = !!(settings as any)[r.id];
                        return (
                          <div key={r.id} className={styles.roleRow}>
                            <span className={styles.roleLabel}>{r.label}</span>
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
                              <span className={on ? styles.toggleOnText : styles.toggleOffText}>
                                {on ? 'ON' : 'OFF'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>عدد المدنيين المتبقي</span>
                  <span className={styles.summaryVal} style={{ color: n >= 4 && civil < 1 ? 'var(--color-red)' : 'var(--color-green)' }}>
                    {n >= 4 ? civil : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* non-host waiting message */}
          {!isHost && (
            <p className={styles.waitingMsg}>
              انتظر المضيف لبدء اللعبة...
            </p>
          )}
        </div>
      </div>

      {/* fixed bottom action bar */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {players.length < 4 && (
            <p className={styles.warning}>
              انتظر {4 - players.length} لاعبين إضافيين للبدء
            </p>
          )}
          <div className={styles.actions}>
            <button onClick={() => router.push('/')} className={styles.leaveBtn}>مغادرة</button>
            {isHost ? (
              <button onClick={startGame} disabled={!canStart || starting} className={styles.startBtn}>
                {starting ? 'جاري...' : 'ابدأ اللعبة 🎴'}
              </button>
            ) : (
              <div className={styles.waitBox}>بانتظار المضيف للبدء</div>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
}

/* ---------- content ---------- */
function RoomContent() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const savedPlayer = getSavedPlayer();
  const playerId = savedPlayer.id;
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const isPlayerInRoom = data.players.some((p: Player) => p.id === playerId);
      if (!isPlayerInRoom) {
        router.push('/');
        return;
      }

      setPlayers(data.players);
      setGameState(data.gameState || {});
      if (data.status === 'playing') {
        router.push(`/room/${code}/game`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code, router, playerId]);

  useEffect(() => {
    if (!playerId) {
      router.replace(`/room?code=${code}`);
      return;
    }
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [code, playerId]);

  if (!playerId) return null;
  if (loading) return (
    <section className={styles.centerMsg}>
      <p className={styles.summaryLabel}>جاري الاتصال...</p>
    </section>
  );
  if (error) return (
    <section className={styles.errorMsg} dir="rtl">
      <p className={styles.errorText}>{error}</p>
      <button onClick={() => router.push('/')} className={styles.link}>الرجوع للرئيسية</button>
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
