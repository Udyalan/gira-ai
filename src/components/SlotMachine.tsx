import React, { useState } from 'react';
import Grid from './Grid';
import { generateRandomGrid, evaluateGrid } from '@utils/gridUtils';
import useLocalStorage from '@hooks/useLocalStorage';

const SlotMachine: React.FC = () => {
  const [grid, setGrid] = useState(generateRandomGrid());
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useLocalStorage<number>('pp_coins', 1000);
  const [xp, setXp] = useLocalStorage<number>('pp_xp', 0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const newGrid = generateRandomGrid();
    setGrid(newGrid);

    const { totalWin } = evaluateGrid(newGrid);

    setTimeout(() => {
      if (totalWin > 0) {
        setCoins(coins + totalWin);
        setXp(xp + totalWin);
      }
      setSpinning(false);
    }, 500);
  };

  return (
    <div className="slot-machine">
      <Grid grid={grid} />
      <button onClick={handleSpin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
};

export default SlotMachine;