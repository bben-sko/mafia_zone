'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { savePlayer, getSavedPlayer } from '@/lib/player-storage';

function JoinForm() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill code from query param ?code=XXX
  useState(() => {
    const c = searchParams.get('code');
    if (c) setCode(c.toUpperCase());
  });

  useEffect(() => {
    const saved = getSavedPlayer();
    if (saved.name) setName(saved.name);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const roomCode = code.trim().toUpperCase();
    if (!trimmed || !roomCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rooms/${roomCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', playerName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join room');
      savePlayer(data.playerId, trimmed);
      router.push(`/room/${roomCode}?playerId=${data.playerId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh px-6" dir="rtl">
      <div className="max-w-[380px] w-full text-center relative z-1">
        <div className="font-display text-xl text-[var(--color-primary)] tracking-[0.15em] uppercase mb-8">
          انضم إلى غرفة
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="w-full px-4 py-3 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none transition-all duration-[180ms] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(200,169,110,0.2)] placeholder:text-[var(--color-text-faint)] text-center tracking-[0.2em] uppercase"
            placeholder="كود الغرفة"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
          />
          <input
            className="w-full px-4 py-3 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none transition-all duration-[180ms] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(200,169,110,0.2)] placeholder:text-[var(--color-text-faint)]"
            placeholder="اسمك..."
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="text-xs text-[var(--color-red-hover)]">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim() || !code.trim()}
            className="w-full py-3 px-8 text-sm font-semibold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري...' : 'انضمام 🎴'}
          </button>
        </form>
        <button
          onClick={() => router.push('/room/create')}
          className="mt-4 text-xs text-[var(--color-text-faint)] underline underline-offset-2 hover:text-[var(--color-text-muted)] transition-colors"
        >
          إنشاء غرفة جديدة
        </button>
        <button
          onClick={() => router.push('/')}
          className="mt-2 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"
        >
          ← الرجوع
        </button>
      </div>
    </section>
  );
}

export default function JoinRoom() {
  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <Suspense fallback={null}>
        <JoinForm />
      </Suspense>
    </>
  );
}
