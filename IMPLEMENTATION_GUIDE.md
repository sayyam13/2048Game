# 2048 Game - Implementation Guide

This document provides a comprehensive technical guide to understanding and modifying the 2048 game implementation.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Game Logic](#core-game-logic)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [Key Algorithms Explained](#key-algorithms-explained)
7. [Data Flow](#data-flow)
8. [How to Modify](#how-to-modify)

---

## Project Structure

```
project/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main game page (entry point)
│   └── globals.css             # Global Tailwind styles
│
├── components/
│   ├── game-board.tsx          # Visual board and tile rendering
│   ├── game-controls.tsx       # Score display, settings, new game
│   ├── game-status.tsx         # Win/lose modal dialogs
│   ├── mobile-controls.tsx     # Touch controls for mobile
│   └── ui/                     # Shadcn UI components (buttons, dialogs, etc.)
│
├── hooks/
│   └── use-game.ts             # Custom hook for game state management
│
├── lib/
│   ├── game-logic.ts           # Pure functions for game mechanics
│   └── utils.ts                # Utility functions (cn helper)
│
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── next.config.js              # Next.js configuration
```

### Hierarchy

```
page.tsx (UI Layer)
    ↓
useGame (Hook Layer)
    ↓
game-logic.ts (Pure Logic Layer)
    ↓
Board State (Data Layer)
```

---

## Core Game Logic

### Main Logic File: `lib/game-logic.ts`

This file contains all the pure game logic with zero dependencies on React or UI.

#### Key Data Types

```typescript
type Tile = number;              // Single tile value (0 = empty)
type Board = Tile[][];           // 2D array representing the grid
interface GameState {
  board: Board;                  // Current board state
  score: number;                 // Current score
  gameOver: boolean;             // Is game finished?
  won: boolean;                  // Has player reached 2048?
}
```

#### Core Functions

**1. Board Initialization**

```typescript
createEmptyBoard(size: number): Board
```
- Creates a size × size grid filled with zeros
- Uses `Array.fill()` and `map()` for functional approach
- Example: `createEmptyBoard(4)` → 4×4 grid of zeros

```typescript
initializeGame(size: number): GameState
```
- Creates empty board
- Adds two random tiles (2 or 4)
- Returns initial game state
- **This is the entry point for a new game**

**2. Random Tile Generation**

```typescript
getEmptyCells(board: Board): [number, number][]
```
- Scans board for empty cells (value === 0)
- Returns array of coordinates: `[[row, col], ...]`
- Used to find where new tiles can spawn

```typescript
addRandomTile(board: Board): Board
```
- Finds all empty cells
- Randomly selects one position
- 90% chance of 2, 10% chance of 4 (classic 2048 rules)
- Returns **new board** (immutable)

**3. Tile Movement Logic**

The core algorithm for moving tiles:

```typescript
slideRow(row: Tile[]): { row: Tile[]; score: number }
```

This is the heart of the game. Here's how it works step-by-step:

1. **Filter**: Remove all zeros (empty cells)
   ```
   [2, 0, 2, 0] → [2, 2]
   ```

2. **Merge**: Combine adjacent matching numbers
   ```
   [2, 2, 4, 4] → [4, 8]
   Score += 4 + 8 = 12
   ```

3. **Pad**: Fill remaining spaces with zeros
   ```
   [4, 8] → [4, 8, 0, 0]
   ```

**4. Directional Moves**

```typescript
moveLeft(board: Board): { board: Board; score: number }
```
- Applies `slideRow` to each row
- Direct implementation, no rotation needed

```typescript
moveRight(board: Board): { board: Board; score: number }
```
- Reverses each row
- Applies `slideRow`
- Reverses result back

```typescript
moveUp(board: Board): { board: Board; score: number }
```
- Rotates board 90° counterclockwise (3 times clockwise)
- Applies `moveLeft`
- Rotates back

```typescript
moveDown(board: Board): { board: Board; score: number }
```
- Rotates board 90° clockwise
- Applies `moveLeft`
- Rotates back 90° counterclockwise (3 times clockwise)

**Why rotation?** Instead of writing separate logic for all 4 directions, we rotate the board so we can always use the same `slideRow` logic horizontally.

**5. Board Rotation**

```typescript
rotateBoard(board: Board): Board
```
- Rotates 90° clockwise
- Uses matrix transpose + reverse
- Formula: `board[j][size-1-i] = board[i][j]`

Visual example:
```
[1, 2]       [3, 1]
[3, 4]  →    [4, 2]
```

**6. Game State Checks**

```typescript
canMove(board: Board): boolean
```
- Checks if any moves are possible
- Returns true if:
  - Empty cells exist, OR
  - Adjacent tiles can merge (horizontal or vertical)

```typescript
hasWon(board: Board): boolean
```
- Scans entire board
- Returns true if any tile ≥ 2048

```typescript
boardsEqual(board1: Board, board2: Board): boolean
```
- Compares two boards cell by cell
- Used to detect if a move actually changed anything
- If boards are equal, move is invalid (don't spawn new tile)

**7. Main Move Function**

```typescript
makeMove(state: GameState, direction: 'up'|'down'|'left'|'right'): GameState
```

This orchestrates everything:

1. Check if game is over → return unchanged state
2. Apply directional move (moveLeft/Right/Up/Down)
3. Compare old vs new board
4. If unchanged → return old state (invalid move)
5. If changed:
   - Add random tile
   - Update score
   - Check win condition
   - Check game over condition
   - Return new state

**This function is pure**: same input always produces same output, no side effects.

---

## Component Architecture

### Component Hierarchy

```
page.tsx
├── GameControls
│   ├── Score Display
│   ├── Settings Dialog
│   │   └── Board Size Input
│   └── New Game Button
│
├── Card
│   └── GameBoard
│       └── Tiles (grid)
│
├── MobileControls
│   └── Directional Buttons
│
└── GameStatus
    └── Win/Lose Modal
```

---

## File-by-File Breakdown

### 1. `app/page.tsx` - Main Game Page

**Purpose**: Entry point, UI composition, event handling

**Key Code:**
```typescript
const { gameState, boardSize, handleMove, handleRestart, handleBoardSizeChange } = useGame(4);
```

**What it does:**
- Imports `useGame` hook for state management
- Passes down props to child components
- Renders the complete game UI
- No game logic here, only presentation

**Props flow:**
- `GameControls`: Gets score, restart handler, board size controls
- `GameBoard`: Gets current board state and size
- `MobileControls`: Gets move handler
- `GameStatus`: Gets game over/won state, score, restart handler

### 2. `hooks/use-game.ts` - State Management Hook

**Purpose**: Bridge between UI and game logic, handles side effects

**State:**
```typescript
const [boardSize, setBoardSize] = useState(4);
const [gameState, setGameState] = useState(() => initializeGame(4));
```

**Functions:**

**a) handleMove**
```typescript
const handleMove = useCallback((direction: 'up'|'down'|'left'|'right') => {
  setGameState((prevState) => makeMove(prevState, direction));
}, []);
```
- Calls pure `makeMove` function from game-logic.ts
- Updates state with new game state
- `useCallback` prevents unnecessary re-renders

**b) handleRestart**
```typescript
const handleRestart = useCallback(() => {
  setGameState(initializeGame(boardSize));
}, [boardSize]);
```
- Creates fresh game state
- Maintains current board size

**c) handleBoardSizeChange**
```typescript
const handleBoardSizeChange = useCallback((newSize: number) => {
  setBoardSize(newSize);
  setGameState(initializeGame(newSize));
}, []);
```
- Updates board size
- Immediately starts new game with new size

**Side Effects (useEffect):**

Keyboard event listener:
```typescript
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    switch (event.key) {
      case 'ArrowUp': handleMove('up'); break;
      // ... other directions
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [gameState.gameOver, handleMove]);
```

- Listens for arrow key presses
- Prevents default browser scrolling
- Disabled when game is over
- Cleanup on unmount

### 3. `components/game-board.tsx` - Board Rendering

**Purpose**: Visual representation of the game board

**Key Functions:**

**a) getTileColor(value: number)**
- Maps tile values to Tailwind CSS classes
- Color scheme:
  - 0: Gray (empty)
  - 2-4: Amber shades
  - 8-32: Orange shades
  - 64-512: Red/yellow shades
  - 1024+: Emerald (success) shades

