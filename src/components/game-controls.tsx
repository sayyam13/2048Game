'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { RotateCcw, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';

interface GameControlsProps {
  score: number;
  onRestart: () => void;
  boardSize: number;
  onBoardSizeChange: (size: number) => void;
}

export function GameControls({
  score,
  onRestart,
  boardSize,
  onBoardSizeChange,
}: GameControlsProps) {
  const handleSizeChange = (value: string) => {
    const size = parseInt(value);
    if (size >= 3 && size <= 10) {
      onBoardSizeChange(size);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        <div className="bg-gray-200 px-4 py-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">SCORE</div>
          <div className="text-xl font-bold text-gray-800">{score}</div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-gray-800">2048</h1>
        <p className="text-gray-600">
          Join the tiles to reach <span className="font-bold">2048</span>!
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Game Settings</DialogTitle>
              <DialogDescription>
                Configure the board size for your game
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="board-size">
                  Board Size: {boardSize} x {boardSize}
                </Label>
                <Input
                  id="board-size"
                  type="number"
                  min="3"
                  max="10"
                  value={boardSize}
                  onChange={(e) => handleSizeChange(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Choose a board size between 3x3 and 10x10
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={onRestart} variant="default">
          <RotateCcw className="h-4 w-4 mr-2" />
          New Game
        </Button>
      </div>
    </div>
  );
}
