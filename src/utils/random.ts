export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomMultiplier(): number {
  const r = Math.random();
  if (r < 0.5) return 1; // 50%
  if (r < 0.75) return 2; // 25%
  if (r < 0.9) return 5; // 15%
  if (r < 0.97) return 10; // 7%
  if (r < 0.995) return 25; // 2.5%
  if (r < 0.999) return 50; // 0.4%
  return 100; // 0.1%
}