**b) getTileSize(boardSize: number)**
- Adjusts font size based on grid size
- Ensures tiles remain readable on larger grids
- 4×4: text-4xl
- 6×6: text-3xl
- 8×8: text-2xl
- 10×10: text-xl

**Rendering Logic:**
```typescript
board.map((row, i) =>
  row.map((cell, j) => (
    <div key={`${i}-${j}`} className={getTileColor(cell)}>
      {cell !== 0 && cell}
    </div>
  ))
)
```

- Nested map creates 2D grid
- Each cell gets unique key
- Empty cells (0) show nothing
- Dynamic styling based on value

**Dynamic Grid:**
```typescript
style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
```
- CSS Grid with dynamic column count
- Responsive sizing

### 4. `components/game-controls.tsx` - Controls UI

**Purpose**: Score display, settings, and restart button

**Components:**

**a) Score Display**
- Shows current score in styled box

**b) Settings Dialog**
- Shadcn Dialog component
- Input for board size (3-10)
- Validates range
- Auto-restarts game on change

**c) New Game Button**
- Calls `onRestart` prop
- Icon from Lucide React

### 5. `components/game-status.tsx` - Win/Lose Modal

**Purpose**: Display game end state

**Logic:**
```typescript
<Dialog open={gameOver || won}>
```
- Opens when game ends OR player wins
- Shows different messages for win vs lose
- Displays final score
- "Play Again" button calls restart

