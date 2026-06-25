'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGame } from '@/context/game-context';
import { Button, Modal, TeamBadge } from '@/components/ui';
import { RoleConfig } from '@/lib/game-types';
import { ROLE_INFO } from '@/lib/roles';

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
      className={`relative h-6 w-11 flex-shrink-0 rounded-full border transition-colors duration-200 ${
        on ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border)] bg-[var(--color-surface-dynamic)]'
      }`}
    >
      <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
        on ? 'left-[3px]' : 'left-[21px]'
      }`} />
    </button>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-[var(--color-border)] bg-[rgba(20,18,16,0.74)] shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function PanelTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-xl text-[var(--color-primary)]">{title}</h2>
      {meta && <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)] tabular-nums">{meta}</span>}
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
    <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(26,24,22,0.68)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-start transition-colors duration-150 hover:bg-[var(--color-surface-offset)]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">{cat.label}</span>
            <span className="rounded-full bg-[var(--color-surface-dynamic)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)] tabular-nums">
              {enabled}/{cat.roles.length}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-text-faint)]">{cat.hint}</div>
        </div>
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="divide-y divide-[var(--color-divider)] border-t border-[var(--color-border)]">
          {cat.roles.map(role => {
            if (role.hasCounter) {
              return (
                <div key={role.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: role.color }} />
                    <span className="truncate text-sm text-[var(--color-text)]">{role.label}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2" dir="ltr">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-base font-bold text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => {
                        onCustom();
                        dispatch({ type: 'CHANGE_MAFIA', delta: -1 });
                      }}
                      disabled={state.roleConfig.mafia <= 1}
                      aria-label="نقص المافيا"
                    >−</button>
                    <span className="min-w-8 text-center font-display text-lg leading-none text-[var(--color-primary)] tabular-nums">{state.roleConfig.mafia}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-base font-bold text-[var(--color-text)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => {
                        onCustom();
                        dispatch({ type: 'CHANGE_MAFIA', delta: 1 });
                      }}
                      disabled={n - (state.roleConfig.mafia + 1) - specials < 1}
                      aria-label="زيد المافيا"
                    >+</button>
                  </div>
                </div>
              );
            }
            const on = state.roleConfig[role.id as keyof typeof state.roleConfig];
            return (
              <div key={role.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: role.color }} />
                  <span className="truncate text-sm text-[var(--color-text)]">{role.label}</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <section className="relative z-10 min-h-dvh px-4 py-5 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="mb-5 flex flex-col gap-4 border-b border-[var(--color-divider)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              <span className="h-px w-10 bg-[var(--color-primary)] opacity-60" />
              Mafia
            </div>
            <h1 className="font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-none text-[var(--color-text)]">إعداد اللعبة</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-md border border-[var(--color-border)] bg-[rgba(20,18,16,0.68)] px-3 py-2 text-center">
              <div className="text-[11px] text-[var(--color-text-faint)]">اللاعبون</div>
              <div className="font-display text-xl text-[var(--color-primary)] tabular-nums">{n}/12</div>
            </div>
            <div className="rounded-md border border-[var(--color-border)] bg-[rgba(20,18,16,0.68)] px-3 py-2 text-center">
              <div className="text-[11px] text-[var(--color-text-faint)]">المافيا</div>
              <div className="font-display text-xl text-[var(--color-red-hover)] tabular-nums">{state.roleConfig.mafia}</div>
            </div>
            <div className="rounded-md border border-[var(--color-border)] bg-[rgba(20,18,16,0.68)] px-3 py-2 text-center">
              <div className="text-[11px] text-[var(--color-text-faint)]">المدنيون</div>
              <div className="font-display text-xl tabular-nums" style={{ color: n >= 4 && civil < 1 ? 'var(--color-red-hover)' : 'var(--color-green)' }}>
                {n >= 4 ? civil : '—'}
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(330px,0.9fr)_minmax(0,1.35fr)]">
          <div className="flex flex-col gap-5">
            <Panel className="p-4 sm:p-5">
              <PanelTitle title="اللاعبون" meta={`${n}/12`} />
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-all duration-[180ms] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_2px_rgba(200,169,110,0.2)]"
                  placeholder="اسم اللاعب..."
                  maxLength={30}
                  value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
              />
                <button
                  onClick={addPlayer}
                  className="flex-shrink-0 rounded-md bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-text-inverse)] transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
                >
                  إضافة
                </button>
              </div>

              <div className="mt-4 min-h-[104px]">
                {state.players.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {state.players.map((p, i) => (
                      <div
                        key={i}
                        className="flex min-w-0 items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-highlight)] font-display text-sm text-[var(--color-primary)]">
                          {p.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">{p}</span>
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_PLAYER', index: i })}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-red-highlight)] hover:text-[var(--color-red-hover)]"
                          aria-label={`حذف ${p}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[104px] items-center justify-center rounded-md border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-faint)]">
                    أضف 4 لاعبين على الأقل
                  </div>
                )}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <PanelTitle title="وضع اللعبة" />
              <div className="grid grid-cols-2 gap-2">
                {(['classic', 'advanced', 'chaos', 'custom'] as Preset[]).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      if (p === 'custom') {
                        setPreset(p);
                        return;
                      }
                      setPreset(p);
                      dispatch({ type: 'APPLY_PRESET', config: PRESET_CONFIGS[p] });
                    }}
                    className={`min-h-[74px] rounded-md border px-3 py-3 text-start transition-all duration-150 ${
                      preset === p
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)] shadow-[0_0_0_1px_rgba(200,169,110,0.14)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                    }`}
                    aria-pressed={preset === p}
                  >
                    <span className="block text-sm font-semibold">{PRESET_LABELS[p]}</span>
                    <span className="mt-1 block text-xs text-[var(--color-text-faint)]">{PRESET_DESCRIPTIONS[p]}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <PanelTitle title="الجاهزية" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-text-muted)]">الأدوار الخاصة</span>
                  <span className="font-display text-lg text-[var(--color-primary)] tabular-nums">{specials}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-text-muted)]">المدنيون</span>
                  <span className="font-display text-lg tabular-nums" style={{ color: n >= 4 && civil < 1 ? 'var(--color-red-hover)' : 'var(--color-green)' }}>
                    {n >= 4 ? civil : '—'}
                  </span>
                </div>
                <div className={`rounded-md px-3 py-2 text-sm ${canStart ? 'bg-[rgba(39,174,96,0.12)] text-[#78d08c]' : 'bg-[var(--color-red-highlight)] text-[var(--color-red-hover)]'}`}>
                  {canStart ? 'جاهز للتوزيع' : warning}
                </div>
              </div>
            </Panel>
          </div>

          <Panel className="flex flex-col overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="font-display text-2xl text-[var(--color-primary)]">الأدوار</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">اختار التوازن قبل توزيع البطاقات.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                شرح الأدوار
              </button>
            </div>

            <div className="flex-1 space-y-3 p-4 sm:p-5">
              {CATEGORIES.map(cat => (
                <Category
                  key={cat.key}
                  cat={cat}
                  n={n}
                  specials={specials}
                  onInfo={() => setModalOpen(true)}
                  onCustom={() => setPreset('custom')}
                />
              ))}
            </div>
          </Panel>
        </div>

        <footer className="sticky bottom-0 z-20 mt-5 border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(13,12,11,0.72),var(--color-bg)_42%)] py-4 backdrop-blur-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-[var(--color-text-muted)]">
              {canStart ? 'كل شيء مضبوط. مرر الهاتف بعد كل بطاقة.' : warning}
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                className="flex-1 !px-8 !py-3 !text-sm md:flex-none"
                onClick={() => dispatch({ type: 'START_GAME' })}
                disabled={!canStart}
              >
                ابدأ التوزيع
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="!px-5 !py-3 !text-sm"
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'lobby' })}
              >
                رجوع
              </Button>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== MODAL ===== */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="شرح الأدوار">
        {Object.keys(ROLE_INFO).map(key => {
          const r = ROLE_INFO[key];
          return (
            <div key={key} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md p-2.5 mb-1.5 last:mb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base w-7 text-center flex-shrink-0">{r.emoji}</span>
                <span className="font-display text-xs text-[var(--color-text)] font-bold flex-1">{r.label}</span>
                <TeamBadge teamClass={r.teamClass}>{r.team}</TeamBadge>
              </div>
              <div className="space-y-1">
                <div>
                  <div className="text-[9px] text-[var(--color-primary)] font-semibold tracking-wider uppercase">⚡ القدرة</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{r.ability}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[var(--color-primary)] font-semibold tracking-wider uppercase">🏆 شروط الربح</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{r.winCondition}</div>
                </div>
              </div>
            </div>
          );
        })}
      </Modal>
    </section>
  );
}
