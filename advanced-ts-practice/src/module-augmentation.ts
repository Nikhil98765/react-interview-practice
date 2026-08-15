/* ============================================================================
   MODULE AUGMENTATION — INTERVIEW REVISION SHEET  🎯        [ 2 of 3 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.

   👉 THIS TOPIC SPANS 3 FILES — this is the middle link:
        1. declaration-merging.ts    the RULES: what merges with what
        2. module-augmentation.ts   ← YOU ARE HERE   the AUGMENTOR: reaching into a module you don't own
        3. module-augmentation-1.ts  the CONSUMER: proof it's program-wide + `declare global` + Q&A
      This file augments `Session`, which file 1 exports and file 3 consumes. 🔗

   CONTENTS
     1. Why plain redeclaration fails ... TS2440, and what it teaches about scope
     2. The augmentation ................ `declare module '<specifier>'`
     3. module vs script ................ the SAME syntax means two different things ⚠️
     4. Required-member hazard .......... how an augmentation breaks the library's own source ⚠️
     5. Checklist

   THE MODEL 🧠
     File 1's rule was: same name, SAME SCOPE. An imported name sits in YOUR file's scope,
     not the original module's — so a local redeclaration can only ever COLLIDE with it.
     `declare module '<specifier>'` is the escape hatch: the block re-enters the TARGET
     module's scope, so ordinary declaration merging (all of file 1's rules) applies inside it.

   💡 THE ONE-LINER: augmentation isn't a new feature — it's declaration merging plus a way
      to say "…but do it over THERE."

   ⚠️ THE BLAST RADIUS: an augmentation is PROGRAM-WIDE, not file-local. Importing this file
      is not required for its effect to apply; being in the compilation is enough. You are
      editing the library's types for every file, including the library's own source (§4).
   ============================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. WHY PLAIN REDECLARATION FAILS ❌
// ─────────────────────────────────────────────────────────────────────────────
// import type { Session } from "./declaration-merging";

// ** A plain redeclaration inside a module does NOT merge with an import — it fights it:
//    ❌ TS2440 "Import declaration conflicts with local declaration of 'Session'."
// interface Session {
//   role: 'admin' | 'user';
// }

// ─────────────────────────────────────────────────────────────────────────────
// 2. THE AUGMENTATION ✅
// ─────────────────────────────────────────────────────────────────────────────
export {}; // 🔑 REQUIRED: augmentation is only legal inside a MODULE. Any top-level import or
           //    export makes this file one; `export {}` is the zero-cost way to declare that.

declare module './declaration-merging' { // ✅ a RELATIVE specifier is legal here — contrast §3
  interface Session {
    role: 'admin' | 'user'; // merges into the exported Session, which now has userId AND role
  }
  export function extraFn(): number; // ⚠️ augmentation can add VALUES too, not just type members —
                                     //    but only DECLARATIONS, never an implementation. Nothing
                                     //    defines extraFn at runtime, so calling it crashes. Same
                                     //    "compiler trusts you" hazard as interface+class in file 1 §6.
}

// 👉 See file 3 for the proof that this worked from a completely different file.

// ─────────────────────────────────────────────────────────────────────────────
// 3. ⚠️ THE BIG ONE — `declare module "x"` MEANS TWO DIFFERENT THINGS
// ─────────────────────────────────────────────────────────────────────────────
/* Which one you get depends ENTIRELY on whether the containing file is a module or a script:

     in a MODULE (has a top-level import/export)   -> AUGMENTATION
        adds to types that already exist; the specifier MUST resolve; relative paths OK.

     in a SCRIPT (no top-level import/export)      -> AMBIENT DECLARATION
        defines the module from scratch and REPLACES the package's real types;
        relative paths banned.

   💡 Interview framing: same syntax, opposite intent — one extends, the other supplants.
      The `export {}` line above is what picks which. */

declare module "fakelib" { // ❌ TS2664 "Invalid module name in augmentation, module 'fakelib' cannot be found"
  interface Cfg {          //    …because THIS file is a module, so TS reads the block as an augmentation
    b: number;             //    and demands the target exist. In a real SCRIPT file this same block would
  }                        //    compile happily and define 'fakelib' wholesale.
}

// ⚠️ The script-file failure mode (verified separately): once that ambient declaration exists,
//    a consumer importing the package's GENUINE exports gets
//       ❌ TS2305 "Module 'fakelib' has no exported member 'real'"
//    — the ambient block wiped out the real types, even though they exist on disk.
//    Fix: add a top-level export so the file is a module and the block becomes an augmentation.
import { real, nonexistent } from 'fakelib'; // ❌ TS2307 here — fakelib genuinely doesn't exist in this project

// ⚠️ And the mirror-image restriction: an AMBIENT declaration can't use a relative specifier —
//       declare module "./foo" { }   ❌ TS2436 "Ambient module declaration cannot specify relative module name."
//    Relative specifiers are legal ONLY for augmentations inside a module, which is why §2 works.

// ─────────────────────────────────────────────────────────────────────────────
// 4. ⚠️ AUGMENTING WITH A REQUIRED MEMBER BREAKS THE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
// In lib.ts (code you don't own and can't edit):
interface Session1 {
  userId: string;
}
function makeSession(): Session1 {
  return { userId: 'sample' }; // ✅ compiles TODAY — nothing augments Session1 in this project yet
}

/* But if consumer code ANYWHERE in the program adds a REQUIRED member:
       declare module 'lib' { interface Session1 { role: 'admin' | 'user' } }
   then the line above starts failing with ❌ TS2741 "Property 'role' is missing" —
   inside the library's own source, which the consumer cannot fix.

   💡 That's the blast radius made concrete: you didn't extend YOUR view of the type,
      you edited THE type, and the library's constructors no longer satisfy it.

   ✅ FIX — augment with OPTIONAL members (`role?: 'admin' | 'user'`) whenever you don't own
      the code that CONSTRUCTS the type. Optional members can't invalidate an existing object. */

// ─────────────────────────────────────────────────────────────────────────────
// 5. CHECKLIST 📋
// ─────────────────────────────────────────────────────────────────────────────
/**
    Before writing an augmentation, in order:
      1. Do I own the type? -> just edit it, stop here.
      2. Is the file a module? -> if not, `export {}` first, or you'll silently get an
         ambient declaration (§3) or a TS2669 on `declare global` (file 3).
      3. Is every member I'm adding OPTIONAL? -> if not, §4 says I may break the lib's own source.
      4. Am I adding a VALUE (function/const)? -> then something must implement it at runtime.
      5. Would a wrapper type do instead? -> prefer it; it has no blast radius.

   👉 NEXT: module-augmentation-1.ts — the consumer side, `declare global`, and the interview Q&A.
 */
