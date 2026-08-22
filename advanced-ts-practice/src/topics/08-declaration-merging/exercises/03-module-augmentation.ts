/* ============================================================================
   EXERCISE 3 — MODULE AUGMENTATION  🎯                        [ 3 of 5 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = write your prediction BEFORE running tsc

   📖 THEORY: ../module-augmentation.ts §2 and §4
   🎯 TARGET: ./mock/analytics.ts — pretend it lives in node_modules. DO NOT EDIT IT.
   🔑 SOLUTION: ./solutions/03-module-augmentation.ts

   DRILLS
     3a. add a property to a third-party interface
     3b. ⚠️ THE TRAP — required vs optional, and the blast radius
     3c. augmenting with a VALUE, and what happens at runtime

   💡 THIS IS THE ONE YOU'LL ACTUALLY USE AT WORK. 3b is the interview question.
   ============================================================================ */

import { track, makeDefaultOptions, flush } from "./mock/analytics";

/* ---- 3a. Make the `track` call below compile. -----------------------------
   `userId` is not on TrackOptions, and you can't edit the mock. */
declare module "./mock/analytics" { // ✅ relative specifier is legal — this file is a MODULE,
  interface TrackOptions {          //    so the block is an AUGMENTATION, not an ambient declaration
    userId?: string; // see 3b for why the `?` is load-bearing
  }

  export function flush(): void; // 3c — augmentations can add VALUES, not just type members
}

track({ event: "click", userId: "u_42" }); // ✅

/* ---- 3b. ⚠️ THE TRAP -------------------------------------------------------
   Run tsc and read the FULL error list, not just this file's.
   If you declare `userId` as REQUIRED, you break a file you never touched.
   Which file, and which line?                                                */
// 📝 ANSWER: ./mock/analytics.ts, on `return { event: "pageview" }` inside makeDefaultOptions —
// ❌ TS2741 "Property 'userId' is missing". Augmentation is PROGRAM-WIDE, so it applies inside
// the package's own source too, and the package's factory predates your new property.
// ✅ FIX: make it optional. Optional members can't invalidate an object that already exists.
// 💡 RULE: never augment with a required member when you don't own the code that CONSTRUCTS the type.
const defaults = makeDefaultOptions();

/* ---- 3c. Add a new top-level export to the package. -----------------------
   Make `import { flush }` compile, then answer: what happens when you CALL it? */
// 📝 ANSWER: it type-checks and 💥 throws "flush is not a function" at runtime — unless the
// shipped JS already had it. `declare` emits nothing; you asserted a value into existence.
// 💡 Same trust boundary as interface+class in ../declaration-merging.ts §6:
//    the compiler believes you, the runtime does not.
flush();
