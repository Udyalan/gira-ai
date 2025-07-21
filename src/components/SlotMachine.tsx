import React, { useState } from 'react';
import Grid from './Grid';
import { generateRandomGrid, spinWithCascades } from '@utils/gridUtils';
import { randomMultiplier } from '@utils/random';
import confetti from 'canvas-confetti';
import useLocalStorage from '@hooks/useLocalStorage';

const SlotMachine: React.FC = () => {
  const [grid, setGrid] = useState(generateRandomGrid());
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useLocalStorage<number>('pp_coins', 1000);
  const [xp, setXp] = useLocalStorage<number>('pp_xp', 0);
  const [freeSpins, setFreeSpins] = useLocalStorage<number>('pp_freeSpins', 0);
  const [multiplier, setMultiplier] = useState(1);
  const [lastWin, setLastWin] = useState(0);
  const [lastCascades, setLastCascades] = useState(0);
  const [pendingGrid, setPendingGrid] = useState<ReturnType<typeof generateRandomGrid> | null>(
    null
  );
  const [reelsDone, setReelsDone] = useState(0);

  const handleSpin = () => {
    if (spinning) return;

    const isFreeSpin = freeSpins > 0;
    if (isFreeSpin) {
      setFreeSpins(freeSpins - 1);
    }

    const newMultiplier = randomMultiplier();
    setMultiplier(newMultiplier);

    const finalGrid = generateRandomGrid();
    setPendingGrid(finalGrid);
    setReelsDone(0);
    setSpinning(true);
  };

  // callback when each reel finishes
  const handleReelDone = () => {
    setReelsDone((prev) => {
      const val = prev + 1;
      if (val === 5 && pendingGrid) {
        // all reels finished
        const { finalGrid, totalWin, cascades } = spinWithCascades(pendingGrid);

        const scatterCount = finalGrid.flat().filter((cell) => cell.id === 'scatter').length;
        if (scatterCount >= 3) {
          setFreeSpins((prevFS) => prevFS + 15);
        }

        const winWithMultiplier = totalWin * multiplier;

        setGrid(finalGrid);
        setLastWin(winWithMultiplier);
        setLastCascades(cascades);

        if (winWithMultiplier > 0) {
          confetti({
            particleCount: Math.min(200, winWithMultiplier),
            spread: 70,
            origin: { y: 0.3 },
          });
          setCoins((prev) => prev + winWithMultiplier);
          setXp((prev) => prev + winWithMultiplier);
        }

        setSpinning(false);
        setPendingGrid(null);
      }
      return val;
    });
  };

  return (
    <div className="slot-machine">
      <Grid grid={pendingGrid || grid} spinning={spinning} onReelDone={handleReelDone} />
      {lastWin > 0 && (
        <div className="win-info">
          Ganhou {lastWin} coins (×{multiplier}) em {lastCascades} cascatas!
        </div>
      )}
      <button onClick={handleSpin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
};

export default SlotMachine;