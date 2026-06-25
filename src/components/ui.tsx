'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

type BtnVariant = 'primary' | 'ghost' | 'danger';
type BtnSize = 'default' | 'lg' | 'sm';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'default', children, className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase rounded-md transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden select-none';
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    ghost: 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]',
    danger: 'bg-[var(--color-red)] text-white hover:bg-[var(--color-red-hover)]',
  };
  const sizes: Record<BtnSize, string> = {
    default: 'px-8 py-3 text-sm',
    lg: 'px-12 py-4 text-base',
    sm: 'px-5 py-2 text-xs',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

type BadgeVariant = 'mafia' | 'civil' | 'detective' | 'doctor' | 'chouafa' | 'laadoul' | 'spy' | 'mayor' | 'avenger' | 'impostor' | 'madman' | 'oracle' | 'mirror' | 'guard' | 'witch' | 'loneWolf';

const badgeStyles: Record<BadgeVariant, string> = {
  mafia: 'bg-[var(--color-red-highlight)] text-[var(--color-red-hover)] border border-[rgba(192,57,43,0.3)]',
  civil: 'bg-[rgba(39,174,96,0.15)] text-[#6dbf7a] border border-[rgba(39,174,96,0.3)]',
  detective: 'bg-[rgba(41,128,185,0.2)] text-[#7ab8e8] border border-[rgba(41,128,185,0.3)]',
  doctor: 'bg-[rgba(212,160,23,0.15)] text-[#e8c47a] border border-[rgba(212,160,23,0.3)]',
  chouafa: 'bg-[rgba(142,68,173,0.15)] text-[#b07fe0] border border-[rgba(142,68,173,0.3)]',
  laadoul: 'bg-[rgba(189,195,199,0.15)] text-[#bdc3c7] border border-[rgba(189,195,199,0.3)]',
  spy: 'bg-[rgba(46,204,113,0.15)] text-[#6dbf7a] border border-[rgba(46,204,113,0.3)]',
  mayor: 'bg-[rgba(243,156,18,0.15)] text-[#e8c47a] border border-[rgba(243,156,18,0.3)]',
  avenger: 'bg-[rgba(192,57,43,0.2)] text-[#e05555] border border-[rgba(192,57,43,0.35)]',
  impostor: 'bg-[rgba(155,89,182,0.15)] text-[#b07fe0] border border-[rgba(155,89,182,0.3)]',
  madman: 'bg-[rgba(149,165,166,0.15)] text-[#bdc3c7] border border-[rgba(149,165,166,0.3)]',
  oracle: 'bg-[rgba(142,68,173,0.15)] text-[#b07fe0] border border-[rgba(142,68,173,0.3)]',
  mirror: 'bg-[rgba(189,195,199,0.1)] text-[#d5d8dc] border border-[rgba(189,195,199,0.25)]',
  guard: 'bg-[rgba(52,152,219,0.15)] text-[#7ab8e8] border border-[rgba(52,152,219,0.3)]',
  witch: 'bg-[rgba(26,188,156,0.15)] text-[#6dd5b2] border border-[rgba(26,188,156,0.3)]',
  loneWolf: 'bg-[rgba(127,140,141,0.15)] text-[#bdc3c7] border border-[rgba(127,140,141,0.3)]',
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

const teamStyles: Record<string, string> = {
  'team-mafia': 'bg-[var(--color-red-highlight)] text-[var(--color-red-hover)]',
  'team-civil': 'bg-[rgba(39,174,96,0.15)] text-[#6dbf7a]',
  'team-neutral': 'bg-[rgba(189,195,199,0.15)] text-[#bdc3c7]',
};

export function TeamBadge({ teamClass, children }: { teamClass: string; children: ReactNode }) {
  return (
    <span className={`text-xs px-[10px] py-[2px] rounded-full font-semibold flex-shrink-0 ${teamStyles[teamClass] || ''}`}>
      {children}
    </span>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-[600px] w-full max-h-[85vh] overflow-y-auto p-6 relative shadow-lg">
        <button
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all duration-[180ms] text-lg"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="font-display text-xl text-[var(--color-primary)] mb-6 text-center">{title}</div>
        {children}
      </div>
    </div>
  );
}
