import React from 'react';
import SymbolTile from './SymbolTile';
import { SymbolGrid, ROWS, COLS } from '@utils/gridUtils';
import Reel from './Reel';

interface Props {
  grid: SymbolGrid;
  spinning: boolean;
  onReelDone: () => void;
}

const Grid: React.FC<Props> = ({ grid, spinning, onReelDone }) => {
  if (spinning) {
    const columns: SymbolGrid[number][] = [];
    for (let c = 0; c < COLS; c++) {
      const colArr = [] as typeof grid[number];
      for (let r = 0; r < ROWS; r++) {
        colArr.push(grid[r][c]);
      }
      columns.push(colArr);
    }
    return (
      <div className="grid grid-reels">
        {columns.map((col, idx) => (
          <Reel key={idx} finalColumn={col} spinning={spinning} delayIndex={idx} onDone={onReelDone} />
        ))}
      </div>
    );
  }

  // static render
  return (
    <div className="grid">
      {grid.map((row, rIdx) => (
        <div className="grid-row" key={rIdx}>
          {row.map((cell, cIdx) => (
            <SymbolTile key={cIdx} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;