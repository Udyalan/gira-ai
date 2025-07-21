import { SymbolId } from './symbols';
import { randomChoice } from './random';

export type SymbolGrid = SymbolId[][];

export const ROWS = 3;
export const COLS = 5;

/**
 * Weighted pool for random symbol generation – wild & scatter são mais raros.
 */
const SYMBOL_POOL: SymbolId[] = [
  'pinataRed',
  'pinataBlue',
  'pinataGreen',
  'taco',
  'sombrero',
  'skull',
  'candy',
];

function generateRandomSymbol(): SymbolId {
  const r = Math.random();
  if (r < 0.02) return 'wild'; // 2%
  if (r < 0.04) return 'scatter'; // 2%
  return randomChoice(SYMBOL_POOL);
}

export function generateRandomGrid(): SymbolGrid {
  const grid: SymbolGrid = [];
  for (let r = 0; r < ROWS; r++) {
    const row: SymbolId[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(generateRandomSymbol());
    }
    grid.push(row);
  }
  return grid;
}

// ----------------- PAYLINES -----------------
// 20 linhas de pagamento (índices de linha para cada coluna)
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // linha do meio
  [0, 0, 0, 0, 0], // topo
  [2, 2, 2, 2, 2], // base
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 0, 2, 0, 0],
  [2, 2, 0, 2, 2],
  [0, 2, 2, 2, 0],
  [2, 0, 0, 0, 2],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 1, 0, 1, 1],
];

export interface EvaluateResult {
  totalWin: number;
  matchedCoords: [number, number][]; // pares [row,col]
}

// ----------------- EVALUATION -----------------
/**
 * Avalia todas as linhas de pagamento da esquerda para direita.
 * Wild (⭐️) conta como qualquer símbolo.
 */
export function evaluateGrid(grid: SymbolGrid): EvaluateResult {
  let totalWin = 0;
  const matched: Set<string> = new Set();

  const addCoord = (row: number, col: number) => {
    matched.add(`${row},${col}`);
  };

  for (const line of PAYLINES) {
    let symbolToMatch: SymbolId | null = null;
    const coords: [number, number][] = [];

    for (let col = 0; col < COLS; col++) {
      const row = line[col];
      const symbol = grid[row][col];

      if (symbol === 'wild') {
        coords.push([row, col]);
        continue;
      }

      if (symbolToMatch === null) {
        symbolToMatch = symbol;
        coords.push([row, col]);
      } else if (symbol === symbolToMatch) {
        coords.push([row, col]);
      } else {
        break;
      }
    }

    if (coords.length >= 3) {
      const win = coords.length * 10; // placeholder payout
      totalWin += win;
      coords.forEach(([r, c]) => addCoord(r, c));
    }
  }

  const matchedCoords: [number, number][] = Array.from(matched).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return [r, c];
  });

  return { totalWin, matchedCoords };
}

// ----------------- CASCADE -----------------
interface CascadeResult {
  finalGrid: SymbolGrid;
  totalWin: number;
  cascades: number;
}

/**
 * Executa cascatas sucessivas até que não haja mais vitórias.
 */
export function spinWithCascades(initialGrid: SymbolGrid): CascadeResult {
  let grid: (SymbolId | null)[][] = initialGrid.map((row) => [...row]);
  let totalWin = 0;
  let cascades = 0;

  while (true) {
    const { totalWin: win, matchedCoords } = evaluateGrid(grid as SymbolGrid);
    if (win <= 0) break;

    totalWin += win;
    cascades++;

    // Remover símbolos vencedores (viram null)
    matchedCoords.forEach(([r, c]) => {
      grid[r][c] = null;
    });

    // Colapsar cada coluna (quebra-cabeça estilo Tetris)
    for (let col = 0; col < COLS; col++) {
      const colSymbols: SymbolId[] = [];
      for (let row = ROWS - 1; row >= 0; row--) {
        const sym = grid[row][col];
        if (sym) colSymbols.push(sym);
      }
      // Preencher com novos símbolos no topo
      while (colSymbols.length < ROWS) {
        colSymbols.push(generateRandomSymbol());
      }
      // Re-escrever coluna de baixo para cima
      for (let row = ROWS - 1, idx = 0; row >= 0; row--, idx++) {
        grid[row][col] = colSymbols[idx];
      }
    }
  }

  return { finalGrid: grid as SymbolGrid, totalWin, cascades };
}