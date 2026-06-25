'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { savePlayer, getSavedPlayer } from '@/lib/player-storage';
import { Input, Button } from '@/components/ui';
import styles from './room.module.css';

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
    <section className={styles.container} dir="rtl">
      <div className={styles.wrapper}>
        <div className={styles.title}>
          انضم إلى غرفة
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            className="text-center tracking-[0.2em] uppercase"
            placeholder="كود الغرفة"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
          />
          <Input
            placeholder="اسمك..."
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button
            type="submit"
            disabled={loading || !name.trim() || !code.trim()}
            className="w-full"
          >
            {loading ? 'جاري...' : 'انضمام 🎴'}
          </Button>
        </form>
        <button
          onClick={() => router.push('/room/create')}
          className={styles.linkPrimary}
        >
          إنشاء غرفة جديدة
        </button>
        <button
          onClick={() => router.push('/')}
          className={styles.linkSecondary}
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
