import { SymbolId } from './symbols';
import { randomChoice } from './random';

export type SymbolGrid = SymbolId[][];

const ROWS = 3;
const COLS = 5;

const SYMBOL_POOL: SymbolId[] = [
  'pinataRed',
  'pinataBlue',
  'pinataGreen',
  'taco',
  'sombrero',
  'skull',
  'candy',
];

export function generateRandomGrid(): SymbolGrid {
  const grid: SymbolGrid = [];
  for (let r = 0; r < ROWS; r++) {
    const row: SymbolId[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(randomChoice(SYMBOL_POOL));
    }
    grid.push(row);
  }
  return grid;
}

interface EvaluateResult {
  totalWin: number;
  matchedCoords: [number, number][];
}

// Very naive evaluation: looks only for horizontal sequences of 3 or more identical symbols
export function evaluateGrid(grid: SymbolGrid): EvaluateResult {
  let totalWin = 0;
  const matchedCoords: [number, number][] = [];

  grid.forEach((row, rIdx) => {
    let current = row[0];
    let count = 1;

    for (let c = 1; c <= COLS; c++) {
      if (row[c] === current) {
        count++;
      } else {
        if (count >= 3) {
          totalWin += count * 10; // placeholder reward per symbol
          for (let i = 0; i < count; i++) {
            matchedCoords.push([rIdx, c - i - 1]);
          }
        }
        current = row[c];
        count = 1;
      }
    }
  });

  return { totalWin, matchedCoords };
}