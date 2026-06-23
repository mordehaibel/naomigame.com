import { useMemo } from 'react';

const SHAPES = ['⭐', '✨', '🌟', '💫', '🎈', '🎮', '🎯'];

// חלקיקים מצוירים שנעים ברקע - אסתטיקה בלבד
export default function BackgroundParticles({ count = 18 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 12 + Math.random() * 18,
        size: 14 + Math.random() * 18,
        tx: (Math.random() - 0.5) * 200,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--tx': `${p.tx}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