**Conditional Rendering:**
```typescript
{won
  ? 'You reached 2048! You won!'
  : 'No more moves available.'}
```

### 6. `components/mobile-controls.tsx` - Touch Controls

**Purpose**: On-screen buttons for mobile devices

**Features:**
- 4 directional buttons (up, down, left, right)
- Hidden on desktop (md:hidden)
- Disabled when game is over
- Large touch targets (h-14 w-14)
- Icons from Lucide React

---

## State Management

### State Flow Diagram

```
User Action (keyboard/click)
    ↓
Handler in useGame (handleMove)
    ↓
makeMove (pure function)
    ↓
New GameState
    ↓
React setState
    ↓
Re-render components
    ↓
UI updates
```

### State Updates

**Important**: All state updates create NEW objects (immutability)

Example:
```typescript
// BAD (mutates state)
board[0][0] = 2;

// GOOD (creates new board)
const newBoard = board.map(row => [...row]);
newBoard[0][0] = 2;
```

This ensures:
- React detects changes
- Previous state preserved for comparison
- Predictable behavior
- Easier debugging

---

## Key Algorithms Explained

### Algorithm 1: Slide and Merge

**Problem**: Move all tiles in one direction and merge matching adjacent tiles

**Solution**: Three-step process

```typescript
function slideRow(row: [2, 0, 2, 4]) {
  // Step 1: Remove zeros
  filtered = [2, 2, 4]

  // Step 2: Merge adjacent matches
  i = 0: filtered[0]=2, filtered[1]=2 → match!
    merged.push(4), score += 4, i += 2
  i = 2: filtered[2]=4, no match
    merged.push(4), i += 1

  // Result: merged = [4, 4]

  // Step 3: Pad with zeros
  while (merged.length < 4) merged.push(0)

  // Final: [4, 4, 0, 0], score = 4
}
```

**Time Complexity**: O(n) where n = board size

