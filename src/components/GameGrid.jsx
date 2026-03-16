import { useRef, useState, useEffect, forwardRef } from 'react';
import { COLS, ROWS, COLORS } from '../utils/constants.js';
import MonsterCell from './MonsterCell.jsx';
import Projectile from './Projectile.jsx';

const GameGrid = forwardRef(function GameGrid({ monsters, cannon, locked, playerColor, onColumnClick, projectiles, onProjectileDone, escapeEffects }, ref) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    }
    measure();
    const obs = new ResizeObserver(measure);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const GAP = 1;
  const cellW = (dims.w - (COLS - 1) * GAP) / COLS;
  const cellH = (dims.h - (ROWS - 1) * GAP) / ROWS;
  const colX = (c) => c * (cellW + GAP);
  const rowY = (r) => r * (cellH + GAP);

  const gridCells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      gridCells.push(
        <div
          key={`${c}-${r}`}
          onPointerDown={(e) => {
            e.preventDefault();
            if (!locked) onColumnClick(c);
          }}
          style={{
            backgroundColor: COLORS.cellBg,
            borderRadius: '6px',
            touchAction: 'manipulation',
            cursor: locked ? 'not-allowed' : 'pointer',
          }}
        />
      );
    }
  }

  function setRefs(el) {
    containerRef.current = el;
    if (ref) {
      if (typeof ref === 'function') ref(el);
      else ref.current = el;
    }
  }

  return (
    <div
      ref={setRefs}
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: '1px',
        backgroundColor: COLORS.gridBg,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {gridCells}

      {dims.w > 0 && (() => {
        const cannonCenter = colX(cannon) + cellW / 2;
        const activeInCol = monsters.filter(m => m.col === cannon && !m.dying);
        let targetY;
        if (activeInCol.length > 0) {
          const lowest = activeInCol.reduce((a, b) => a.row > b.row ? a : b);
          targetY = rowY(lowest.row) + cellH * 0.8;
        } else {
          targetY = 0;
        }
        const laserHeight = dims.h - targetY;
        return (
          <div style={{
            position: 'absolute',
            left: cannonCenter - 1,
            top: targetY,
            width: '2px',
            height: `${laserHeight}px`,
            backgroundColor: playerColor,
            opacity: 0.5,
            boxShadow: `0 0 6px 2px ${playerColor}, 0 0 12px 4px ${playerColor}40`,
            pointerEvents: 'none',
            zIndex: 2,
          }} />
        );
      })()}

      {dims.w > 0 && monsters.map(m => (
        <div
          key={m.id}
          style={{
            position: 'absolute',
            left: colX(m.col),
            top: rowY(m.row),
            width: cellW,
            height: cellH,
            transition: 'top 300ms ease-out',
            padding: '1px',
            pointerEvents: 'none',
            zIndex: m.dying ? 5 : 1,
          }}
        >
          <MonsterCell monster={m} />
        </div>
      ))}

      {dims.w > 0 && projectiles && projectiles.map(p => (
        <Projectile key={p.id} proj={p} onDone={onProjectileDone} />
      ))}

      {dims.w > 0 && escapeEffects && escapeEffects.map(e => {
        const progress = Math.min(e.acc / 800, 1);
        return (
          <div
            key={e.id}
            style={{
              position: 'absolute',
              left: colX(e.col),
              bottom: 0,
              width: cellW,
              height: cellH,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(239,68,68,0.4)',
              opacity: 1 - progress,
            }} />
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ef4444',
              opacity: 1 - progress,
              transform: `translateY(${-progress * 20}px)`,
              textShadow: '0 0 6px rgba(239,68,68,0.8)',
            }}>
              -{e.pts}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default GameGrid;
