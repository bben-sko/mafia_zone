'use client';

import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, useEffect, forwardRef } from 'react';

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'outline';
type BtnSize = 'default' | 'lg' | 'sm';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'default', children, className = '', ...props }: BtnProps) {
  const base = 'btn';
  const variants: Record<BtnVariant, string> = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    danger: 'btn-danger',
  };
  const sizes: Record<BtnSize, string> = {
    default: 'btn-default',
    lg: 'btn-lg',
    sm: 'btn-sm',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`input ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';

// ... Badge styles can remain mostly semantic, just cleaning up the text sizes
type BadgeVariant = 'mafia' | 'civil' | 'detective' | 'doctor' | 'chouafa' | 'laadoul' | 'spy' | 'mayor' | 'avenger' | 'impostor' | 'madman' | 'oracle' | 'mirror' | 'guard' | 'witch' | 'loneWolf';

const badgeStyles: Record<BadgeVariant, string> = {
  mafia: 'badge-mafia',
  civil: 'badge-civil',
  detective: 'badge-detective',
  doctor: 'badge-doctor',
  chouafa: 'badge-chouafa',
  laadoul: 'badge-laadoul',
  spy: 'badge-spy',
  mayor: 'badge-mayor',
  avenger: 'badge-avenger',
  impostor: 'badge-impostor',
  madman: 'badge-madman',
  oracle: 'badge-oracle',
  mirror: 'badge-mirror',
  guard: 'badge-guard',
  witch: 'badge-witch',
  loneWolf: 'badge-loneWolf',
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`badge ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

const teamStyles: Record<string, string> = {
  'team-mafia': 'team-mafia',
  'team-civil': 'team-civil',
  'team-neutral': 'team-neutral',
};

export function TeamBadge({ teamClass, children }: { teamClass: string; children: ReactNode }) {
  return (
    <span className={`badge ${teamStyles[teamClass] || ''}`}>
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
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
