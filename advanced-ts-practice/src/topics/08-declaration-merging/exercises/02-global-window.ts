/* ============================================================================
   EXERCISE 2 — declare global  🎯                             [ 2 of 5 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = write your prediction BEFORE running tsc

   📖 THEORY: ../global-augmentation.ts §2 and §3
   🔑 SOLUTION: ./solutions/02-global-window.ts

   ⚙️ REQUIRES "moduleDetection": "auto" (or "legacy"). Vite's template default is "force",
      which makes every file a module and hides drill 2a completely.

   DRILLS
     2a. script vs module — why `declare global` needs `export {}`
     2b. augmenting a GENERIC lib type (`Array<T>`) + the runtime half everyone forgets ⚠️
     2c. the shadowing trap — a bare `interface Window` inside a module

   THE MODEL 🧠
     `declare global` re-enters global scope FROM OUTSIDE IT. A script file is already in
     global scope, so there is no "outside" to re-enter from — hence the module requirement.
   ============================================================================ */

/* ---- 2a. This file starts as a SCRIPT. Two errors. ------------------------
   Fix with a ONE-LINE addition at the top. Expected: ❌ TS2669, and TS2339 as a knock-on. */
export {}; // 🔑 THE ONE LINE. Flips script -> module, which is what makes `declare global` legal.
           //    Without it: ❌ TS2669 "Augmentations for the global scope can only be directly
           //    nested in external modules or ambient module declarations."

declare global {
  interface Window {
    __APP_VERSION__: string;
  }
  interface Array<T> { // 2b — generic T, NOT any: the augmentation must stay type-preserving
    last: () => T | undefined;
  }
}

const version = window.__APP_VERSION__; // ✅ string

/* ---- 2b. Add a `last()` method to every array. ----------------------------
   Both call sites below must type-check, and `last` must return T | undefined, not any. */

// ❌ ATTEMPT 1 — a bare `interface Array<T>` at module top level.
//    This file is a module, so the declaration is FILE-LOCAL: it creates a brand-new type
//    that SHADOWS the global Array instead of merging with it. Must go inside `declare global`.
//   interface Array<T> {
//     last: () => T | undefined;
//   }

// ❌ ATTEMPT 2 — an arrow function on the prototype.
//    Arrow functions take `this` from the enclosing scope, so there is no per-instance `this`.
// Array.prototype.last = () => { /* no `this` to read */ };

// ✅ THE RUNTIME HALF — `declare global` only asserts a TYPE and emits nothing.
//    Without this assignment the code compiles and then throws "last is not a function".
Array.prototype.last = function <T>(this: T[]) {
  return this[this.length - 1];
};

const nums = [1, 2, 3];
const n = nums.last(); // ✅ number | undefined  — T flowed through, no `any`
const s = ["a", "b"].last(); // ✅ string | undefined

// ⚠️ THE BROADER POINT: this augmentation now claims EVERY array in the program has .last(),
//    including arrays from node_modules that will never have it. Global augmentation has no
//    scope and no opt-out — see ../declaration-merging.ts §8.

/* ---- 2c. ⚠️ Trap. Predict before compiling. -------------------------------
   Does a bare `interface Window { __OTHER__: number }` merge with the real Window? */
// 📝 ANSWER: NO — not from this file. While it was a script it WOULD have merged, because a
// script's declarations live in global scope. The `export {}` at the top changed that: the
// declaration is now scoped to this module and merely shadows the global Window.
// 💡 That flip is the entire reason `declare global` exists — it opts a single block back out
//    of module scoping.
declare global {
  interface Window {
    __OTHER__: number;
  }
}

const other = window.__OTHER__; // ✅ number
