'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { savePlayer, getSavedPlayer } from '@/lib/player-storage';

export default function CreateRoom() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = getSavedPlayer();
    if (saved.name) setName(saved.name);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      savePlayer(data.playerId, trimmed);
      router.push(`/room/${data.code}?playerId=${data.playerId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GrainOverlay />
      <Fireflies />
      <section className="flex flex-col items-center justify-center min-h-dvh px-6" dir="rtl">
        <div className="max-w-[380px] w-full text-center relative z-1">
          <div className="font-display text-xl text-[var(--color-primary)] tracking-[0.15em] uppercase mb-8">
            إنشاء غرفة
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="w-full px-4 py-3 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none transition-all duration-[180ms] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(200,169,110,0.2)] placeholder:text-[var(--color-text-faint)]"
              placeholder="اسمك..."
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && <p className="text-xs text-[var(--color-red-hover)]">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 px-8 text-sm font-semibold tracking-wider uppercase rounded-md bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_2px_8px_rgba(200,169,110,0.4)] hover:bg-[var(--color-primary-hover)] transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري...' : 'إنشاء الغرفة 🎴'}
            </button>
          </form>
          <button
            onClick={() => router.push('/room')}
            className="mt-4 text-xs text-[var(--color-text-faint)] underline underline-offset-2 hover:text-[var(--color-text-muted)] transition-colors"
          >
            لديك كود؟ انضم إلى غرفة
          </button>
          <button
            onClick={() => router.push('/')}
            className="mt-2 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            ← الرجوع
          </button>
        </div>
      </section>
    </>
  );
}