**Space Complexity**: O(n) for filtered array

### Algorithm 2: Board Rotation

**Problem**: Rotate board 90° clockwise

**Solution**: Transpose + Reverse

```typescript
Original:        Transpose:       Reverse rows:
[1, 2, 3]       [1, 4, 7]        [7, 4, 1]
[4, 5, 6]  →    [2, 5, 8]   →    [8, 5, 2]
[7, 8, 9]       [3, 6, 9]        [9, 6, 3]
```

**Implementation:**
```typescript
board[0].map((_, colIndex) =>           // For each column
  board.map(row => row[colIndex])       // Collect values
       .reverse()                       // Reverse for clockwise
)
```

**Why?** Allows us to reuse horizontal slide logic for all directions

### Algorithm 3: Move Detection

**Problem**: Check if any valid moves exist

**Solution**: Two conditions

```typescript
function canMove(board) {
  // Condition 1: Empty cells exist
  if (hasEmptyCell(board)) return true;

  // Condition 2: Adjacent matching tiles
  for (i, j in board) {
    if (board[i][j] === board[i][j+1]) return true;  // Horizontal
    if (board[i][j] === board[i+1][j]) return true;  // Vertical
  }

  return false;
}
```

**Time Complexity**: O(n²) where n = board size

**Early Exit**: Returns true as soon as valid move found

---

## Data Flow

### New Game Flow

```
1. User clicks "New Game"
   ↓
2. handleRestart() called
   ↓
3. initializeGame(boardSize)
   ↓
4. createEmptyBoard(4) → [[0,0,0,0], ...]
   ↓
5. addRandomTile() → adds first tile
   ↓
6. addRandomTile() → adds second tile
   ↓
7. Returns GameState { board, score: 0, ... }
   ↓
8. setGameState updates state
   ↓
9. Components re-render with new board
```

### Move Flow

```
1. User presses Arrow Key
   ↓
2. handleKeyPress detects event
   ↓
3. handleMove('up') called
   ↓
4. makeMove(currentState, 'up')
   ↓
5. moveUp(board)
   ↓
6. rotateBoard (3 times)
   ↓
7. moveLeft (apply slideRow to each row)
   ↓
8. rotateBoard (1 time to restore)
   ↓
9. Compare old vs new board
   ↓
10. If changed:
    - addRandomTile()
    - Update score
    - Check win/lose
    ↓
11. Return new GameState
    ↓
12. setGameState updates state
    ↓
13. Components re-render
```

### Board Size Change Flow

```
1. User opens Settings dialog
   ↓
2. Changes input value to 6
   ↓
3. handleBoardSizeChange(6)
   ↓
4. setBoardSize(6)
   ↓
5. initializeGame(6) → creates 6×6 board
   ↓
6. setGameState with new board
   ↓
7. Dialog auto-closes
   ↓
8. New 6×6 game starts
```

---

## How to Modify

### Common Modifications

#### 1. Change Win Condition

**Location**: `lib/game-logic.ts`

**Current**:
```typescript
export const hasWon = (board: Board): boolean => {
  return board.some(row => row.some(cell => cell >= 2048));
};
```

**To win at 4096**:
```typescript
export const hasWon = (board: Board): boolean => {
  return board.some(row => row.some(cell => cell >= 4096));
};
```

#### 2. Change Starting Tile Probability

**Location**: `lib/game-logic.ts` → `addRandomTile`

**Current**: 90% chance of 2, 10% chance of 4
```typescript
const value = Math.random() < 0.9 ? 2 : 4;
```

**50/50 chance**:
```typescript
const value = Math.random() < 0.5 ? 2 : 4;
```

**Always start with 2**:
```typescript
const value = 2;
```

#### 3. Change Number of Starting Tiles

**Location**: `lib/game-logic.ts` → `initializeGame`

**Current**: Two tiles
```typescript
board = addRandomTile(board);
board = addRandomTile(board);
```

