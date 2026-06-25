'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button, Input, Modal, TeamBadge } from '@/components/ui';
import { RoleConfig } from '@/lib/game-types';
import { ROLE_INFO } from '@/lib/roles';
import styles from './setup.module.css';

/* ---------- data ---------- */

type Preset = 'classic' | 'advanced' | 'chaos' | 'custom';

const PRESET_CONFIGS: Record<Exclude<Preset, 'custom'>, Partial<RoleConfig>> = {
  classic: { mafia: 1, detective: true, doctor: true, chouafa: false, laadoul: false, spy: false, mayor: false, guard: false, oracle: false, avenger: false, mirror: false, witch: false, madman: false, loneWolf: false, impostor: false },
  advanced: { mafia: 1, detective: true, doctor: true, chouafa: true, laadoul: true, spy: false, mayor: false, guard: false, oracle: false, avenger: false, mirror: false, witch: false, madman: false, loneWolf: false, impostor: false },
  chaos: { mafia: 2, detective: true, doctor: true, chouafa: true, laadoul: true, spy: true, mayor: true, guard: true, oracle: true, avenger: true, mirror: true, witch: true, madman: true, loneWolf: true, impostor: true },
};

interface CatRole {
  id: string; label: string; color: string; hasCounter?: boolean;
}

const PRESET_LABELS: Record<Preset, string> = {
  classic: 'كلاسيكي',
  advanced: 'متقدم',
  chaos: 'فوضى',
  custom: 'حر',
};

const PRESET_DESCRIPTIONS: Record<Preset, string> = {
  classic: 'بداية متوازنة',
  advanced: 'أدوار تحقيق أكثر',
  chaos: 'كل شيء مفتوح',
  custom: 'اختيار يدوي',
};

const CATEGORIES: { label: string; key: string; hint: string; defaultOpen: boolean; roles: CatRole[] }[] = [
  { label: 'Core Roles', key: 'core', hint: 'الأدوار الأساسية', defaultOpen: true, roles: [
    { id: 'mafia', label: 'المافيا', color: 'var(--color-red)', hasCounter: true },
    { id: 'detective', label: 'المحقق', color: 'var(--color-blue)' },
    { id: 'doctor', label: 'الطبيب', color: 'var(--color-amber)' },
    { id: 'chouafa', label: 'الشوافة', color: 'var(--color-teal)' },
    { id: 'laadoul', label: 'العَدول', color: 'var(--color-rose)' },
  ]},
  { label: 'Support Roles', key: 'support', hint: 'مساعدة وتحكم', defaultOpen: false, roles: [
    { id: 'spy', label: 'الجاسوس', color: '#2ecc71' },
    { id: 'mayor', label: 'العمدة', color: 'var(--color-primary)' },
    { id: 'guard', label: 'الحارس', color: '#3498db' },
    { id: 'oracle', label: 'العراف', color: '#8e44ad' },
  ]},
  { label: 'Special Roles', key: 'special', hint: 'قدرات مفاجئة', defaultOpen: false, roles: [
    { id: 'avenger', label: 'المنتقم', color: 'var(--color-red)' },
    { id: 'mirror', label: 'المرآة', color: '#bdc3c7' },
    { id: 'witch', label: 'الساحرة', color: '#1abc9c' },
  ]},
  { label: 'Neutral Roles', key: 'neutral', hint: 'أهداف مستقلة', defaultOpen: false, roles: [
    { id: 'madman', label: 'المجنون', color: '#95a5a6' },
    { id: 'loneWolf', label: 'الذئب الوحيد', color: '#7f8c8d' },
    { id: 'impostor', label: 'المتنكر', color: '#9b59b6' },
  ]},
];

/* ---------- components ---------- */

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`}
    >
      <span className={`${styles.toggleKnob} ${on ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
    </button>
  );
}

