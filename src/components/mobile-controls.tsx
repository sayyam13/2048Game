"use client";

import { Button } from '@/src/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  disabled?: boolean;
}

export function MobileControls({ onMove, disabled = false }: MobileControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2 md:hidden">
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14"
        onClick={() => onMove('up')}
        disabled={disabled}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14"
          onClick={() => onMove('left')}
          disabled={disabled}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14"
          onClick={() => onMove('down')}
          disabled={disabled}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14"
          onClick={() => onMove('right')}
          disabled={disabled}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
