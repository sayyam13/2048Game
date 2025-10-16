# 2048 Game

A fully functional implementation of the popular 2048 puzzle game built with modern web technologies.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality React component library
- **Lucide React** - Beautiful icon library

## Features

- Classic 2048 gameplay mechanics
- Configurable board size (3x3 to 10x10)
- Keyboard controls for desktop
- Touch controls for mobile devices
- Score tracking
- Win/lose detection
- Game restart functionality
- Responsive design
- Clean, modular architecture

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

Export as static site:
```bash
npm run build
```

## Gameplay Instructions

### Objective

Combine tiles with the same number to reach the **2048** tile!

### How to Play

1. **Starting the Game**
   - The game begins with two random tiles (2 or 4) on a 4x4 grid
   - Use arrow keys (desktop) or on-screen buttons (mobile) to move tiles

2. **Making Moves**
   - Press arrow keys: ↑ ↓ ← → (desktop)
   - Tap directional buttons (mobile)
   - All tiles slide in the chosen direction
   - Tiles with the same number merge into one

3. **Scoring**
   - Each time tiles merge, their sum is added to your score
   - Example: Two 4s merge → 8 points added

4. **Winning**
   - Reach the 2048 tile to win
   - You can continue playing after winning

5. **Game Over**
   - The game ends when no more moves are possible
   - No empty spaces and no adjacent tiles can merge

### Controls

**Desktop:**
- Arrow Up (↑) - Move tiles up
- Arrow Down (↓) - Move tiles down
- Arrow Left (←) - Move tiles left
- Arrow Right (→) - Move tiles right

**Mobile:**
- Use on-screen directional buttons

### Settings

Click the settings icon to configure:
- Board size (3x3 to 10x10)
- Changing board size starts a new game

### New Game

Click the "New Game" button to restart at any time.

## Implementation Details

### Architecture

The application follows a clean, modular architecture with separation of concerns:

```
src/app/                    # Next.js app directory
├── layout.tsx         # Root layout
├── page.tsx           # Main game page
└── globals.css        # Global styles

src/components/            # React components
├── game-board.tsx    # Board and tile rendering
├── game-controls.tsx # Score and controls UI
├── game-status.tsx   # Win/lose modals
├── mobile-controls.tsx # Touch controls
└── ui/               # Shadcn UI components

src/hooks/                # Custom React hooks
└── use-game.ts       # Game state management

src/lib/                  # Core logic
├── game-logic.ts     # Pure game logic functions
└── utils.ts          # Utility functions
```

### Functional Programming Principles

The game logic follows functional programming principles:

- **Pure Functions**: All game logic functions are pure (no side effects)
- **Immutability**: Board state is never mutated, always returns new state
- **Declarative**: Logic describes what should happen, not how
- **Composability**: Small, focused functions that compose together

### Key Algorithms

**Tile Sliding:**
- Filter empty cells
- Merge adjacent matching tiles
- Calculate score from merges
- Pad remaining spaces with zeros

**Board Rotation:**
- Used to implement all four directions using a single slide function
- Rotate board, apply slide, rotate back

**Win/Lose Detection:**
- Win: Check if any tile equals or exceeds 2048
- Lose: No empty cells AND no adjacent matching tiles

### State Management

- React hooks for local state
- Custom `useGame` hook encapsulates all game logic
- State updates trigger re-renders
- Keyboard events handled via useEffect

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for 60fps animations
- Static generation for fast loading
- Minimal bundle size
- Tree-shaking enabled

## License
This project is created as part of a technical assignment/personal project.

## Author
Sayyam Jain