**Start with three tiles**:
```typescript
board = addRandomTile(board);
board = addRandomTile(board);
board = addRandomTile(board);
```

#### 4. Add Undo Feature

**Step 1**: Store history in `use-game.ts`
```typescript
const [history, setHistory] = useState<GameState[]>([]);
```

**Step 2**: Save state before each move
```typescript
const handleMove = useCallback((direction) => {
  setHistory(prev => [...prev, gameState]);
  setGameState(prevState => makeMove(prevState, direction));
}, [gameState]);
```

**Step 3**: Add undo function
```typescript
const handleUndo = useCallback(() => {
  if (history.length === 0) return;
  const previousState = history[history.length - 1];
  setGameState(previousState);
  setHistory(prev => prev.slice(0, -1));
}, [history]);
```

**Step 4**: Add button in UI
```typescript
<Button onClick={handleUndo} disabled={history.length === 0}>
  Undo
</Button>
```

#### 5. Add Animation

**Location**: `components/game-board.tsx`

**Add to tile div**:
```typescript
className={cn(
  getTileColor(cell),
  'transition-all duration-200 ease-in-out',
  'animate-in fade-in zoom-in'
)}
```

**For smooth movement**: Use CSS Grid animations or Framer Motion

#### 6. Change Color Scheme

**Location**: `components/game-board.tsx` → `getTileColor`

**Example - Blue theme**:
```typescript
const colors: Record<number, string> = {
  0: 'bg-gray-200',
  2: 'bg-blue-100 text-gray-700',
  4: 'bg-blue-200 text-gray-700',
  8: 'bg-blue-300 text-white',
  16: 'bg-blue-400 text-white',
  32: 'bg-blue-500 text-white',
  64: 'bg-blue-600 text-white',
  128: 'bg-blue-700 text-white',
  256: 'bg-blue-800 text-white',
  512: 'bg-blue-900 text-white',
  1024: 'bg-purple-600 text-white',
  2048: 'bg-purple-700 text-white',
};
```

#### 7. Add High Score Tracking

**Step 1**: Add to `use-game.ts`
```typescript
const [highScore, setHighScore] = useState(() => {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('highScore') || '0');
  }
  return 0;
});
```

**Step 2**: Update on score change
```typescript
useEffect(() => {
  if (gameState.score > highScore) {
    setHighScore(gameState.score);
    localStorage.setItem('highScore', gameState.score.toString());
  }
}, [gameState.score, highScore]);
```

**Step 3**: Display in `game-controls.tsx`
```typescript
<div className="bg-gray-200 px-6 py-3 rounded-lg">
  <div className="text-sm text-gray-600 font-medium">HIGH SCORE</div>
  <div className="text-2xl font-bold text-gray-800">{highScore}</div>
</div>
```

#### 8. Add Different Tile Spawn Positions

**Location**: `lib/game-logic.ts` → `addRandomTile`

**Current**: Random empty cell
```typescript
const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
```

**Prefer edges**:
```typescript
const edgeCells = emptyCells.filter(([r, c]) =>
  r === 0 || r === board.length - 1 || c === 0 || c === board[0].length - 1
);
const cells = edgeCells.length > 0 ? edgeCells : emptyCells;
const [row, col] = cells[Math.floor(Math.random() * cells.length)];
```

#### 9. Add Sound Effects

**Step 1**: Install howler.js
```bash
npm install howler
```

**Step 2**: Add to `use-game.ts`
```typescript
import { Howl } from 'howler';

const moveSound = new Howl({ src: ['/sounds/move.mp3'] });
const mergeSound = new Howl({ src: ['/sounds/merge.mp3'] });
const winSound = new Howl({ src: ['/sounds/win.mp3'] });

const handleMove = useCallback((direction) => {
  const oldState = gameState;
  const newState = makeMove(gameState, direction);

  if (!boardsEqual(oldState.board, newState.board)) {
    moveSound.play();
    if (newState.score > oldState.score) {
      mergeSound.play();
    }
  }

  if (newState.won && !oldState.won) {
    winSound.play();
  }

  setGameState(newState);
}, [gameState]);
```

