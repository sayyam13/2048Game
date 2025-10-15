'use client';

import { Board } from '@/src/lib/game-logic';
import { cn } from '@/src/lib/utils';

interface GameBoardProps {
  board: Board;
  size: number;
}

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    0: 'bg-gray-200',
    2: 'bg-amber-100 text-gray-700',
    4: 'bg-amber-200 text-gray-700',
    8: 'bg-orange-300 text-white',
    16: 'bg-orange-400 text-white',
    32: 'bg-orange-500 text-white',
    64: 'bg-red-400 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-emerald-400 text-white',
    2048: 'bg-emerald-500 text-white',
    4096: 'bg-emerald-600 text-white',
  };
  return colors[value] || 'bg-gray-800 text-white';
};

const getTileSize = (boardSize: number): string => {
  if (boardSize <= 4) return 'text-4xl';
  if (boardSize <= 6) return 'text-3xl';
  if (boardSize <= 8) return 'text-2xl';
  return 'text-xl';
};

export function GameBoard({ board, size }: GameBoardProps) {
  const gap = size <= 4 ? 'gap-4' : size <= 6 ? 'gap-3' : 'gap-2';

  return (
    <div
      className={cn('grid bg-gray-300 rounded-lg p-4', gap)}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={cn(
              'aspect-square rounded-lg flex items-center justify-center font-bold transition-all duration-100',
              getTileColor(cell),
              getTileSize(size)
            )}
          >
            {cell !== 0 && cell}
          </div>
        ))
      )}
    </div>
  );
}
