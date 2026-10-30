export function num(n: number | null | undefined) {
  if (n === null || n === undefined) return "Unavailable";
  if (n === 0) return "0";
  return Math.abs(n) >= 1e5 || Math.abs(n) < 0.001
    ? n.toExponential(4)
    : n.toLocaleString("en-US", { maximumSignificantDigits: 6 });
}
export function regime(s: string) {
  return s.replaceAll("_", " ");
}
