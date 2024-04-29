import React, { useState, useEffect } from 'react';
import Redcard2 from '../assets/card back blue.png';

// Define card images for Spades
const spadeCardImages = [
  require('../assets/solitaire images/Suit=Spades, Number=Ace.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=2.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=3.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=4.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=5.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=6.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=7.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=8.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=9.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=10.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=Jack.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=Queen.svg').default,
  require('../assets/solitaire images/Suit=Spades, Number=King.svg').default,
];

function CenterSolitaire({ onDropCard }) {
  const [centerCardSlots, setCenterCardSlots] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [movesHistory, setMovesHistory] = useState([]);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [pausedState, setPausedState] = useState(null);
  const [foundationPiles, setFoundationPiles] = useState([[], [], [], []]); // State for foundation piles

  useEffect(() => {
    // Initialize slots with four Redcard2 images each
    const initialSlots = Array.from({ length: 10 }, () => Array.from({ length: 5 }, (_, index) => {
      // For the 5th card, select a random spades card image
      if (index === 4) {
        const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
        return spadeCardImages[randomIndex];
      } else {
        return Redcard2;
      }
    }));
    setCenterCardSlots(initialSlots);

    const intervalId = setInterval(() => {
      if (!isPaused) {
        // Increment seconds by 1
        setTimer(prevTimer => {
          const updatedSeconds = prevTimer.seconds + 1;
          if (updatedSeconds === 60) {
            // If seconds reach 60, reset seconds to 0 and increment minutes by 1
            return { minutes: prevTimer.minutes + 1, seconds: 0 };
          } else {
            return { ...prevTimer, seconds: updatedSeconds };
          }
        });
      }
    }, 1000); // Update every 1000 milliseconds (1 second)
    

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [isPaused]); // Re-run effect when isPaused changes

  useEffect(() => {
    // If the game was paused, restore the paused state
    if (pausedState !== null) {
      setCenterCardSlots(pausedState.centerCardSlots);
      setClickCount(pausedState.clickCount);
      setMoveCount(pausedState.moveCount);
      setMovesHistory(pausedState.movesHistory);
      setTimer(pausedState.timer);
    }
  }, [pausedState]);

  useEffect(() => {
    // Check for completed sequences when centerCardSlots changes
    checkForCompletedSequences();
  }, [centerCardSlots]);

  const checkForCompletedSequences = () => {
    const updatedFoundationPiles = [...foundationPiles];

    // Loop through each slot in the tableau
    centerCardSlots.forEach((cards, slotIndex) => {
      // Check if the slot has a completed sequence
      if (cards.length === 13) {
        const sequence = cards.map(card => getCardValue(card)); // Extract card values
        const isSequenceValid = isSequential(sequence); // Check if sequence is sequential

        if (isSequenceValid) {
          // Move the sequence to the foundation pile
          const foundationIndex = findEmptyFoundation(updatedFoundationPiles);
          if (foundationIndex !== -1) {
            updatedFoundationPiles[foundationIndex] = [...sequence];
            // Update centerCardSlots to remove the moved cards
            centerCardSlots[slotIndex] = [];
          }
        }
      }
    });

    setFoundationPiles(updatedFoundationPiles);
  };

  // Utility function to get card value
  const getCardValue = (card) => {
    return card.split('=')[2].split('.')[0].split(',')[1];
  };

  // Utility function to check if an array is sequential
  const isSequential = (arr) => {
    return arr.every((val, i) => i === 0 || parseInt(val) === parseInt(arr[i - 1]) + 1);
  };

  // Utility function to find an empty foundation pile
  const findEmptyFoundation = (foundationPiles) => {
    return foundationPiles.findIndex(pile => pile.length === 0);
  };

  const generateRandomCards = () => {
    if (clickCount < 5) {
      const updatedClickCount = 5 - clickCount; // Adjusted click count
      setClickCount(clickCount + 1);
      const updatedCenterCardSlots = centerCardSlots.map(slot => {
        // Generate a random index to select a card image
        const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
        // Add the randomly selected card image to the slot
        return [...slot, spadeCardImages[randomIndex]];
      });
      // Update state with the updated slots
      setCenterCardSlots(updatedCenterCardSlots);
  
      // Update the button text to reflect the adjusted click count
      document.querySelector('.deal-button').innerText = updatedClickCount === 0 ? 'Limit Reached' : `Deal Left: ${updatedClickCount}`;
    }
  };

  const handleUndo = () => {
    if (movesHistory.length > 0) {
      const lastMove = movesHistory.pop();
      const [targetSlotIndex, targetCardIndex] = lastMove.target;
      const [sourceSlotIndex, sourceCardIndex] = lastMove.source;

      const updatedCenterCardSlots = [...centerCardSlots];

      // Remove the cards from the target slot
      const draggedCards = updatedCenterCardSlots[targetSlotIndex].splice(targetCardIndex);
      
      // Place the dragged cards in the source slot
      updatedCenterCardSlots[sourceSlotIndex] = [
        ...updatedCenterCardSlots[sourceSlotIndex],
        ...draggedCards,
      ];

      setCenterCardSlots(updatedCenterCardSlots);

      // Decrement move counter
      setMoveCount(moveCount - 1);

      // Update move history
      setMovesHistory([...movesHistory]);
    }
  };

  const handleReset = () => {
    // Reload the page to reset the game
    window.location.reload();
  };

  const handlePause = () => {
    // Pause the game by setting isPaused to true and storing the current state
    setPausedState({
      centerCardSlots,
      clickCount,
      moveCount,
      movesHistory,
      timer,
      isPaused: true, // Also store the paused state
    });
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
    // Restore the game state from the paused state
    if (pausedState !== null) {
      // Only restore the timer state, other state will remain as it is
      setTimer(pausedState.timer);
      // If the game was paused, resume the drag-and-drop functionality
      if (!pausedState.isPaused) {
        // Restore the event listeners for drag-and-drop
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(card => {
          card.addEventListener('dragstart', handleDragStart);
        });
      }
    }
    // Clear the paused state without resetting it
    setPausedState(null);
  };

  const handleDrop = (event, targetSlotIndex, targetCardIndex) => {
    event.preventDefault();
    const draggedCard = event.dataTransfer.getData("card");
    const updatedCenterCardSlots = [...centerCardSlots];
    const [sourceSlotIndex, sourceCardIndex] = JSON.parse(event.dataTransfer.getData("source"));

    // Check if the move is valid for each dragged card
    const draggedCards = updatedCenterCardSlots[sourceSlotIndex].slice(sourceCardIndex);
    if (isValidMove(draggedCards, targetSlotIndex, targetCardIndex)) {
      // Remove the dragged cards from the source slot
      updatedCenterCardSlots[sourceSlotIndex] = updatedCenterCardSlots[sourceSlotIndex].slice(0, sourceCardIndex);

      // Place the dragged cards in the target slot
      updatedCenterCardSlots[targetSlotIndex] = [
        ...updatedCenterCardSlots[targetSlotIndex].slice(0, targetCardIndex),
        ...draggedCards,
        ...updatedCenterCardSlots[targetSlotIndex].slice(targetCardIndex),
      ];

      setCenterCardSlots(updatedCenterCardSlots);

      // Adjust margin top of the dropped cards
      event.target.style.marginTop = `${15 * targetCardIndex}px`;

      // Increment move counter
      setMoveCount(moveCount + 1);

      // Add move to history
      setMovesHistory([...movesHistory, { source: [sourceSlotIndex, sourceCardIndex], target: [targetSlotIndex, targetCardIndex] }]);
    }
  };


  const isValidMove = (draggedCards, targetSlotIndex, targetCardIndex) => {
    // If the target slot is empty, only accept a King or Ace
    if (targetCardIndex === 0) {
      return draggedCards[0].includes('King') || draggedCards[0].includes('Ace');
    } else {
      // Get the value and suit of the card on top of the target slot
      const [topCardValue, topCardSuit] = centerCardSlots[targetSlotIndex][targetCardIndex - 1]
        .split('=')[2].split('.')[0].split(',');

      // Get the value and suit of the dragged card
      const [draggedCardValue, draggedCardSuit] = draggedCards[0].split('=')[2].split('.')[0].split(',');

      // Define the sequence of card values
      const sequence = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

      // Check if the dragged card can be placed on top of the target card according to solitaire rules
      return (
        (sequence.includes(draggedCardValue) && sequence.includes(topCardValue) && sequence.indexOf(draggedCardValue) === sequence.indexOf(topCardValue) - 1) || // Descending order for 2 to 10 cards
        (draggedCardValue === '10' && topCardValue === 'Jack') || // 10 can be placed on Jack
        (draggedCardValue === 'Jack' && topCardValue === 'Queen') || // Jack can be placed on Queen
        (draggedCardValue === 'Queen' && topCardValue === 'King') || // Queen can be placed on King
        (draggedCardValue === 'Ace' && topCardValue === '2') // Ace can be placed on 10
      );
    }
  };

  const handleDragOver = (event, slotIndex, cardIndex) => {
    event.preventDefault();
  };

  const handleDragStart = (event, card, sourceSlotIndex, sourceCardIndex) => {
    event.dataTransfer.setData("card", card);
    event.dataTransfer.setData("source", JSON.stringify([sourceSlotIndex, sourceCardIndex]));
  };

  return (
    <div className='flex gap-10 mt-5 justify-center w-screen' style={{ backgroundColor: '#1e5074', padding: '20px' }}>
      <div className='flex flex-col items-center gap-2'>
        <img className='w-[70px] h-[100px]' onClick={generateRandomCards} src={Redcard2} alt="Red Card"/>
        <button className='text-white deal-button'>
          {clickCount < 5 ? `Deal Left: ${5 - clickCount}` : 'Limit Reached'}
        </button>
        <div className="mt-1 text-white">Moves: {moveCount}</div>
        <button className='border bg-blue-500 text-white w-[70px]' onClick={handleUndo}>Undo</button>
        <button className='border bg-red-500 text-white w-[70px] mt-2' onClick={handleReset}>Restart</button>
        {isPaused ? (
          <button className='border bg-yellow-500 text-white w-[70px] mt-2' onClick={handleResume}>Resume</button>
        ) : (
          <button className='border bg-gray-500 text-white w-[70px] mt-2' onClick={handlePause}>Pause</button>
        )}
        <div className="text-white">Time: {`${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', alignItems: 'flex-start' }}>
        {centerCardSlots.map((cards, slotIndex) => (
          <div
            key={slotIndex}
            style={{
              width: '70px',
              height: '90px',
              backgroundColor: 'white',
              border: '1px solid black',
              marginRight: '10px',
              position: 'relative',
            }}
            onDrop={(event) => handleDrop(event, slotIndex, cards.length)}
            onDragOver={(event) => handleDragOver(event, slotIndex, cards.length)}
          >
            {cards.map((card, cardIndex) => (
              <img
                key={cardIndex}
                src={card}
                alt="Card"
                className="card" // Add the 'card' class here
                draggable="true"
                onDragStart={(event) => handleDragStart(event, card, slotIndex, cardIndex)}
                style={{
                  width: '70px',
                  height: '90px',
                  position: 'absolute',
                  top: `${cardIndex * 15}px`,
                  marginTop: cardIndex === cards.length - 1 ? '' : '0', // Add margin-top only to the dropped card
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '8px' }}>
        {foundationPiles.map((pile, index) => (
          <div
            key={index}
            style={{
              width: '70px',
              height: '90px',
              borderRadius: '10px',
              border: '1px solid #000',
            }}
          >
            {pile.length > 0 ? (
              <img
                src={pile[pile.length - 1]} // Display the top card of the pile
                alt={`Foundation ${index + 1}`}
                style={{ width: '100%', height: '100%', borderRadius: '10px' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '10px', backgroundColor: 'lightgrey' }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CenterSolitaire;
