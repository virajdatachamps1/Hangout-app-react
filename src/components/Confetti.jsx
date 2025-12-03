import { useEffect, useState } from 'react';

function Confetti({ duration = 3000, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#10b981', '#f59e0b'];
    const newParticles = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2
      });
    }

    setParticles(newParticles);

    // Auto cleanup
    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti ${duration}ms ease-out forwards`,
            animationDelay: `${Math.random() * 200}ms`,
            opacity: 0.9
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;