'use client';

import { GameBoard } from '@/src/components/game-board';
import { GameControls } from '@/src/components/game-controls';
import { GameStatus } from '@/src/components/game-status';
import { MobileControls } from '@/src/components/mobile-controls';
import { useGame } from '@/src/hooks/use-game';
import { Card } from '@/src/components/ui/card';
import { Keyboard } from 'lucide-react';

export default function Home() {
  const {
    gameState,
    boardSize,
    handleMove,
    handleRestart,
    handleBoardSizeChange,
  } = useGame(4);

  return (
    <div className="flex items-center justify-center p-3">
      <div className="w-full max-w-2xl space-y-4">
        <GameControls
          score={gameState.score}
          onRestart={handleRestart}
          boardSize={boardSize}
          onBoardSizeChange={handleBoardSizeChange}
        />

        <Card className="p-2">
          <GameBoard board={gameState.board} size={boardSize} />
        </Card>

        <MobileControls onMove={handleMove} disabled={gameState.gameOver} />

        <div className="hidden md:flex items-center justify-center gap-2 text-sm text-gray-500">
          <Keyboard className="h-4 w-4" />
          <span>Use arrow keys to move tiles</span>
        </div>

        <GameStatus
          gameOver={gameState.gameOver}
          won={gameState.won}
          score={gameState.score}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}
