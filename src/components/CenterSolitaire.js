  import React, { useState, useEffect } from 'react';
  import Redcard2 from '../assets/card back blue.png';
  import Ace from "../assets/ace.svg"
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

  const aceSVG = require('../assets/solitaire images/Suit=Spades, Number=Ace.svg').default;


  function CenterSolitaire({ onDropCard }) {
    const [centerCardSlots, setCenterCardSlots] = useState([]);
    const [clickCount, setClickCount] = useState(0);
    const [moveCount, setMoveCount] = useState(0);
    const [movesHistory, setMovesHistory] = useState([]);
    const [timer, setTimer] = useState({ minutes: 15, seconds: 60 });
    const [isPaused, setIsPaused] = useState(false);
    const [pausedState, setPausedState] = useState(null);
    const [foundationPiles, setFoundationPiles] = useState([[], [], [],]); // State for foundation piles
    const [difficultySelected, setDifficultySelected] = useState(false); // State to track if a difficulty has been selected


    useEffect(() => {
    // Initialize slots with four Redcard2 images each
    const initialSlots = Array.from({ length: 10 }, () =>
      Array.from({ length: 5 }, (_, index) => {
        // For the 5th card, select a random spades card image
        if (index === 4) {
          const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
          return spadeCardImages[randomIndex];
        } else {
          return Redcard2;
        }
      })
    );
    setCenterCardSlots(initialSlots);

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        let updatedSeconds = prevTimer.seconds - 1;
        let updatedMinutes = prevTimer.minutes;

        if (updatedSeconds < 0) {
          updatedSeconds = 59;
          updatedMinutes -= 1;
        }

        // If the timer is about to reach 0 minutes and 1 second, stop the timer
        if (updatedMinutes === 0 && updatedSeconds === 0) {
          clearInterval(intervalId);
        }

        return { minutes: updatedMinutes, seconds: updatedSeconds };
      });
    }, 1000); // Update every 1000 milliseconds (1 second)

    // Clear interval on component unmount or when timer reaches 0 minutes and 0 seconds
    return () => clearInterval(intervalId);
  }, []);


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


    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    
    // Initialize an array to hold all card images
  let allCardImages = [];

  // Populate the array with each card image four times
  spadeCardImages.forEach(cardImage => {
    allCardImages.push(cardImage, cardImage, cardImage, cardImage);
  });

  // Calculate the number of remaining slots needed to reach 100 cards
  const remainingSlots = 100 - allCardImages.length;

  // Fill the remaining slots with random spade card images
  for (let i = 0; i < remainingSlots; i++) {
    const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
    allCardImages.push(spadeCardImages[randomIndex]);
  }

  // Shuffle the array to randomize the card order
  allCardImages = shuffleArray(allCardImages);

  // Now allCardImages contains 100 cards with each card appearing at least four times


    // const getCardValue = (card) => {
    //   console.log('Card split response:', card?.split('=')[2]?.split('.')[0]?.split(',')[1]);
    //   console.log(card , "--cards") // Add this line to log the card value
    //   return card?.split('=')[2]?.split('.')[0]?.split(',')[1];
    // };



    const getCardValue = (card) => {
      // Define the regex pattern to match the value part of the card string
      const regexPattern = /Suit=\w+, Number=(\w+)/;
      // Use match method with the regex pattern to extract the value
      const matchResult = card.match(regexPattern);
      
      if (matchResult && matchResult.length >= 2) {
        // Extracted value will be in the second captured group
        const value = matchResult[1];
        console.log('Card split response:', value);
        console.log(card , "--cards"); // Log the original card value
        return value; // Return the extracted value
      } else {
        console.log('Invalid card format:', card); // Log if the card format is invalid
        return null; // Return null if the card format is invalid
      }
    };

    
  const isSequential = (arr) => {
  console.log(arr, "----is sequential arr boolean func")
      const sequence = [
        "King", "Queen", "Jack", "10", "9", "8", "7", "6", "5", "4", "3", "2", "Ace"
      ];
      if (arr.length !== sequence.length) {
        return false;
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== sequence[i]) {
          return false;
        }
      }
      return true;
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
        const lastMove = movesHistory[movesHistory.length - 1];
        const [targetSlotIndex, targetCardIndex] = lastMove.target;
        const [sourceSlotIndex, sourceCardIndex] = lastMove.source;
    
        const updatedCenterCardSlots = [...centerCardSlots];
    
        const draggedCards = updatedCenterCardSlots[targetSlotIndex]?.splice(targetCardIndex);

        if (sourceCardIndex === updatedCenterCardSlots[sourceSlotIndex].length - 1 && updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex] === Redcard2) {
          updatedCenterCardSlots[sourceSlotIndex].pop();
        }
    
        updatedCenterCardSlots[sourceSlotIndex] = [
          ...updatedCenterCardSlots[sourceSlotIndex].slice(0, sourceCardIndex),
          ...draggedCards,
          ...updatedCenterCardSlots[sourceSlotIndex].slice(sourceCardIndex)
        ];
    
        setCenterCardSlots(updatedCenterCardSlots);
    
        // Decrement move counter
        setMoveCount(moveCount - 1);
    
        // Remove the last move from the history
        setMovesHistory(movesHistory.slice(0, -1));
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
      setIsPaused(false); // Set isPaused to false to resume the game
    
      // Restore the game state from the paused state
      if (pausedState !== null) {
        // Restore the timer state
        setTimer(pausedState.timer);
    
        // Restore other game state variables
        setCenterCardSlots(pausedState.centerCardSlots);
        setClickCount(pausedState.clickCount);
        setMoveCount(pausedState.moveCount);
        setMovesHistory(pausedState.movesHistory);
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
        // Store the number of cards before the drop
        const numCardsBeforeDrop = updatedCenterCardSlots[targetSlotIndex].length;
    
        // Remove the dragged cards from the source slot
        updatedCenterCardSlots[sourceSlotIndex] = updatedCenterCardSlots[sourceSlotIndex].slice(0, sourceCardIndex);
    
        // Place the dragged cards in the target slot
        updatedCenterCardSlots[targetSlotIndex] = [
          ...updatedCenterCardSlots[targetSlotIndex].slice(0, targetCardIndex),
          ...draggedCards,
          ...updatedCenterCardSlots[targetSlotIndex].slice(targetCardIndex),
        ];
    
        // Store the number of cards after the drop
        const numCardsAfterDrop = updatedCenterCardSlots[targetSlotIndex].length;
    
        // Check if the last card before and after the drop is a red card
        const isLastCardRedBefore = updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex - 1] === Redcard2;
        const isLastCardRedAfter = updatedCenterCardSlots[targetSlotIndex][targetCardIndex - 1] === Redcard2;
    
        // If the last card before the drop is red and the last card after the drop is not red, swap it with a random spade card
        if (isLastCardRedBefore && !isLastCardRedAfter) {
          const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
          updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex - 1] = spadeCardImages[randomIndex];
        }
    
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
          return draggedCards.length === 1 && (draggedCards[0].includes('King') || draggedCards[0].includes('Ace'));
      } else {
          // Get the value and suit of the card on top of the target slot
          const [topCardValue, topCardSuit] = centerCardSlots[targetSlotIndex][targetCardIndex - 1]
              .split('=')[2]?.split('.')[0]?.split(',');

          // Get the value and suit of the dragged card(s)
          const [draggedCardValue, draggedCardSuit] = draggedCards[0]?.split('=')[2]?.split('.')[0]?.split(',');

          // Check if the dragged card(s) can be placed on top of the target card according to solitaire rules
          const sequence = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

          // Check if the dragged cards form a descending order sequence
          const isDescendingOrder = draggedCards.every((card, index) =>
              sequence.indexOf(card.split('=')[2]?.split('.')[0]?.split(',')[0]) === sequence.indexOf(draggedCards[0].split('=')[2]?.split('.')[0]?.split(',')[0]) - index
          );

          return (
              (
                  // Check if the dragged card(s) form a valid sequence according to solitaire rules
                  isDescendingOrder && // Check if cards are in descending order
                  (
                      sequence.includes(draggedCardValue) && sequence.includes(topCardValue) && sequence.indexOf(draggedCardValue) === sequence.indexOf(topCardValue) - 1
                  )
              ) ||
              (
                  // Check if the dragged card(s) form a pair
                  draggedCards.length === 2 &&
                  draggedCards.every(card => card.split('=')[2]?.split('.')[0]?.split(',')[0] === draggedCards[0].split('=')[2]?.split('.')[0]?.split(',')[0])
              ) ||
              (
                  // Check if a single card is being dragged
                  draggedCards.length === 1 && !isDescendingOrder && sequence.indexOf(draggedCardValue) === sequence.indexOf(topCardValue) - 1
              )
          );
      }
  };

    

    const handleDragOver = (event, slotIndex, cardIndex) => {
      event.preventDefault();
    };

    const handleDragStart = (event, card, sourceSlotIndex, sourceCardIndex) => {
      // Check if the timer has expired
      if (timer.minutes === 0 && timer.seconds === 0) {
        // Timer has expired, prevent dragging
        event.preventDefault();
        return;
      }
    
      event.dataTransfer.setData("card", card);
      event.dataTransfer.setData("source", JSON.stringify([sourceSlotIndex, sourceCardIndex]));
    };
    


  // Function to detect complete stacks and move them to the foundation
  const checkForCompletedSequences = () => {
    const updatedFoundationPiles = [...foundationPiles];

    // Loop through each slot in the tableau
    centerCardSlots.forEach((cards, slotIndex) => {
      // Check if the slot has a completed sequence

        if (cards.length > 13) {
          const sequence = cards.map(card => getCardValue(card)); // Extract card values
          console.log(sequence , "-----sequence")
          const isSequenceValid = isSequential(sequence); // Check if sequence is sequential
          console.log(isSequenceValid , "----is true valid boolean test")
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


  const handleDifficultySelect = (difficulty) => {
    // Set the difficulty selected state to true
    setDifficultySelected(true);

    switch (difficulty) {
      case 'easy':
        setFoundationPiles([[]]);
        break;
      case 'medium':
        setFoundationPiles([[], []]);
        break;
      case 'hard':
        setFoundationPiles([[], [], []]);
        break;
      default:
        break;
    }

    // You may also need to reset the game state or restart the game here
  };

    

    return (
      <div className='flex gap-10 mt-5 justify-center w-screen overflow-hidden' style={{ backgroundColor: '#1e5074', padding: '20px' }}>
        <div className='flex flex-col items-center gap-2'>
          <img className='w-[70px] h-[100px]' onClick={generateRandomCards} src={Redcard2} alt="Red Card"/>
          <button className='text-white deal-button'>
            {clickCount < 5 ? `Deal Left: ${5 - clickCount}` : 'Limit Reached'}
          </button>
          <div className="mt-1 text-white">Moves: {moveCount}</div>
          <button className='border bg-blue-500 text-white w-[70px]' onClick={handleUndo}>Undo</button>
          <button className='border bg-red-500 text-white w-[70px] mt-2' onClick={handleReset}>Restart</button>
          {/* {isPaused ? (
            <button className='border bg-yellow-500 text-white w-[70px] mt-2' onClick={handleResume}>Resume</button>
          ) : (
            <button className='border bg-gray-500 text-white w-[70px] mt-2' onClick={handlePause}>Pause</button>
          )} */}
          <div className='text-white'>Time: {`${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`}</div>
        </div>
        <div className='cursor-grabbing ' style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', alignItems: 'flex-start',}}>
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
                  className="card"
                  draggable="true"
                  onDragStart={(event) => handleDragStart(event, card, slotIndex, cardIndex)}
                  style={{
                    width: '70px',
                    height: '90px',
                    position: 'absolute',
                    top: `${cardIndex * 15}px`,
                    marginTop: cardIndex === cards.length - 1 ? '' : '0',
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
                  src={Ace}
                  alt={`Foundation ${index + 1}`}
                  style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '10px', backgroundColor: 'lightgrey' }}></div>
              )}
            </div>  
          ))}
        </div>  
        {!difficultySelected && ( // Render difficulty buttons if a difficulty has not been selected
          <div className="difficulty-buttons" style={{ padding: '10px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="difficulty-button" onClick={() => handleDifficultySelect('easy')} style={{ backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Easy</button>
            <button className="difficulty-button" onClick={() => handleDifficultySelect('medium')} style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Medium</button>
            <button className="difficulty-button" onClick={() => handleDifficultySelect('hard')} style={{ backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Hard</button>
          </div>
        )}

      </div>
    );
  }

  export default CenterSolitaire;