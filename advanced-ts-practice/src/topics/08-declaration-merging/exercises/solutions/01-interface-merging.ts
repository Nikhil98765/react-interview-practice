export { };
  
// 1a
interface Config { host: string }
interface Config { port: number }
const settings: Config = { host: "localhost", port: 8080 };

// 1b — types must be IDENTICAL across declarations. Pick one, or rename.
interface Conflict { id: number }
interface Conflict { createdAt: string }

// 1c — "light" | "dark".
// The later declaration's overloads go FIRST, and single-literal-parameter
// overloads hoist above all wide ones regardless of declaration order.
interface Store { get(key: string): unknown }
interface Store { get(key: "theme"): "light" | "dark" }
declare const store: Store;
const themeValue = store.get("theme");
const themeCheck: "light" | "dark" = themeValue;

// 1d — type parameters must match exactly, including their NAMES.
interface Pair<T> { first: T }
interface Pair<T> { second: T }
