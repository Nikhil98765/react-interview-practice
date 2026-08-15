/* ============================================================================
   THE CONSUMER SIDE & GLOBAL AUGMENTATION — REVISION SHEET  🎯    [ 3 of 3 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway

   👉 THIS TOPIC SPANS 3 FILES — this is the last link:
        1. declaration-merging.ts    the RULES: what merges with what
        2. module-augmentation.ts    the AUGMENTOR: reaching into a module you don't own
        3. module-augmentation-1.ts ← YOU ARE HERE   the CONSUMER + `declare global` + Q&A
      File 1 exports `Session`, file 2 augments it, and §1 below imports it and sees BOTH halves. 🔗

   ⚠️ THIS FILE IS DELIBERATELY A SCRIPT (no top-level import/export), because §2's whole point
      is what happens to `declare global` in a script. That makes §1 and §2 MUTUALLY EXCLUSIVE:
      uncommenting §1's import turns the file into a module and §2's error disappears.
      Toggle one at a time — the switch itself is the lesson. 💡

   CONTENTS
     1. Proof the augmentation is program-wide
     2. `declare global` needs a module ... and moduleDetection does NOT rescue it ⚠️
     3. Duplicate global augmentation ..... why file 1's identical block doesn't clash
     4. Interview Q&A (covers all three files) 🎤

   THE MODEL 🧠
     Global scope is just another merge target — `declare global` re-enters the GLOBAL scope
     the same way `declare module 'x'` re-enters a module's scope (file 2 §2). The catch:
     you can only re-enter global FROM somewhere else, and a script file is already there.
     That's the entire reason for the module requirement.
   ============================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROOF THE AUGMENTATION IS PROGRAM-WIDE 🔗
// ─────────────────────────────────────────────────────────────────────────────
// import { extraFn, type Session } from "./declaration-merging";
//
// ✅ VERIFIED: with this import uncommented, all four lines below type-check. Note what that means —
//    `role` and `extraFn` are imported from './declaration-merging', but NEITHER is declared there.
//    They came from module-augmentation.ts, which this file never imports and never mentions.
//    💡 Being in the compilation is enough. That is the blast radius from file 2, demonstrated.
//
// extraFn();                      // ✅ type-checks, 💥 crashes at runtime — declaration without implementation
// declare const session: Session;
// const role   = session.role;    // ✅ 'admin' | 'user'  — added by file 2
// const userId = session.userId;  // ✅ string            — original member from file 1

// ─────────────────────────────────────────────────────────────────────────────
// 2. ⚠️ `declare global` NEEDS A MODULE
// ─────────────────────────────────────────────────────────────────────────────
/* THE EXPERIMENT: flipped moduleDetection from "force" to "legacy" in tsconfig.app.json to see
   whether a plain SCRIPT file could augment the global scope.

   ** RESULT: NO. ❌ TS2669 "Augmentations for the global scope can only be directly nested in
      external modules or ambient module declarations."

   💡 THE TAKEAWAY: `moduleDetection` only controls whether TS *treats* a file as a module —
      it does not change what `declare global` requires, which is an ACTUAL module.
      Fix: uncomment either the import in §1 or the `export {}` below. */

// export {}
declare global { // ❌ TS2669 — this file is a script, so there is no "outside global" to re-enter from
  interface Window {
    __APP__: {
      version: string;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DUPLICATE GLOBAL AUGMENTATION ✅
// ─────────────────────────────────────────────────────────────────────────────
/* declaration-merging.ts declares this EXACT same Window.__APP__ member. No clash — and that's
   file 1 §2's CONSTRAINT 1 doing its job: identical non-method members may repeat across merges;
   TS2717 only fires when the types DISAGREE.
   ⚠️ Flip one of them to `version: number` and you'd get TS2717 across FILE BOUNDARIES — which is
      the practical pain of global augmentation: two libraries can each augment Window and conflict. */

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTERVIEW Q&A 🎤  (all three files)
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Why do public APIs ship `interface` instead of `type`?
      Interfaces are OPEN — consumers can merge into them to add members. Type aliases are
      CLOSED and collide (TS2300). Shipping a type alias means consumers must fork your types.

 ** Q2. Two interfaces of the same name declare `x: string` and `x: number`. What happens?
      ❌ TS2717 "Subsequent property declarations must have the same type." Non-method members
      must be IDENTICAL. Methods are the exception — they stack as overloads instead.

 ** Q3. `interface G<T>` and `interface G<U>` — do they merge?
      No. ❌ TS2428 "All declarations of 'G' must have identical type parameters." Renaming alone
      breaks it; so does different arity. The names must match, not just the shape.

 ** Q4. Two interfaces both declare `m(x: unknown)`. Which overload wins at the call site?
      The LATER interface's. Merged overload lists put later declarations first.

 ** Q5. …and if one of them declares `m(x: 'div')`?
      Single-LITERAL parameter overloads get hoisted above the wide ones, even from the earlier
      interface — so `m('div')` hits the literal one. A UNION (`'div' | 'canvas'`) is NOT hoisted,
      so `m('canvas')` falls through to `m(x: unknown)` and never reaches the overload written for
      it. That asymmetry is the trick question. (file 1 §3)

 ** Q6. Where must a namespace sit relative to the function or class it merges with?
      AFTER. ❌ TS2434 otherwise. Enums are the exception — order is free there. And only
      EXPORTED namespace members survive; the rest stay private (❌ TS2339 on access).

 ** Q7. `class Widget {}` + `interface Widget { render(): string }` — does `new Widget().render()` work?
      It COMPILES and CRASHES. Merging asserts a type and emits no code. Fix by attaching to the
      prototype, or better use `implements`, which the compiler VERIFIES.
      💡 Merge = an assertion the compiler trusts. implements = a request it verifies.

 ** Q8. Why can't you just redeclare an imported interface to add a member?
      Merging needs the same name in the same SCOPE. An imported name lives in YOUR file's scope,
      so the redeclaration collides instead: ❌ TS2440. `declare module '<specifier>'` re-enters the
      target's scope, which is why it works.

 ** Q9. `declare module "some-lib" { }` — what does it do?
      Trick question: it depends on the containing file. In a MODULE it's an augmentation (adds to
      existing types; target must resolve). In a SCRIPT it's an ambient declaration (defines the
      module from scratch and REPLACES the real types, so consumers get ❌ TS2305 on genuine
      exports). Relative specifiers are legal only in the first case (❌ TS2436 in the second).

 ** Q10. You augment a library interface with `role: string`. What breaks?
      The LIBRARY'S OWN SOURCE. Its factory functions now return objects missing `role` →
      ❌ TS2741, in code you can't edit. Augmentation is program-wide, not file-local.
      ✅ Use optional members when you don't own the constructors.

 ** Q11. `declare global` gives TS2669. Why, and does moduleDetection fix it?
      The file is a script. `declare global` re-enters global scope from OUTSIDE it, and a script
      is already there. moduleDetection does NOT fix it — it only affects how TS treats files, not
      what `declare global` requires. Add a real top-level import/export (`export {}`).

 ** Q12. When should you NOT use any of this?
      When you own the type (edit it), when a wrapper type would do (no blast radius), and for
      cross-cutting globals like `Array<T>.last()` — that claims EVERY array in the program has
      the method, including arrays from node_modules that never will.
 */
