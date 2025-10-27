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
  img?: string; // optional external image url
  isWild?: boolean;
  isScatter?: boolean;
}

export const SYMBOL_META: Record<SymbolId, SymbolMeta> = {
  pinataRed: {
    id: 'pinataRed',
    emoji: '🪅',
    label: 'Red Piñata',
    img: 'https://source.unsplash.com/64x64/?pinata&sig=1',
  },
  pinataBlue: {
    id: 'pinataBlue',
    emoji: '🪅',
    label: 'Blue Piñata',
    img: 'https://source.unsplash.com/64x64/?pinata&sig=2',
  },
  pinataGreen: {
    id: 'pinataGreen',
    emoji: '🪅',
    label: 'Green Piñata',
    img: 'https://source.unsplash.com/64x64/?pinata&sig=3',
  },
  taco: {
    id: 'taco',
    emoji: '🌮',
    label: 'Taco',
    img: 'https://source.unsplash.com/64x64/?taco&sig=4',
  },
  sombrero: {
    id: 'sombrero',
    emoji: '👒',
    label: 'Sombrero',
    img: 'https://source.unsplash.com/64x64/?sombrero&sig=5',
  },
  skull: {
    id: 'skull',
    emoji: '💀',
    label: 'Calavera',
    img: 'https://source.unsplash.com/64x64/?calavera,skull&sig=6',
  },
  candy: {
    id: 'candy',
    emoji: '🍬',
    label: 'Candy',
    img: 'https://source.unsplash.com/64x64/?candy&sig=7',
  },
  wild: {
    id: 'wild',
    emoji: '⭐️',
    label: 'Wild',
    img: 'https://source.unsplash.com/64x64/?star,glow&sig=8',
    isWild: true,
  },
  scatter: {
    id: 'scatter',
    emoji: '🎊',
    label: 'Scatter',
    img: 'https://source.unsplash.com/64x64/?confetti&sig=9',
    isScatter: true,
  },
};

export type SymbolCell = {
  id: SymbolId;
  golden?: boolean;
};