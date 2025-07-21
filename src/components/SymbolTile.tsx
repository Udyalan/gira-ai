import React from 'react';
import { SymbolCell, SYMBOL_META } from '@utils/symbols';

interface Props {
  cell: SymbolCell;
}

const SymbolTile: React.FC<Props> = ({ cell }) => {
  const { id, golden } = cell;
  const meta = SYMBOL_META[id];
  return (
    <div
      className={`symbol ${id} ${golden ? 'golden' : ''}`}
      title={meta.label + (golden ? ' (Golden)' : '')}
    >
      <span role="img" aria-label={meta.label}>
        {meta.emoji}
      </span>
    </div>
  );
};

export default SymbolTile;