export type SymbolId =
  | 'pinataRed'
  | 'pinataBlue'
  | 'pinataGreen'
  | 'taco'
  | 'sombrero'
  | 'skull'
  | 'candy'
  | 'wild'
  | 'scatter';

interface SymbolMeta {
  id: SymbolId;
  emoji: string;
  label: string;
  isWild?: boolean;
  isScatter?: boolean;
}

export const SYMBOL_META: Record<SymbolId, SymbolMeta> = {
  pinataRed: { id: 'pinataRed', emoji: '🪅', label: 'Red Piñata' },
  pinataBlue: { id: 'pinataBlue', emoji: '🪅', label: 'Blue Piñata' },
  pinataGreen: { id: 'pinataGreen', emoji: '🪅', label: 'Green Piñata' },
  taco: { id: 'taco', emoji: '🌮', label: 'Taco' },
  sombrero: { id: 'sombrero', emoji: '👒', label: 'Sombrero' },
  skull: { id: 'skull', emoji: '💀', label: 'Calavera' },
  candy: { id: 'candy', emoji: '🍬', label: 'Candy' },
  wild: { id: 'wild', emoji: '⭐️', label: 'Wild', isWild: true },
  scatter: { id: 'scatter', emoji: '🎊', label: 'Scatter', isScatter: true },
};

export type SymbolCell = {
  id: SymbolId;
  golden?: boolean;
};