function Panel({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card-base ${className}`} style={style}>
      {children}
    </div>
  );
}

function PanelTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className={styles.rolesHeader} style={{borderBottom: 'none', paddingBottom: 0}}>
      <h2 className={styles.rolesTitle}>{title}</h2>
      {meta && <span className={styles.catCount}>{meta}</span>}
    </div>
  );
}

function Category({ cat, n, specials, onInfo, onCustom }: {
  cat: typeof CATEGORIES[number]; n: number; specials: number;
  onInfo: () => void; onCustom: () => void;
}) {
  const [open, setOpen] = useState(cat.defaultOpen);
  const { state, dispatch } = useGame();

  const enabled = cat.roles.filter(r => {
    if (r.hasCounter) return state.roleConfig.mafia > 0;
    return state.roleConfig[r.id as keyof typeof state.roleConfig];
  }).length;

  return (
    <div className={styles.catWrapper}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.catHeader}
        aria-expanded={open}
      >
        <div className={styles.catHeaderLeft}>
          <div className={styles.catHeaderRow}>
            <span className={styles.catLabel}>{cat.label}</span>
            <span className={styles.catCount}>{enabled}/{cat.roles.length}</span>
          </div>
          <div className={styles.catHint}>{cat.hint}</div>
        </div>
        <svg className={`${styles.catIcon} ${open ? styles.catIconOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={styles.catBody}>
          {cat.roles.map(role => {
            if (role.hasCounter) {
              return (
                <div key={role.id} className={styles.roleRow}>
                  <div className={styles.roleLeft}>
                    <span className={styles.roleDot} style={{ background: role.color }} />
                    <span className={styles.roleLabel}>{role.label}</span>
                  </div>
                  <div className={styles.roleRight} dir="ltr">
                    <button
                      className={styles.counterBtn}
                      onClick={() => { onCustom(); dispatch({ type: 'CHANGE_MAFIA', delta: -1 }); }}
                      disabled={state.roleConfig.mafia <= 1}
                      aria-label="نقص المافيا"
                    >−</button>
                    <span className={styles.counterVal}>{state.roleConfig.mafia}</span>
                    <button
                      className={styles.counterBtn}
                      onClick={() => { onCustom(); dispatch({ type: 'CHANGE_MAFIA', delta: 1 }); }}
                      disabled={n - (state.roleConfig.mafia + 1) - specials < 1}
                      aria-label="زيد المافيا"
                    >+</button>
                  </div>
                </div>
              );
            }
            const on = state.roleConfig[role.id as keyof typeof state.roleConfig];
            return (
              <div key={role.id} className={styles.roleRow}>
                <div className={styles.roleLeft}>
                  <span className={styles.roleDot} style={{ background: role.color }} />
                  <span className={styles.roleLabel}>{role.label}</span>
                </div>
                <div className={styles.roleRight}>
                  <button
                    type="button"
                    className={styles.roleInfoBtn}
                    onClick={onInfo}
                    aria-label={`معلومات عن ${role.label}`}
                    title="معلومات عن الدور"
                  >i</button>
                  <Toggle on={!!on} onChange={() => {
                    onCustom();
                    dispatch({ type: 'TOGGLE_ROLE', role: role.id });
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- main ---------- */

export default function Setup() {
  const { state, dispatch, getCivilCount: getCivil, countSpecials } = useGame();
  const [inputVal, setInputVal] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>('classic');
  const [activeTab, setActiveTab] = useState<'players' | 'roles'>('players');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'players') {
      inputRef.current?.focus();
    }
  }, [activeTab]);

  const addPlayer = () => {
    const name = inputVal.trim();
    if (!name) return;
    if (state.players.includes(name)) {
      gsap.to(inputRef.current, { x: -5, duration: 0.08, ease: 'power1.inOut', yoyo: true, repeat: 4, onComplete: () => gsap.set(inputRef.current, { x: 0 }) });
      return;
    }
    dispatch({ type: 'ADD_PLAYER', name });
    setInputVal('');
    inputRef.current?.focus();
  };

  const n = state.players.length;
  const civil = getCivil();
  const specials = countSpecials();
  const canStart = n >= 4 && civil >= 1 && state.roleConfig.mafia < n - state.roleConfig.mafia;
  const minPlayersRemaining = Math.max(0, 4 - n);

  let warning = '';
  if (n < 4) warning = `خاصك ${minPlayersRemaining} لاعبين`;
  else if (civil < 1) warning = '⚠ مدنيين ماكاينش! زيد لاعبين أو نقص المافيا';
  else if (state.roleConfig.mafia >= n - state.roleConfig.mafia) warning = '⚠ المافيا أكثر من المدنيين!';

  return (
    <section className={styles.container} dir="rtl">
      <div className={styles.inner}>
        
        {/* Header Details */}
        <header className={styles.header}>
          <div className={styles.headerSub}>
            <span className={styles.headerSubLine} />
            Mafia Setup
          </div>
          <h1 className={styles.headerTitle}>إعداد اللعبة</h1>
        </header>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('players')}
            className={`${styles.tabBtn} ${activeTab === 'players' ? styles.tabBtnActive : ''}`}
          >
            اللاعبون ({n})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`${styles.tabBtn} ${activeTab === 'roles' ? styles.tabBtnActive : ''}`}
          >
            الأدوار ({state.roleConfig.mafia + specials})
          </button>
        </div>

        {/* Tab Content: PLAYERS */}
        {activeTab === 'players' && (
          <div className={styles.tabContent}>
            <Panel style={{padding: '1.25rem'}}>
              <div className={styles.inputGroup}>
                <Input
                  ref={inputRef}
                  maxLength={30}
                  value={inputVal}
                  placeholder="اسم اللاعب الجديد..."
                  style={{flex: 1, minWidth: 0}}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
                />
                <Button size="sm" onClick={addPlayer} style={{padding: '0 1rem', flexShrink: 0}}>إضافة</Button>
              </div>

              <div className={styles.playerList}>
                {state.players.length > 0 ? (
                  state.players.map((p, i) => (
                    <div key={i} className={styles.playerItem}>
                      <span className={styles.playerAvatar}>{p.charAt(0)}</span>
                      <span className={styles.playerName}>{p}</span>
                      <button onClick={() => dispatch({ type: 'REMOVE_PLAYER', index: i })} className={styles.playerRemove} aria-label={`حذف ${p}`}>×</button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyPlayers}>أضف 4 لاعبين على الأقل</div>
                )}
              </div>
            </Panel>
            
            <Button variant="outline" onClick={() => setActiveTab('roles')} style={{width: '100%', borderStyle: 'dashed'}}>
              متابعة لاختيار الأدوار ←
            </Button>
          </div>
        )}

        {/* Tab Content: ROLES */}
        {activeTab === 'roles' && (
          <div className={styles.tabContent}>
            <Panel style={{padding: '1.25rem'}}>
              <PanelTitle title="وضع اللعبة" />
              <div className={styles.grid2}>
                {(['classic', 'advanced', 'chaos', 'custom'] as Preset[]).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      if (p === 'custom') { setPreset(p); return; }
                      setPreset(p); dispatch({ type: 'APPLY_PRESET', config: PRESET_CONFIGS[p] });
                    }}
                    className={`${styles.presetBtn} ${preset === p ? styles.presetBtnActive : ''}`}
                    aria-pressed={preset === p}
                  >
                    <span className={styles.presetLabel}>{PRESET_LABELS[p]}</span>
                    <span className={styles.presetDesc}>{PRESET_DESCRIPTIONS[p]}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className={styles.rolesPanel}>
              <div className={styles.rolesHeader}>
                <h2 className={styles.rolesTitle}>الأدوار</h2>
                <button type="button" onClick={() => setModalOpen(true)} className={styles.infoBtn}>شرح الأدوار</button>
              </div>

              <div className={styles.rolesBody}>
                {CATEGORIES.map(cat => (
                  <Category key={cat.key} cat={cat} n={n} specials={specials} onInfo={() => setModalOpen(true)} onCustom={() => setPreset('custom')} />
                ))}
              </div>
            </Panel>
            
            {/* Quick summary before start */}
            <Panel style={{padding: '1.25rem'}}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>إجمالي اللاعبين</span>
                <span className={`${styles.summaryVal} ${styles.summaryValText}`}>{n}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>المدنيون</span>
                <span className={`${styles.summaryVal}`} style={{ color: n >= 4 && civil < 1 ? 'var(--color-red-hover)' : 'var(--color-green)' }}>
                  {n >= 4 ? civil : '—'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>المافيا والأدوار</span>
                <span className={`${styles.summaryVal} ${styles.summaryValRed}`}>{state.roleConfig.mafia + specials}</span>
              </div>
            </Panel>
          </div>
        )}

      </div>

      {/* Fixed Bottom Action Bar */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {!canStart && (
            <div className={styles.warning}>{warning}</div>
          )}
          <div className={styles.footerActions}>
            <Button variant="outline" size="sm" style={{flexBasis: '30%'}} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'lobby' })}>رجوع</Button>
            <Button size="sm" style={{flex: 1}} onClick={() => dispatch({ type: 'START_GAME' })} disabled={!canStart}>ابدأ التوزيع</Button>
          </div>
        </div>
      </footer>

      {/* ===== MODAL ===== */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="شرح الأدوار">
        <div>
          {Object.keys(ROLE_INFO).map(key => {
            const r = ROLE_INFO[key];
            return (
              <div key={key} className={styles.modalItem}>
                <div className={styles.modalItemHeader}>
                  <span className={styles.modalItemEmoji}>{r.emoji}</span>
                  <span className={styles.modalItemTitle}>{r.label}</span>
                  <TeamBadge teamClass={r.teamClass}>{r.team}</TeamBadge>
                </div>
                <div>
                  <div className={styles.modalItemSection}>
                    <div className={styles.modalItemSectionTitle}>⚡ القدرة</div>
                    <div className={styles.modalItemSectionText}>{r.ability}</div>
                  </div>
                  <div className={styles.modalItemSection}>
                    <div className={styles.modalItemSectionTitle}>🏆 شروط الربح</div>
                    <div className={styles.modalItemSectionText}>{r.winCondition}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </section>
  );
}
