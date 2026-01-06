export function randomFrom<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("Empty array");
  return arr[Math.floor(Math.random() * arr.length)]!;
}