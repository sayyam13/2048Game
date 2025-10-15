"use client";

import { useState, useEffect, useCallback } from 'react';
import { GameState, initializeGame, makeMove } from '@/src/lib/game-logic';

export function useGame(initialBoardSize: number = 4) {
  const [boardSize, setBoardSize] = useState(initialBoardSize);
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGame(boardSize)
  );

  const handleMove = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      setGameState((prevState) => makeMove(prevState, direction));
    },
    []
  );

  const handleRestart = useCallback(() => {
    setGameState(initializeGame(boardSize));
  }, [boardSize]);

  const handleBoardSizeChange = useCallback((newSize: number) => {
    setBoardSize(newSize);
    setGameState(initializeGame(newSize));
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, handleMove]);

  return {
    gameState,
    boardSize,
    handleMove,
    handleRestart,
    handleBoardSizeChange,
  };
}
