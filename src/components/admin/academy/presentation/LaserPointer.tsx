import React, { useState, useEffect } from 'react';

interface LaserPointerProps {
  isActive: boolean;
}

export const LaserPointer: React.FC<LaserPointerProps> = ({ isActive }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPosition({ x: -100, y: -100 });
      setTrail([]);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      
      setTrail(prev => {
        const newTrail = [{ ...newPos, opacity: 1 }, ...prev.slice(0, 10)].map((point, i) => ({
          ...point,
          opacity: 1 - (i * 0.1)
        }));
        return newTrail;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Fade out trail
  useEffect(() => {
    if (!isActive || trail.length === 0) return;

    const interval = setInterval(() => {
      setTrail(prev => prev.map(point => ({
        ...point,
        opacity: Math.max(0, point.opacity - 0.1)
      })).filter(point => point.opacity > 0));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, trail.length]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Trail */}
      {trail.map((point, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-red-500"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            width: 8 - i * 0.5,
            height: 8 - i * 0.5,
            opacity: point.opacity * 0.5,
            filter: 'blur(1px)',
          }}
        />
      ))}
      
      {/* Main pointer */}
      <div
        className="absolute"
        style={{
          left: position.x - 10,
          top: position.y - 10,
        }}
      >
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse"
          style={{
            width: 20,
            height: 20,
            filter: 'blur(4px)',
          }}
        />
        {/* Inner glow */}
        <div 
          className="absolute rounded-full bg-red-500/60"
          style={{
            left: 4,
            top: 4,
            width: 12,
            height: 12,
            filter: 'blur(2px)',
          }}
        />
        {/* Core */}
        <div 
          className="absolute rounded-full bg-red-600"
          style={{
            left: 7,
            top: 7,
            width: 6,
            height: 6,
            boxShadow: '0 0 10px 3px rgba(239, 68, 68, 0.8)',
          }}
        />
      </div>
    </div>
  );
};
