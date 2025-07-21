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

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const isFreeSpin = freeSpins > 0;
    if (isFreeSpin) {
      setFreeSpins(freeSpins - 1);
    } else {
      // futuros: custo de giro, por enquanto nenhum
    }

    // Define multiplicador do giro (sempre 1 em free spins? podemos manter aleatório)
    const newMultiplier = randomMultiplier();
    setMultiplier(newMultiplier);

    const initialGrid = generateRandomGrid();

    // Simula pequena animação de giro
    setTimeout(() => {
      const { finalGrid, totalWin, cascades } = spinWithCascades(initialGrid);

      // Contar scatters no grid final
      const scatterCount = finalGrid.flat().filter((cell) => cell.id === 'scatter').length;
      if (scatterCount >= 3) {
        setFreeSpins((prev) => prev + 15);
      }

      const winWithMultiplier = totalWin * newMultiplier;

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
    }, 300);
  };

  return (
    <div className="slot-machine">
      <Grid grid={grid} />
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