#### 10. Add Touch Swipe Gestures

**Step 1**: Install react-swipeable
```bash
npm install react-swipeable
```

**Step 2**: Add to `app/page.tsx`
```typescript
import { useSwipeable } from 'react-swipeable';

const swipeHandlers = useSwipeable({
  onSwipedLeft: () => handleMove('left'),
  onSwipedRight: () => handleMove('right'),
  onSwipedUp: () => handleMove('up'),
  onSwipedDown: () => handleMove('down'),
  preventScrollOnSwipe: true,
});

return (
  <div {...swipeHandlers}>
    {/* game UI */}
  </div>
);
```

---

## Testing Scenarios

### Manual Testing Checklist

1. **Basic Movement**
   - [ ] All four directions work
   - [ ] Tiles slide to edge
   - [ ] Invalid moves don't add new tiles

2. **Merging**
   - [ ] Same tiles merge
   - [ ] Score updates correctly
   - [ ] Multiple merges in one move
   - [ ] No double-merging (2+2+4 → 4+4, not 8)

3. **Win Condition**
   - [ ] Reaching 2048 shows win modal
   - [ ] Can continue playing after winning

4. **Lose Condition**
   - [ ] Game over when board full and no merges
   - [ ] Modal displays correctly

5. **Board Size**
   - [ ] Can change size in settings
   - [ ] Game restarts with new size
   - [ ] Tiles scale appropriately

6. **Persistence**
   - [ ] New game resets score
   - [ ] New game creates random starting tiles

7. **Responsive**
   - [ ] Works on mobile
   - [ ] Touch controls appear on small screens
   - [ ] Keyboard hint hidden on mobile

---

## Performance Considerations

### Optimization Techniques Used

1. **useCallback**: Prevents function recreation on every render
2. **Pure Functions**: Predictable, cacheable, testable
3. **Immutability**: Easier change detection for React
4. **Early Returns**: Avoid unnecessary computation
5. **CSS Transitions**: Hardware-accelerated animations

### Potential Bottlenecks

- Large board sizes (10×10+) may impact performance
- Can optimize with React.memo for tile components
- Use virtualization for very large grids

---

## Architecture Decisions

### Why Functional Programming?

1. **Testability**: Pure functions easy to test
2. **Predictability**: Same input = same output
3. **Debugging**: No hidden state changes
4. **Parallelization**: Pure functions safe to run in parallel
5. **Reasoning**: Easier to understand data flow

### Why Separate Logic from UI?

1. **Reusability**: Game logic works in any framework
2. **Testing**: Test logic without rendering components
3. **Maintainability**: Changes isolated to specific files
4. **Portability**: Easy to port to React Native, etc.

### Why Custom Hook?

1. **Encapsulation**: All game state in one place
2. **Reusability**: Can use in multiple components
3. **Separation**: UI doesn't need to know implementation
4. **Testing**: Can test hook independently

---

## Functional Programming Principles Applied

### 1. Pure Functions

Every function in `game-logic.ts` is pure:

```typescript
// Always returns same output for same input
// No side effects (no console.log, no mutations, no API calls)
function addNumbers(a: number, b: number): number {
  return a + b;
}
```

### 2. Immutability

Never mutate data, always create new:

```typescript
// BAD
function badMove(board: Board): Board {
  board[0][0] = 2;  // Mutation!
  return board;
}

// GOOD
function goodMove(board: Board): Board {
  const newBoard = board.map(row => [...row]);  // Create copy
  newBoard[0][0] = 2;
  return newBoard;
}
```

### 3. Function Composition

Build complex logic from simple functions:

