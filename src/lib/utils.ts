import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function toLanguageSlug(name: string): string {
  return name.toLowerCase().replace(/\+/g, 'plus').replace(/#/g, 'sharp').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const SLUG_TO_NAME: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cplusplus: 'C++',
  go: 'Go',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  c: 'C',
  shell: 'Shell',
  dart: 'Dart',
  r: 'R',
  lua: 'Lua',
  perl: 'Perl',
  haskell: 'Haskell',
  elixir: 'Elixir',
  clojure: 'Clojure',
  erlang: 'Erlang',
  julia: 'Julia',
  fsharp: 'F#',
  crystal: 'Crystal',
  nim: 'Nim',
  zig: 'Zig',
  'objective-c': 'Objective-C',
  webassembly: 'WebAssembly',
};

export function fromLanguageSlug(slug: string): string | undefined {
  return SLUG_TO_NAME[slug];
}

/** Clamp a value between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
