'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import { savePlayer, getSavedPlayer } from '@/lib/player-storage';
import { Input, Button } from '@/components/ui';
import styles from '../room.module.css';

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
      <section className={styles.container} dir="rtl">
        <div className={styles.wrapper}>
          <div className={styles.title}>
            إنشاء غرفة
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              placeholder="اسمك..."
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full"
            >
              {loading ? 'جاري...' : 'إنشاء الغرفة 🎴'}
            </Button>
          </form>
          <button
            onClick={() => router.push('/room')}
            className={styles.linkPrimary}
          >
            لديك كود؟ انضم إلى غرفة
          </button>
          <button
            onClick={() => router.push('/')}
            className={styles.linkSecondary}
          >
            ← الرجوع
          </button>
        </div>
      </section>
    </>
  );
}
