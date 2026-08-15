/* eslint-disable @typescript-eslint/no-namespace */

/* ============================================================================
   DECLARATION MERGING — INTERVIEW REVISION SHEET  🎯        [ 1 of 3 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` after a call is the ACTUAL resolved type (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.

   👉 THIS TOPIC SPANS 3 FILES — read them in order, they form one chain:
        1. declaration-merging.ts   ← YOU ARE HERE   the RULES: what merges with what
        2. module-augmentation.ts                    the AUGMENTOR: reaching into a module you don't own
        3. module-augmentation-1.ts                  the CONSUMER: proof it's program-wide + `declare global`
      The chain is live code, not prose: this file exports `Session`, file 2 augments it,
      file 3 imports it and sees the augmented members. Interview Q&A lives at the end of file 3.
      Companion topics: Narrow.ts, Inference.ts, AdvancedTypes.ts.

   ⚙️ TSCONFIG NOTE — this topic needs two non-default flags in tsconfig.app.json:
        "erasableSyntaxOnly": false   -> namespaces emit runtime code, so they're banned without this
        "moduleDetection": "legacy"   -> lets file 3 stay a SCRIPT, which is the point of its demo
      Revert both when you move on to another topic; they affect all of src/.

   CONTENTS
     1. Why it exists .......... the Window problem, `declare global`
     2. interface + interface .. members merge; the two hard constraints
     3. Method members ......... merging produces OVERLOADS, and the order is surprising
     4. namespace merging ...... + function / class / enum, the ordering rule, exported-only
     5. The merge table ........ what merges with what
     6. interface + class ...... the merge that type-checks code that crashes ⚠️
     7. enum + enum ............ the auto-numbering trap
     8. When not to use

   THE MODEL 🧠
     Two or more declarations with the SAME NAME in the SAME SCOPE fuse into one entity
     instead of colliding. Two words carry all the weight:
       - SAME NAME  : `type` aliases are excluded entirely — they collide, never merge.
       - SAME SCOPE : an IMPORTED name is in YOUR file's scope, not the original module's,
                      which is exactly why plain redeclaration can't augment (see file 2).

   💡 THE ONE-LINER: interfaces are OPEN, type aliases are CLOSED. That is why public API
      surfaces ship interfaces — consumers can extend them without forking your types.

   THE TRUST BOUNDARY ⚠️
     Merging is an ASSERTION THE COMPILER TRUSTS, never verifies. `interface Widget { render(): string }`
     next to `class Widget {}` makes `w.render()` compile and crash at runtime (§6).
     Contrast `implements`: a REQUEST THE COMPILER VERIFIES.
       Merge = "trust me, it's there."   implements = "prove it's there."
   ============================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. WHY IT EXISTS 🏷️
// ─────────────────────────────────────────────────────────────────────────────
/* The problem: you want `window.__APP__`. You can't edit lib.dom.d.ts, and a second
   `type Window = ...` would just collide. Merging is the escape hatch. */

// export { }  <- not needed HERE: `export interface Session` at the bottom already makes this file a module.
//                ⚠️ `declare global` ONLY works inside a module — file 3 shows the ❌ script-file version.
declare global {
  interface Window {
    __APP__: { version: string };
  }
}

const v = window.__APP__.version; // ✅ typed as string, from a lib type we never touched

// ─────────────────────────────────────────────────────────────────────────────
// 2. interface + interface 🧩
// ─────────────────────────────────────────────────────────────────────────────
interface Box {
  width: number;
}
interface Box {
  height: number;
}

const b: Box = { width: 12 }; // ❌ TS2741: 'height' is missing — proof the two declarations became ONE type

/* CONSTRAINT 1 — non-method members must be IDENTICAL across declarations. */
interface Same {
  x: number;
}
interface Same {
  x: number; // ✅ identical repeats are allowed
}

interface Diff {
  x: string;
}
interface Diff {
  x: number; // ❌ TS2717: "Subsequent property declarations must have the same type."
}

/* CONSTRAINT 2 — type parameters must match EXACTLY. This pair matches, so it merges
   into { a: T; b: T }. */
