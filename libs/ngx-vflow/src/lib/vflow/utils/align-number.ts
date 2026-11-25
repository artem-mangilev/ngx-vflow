export function align(num: number, constant: number): number {
  return Math.ceil(num / constant) * constant;
}
