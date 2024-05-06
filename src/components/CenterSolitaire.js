import React, { useState, useEffect } from "react";
import Redcard2 from "../assets/card back blue.png";
import Ace from "../assets/ace.svg";
// Define card images for Spades
const spadeCardImages = [
  require("../assets/solitaire images/Suit=Spades, Number=Ace.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=2.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=3.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=4.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=5.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=6.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=7.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=8.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=9.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=10.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=Jack.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=Queen.svg").default,
  require("../assets/solitaire images/Suit=Spades, Number=King.svg").default,
];

const aceSVG =
  require("../assets/solitaire images/Suit=Spades, Number=Ace.svg").default;

function CenterSolitaire({ onDropCard }) {
  const [centerCardSlots, setCenterCardSlots] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [movesHistory, setMovesHistory] = useState([]);
  const [timer, setTimer] = useState({ minutes: 15, seconds: 60 });
  const [isPaused, setIsPaused] = useState(false);
  const [pausedState, setPausedState] = useState(null);
  const [foundationPiles, setFoundationPiles] = useState([[], [], [],]); 
  const [difficultySelected, setDifficultySelected] = useState(false); 
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    const initialSlots = Array.from({ length: 10 }, () =>
      Array.from({ length: 5 }, (_, index) => {
        if (index === 4) {
          const randomIndex = Math.floor(
            Math.random() * spadeCardImages.length
          );
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

        if (updatedMinutes === 0 && updatedSeconds === 0) {
          clearInterval(intervalId);
        }
        return { minutes: updatedMinutes, seconds: updatedSeconds };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (pausedState !== null) {
      setCenterCardSlots(pausedState.centerCardSlots);
      setClickCount(pausedState.clickCount);
      setMoveCount(pausedState.moveCount);
      setMovesHistory(pausedState.movesHistory);
      setTimer(pausedState.timer);
    }
  }, [pausedState]);

  useEffect(() => {
    checkForCompletedSequences();
  }, [centerCardSlots]);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let allCardImages = [];

  spadeCardImages.forEach((cardImage) => {
    allCardImages.push(cardImage, cardImage, cardImage, cardImage);
  });

  const remainingSlots = 100 - allCardImages.length;

  for (let i = 0; i < remainingSlots; i++) {
    const randomIndex = Math.floor(Math.random() * spadeCardImages.length);
    allCardImages.push(spadeCardImages[randomIndex]);
  }
  allCardImages = shuffleArray(allCardImages);
  const getCardValue = (card) => {
    const regexPattern = /Suit=\w+, Number=(\w+)/;
    const matchResult = card.match(regexPattern);

    if (matchResult && matchResult.length >= 2) {
      const value = matchResult[1];
      console.log("Card split response:", value);
      console.log(card, "--cards");
      return value;
    } else {
      console.log("Invalid card format:", card);
      return null; 
    }
  };

  const isSequential = (arr) => {
    console.log(arr, "----is sequential arr boolean func");
    const sequence = [
      "King",
      "Queen",
      "Jack",
      "10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "Ace",
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

  const findEmptyFoundation = (foundationPiles) => {
    return foundationPiles.findIndex((pile) => pile.length === 0);
  };

  const generateRandomCards = () => {
    if (clickCount < 5) {
      const updatedClickCount = 5 - clickCount;
      setClickCount(clickCount + 1);

      const dealtIndexes = new Set();

      const updatedCenterCardSlots = centerCardSlots.map((slot) => {
        const newSlot = [...slot];
        while (true) {
          const randomNumber = Math.floor(
            Math.random() * spadeCardImages.length
          );
          if (!dealtIndexes.has(randomNumber)) {
            dealtIndexes.add(randomNumber);
            newSlot.push(spadeCardImages[randomNumber]);
            break;
          }
        }
        return newSlot;
      });

      setCenterCardSlots(updatedCenterCardSlots);

      document.querySelector(".deal-button").innerText =
        updatedClickCount === 0
          ? "Limit Reached"
          : `Deal Left: ${updatedClickCount}`;
    }
  };


  const handleUndo = () => {
    if (movesHistory.length > 0) {
      const lastMove = movesHistory[movesHistory.length - 1];
      const [targetSlotIndex, targetCardIndex] = lastMove.target;
      const [sourceSlotIndex, sourceCardIndex] = lastMove.source;
  
      const updatedCenterCardSlots = [...centerCardSlots];
  
      // Retrieve the dragged cards
      const draggedCards = updatedCenterCardSlots[targetSlotIndex].splice(targetCardIndex);
  
      // Check if the last move involved a red card being dragged and replaced
      const wasRedCardReplaced = draggedCards.includes(Redcard2);
  
      // If the last move involved replacing a red card, revert it back to Redcard2
      if (wasRedCardReplaced) {
        updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex - 1] = Redcard2;
      }
  
      // Move the dragged cards back to their original position
      updatedCenterCardSlots[sourceSlotIndex] = [
        ...updatedCenterCardSlots[sourceSlotIndex].slice(0, sourceCardIndex),
        ...draggedCards,
        ...updatedCenterCardSlots[sourceSlotIndex].slice(sourceCardIndex),
      ];
  
      // Update the state with the reverted move
      setCenterCardSlots(updatedCenterCardSlots);
      setMoveCount(moveCount - 1);
      setMovesHistory(movesHistory.slice(0, -1));
    }
  };
  

  

  const handleReset = () => {
    window.location.reload();
  };

  const handlePause = () => {
    setPausedState({
      centerCardSlots,
      clickCount,
      moveCount,
      movesHistory,
      timer,
      isPaused: true,
    });
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);

    if (pausedState !== null) {
      setTimer(pausedState.timer);
      setCenterCardSlots(pausedState.centerCardSlots);
      setClickCount(pausedState.clickCount);
      setMoveCount(pausedState.moveCount);
      setMovesHistory(pausedState.movesHistory);
    }
    setPausedState(null);
  };

  const handleDrop = (event, targetSlotIndex, targetCardIndex) => {
    event.preventDefault();
    const draggedCard = event.dataTransfer.getData("card");
    const updatedCenterCardSlots = [...centerCardSlots];
    const [sourceSlotIndex, sourceCardIndex] = JSON.parse(
      event.dataTransfer.getData("source")
    );

    if (updatedCenterCardSlots[targetSlotIndex].length === 0) {
      if (isRandomCardInSequence(draggedCard)) {
        updatedCenterCardSlots[targetSlotIndex] = [draggedCard];
        updatedCenterCardSlots[sourceSlotIndex].splice(sourceCardIndex, 1)
        setCenterCardSlots(updatedCenterCardSlots);
        setMoveCount(moveCount + 1);
        setMovesHistory([
          ...movesHistory,
          {
            source: [sourceSlotIndex, sourceCardIndex],
            target: [targetSlotIndex, 0],
          },
        ]);
      } else {
        console.log(
          "Cannot drop a non-random card or card not in sequence form onto an empty stack"
        );
      }
    } else {

      const draggedCards =
        updatedCenterCardSlots[sourceSlotIndex].slice(sourceCardIndex);
      if (isValidMove(draggedCards, targetSlotIndex, targetCardIndex)) {

        const numCardsBeforeDrop =
          updatedCenterCardSlots[targetSlotIndex].length;

        updatedCenterCardSlots[sourceSlotIndex] = updatedCenterCardSlots[
          sourceSlotIndex
        ].slice(0, sourceCardIndex);

        updatedCenterCardSlots[targetSlotIndex] = [
          ...updatedCenterCardSlots[targetSlotIndex].slice(0, targetCardIndex),
          ...draggedCards,
          ...updatedCenterCardSlots[targetSlotIndex].slice(targetCardIndex),
        ];

        const numCardsAfterDrop =
          updatedCenterCardSlots[targetSlotIndex].length;

        const isLastCardRedBefore =
          updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex - 1] ===
          Redcard2;
        const isLastCardRedAfter =
          updatedCenterCardSlots[targetSlotIndex][targetCardIndex - 1] ===
          Redcard2;

        if (isLastCardRedBefore && !isLastCardRedAfter) {
          const randomIndex = Math.floor(
            Math.random() * spadeCardImages.length
          );
          updatedCenterCardSlots[sourceSlotIndex][sourceCardIndex - 1] =
            spadeCardImages[randomIndex];
        }

        setCenterCardSlots(updatedCenterCardSlots);

        event.target.style.marginTop = `${15 * targetCardIndex}px`;

        // Increment move counter
        setMoveCount(moveCount + 1);

        setMovesHistory([
          ...movesHistory,
          {
            source: [sourceSlotIndex, sourceCardIndex],
            target: [targetSlotIndex, targetCardIndex],
          },
        ]);
      }
    }
  };

  const isRandomCardInSequence = (card) => {
    const cardValue = getCardValue(card);
    const sequence = [
      "King",
      "Queen",
      "Jack",
      "10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "Ace",
    ];
    return sequence.includes(cardValue);
  };

  const isValidMove = (draggedCards, targetSlotIndex, targetCardIndex) => {
    if (targetCardIndex === 0) {
      return (
        draggedCards.length === 1 &&
        (draggedCards[0].includes("King") || draggedCards[0].includes("Ace"))
      );
    } else {

      const [topCardValue, topCardSuit] = centerCardSlots[targetSlotIndex][
        targetCardIndex - 1
      ]
        .split("=")[2]
        ?.split(".")[0]
        ?.split(",");

      const [draggedCardValue, draggedCardSuit] = draggedCards[0]
        ?.split("=")[2]
        ?.split(".")[0]
        ?.split(",");

      const sequence = [
        "Ace",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "Jack",
        "Queen",
        "King",
      ];

      const isDescendingOrder = draggedCards.every(
        (card, index) =>
          sequence.indexOf(card.split("=")[2]?.split(".")[0]?.split(",")[0]) ===
          sequence.indexOf(
            draggedCards[0].split("=")[2]?.split(".")[0]?.split(",")[0]
          ) -
            index
      );

      return (
        (isDescendingOrder && 
          sequence.includes(draggedCardValue) &&
          sequence.includes(topCardValue) &&
          sequence.indexOf(draggedCardValue) ===
            sequence.indexOf(topCardValue) - 1) ||

        (draggedCards.length === 2 &&
          draggedCards.every(
            (card) =>
              card.split("=")[2]?.split(".")[0]?.split(",")[0] ===
              draggedCards[0].split("=")[2]?.split(".")[0]?.split(",")[0]
          )) ||
        (draggedCards.length === 1 &&
          !isDescendingOrder &&
          sequence.indexOf(draggedCardValue) ===
            sequence.indexOf(topCardValue) - 1)
      );
    }
  };

  const handleDragOver = (event, slotIndex, cardIndex) => {
    event.preventDefault();
  };

  const handleDragStart = (event, card, sourceSlotIndex, sourceCardIndex) => {
    if (timer.minutes === 0 && timer.seconds === 0) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("card", card);
    event.dataTransfer.setData(
      "source",
      JSON.stringify([sourceSlotIndex, sourceCardIndex])
    );
  };

  const checkForCompletedSequences = () => {
    const updatedFoundationPiles = [...foundationPiles];

    centerCardSlots.forEach((cards, slotIndex) => {
      const sequence = cards.map((card) => getCardValue(card));

      if (
        isSequential(sequence) &&
        sequence.length === 13 &&
        sequence[0] === "King" &&
        sequence[12] === "Ace"
      ) {
        const foundationIndex = findEmptyFoundation(updatedFoundationPiles);
        if (foundationIndex !== -1) {
          updatedFoundationPiles[foundationIndex].push(...cards);
          centerCardSlots[slotIndex] = [];
        }
      } else {
        // Check if the sequence forms a complete sequence starting from King
        let startIndex = sequence.indexOf("King");
        if (startIndex !== -1) {
          const subSequence = sequence.slice(startIndex);
          if (isSequential(subSequence) && subSequence.length >= 13) {
            const foundationIndex = findEmptyFoundation(updatedFoundationPiles);
            if (foundationIndex !== -1) {
              updatedFoundationPiles[foundationIndex].push(
                ...cards.slice(startIndex)
              );
              centerCardSlots[slotIndex] = centerCardSlots[slotIndex].slice(
                0,
                startIndex
              );
            }
          }
        }
      }
    });

    setFoundationPiles(updatedFoundationPiles);
  };
  useEffect(() => {
    if (!difficultySelected) return; 

    let targetFilledPilesCount;
    switch (foundationPiles.length) {
      case 1:
        targetFilledPilesCount = 1;
        break;
      case 2:
        targetFilledPilesCount = 2;
        break;
      case 4:
        targetFilledPilesCount = 3;
        break;
      default:
        targetFilledPilesCount = 0;
    }
    const filledPilesCount = foundationPiles.filter(pile => pile.length > 0).length;
    console.log(filledPilesCount, "--------->fouhkhkjhndation ");
    
    if (filledPilesCount === targetFilledPilesCount) {
      setIsCelebrating(true);
    }
  }, [foundationPiles, difficultySelected]);

  const handleDifficultySelect = (difficulty) => {
    setDifficultySelected(true);

    switch (difficulty) {
      case "easy":
        setFoundationPiles([[]]);
        break;
      case "medium":
        setFoundationPiles([[], []]);
        break;
      case "hard":
        setFoundationPiles([[], [], [], []]);
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    if (isCelebrating) {
      const celebrationTimeout = setTimeout(() => {
        setIsCelebrating(false);
      }, 5000); 
      return () => clearTimeout(celebrationTimeout);
    }
  }, [isCelebrating]);
  


  return (
    <div>
      {isCelebrating ? (
        <div className="bg-gray-900 w-[100vw] h-screen">
          <div className="flex justify-center ">
            <div className="pt-6">
              <img
                className="2xl:w-[1800px] lg:w-[1100px] h-[600px] mx-auto container"
                src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExczljbGhhcnNyeGtxZGo2N296N3U2Yjk3ZXhid2J3Mng2aXZsc3lsciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4QFAH0qZ0LQnIwVYKT/giphy.gif"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex gap-10  justify-center w-screen overflow-x-hidden overflow-y-hidden h-screen bg-[#1e5074]"
          style={{ backgroundColor: "#1e5074", padding: "20px" }}
        >
          <div className="flex flex-col items-center gap-2">
            <img
              className="w-[70px] h-[100px]"
              onClick={generateRandomCards}
              src={Redcard2}
              alt="Red Card"
            />
            <button className="text-white deal-button">
              {clickCount < 5
                ? `Deal Left: ${5 - clickCount}`
                : "Limit Reached"}
            </button>
            <div className="mt-1 text-white">Moves: {moveCount}</div>
            <button
              className="border bg-blue-500 text-white w-[70px]"
              onClick={handleUndo}
            >
              Undo
            </button>
            <button
              className="border bg-red-500 text-white w-[70px] mt-2"
              onClick={handleReset}
            >
              Restart
            </button>
            {/* {isPaused ? (
          <button className='border bg-yellow-500 text-white w-[70px] mt-2' onClick={handleResume}>Resume</button>
        ) : (
          <button className='border bg-gray-500 text-white w-[70px] mt-2' onClick={handlePause}>Pause</button>
        )} */}
            <div className="text-white">
              Time:{" "}
              {`${timer.minutes.toString().padStart(2, "0")}:${timer.seconds
                .toString()
                .padStart(2, "0")}`}
            </div>
          </div>
          <div
            className="cursor-grabbing "
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
              alignItems: "flex-start",
            }}
          >
            {centerCardSlots.map((cards, slotIndex) => (
              <div
                key={slotIndex}
                style={{
                  width: "70px",
                  height: "90px",
                  backgroundColor: "white",
                  border: "1px solid black",
                  marginRight: "10px",
                  position: "relative",
                }}
                onDrop={(event) => handleDrop(event, slotIndex, cards.length)}
                onDragOver={(event) =>
                  handleDragOver(event, slotIndex, cards.length)
                }
              >
                {cards.map((card, cardIndex) => (
                  <img
                    key={cardIndex}
                    src={card}
                    alt="Card"
                    className="card"
                    draggable="true"
                    onDragStart={(event) =>
                      handleDragStart(event, card, slotIndex, cardIndex)
                    }
                    style={{
                      width: "70px",
                      height: "90px",
                      position: "absolute",
                      top: `${cardIndex * 15}px`,
                      marginTop: cardIndex === cards.length - 1 ? "" : "0",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
            }}
          >
            {foundationPiles.map((pile, index) => (
              <div
                key={index}
                style={{
                  width: "70px",
                  height: "90px",
                  borderRadius: "10px",
                  border: "1px solid #000",
                }}
              >
                {pile.length > 0 ? (
                  <img
                    src={Ace}
                    alt={`Foundation ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                      backgroundColor: "lightgrey",
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
          {!difficultySelected && ( 
            <div
              className="difficulty-buttons"
              style={{
                padding: "10px",
                borderRadius: "5px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            ><p className="text-white">SELECT DIFFICULTY</p>
              <button
                className="difficulty-button"
                onClick={() => handleDifficultySelect("easy")}
                style={{
                  backgroundColor: "#3498db",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Easy
              </button>
              <button
                className="difficulty-button"
                onClick={() => handleDifficultySelect("medium")}
                style={{
                  backgroundColor: "#e67e22",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Medium
              </button>
              <button
                className="difficulty-button"
                onClick={() => handleDifficultySelect("hard")}
                style={{
                  backgroundColor: "#c0392b",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Hard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CenterSolitaire; 