interface G<T> {
  a: T;
}
interface G<T> {
  b: T;
}

const g1: G<string> = { a: 12, b: 43 }; // ❌ TS2322 ×2 — both are `string` in G<string>. (The MERGE was fine.)

/* ⚠️ A mismatch is what actually breaks the merge — and "mismatch" is stricter than you'd guess:
     interface Bad<T>  { a: T }
     interface Bad<U>  { b: U }    ❌ TS2428 — merely RENAMING the parameter counts as a mismatch
     interface Bad2<T>    { a: T }
     interface Bad2<T, K> { b: K } ❌ TS2428 — different arity */

// ─────────────────────────────────────────────────────────────────────────────
// 3. METHOD MEMBERS BECOME OVERLOADS 📚
// ─────────────────────────────────────────────────────────────────────────────
/* 💡 Methods are the exception to CONSTRAINT 1: they're allowed to differ, because they
   stack into an overload list instead of conflicting. The ORDER of that list decides
   which one wins, and it is not the order you wrote. */

interface F {
  m(x: unknown): "first-A";
}
interface F {
  m(x: unknown): "second-B";
}

/* Merged shape — LATER interface goes FIRST:
     interface F {
       m(x: unknown): "second-B";
       m(x: unknown): "first-A";
     } */
declare const f: F;
const f1 = f.m("any"); // => "second-B" ✅ both overloads match, so the first in the merged list wins

/* ⚠️ RULE ON TOP OF THE RULE — within each interface, overloads whose parameter is a SINGLE
   LITERAL get hoisted above the rest. A UNION of literals does NOT get hoisted. */
interface F1 {
  m(x: unknown): "A-wide";
  m(x: "div"): "A-lit";
}
interface F1 {
  m(x: unknown): "B-wide";
  m(x: "canvas"): "B-lit";
}

/* Merged shape — single literals float to the top, then the rest in later-first order:
     interface F1 {
       m(x: 'canvas'): 'B-lit';
       m(x: 'div'):    'A-lit';
       m(x: unknown):  'B-wide';
       m(x: unknown):  'A-wide';
     } */
declare const f11: F1;
const f11v1 = f11.m("dad");    // => "B-wide" ✅ no literal matches, falls to the first `unknown` (B's — later interface)
const f11v2 = f11.m("div");    // => "A-lit"  ✅ hoisted literal wins even though A is the EARLIER interface
const f11v3 = f11.m("canvas"); // => "B-lit"  ✅

interface F2 {
  m(x: unknown): "A-wide";
  m(x: "div"): "A-lit";
}
interface F2 {
  m(x: unknown): "B-wide";
  m(x: "div" | "canvas"): "union-lit";
}

/* Merged shape — "div" | "canvas" is a UNION, so it stays put below the wide overloads:
     interface F2 {
       m(x: "div"):              "A-lit";
       m(x: unknown):            "B-wide";
       m(x: "div" | 'canvas'):   "union-lit";
       m(x: unknown):            "A-wide";
     } */
declare const f2: F2;
const f2v1 = f2.m("div");    // => "A-lit"  ✅ single-literal overload still hoisted
const f2v2 = f2.m("canvas"); // => "B-wide" ⚠️ THE PAYOFF: `m(x: unknown)` sits above "union-lit",
                             //    so "canvas" NEVER reaches the overload that was written for it.

// ─────────────────────────────────────────────────────────────────────────────
// 4. NAMESPACE MERGING 📦
// ─────────────────────────────────────────────────────────────────────────────
/* A namespace merges into a function / class / enum, and its EXPORTED members are attached
   as STATIC-side members. This is how you model "a function that also has properties". */

function counter() {
  return counter.count;
}
namespace counter { // ✅ namespace comes AFTER the function
  let hidden; // not exported -> never visible as counter.hidden
  export let count = 0;
}

/* counter's merged shape:
     counter {
       (): number;
       count: number;
     } */

