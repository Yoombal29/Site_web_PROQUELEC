import React from 'react';

interface RulerProps {
  /** Position du pointeur en pixels (pour affichage de la position courante) */
  pointerPos?: number;
  /** Direction: 'horizontal' ou 'vertical' */
  direction: 'horizontal' | 'vertical';
  /** Longueur totale en pixels */
  length: number;
  /** Conversion: pixels par mètre (défaut 10) */
  pixelsPerMeter?: number;
}

/**
 * Composant Décamètre professionnel pour le canvas
 * Affiche une règle avec graduations et labels
 * Format professionnel pour schéma électrique
 */
export const Ruler: React.FC<RulerProps> = ({
  pointerPos = 0,
  direction,
  length,
  pixelsPerMeter = 10
}) => {
  // Configuration des graduations
  const metersPerUnit = 1; // 1 mètre par grande graduation
  const smallGraduationStep = pixelsPerMeter / 5; // 0.2m par petite graduation
  const largeGraduationStep = pixelsPerMeter * metersPerUnit; // 1m par grande graduation

  // Génération des graduations
  const graduations = [];

  for (let i = 0; i <= length; i += smallGraduationStep) {
    const isMajor = Math.abs((i % largeGraduationStep) - 0) < 0.5;
    graduations.push({
      position: i,
      isMajor,
      label: isMajor ? (i / pixelsPerMeter).toFixed(0) : undefined
    });
  }

  const isHorizontal = direction === 'horizontal';
  const width = isHorizontal ? length : 40;
  const height = isHorizontal ? 40 : length;

  return (
    <div
      className="bg-gradient-to-b from-slate-900 to-slate-800 border-r-2 border-b-2 border-slate-700 relative overflow-hidden select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* Graduations */}
        {graduations.map((grad, idx) => {
          if (isHorizontal) {
            const x = grad.position;
            const majorHeight = 12;
            const minorHeight = 6;
            const h = grad.isMajor ? majorHeight : minorHeight;

            return (
              <g key={idx}>
                {/* Ligne de graduation */}
                <line
                  x1={x}
                  y1={40 - h}
                  x2={x}
                  y2={40}
                  stroke={grad.isMajor ? '#60A5FA' : '#94A3B8'}
                  strokeWidth={grad.isMajor ? 2 : 1}
                  opacity={0.8}
                />

                {/* Label pour graduations majeures */}
                {grad.label && (
                  <text
                    x={x}
                    y={14}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#10B981"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {grad.label}m
                  </text>
                )}
              </g>
            );
          } else {
            // Vertical
            const y = grad.position;
            const majorWidth = 12;
            const minorWidth = 6;
            const w = grad.isMajor ? majorWidth : minorWidth;

            return (
              <g key={idx}>
                {/* Ligne de graduation */}
                <line
                  x1={40 - w}
                  y1={y}
                  x2={40}
                  y2={y}
                  stroke={grad.isMajor ? '#60A5FA' : '#94A3B8'}
                  strokeWidth={grad.isMajor ? 2 : 1}
                  opacity={0.8}
                />

                {/* Label pour graduations majeures */}
                {grad.label && (
                  <text
                    x={12}
                    y={y + 3}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#10B981"
                    fontWeight="bold"
                    fontFamily="monospace"
                    transform={`rotate(-90, 12, ${y})`}
                  >
                    {grad.label}m
                  </text>
                )}
              </g>
            );
          }
        })}

        {/* Ligne indicatrice de position (pointeur en temps réel) */}
        {pointerPos > 0 && pointerPos < length && (
          isHorizontal ? (
            <line
              x1={pointerPos}
              y1={0}
              x2={pointerPos}
              y2={40}
              stroke="#EF4444"
              strokeWidth={2}
              opacity={0.7}
              strokeDasharray="3,3"
            />
          ) : (
            <line
              x1={0}
              y1={pointerPos}
              x2={40}
              y2={pointerPos}
              stroke="#EF4444"
              strokeWidth={2}
              opacity={0.7}
              strokeDasharray="3,3"
            />
          )
        )}
      </svg>

      {/* Label de position pour horizontal */}
      {isHorizontal && pointerPos > 0 && pointerPos < length && (
        <div
          className="absolute text-xs font-mono text-yellow-400 bg-slate-900 px-1 rounded pointer-events-none"
          style={{
            left: `${Math.max(5, Math.min(pointerPos - 12, length - 30))}px`,
            top: '2px'
          }}
        >
          {(pointerPos / pixelsPerMeter).toFixed(2)}m
        </div>
      )}

      {/* Label de position pour vertical */}
      {!isHorizontal && pointerPos > 0 && pointerPos < length && (
        <div
          className="absolute text-xs font-mono text-yellow-400 bg-slate-900 px-1 rounded pointer-events-none"
          style={{
            top: `${Math.max(5, Math.min(pointerPos - 8, length - 20))}px`,
            right: '2px'
          }}
        >
          {(pointerPos / pixelsPerMeter).toFixed(2)}m
        </div>
      )}
    </div>
  );
};

export default Ruler;
