import React, { useEffect, useRef } from 'react';
import SymbolTile from './SymbolTile';
import { SymbolCell } from '@utils/symbols';
import { generateRandomSymbol, ROWS } from '@utils/gridUtils';

interface Props {
  finalColumn: SymbolCell[]; // length ROWS
  spinning: boolean;
  delayIndex: number; // stagger start
  onDone: () => void;
}

const EXTRA = 8; // extra cells for animation

const Reel: React.FC<Props> = ({ finalColumn, spinning, delayIndex, onDone }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const combined = React.useMemo(() => {
    const extras: SymbolCell[] = Array.from({ length: EXTRA }, () => generateRandomSymbol());
    return [...extras, ...finalColumn];
  }, [finalColumn]);

  useEffect(() => {
    if (!spinning || !listRef.current) return;
    const distance = 64 * EXTRA; // pixels to move (symbol size)
    const anim = listRef.current.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(-${distance}px)` },
      ],
      {
        duration: 600 + delayIndex * 150,
        easing: 'cubic-bezier(.5,.02,.3,.99)',
        fill: 'forwards',
      }
    );
    anim.onfinish = () => {
      // after animation, trim extras
      onDone();
    };
  }, [spinning]);

  return (
    <div className="reel" style={{ width: 64, height: 64 * ROWS, overflow: 'hidden' }}>
      <div ref={listRef}>
        {combined.map((cell, idx) => (
          <SymbolTile key={idx} cell={cell} />
        ))}
      </div>
    </div>
  );
};

export default Reel;