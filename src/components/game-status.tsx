"use client";

import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface GameStatusProps {
  gameOver: boolean;
  won: boolean;
  score: number;
  onRestart: () => void;
}

export function GameStatus({ gameOver, won, score, onRestart }: GameStatusProps) {
  return (
    <Dialog open={gameOver || won}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {won ? '🎉 Congratulations!' : 'Game Over'}
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            {won
              ? 'You reached 2048! You won the game!'
              : 'No more moves available.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-gray-100 px-8 py-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium text-center">
              FINAL SCORE
            </div>
            <div className="text-4xl font-bold text-gray-800 text-center">
              {score}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onRestart} className="w-full">
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
