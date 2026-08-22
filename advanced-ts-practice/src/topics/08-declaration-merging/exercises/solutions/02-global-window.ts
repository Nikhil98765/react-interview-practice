export {};    // 2a — the one line: flips script -> module so `declare global` is legal

declare global {
  interface Window { __APP_VERSION__: string }
  interface Array<T> { last(): T | undefined }   // 2b — generic T, not any
}

const version = window.__APP_VERSION__;
const n = [1, 2, 3].last();          // number | undefined
const s = ["a", "b"].last();         // string | undefined

// 2c — NO. Once the file is a module, a bare `interface Window` is file-local
// and shadows the global one instead of merging with it. That is exactly why
// `declare global` exists.
