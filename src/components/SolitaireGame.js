import React, { useState } from 'react';
import LeftSolitaire from './components/Leftsolitaire';
import CenterSolitaire from '../src/components/CenterSolitaire';

function SolitaireGame() {
  const [centerCardSlots, setCenterCardSlots] = useState([]);

  const handleRedCardClick = (randomCards) => {
    setCenterCardSlots(randomCards);
  };

  return (
    <div>
      <LeftSolitaire onRedCardClick={handleRedCardClick} />
      <CenterSolitaire centerCardSlots={centerCardSlots} />
    </div>
  );
}

export default SolitaireGame;
