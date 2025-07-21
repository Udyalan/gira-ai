import React from 'react';
import SlotMachine from '@components/SlotMachine';
import Hud from '@components/Hud';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Piñata Party 🎉</h1>
      <Hud />
      <SlotMachine />
    </div>
  );
};

export default App;