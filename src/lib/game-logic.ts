export type Tile = number;
export type Board = Tile[][];

export interface GameState {
  board: Board;
  score: number;
  gameOver: boolean;
  won: boolean;
}

export const createEmptyBoard = (size: number): Board => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

export const getEmptyCells = (board: Board): [number, number][] => {
  const emptyCells: [number, number][] = [];
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 0) {
        emptyCells.push([i, j]);
      }
    });
  });
  return emptyCells;
};

export const addRandomTile = (board: Board): Board => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = value;
  return newBoard;
};

export const initializeGame = (size: number): GameState => {
  let board = createEmptyBoard(size);
  board = addRandomTile(board);
  board = addRandomTile(board);

  return {
    board,
    score: 0,
    gameOver: false,
    won: false,
  };
};

const slideRow = (row: Tile[]): { row: Tile[]; score: number } => {
  const filtered = row.filter(cell => cell !== 0);
  const merged: Tile[] = [];
  let score = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }

  while (merged.length < row.length) {
    merged.push(0);
  }

  return { row: merged, score };
};

const rotateBoard = (board: Board): Board => {
  const size = board.length;
  return board[0].map((_, colIndex) =>
    board.map(row => row[colIndex]).reverse()
  );
};

const boardsEqual = (board1: Board, board2: Board): boolean => {
  return board1.every((row, i) =>
    row.every((cell, j) => cell === board2[i][j])
  );
};

export const moveLeft = (board: Board): { board: Board; score: number } => {
  let totalScore = 0;
  const newBoard = board.map(row => {
    const { row: newRow, score } = slideRow(row);
    totalScore += score;
    return newRow;
  });
  return { board: newBoard, score: totalScore };
};

export const moveRight = (board: Board): { board: Board; score: number } => {
  let totalScore = 0;
  const newBoard = board.map(row => {
    const reversed = [...row].reverse();
    const { row: newRow, score } = slideRow(reversed);
    totalScore += score;
    return newRow.reverse();
  });
  return { board: newBoard, score: totalScore };
};

export const moveUp = (board: Board): { board: Board; score: number } => {
  const rotated = rotateBoard(rotateBoard(rotateBoard(board)));
  const { board: moved, score } = moveLeft(rotated);
  const result = rotateBoard(moved);
  return { board: result, score };
};

export const moveDown = (board: Board): { board: Board; score: number } => {
  const rotated = rotateBoard(board);
  const { board: moved, score } = moveLeft(rotated);
  const result = rotateBoard(rotateBoard(rotateBoard(moved)));
  return { board: result, score };
};

export const canMove = (board: Board): boolean => {
  if (getEmptyCells(board).length > 0) return true;

  const size = board.length;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const current = board[i][j];
      if (j < size - 1 && current === board[i][j + 1]) return true;
      if (i < size - 1 && current === board[i + 1][j]) return true;
    }
  }

  return false;
};

export const hasWon = (board: Board): boolean => {
  return board.some(row => row.some(cell => cell >= 2048));
};

export const makeMove = (
  state: GameState,
  direction: 'up' | 'down' | 'left' | 'right'
): GameState => {
  if (state.gameOver) return state;

  let result: { board: Board; score: number };

  switch (direction) {
    case 'left':
      result = moveLeft(state.board);
      break;
    case 'right':
      result = moveRight(state.board);
      break;
    case 'up':
      result = moveUp(state.board);
      break;
    case 'down':
      result = moveDown(state.board);
      break;
  }

  if (boardsEqual(result.board, state.board)) {
    return state;
  }

  const newBoard = addRandomTile(result.board);
  const newScore = state.score + result.score;
  const won = !state.won && hasWon(newBoard);
  const gameOver = !canMove(newBoard);

  return {
    board: newBoard,
    score: newScore,
    gameOver,
    won,
  };
};