```typescript
// Small, focused functions
const filter = (arr) => arr.filter(x => x !== 0);
const merge = (arr) => /* merge logic */;
const pad = (arr, length) => /* pad logic */;

// Compose into complex function
const slideRow = (row) => pad(merge(filter(row)), row.length);
```

### 4. Higher-Order Functions

Functions that work on other functions:

```typescript
// map, filter, reduce are higher-order
board.map(row => slideRow(row));
```

### 5. Declarative Style

Describe WHAT, not HOW:

```typescript
// Imperative (HOW)
let emptyCells = [];
for (let i = 0; i < board.length; i++) {
  for (let j = 0; j < board[i].length; j++) {
    if (board[i][j] === 0) {
      emptyCells.push([i, j]);
    }
  }
}

// Declarative (WHAT)
const emptyCells = board.flatMap((row, i) =>
  row.map((cell, j) => cell === 0 ? [i, j] : null)
     .filter(Boolean)
);
```

---

## Interview Preparation

### Expected Questions & Answers

**Q: Why did you choose this architecture?**

A: I separated concerns into three layers:
1. Pure logic (game-logic.ts) - testable, portable
2. State management (use-game.ts) - handles side effects
3. UI components - only presentation

This makes the code modular, testable, and easy to modify.

**Q: How does the merge algorithm work?**

A: Three steps:
1. Filter out zeros
2. Merge adjacent matching tiles (tracking score)
3. Pad with zeros to maintain array length

Example: [2,0,2,4] → [2,2,4] → [4,4] → [4,4,0,0]

**Q: Why use board rotation for directional moves?**

A: Instead of writing 4 separate algorithms, I rotate the board so I can always use the same horizontal slide logic. This reduces code duplication and potential bugs.

**Q: How would you add multiplayer?**

A:
1. Add Supabase for state sync
2. Store game state in database
3. Use real-time subscriptions for updates
4. Add turn-based logic
5. Handle conflict resolution

**Q: How would you optimize for larger boards?**

A:
1. React.memo on tile components
2. Virtual scrolling for >10×10 grids
3. Web Workers for game logic calculation
4. Canvas rendering instead of DOM elements

**Q: Explain your state management approach**

A: I use React hooks with functional setState:
- `useState` for game state
- `useCallback` to prevent unnecessary re-renders
- `useEffect` for keyboard events (side effects)
- Pure functions ensure predictable state transitions

---

## Debugging Tips

### Common Issues & Solutions

**Issue**: Tiles not merging correctly
- **Check**: `slideRow` function logic
- **Debug**: Add console.log before/after merge
- **Test**: Unit test with [2,2,2,2] → should be [4,4,0,0]

**Issue**: Board not updating after move
- **Check**: Ensure `makeMove` returns new board (not mutated)
- **Debug**: Compare board references (oldBoard === newBoard)
- **Fix**: Always use `map` to create new arrays

**Issue**: Keyboard not working
- **Check**: `useEffect` dependencies
- **Debug**: Add console.log in event handler
- **Fix**: Ensure component is focused (or use window listener)

**Issue**: Score not updating
- **Check**: `slideRow` score calculation
- **Debug**: Log score deltas
- **Fix**: Ensure all merge operations add to score

**Issue**: New tile spawning in occupied cell
- **Check**: `getEmptyCells` logic
- **Debug**: Log empty cell coordinates
- **Fix**: Verify filter condition (cell === 0)

---

## Resources for Further Learning

1. **Functional Programming**
   - "Mostly Adequate Guide to FP" (free online)
   - Look into Ramda.js for FP utilities

2. **Game Logic Algorithms**
   - Research "Sliding Tile Puzzle" algorithms
   - Study expectimax algorithm for AI opponent

3. **React Patterns**
   - Kent C. Dodds' blog on React patterns
   - React docs on hooks

4. **Next.js**
   - Official Next.js documentation
   - Learn about App Router vs Pages Router

---

This guide should give you everything needed to understand, modify, and extend the 2048 game implementation. Good luck with your interview!
