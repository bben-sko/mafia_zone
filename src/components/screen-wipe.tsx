'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ScreenWipe({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1, duration: 0.2, onComplete: () => {
        gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.05 });
      }
    });
  }, [trigger]);

  return <div ref={ref} className="screen-wipe" />;
}
