import React from 'react';
import SymbolTile from './SymbolTile';
import { SymbolGrid } from '@utils/gridUtils';

interface Props {
  grid: SymbolGrid;
}

const Grid: React.FC<Props> = ({ grid }) => {
  return (
    <div className="grid">
      {grid.map((row, rIdx) => (
        <div className="grid-row" key={rIdx}>
          {row.map((cell, cIdx) => (
            <SymbolTile key={cIdx} cell={cell} delay={(rIdx + cIdx) * 0.05} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;