class Album {
  constructor(public title: string) {}
}
namespace Album {
  export class Cover {
    constructor(public url: string) {}
  }
}
const cover = new Album.Cover("test"); // ✅ Cover is a static on Album — no need to instantiate Album first

/* ⚠️ ORDER MATTERS — but only for functions and classes, NOT enums. With an enum the
   namespace may come first, because an enum's declaration isn't hoist-sensitive the same way. */
namespace Color {
  export function mix() {
    return "mixed";
  }
}
enum Color {
  red = 1,
}
const color = Color.mix(); // ✅ mix() sits on the enum object alongside Color.red

// ** Only EXPORTED namespace members survive the merge.
namespace NS { // ❌ TS2434: "A namespace declaration cannot be located prior to a class or function with which it is merged."
  let hidden;
  export let count = 0;
}

function NS() {
  NS.hidden; // ❌ TS2339: 'hidden' does not exist on typeof NS — non-exported members stay private
  return NS.count; // ✅ exported
}

// The chain's anchor — file 2 augments this, file 3 consumes the result. 🔗
export interface Session {
  userId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. THE MERGE TABLE 🗺️
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** What merges with what
      Combination                             Result
      interface + interface             merged members; methods stack as overloads (§3)
      interface + class                 members added to the INSTANCE type (not to the class itself) ⚠️ §6
      interface + namespace             type side + value side
      namespace + namespace             merges exported members
      namespace + function / class      exported members become statics; namespace must come AFTER
      namespace + enum                  statics; order is free
      enum + enum                       members merged ⚠️ §7
      type + type                       ❌ TS2300 duplicate identifier
      type + interface                  ❌ TS2300 duplicate identifier
      class + class                     ❌ TS2300 duplicate identifier

   💡 The pattern behind the table: merging works where a declaration is OPEN-ENDED
      (interface, namespace, enum). `type` and `class` produce one sealed thing, so they collide.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 6. ⚠️ THE DANGEROUS ONE — interface + class
// ─────────────────────────────────────────────────────────────────────────────
class Widget {
  id = 1;
}
interface Widget {
  render(): string;
} // ⚠️ zero TS errors — but eslint's @typescript-eslint/no-unsafe-declaration-merging flags this pair, for exactly the reason below

const w = new Widget();
w.render(); // ✅ compiles, 💥 CRASHES AT RUNTIME — nothing ever attached render to the instance.
            //    Merging only asserted the TYPE; it emits no code.

// Fix 1 — actually attach it:
Widget.prototype.render = function () {
  return "widget rendered";
};
const w1 = new Widget();
w1.render(); // ✅ compiles AND runs — a real function now exists on the prototype

// Fix 2 (better) — use `implements` instead of merging. TS then forces the method to exist
// in the class body. 💡 Merge = an assertion the compiler trusts. implements = a request it verifies.

// ─────────────────────────────────────────────────────────────────────────────
// 7. enum + enum ⚠️
// ─────────────────────────────────────────────────────────────────────────────
enum E3 { a }
enum E3 { b } // ❌ TS2432: "In an enum with multiple declarations, only one declaration can omit
              //    an initializer for its first enum element." Both would auto-start at 0 and collide.
              //    Fix: `enum E3 { b = 1 }`

const e3 = E3[0]; // runtime value is 'a', but the TYPE is `string` —
                  // reverse mapping is indexed as Record<number, string>, not a literal. ⚠️

// ─────────────────────────────────────────────────────────────────────────────
// 8. WHEN NOT TO USE 🚫
// ─────────────────────────────────────────────────────────────────────────────
/**
    1. If you OWN the type — just edit it. Merging is for types you can't reach.
    2. If you need to extend a lib type, prefer a WRAPPER type — an augmentation edits the
       type for the whole program, including the library's own source (see the ⚠️ in file 2).
    3. Cross-cutting GLOBAL additions in app code —
        declare global {
          interface Array<T> { last(): T }
        }
       This tells the compiler EVERY array in the program has .last(), including arrays from
       node_modules that will never have it. Global augmentation has no scope and no opt-out.

   👉 NEXT: module-augmentation.ts — how to reach a type inside a module you don't own.
 */
