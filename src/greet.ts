/** Builds the greeting shown on the home screen. */
export function greet(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `Hello, ${trimmed}!` : 'Hello, world!';
}
