'use client';

import { useEffect, useRef, useState } from 'react';
import { ROLE_INFO } from '@/lib/roles';

export default function RoleTooltip({ roleKey, buttonRef }: { roleKey: string; buttonRef: React.RefObject<HTMLButtonElement | null> }) {
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [visible, setVisible] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const r = ROLE_INFO[roleKey];

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const show = () => {
      const rect = btn.getBoundingClientRect();
      const tipW = Math.min(300, window.innerWidth - 32);
      let left = rect.left + rect.width / 2 - tipW / 2;
      let top = rect.bottom + 8;
      if (left < 16) left = 16;
      if (left + tipW > window.innerWidth - 16) left = window.innerWidth - 16 - tipW;
      if (top + 200 > window.innerHeight) top = rect.top - 8 - 200;
      setPos({ left, top });
      setVisible(true);
    };
    const hide = () => setVisible(false);
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('mouseleave', hide);
    return () => {
      btn.removeEventListener('mouseenter', show);
      btn.removeEventListener('mouseleave', hide);
    };
  }, [buttonRef, roleKey]);

  const teamStyles: Record<string, string> = {
    'team-mafia': 'bg-[var(--color-red-highlight)] text-[var(--color-red-hover)]',
    'team-civil': 'bg-[rgba(39,174,96,0.15)] text-[#6dbf7a]',
    'team-neutral': 'bg-[rgba(189,195,199,0.15)] text-[#bdc3c7]',
  };

  if (!r) return null;

  return (
    <div
      ref={tipRef}
      className={`fixed z-[10001] bg-[var(--color-surface-offset)] border border-[var(--color-border)] rounded-md p-4 shadow-lg transition-opacity duration-200 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ left: pos.left, top: pos.top, maxWidth: Math.min(300, window.innerWidth - 32) }}
    >
      <div className="font-display text-base text-[var(--color-primary)] mb-2 flex items-center gap-2">
        {r.emoji} {r.label} — <span className={`text-xs px-2 py-[2px] rounded-full ${teamStyles[r.teamClass] || ''}`}>{r.team}</span>
      </div>
      <div className="text-sm text-[var(--color-text-muted)] leading-relaxed">{r.description}</div>
    </div>
  );
}
