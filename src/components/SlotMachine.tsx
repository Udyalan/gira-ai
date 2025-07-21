import React, { useState } from 'react';
import Grid from './Grid';
import { generateRandomGrid, spinWithCascades } from '@utils/gridUtils';
import useLocalStorage from '@hooks/useLocalStorage';

const SlotMachine: React.FC = () => {
  const [grid, setGrid] = useState(generateRandomGrid());
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useLocalStorage<number>('pp_coins', 1000);
  const [xp, setXp] = useLocalStorage<number>('pp_xp', 0);
  const [lastWin, setLastWin] = useState(0);
  const [lastCascades, setLastCascades] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const initialGrid = generateRandomGrid();

    // Simula pequena animação de giro
    setTimeout(() => {
      const { finalGrid, totalWin, cascades } = spinWithCascades(initialGrid);
      setGrid(finalGrid);
      setLastWin(totalWin);
      setLastCascades(cascades);

      if (totalWin > 0) {
        setCoins(coins + totalWin);
        setXp(xp + totalWin);
      }

      setSpinning(false);
    }, 300);
  };

  return (
    <div className="slot-machine">
      <Grid grid={grid} />
      {lastWin > 0 && (
        <div className="win-info">Ganhou {lastWin} coins em {lastCascades} cascatas!</div>
      )}
      <button onClick={handleSpin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
};

export default SlotMachine;