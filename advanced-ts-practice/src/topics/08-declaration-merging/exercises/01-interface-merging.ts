/* ============================================================================
   EXERCISE 1 — INTERFACE MERGING & OVERLOAD ORDERING  🎯      [ 1 of 5 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = write your prediction BEFORE running tsc

   📖 THEORY: ../declaration-merging.ts §2 and §3
   🔑 SOLUTION: ./solutions/01-interface-merging.ts  (only after you've compiled your own attempt)

   DRILLS
     1a. Merge members across declarations
     1b. TS2717 — non-method members must be identical
     1c. Overload ordering + the single-literal hoist ⚠️ the one people get wrong
     1d. TS2428 — type parameters must match exactly

   💡 THE ONE-LINER FOR THIS EXERCISE: interfaces are open; methods stack as overloads,
      everything else must agree exactly.
   ============================================================================ */

export {}; // 🔑 without this the file is a SCRIPT: every declaration lands in global scope
           //    and clashes with same-named declarations in the other exercise files.

/* ---- 1a. Make this compile. Do NOT edit the const. ------------------------- */
// TODO was: add a second `interface Config` so `settings1` type-checks.
interface Config {
  host: string;
}
interface Config {
  port: number;
}

const settings1: Config = { host: "localhost", port: 8080 }; // ✅ merged into { host; port }

/* ---- 1b. Why does this fail? Fix it. -------------------------------------- */
// ANSWER: ❌ TS2717 — two declarations of the same interface may not give the same
// property key different types. Non-method members must be IDENTICAL.
interface Conflict {
  id: number;
}
interface Conflict {
  id: string; // ❌ TS2717 — fix by renaming the prop, or matching the type above
}

/* ---- 1c. ⚠️ Predict before compiling. ------------------------------------- */
// ANSWER: both interfaces merge. When method names collide they become OVERLOADS
// rather than conflicting, and the merged list is ordered:
//   1. single-LITERAL parameter overloads hoist to the top (regardless of which
//      interface declared them),
//   2. then the remaining ones, LATER interface first.
// So `store.get("theme")` hits `get(key: "theme")` and returns "light" | "dark".
interface Store {
  get(key: string): unknown;
}
interface Store {
  get(key: "theme"): "light" | "dark";
}

declare const store: Store;
const themeValue = store.get("theme");

// 📝 PREDICTION: themeValue is _____ "light" | "dark" _____
// Reveal by uncommenting — the error message names the real type:
const reveal: null = themeValue; // ❌ TS2322 'Type "light" | "dark" is not assignable to type null' ✅ prediction confirmed

// ⚠️ THE TRAP TO REMEMBER: a UNION parameter (`get(key: "theme" | "lang")`) does NOT hoist.
//    It would sit BELOW `get(key: string)`, so the wide overload swallows the call and you
//    silently get `unknown` back. Single literal hoists; union of literals does not.

/* ---- 1d. Make this compile without touching Pair's body. ------------------ */
// ANSWER: generic parameters must be identical across declarations — including their NAMES.
interface Pair<T> {
  first: T;
}
interface Pair<T> { // ✅ matches. `interface Pair<U>` would be ❌ TS2428, and so would `Pair<T, K>`
  second: T;
}
