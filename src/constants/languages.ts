/** All 30 programming languages tracked by the ranking engine. */

export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++',
  'Go', 'PHP', 'Ruby', 'Rust', 'Swift', 'Kotlin', 'Scala', 'C',
  'Shell', 'Dart', 'R', 'Lua', 'Perl', 'Haskell', 'Elixir',
  'Clojure', 'Erlang', 'Julia', 'F#', 'Crystal', 'Nim', 'Zig',
  'Objective-C', 'WebAssembly',
] as const;

export type Language = (typeof LANGUAGES)[number];
