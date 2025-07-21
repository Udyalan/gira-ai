import React from 'react';
import { SymbolId, SYMBOL_META } from '@utils/symbols';

interface Props {
  symbolId: SymbolId;
}

const SymbolTile: React.FC<Props> = ({ symbolId }) => {
  const meta = SYMBOL_META[symbolId];
  return (
    <div className={`symbol ${symbolId}`} title={meta.label}>
      <span role="img" aria-label={meta.label}>
        {meta.emoji}
      </span>
    </div>
  );
};

export default SymbolTile;