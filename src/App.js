import React, { useState } from 'react';
import CenterSolitaire from '../src/components/CenterSolitaire';
import './App.css';

function App() {
  const [moveCounter, setMoveCounter] = useState(0); // State for move counter

  // Function to increment the move counter
  const incrementMoveCounter = () => {
    setMoveCounter((prevCounter) => prevCounter + 1);
  };

  return (
    <div className="App">
      <div className="flex justify-center items-center h-screen">
        <div className="bg-[#1e5074]" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <CenterSolitaire onDropCard={incrementMoveCounter} />
        </div>
      </div>
    </div>
  );
}

export default App;
