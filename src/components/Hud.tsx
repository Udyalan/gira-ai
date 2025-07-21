import React from 'react';
import useLocalStorage from '@hooks/useLocalStorage';

const Hud: React.FC = () => {
  const [coins] = useLocalStorage<number>('pp_coins', 1000);
  const [xp] = useLocalStorage<number>('pp_xp', 0);
  const level = Math.floor(xp / 100) + 1;

  return (
    <div className="hud">
      <span>Coins: {coins}</span>
      <span>XP: {xp}</span>
      <span>Level: {level}</span>
    </div>
  );
};

export default Hud;