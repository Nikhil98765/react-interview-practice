/* ============================================================================
   NARROWING & CONTROL FLOW ANALYSIS — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` after a bare `x;` is the ACTUAL narrowed type at that point
     (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.
   👉 Companion files: Inference.ts, utilityTypes.ts, AdvancedTypes.ts.

   CONTENTS
     1. typeof ................... plus the null and truthiness traps
     2. in ....................... property-presence narrowing
     3. instanceof / isArray ..... needs a runtime value
     4. Discriminated unions ..... + the never exhaustiveness check
     5. Type predicates .......... `x is T`, inferred predicates, the trust problem
     6. Assertion functions ...... `asserts x is T`, `asserts this is T`, the annotation gotcha
     7. Narrowing lifetime ....... reassignment and closures ending a narrowing

   THE MODEL 🧠
     Narrowing is CONTROL FLOW ANALYSIS: TS walks each path and tracks what a variable
     could be at that point. So narrowing is a property of a POSITION IN THE CODE,
     not of the variable. Two things end it:
       - reassignment (the flow now says something new)
       - a closure over a variable TS can't prove is stable

   THE TRUST BOUNDARY ⚠️
     `x is T` and `asserts x is T` are PROMISES YOU MAKE, not claims TS verifies.
     An empty body compiles fine (see assertLie). Everything downstream of a wrong
     predicate is a lie that TS will happily propagate. Keep them tiny and obvious.
   ============================================================================ */

// 1. typeof 🏷️
function f(x: number | string) {
  if (typeof x === "number") {
    x; // => number ✅
  } else {
    x; // => string ✅ (the else branch narrows too — TS subtracts the matched member)
  }
}

// Gotcha's
// 1. typeof v === 'object' doesn't exclude null
// ⚠️ The famous JS wart: typeof null === 'object', so the commented-out check below
// narrows to `object | null` — it does NOT remove null.
function f2(x: object | null) {
  // if (typeof x === 'object') {
  //   const y: typeof x = null; // object | null
  // }
  if (x !== null) {
    // Fix
    x; // => object ✅ an explicit !== null is the reliable way
  }
}

// 2. Truthiness drops values
// ⚠️ Truthiness removes ALL falsy values, not just the one you had in mind.
function f3(x: number | undefined) {
  if (x) {
    x; // => number ✅ (but note 0 was excluded here too!)
  } else {
    x; //type = number | undefined because TS knows that 0 lands here. Fix: use typeof x !== undefined
  }
}
// 👉 Same trap with `if (str)` on `string | undefined` — "" takes the else branch.
//    Reach for `!== undefined` / `!= null` when 0 or "" are legitimate values.

/* 💡 SECTION 1 TAKEAWAY
   - typeof narrows both branches; the else branch subtracts the matched type.
   - typeof null === 'object' — use an explicit `!== null` instead.
   - Truthiness checks drop 0, "", NaN, false along with null/undefined. If those are
     valid data, you've just introduced a bug that the types will not catch. */

// 2. in 🔑
type Dog = { bark: () => void };
type Cat = { meow: () => void };

// Use `in` when the union members have no shared discriminant to compare.
function f4(x: Dog | Cat) {
  if ("bark" in x) {
    x; // Dog
  } else {
    x; // Cat
  }
}

// 3. instanceOf and Array.isArray 🏗️
function f5(x: Date | string) {
  if (x instanceof Date) {
    x; // => Date ✅
  } else {
    x; // => string ✅
  }
}
//Note: instanceof requires a runtime value like -> classes, Date, Error, RegExp but not interface, type aliases and plain objects.
// 👉 Because it compiles to a real `instanceof` check, it needs something that EXISTS at
//    runtime. Types and interfaces are erased, so there's nothing to test against. ⚠️

// Array.isArray is a built-in type guard — its signature is `arg is any[]`.
function f6(x: string | string[]) {
  if (Array.isArray(x)) {
    x; // => string[] ✅
  } else {
    x; // => string ✅
  }
}

/* 💡 SECTION 3 TAKEAWAY
   instanceof works on anything with a runtime constructor (classes, Date, Error, RegExp).
   For plain object shapes you need `in` or a type predicate instead — there is no
   runtime representation of an interface to check. */

// 4. Discriminated unions 🎫
// The most robust option when you control the shapes: a shared literal `kind` field.
type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };

function f7(shape: Shape) {
  if (shape.kind === "circle") {
    shape; // => { kind: "circle"; r: number } ✅
  } else {
    shape; // => { kind: "square"; s: number } ✅
  }
}

// Exhaustiveness check - missing a condition for a variant will throw error if we typecast it to never in default branch
function f8(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      shape; // => { kind: "circle"; r: number }
      break;
    default:
      // ❌ error: "square" is unhandled, so shape isn't `never` here yet.
      // ⭐ That error is the POINT — add a `kind` to Shape and this line breaks the
      //    build until you handle it. Compile-time proof you covered every case.
      const d: never = shape;
      break;
  }
}

/* 💡 SECTION 4 TAKEAWAY
   - A discriminated union needs a shared property with LITERAL types across all members.
   - `const _x: never = value` in the default branch is the exhaustiveness idiom.
     Without it, a missing case silently falls through at runtime.
   - Prefer this over `in`/instanceof when you own the type definitions. */

// 5. Type predicates 🤝
/** 
  syntax = <param-name> is <Type>
  TS trusts the annotation (x) : x is Dog => true but doesn't check whether body has validated it. Don't use it for untrusted input validation. Keep them small.
  ** Note - Use inferred predicates for local helpers. for exports or shared one's write the predicate explicitly.
*/
// ⭐ Three variants, three different outcomes — a favourite interview comparison:
const isDogInferred = (x: Dog | Cat) => "bark" in x;           // no annotation  -> TS INFERS `x is Dog` (TS 5.5+)
const isDogBad = (x: Dog | Cat): x is Dog => "bark" in x;      // explicit predicate -> narrows
const isDogBad1 = (x: Dog | Cat): boolean => "bark" in x;      // `boolean` -> narrowing DESTROYED
function f9(p: Dog | Cat) {
  if (isDogInferred(p)) {
    p; // p:Dog => inferred predicates -> derive from the body, any change to body might break the narrowing.
  }
  if (isDogBad(p)) {
    p; // p:Dog => narrowed down to Dog since it uses type predicate `x is Dog`
  }
  if (isDogBad1(p)) {
    p; // p: Dog | Cat => Lost the narrowing since the return type is not a predicate
  }
}
// ** Note: If the checks were in some helper function like isDogBad, we must declare the predicate type as return type in the helper function then the narrowing stays alive or it will be lost at call site.
// 👉 Why: narrowing does NOT cross a function boundary on its own. A plain `boolean`
//    tells the caller "true or false" and nothing about WHY. The predicate is the only
//    channel for carrying that information back out. ⚠️

/* 💡 SECTION 5 TAKEAWAY
   - `x is T` is the ONLY way to export a narrowing from a helper function.
   - Returning `boolean` silently loses it — no error, the call site just stays wide. 🐛
   - TS 5.5+ infers predicates for simple un-annotated helpers, but the inference is
     fragile: it derives from the body, so an innocent refactor can silently drop it.
     Annotate explicitly for anything exported or shared.
   - TS NEVER verifies the body matches the predicate. It's a promise, not a proof. */

// Narrowing Unknown
// User defined type guard - returns type predicate
type User = { id: number; name: string };

function isUserValid(x: unknown): x is User {
  return (
    x !== null &&
    typeof x === "object" &&
    "id" in x &&
    typeof x.id === "number" &&
    "name" in x &&
    typeof x.name === "string"
  );
}
// ** Note: Type guards are safe if we have the closed union type param but if we resolve from unknown to a defined shape then it will be dangerous because data make use of type predicate and define a wrong shape which produces runtime errors.

const data: unknown = JSON.parse("ada");
if (isUserValid(data)) {
  data; // data: User => Narrows to User type using user-defined type guard.
}

// 6. Asserts ⛔
// Difference from a type predicate: a predicate RETURNS a boolean you branch on.
// An assertion function THROWS, and narrows everything AFTER the call in that scope.
// asserts <param> is <type>
function assertStr(s: unknown): asserts s is string {
  if (typeof s !== "string") throw Error("");
}

function f11(v: unknown) {
  assertStr(v);
  v; // v: string => will be narrowed down to string for the rest of the scope.
}

// asserts <condition> - narrows whatever the condition proved
function assertsExp(c: unknown): asserts c {
  if (!c) throw Error("");
}

function f12(v: string | null) {
  assertsExp(v !== null);
  v; //v: string
}

// ** Gotcha - call target needs an explicit type annotation
const assertBoolean = (s: unknown): asserts s is boolean => {};

function f13(b: boolean | null) {
  assertBoolean(b); // ❌ TS2775: "Assertions require every name in the call target to be
                    //    declared with an explicit type annotation."
  b; // => boolean | null — narrowing lost ⚠️
}
// ⚠️ Note this is a HARD ERROR at the call site, not a silent failure. TS needs the
// assertion signature to be knowable without inferring the initializer first.
/**
  since the arrow function variable's type is inferred but not explicitly typed.
  Inference - ❌
  Explicit type - ✅
  ** Two fixes 
    1. use function declaration - because it has the type explicitly defined.
    2. Annotate the binding with a named signature type
 */
// 1. Function declaration
function assertBoolean1(x: unknown): asserts x is boolean {}

function f14(b: boolean | null) {
  assertBoolean1(b);
  b; // narrowed down to boolean
}

// 2. Annotate the binding with a named signature.
type AssertBool = (x: unknown) => asserts x is boolean;
const assertBool1: AssertBool = (x: unknown) => {};

function f15(b: boolean | null) {
  assertBool1(b);
  b; // narrowed down to boolean
}

// * Gotcha - An empty body compiles
function assertLie(v: unknown): asserts v is string {}
function f16(x: unknown) {
  assertLie(x);
  x; // typed as string, same unverified contract problem as type predicates - Nothing forces the body to actually check anything. TS just trusts the signature.
}

// ** asserts this is X -> narrows the object you called the method on instead of the parameter
class Box {
  value?: string;
  assertLoaded(): asserts this is { value: string } {
    // Here any shape can be accepted and result will be intersection of Box & <type> but not an error
    if (this.value === undefined) throw Error("");
  }
}
function f17(b: Box) {
  const x: string = b.value; // ❌ error: b.value is `string | undefined` BEFORE the assert
  b.assertLoaded();
  const y: string = b.value; // b.value is narrowed down to string
}
// 👆 The two lines are the demo: identical code, different types, purely because the
// assert call sits between them. That's control flow analysis in one picture. 📸

/* 💡 SECTION 6 TAKEAWAY
   - `asserts x is T` narrows for the REST OF THE SCOPE; a predicate narrows inside a branch.
   - An arrow function assigned to a const needs an explicit annotation, or the call
     site is a hard error (TS2775). Function declarations are fine as-is.
   - `asserts this is T` narrows the receiver — the pattern behind "loaded"/"initialized"
     states on a class.
   - An empty body compiles. TS trusts you completely — same unverified contract as
     type predicates, and the main reason to keep both tiny. ⚠️ */

// 6. Narrowing lifetime
/**
  ** Narrowing is per control flow path. It can be end by two things.
      1. reassignment 
      2. crossing into a closure over something that could be reassigned elsewhere.
*/
// Reassignment
function f21(v: string | number) {
  if (typeof v === "string") {
    v = 1 as string | number;
    v; // back to declared type  => string | number ⚠️
  }
}
// 👉 Assignment resets the flow to whatever was just assigned. Narrowing is tied to a
//    POSITION in the code, not to the variable.

// closures - depends on what could reassign the variable
// ⚠️ The rule TS uses: it narrows inside a closure only if it can prove the variable is
// never reassigned anywhere it can see. Cases 1-4 below walk that proof boundary.
function f22(v: string | number) {
  if (typeof v === "string") {
    const cb = () => {
      v; // Narrowing survives, never reassigned in the function
    };
  }
}

function f23() {
  let v: string | number = "";
  if (typeof v === "string") {
    const cb = () => {
      v; // local let, narrowing survives because it was never reassigned after the check
    };
  }
}

// case 1 - module, not exported, never reassigned
let v1: string | number = "";
function f24() {
  if (typeof v1 === "string") {
    const cb = () => {
      v1; // Narrowing still works
    };
  }
}

// case 2 - Assignment exists somewhere in the file
let v2: string | number = "";
function f251() {
  v2 = 2;
}
function f252() {
  if (typeof v2 === "string") {
    const cb = () => {
      v2; // Narrowing lost, because reassignment at line-246
    };
  }
}

// case 3 - variable is exported
export let v3: string | number = "";
function f26() {
  if (typeof v3 === "string") {
    const cb = () => {
      v3; // Narrowing lost, because of variable is exported.
    };
  }
}

// case 4 - script file (no import or no export anywhere) [cant test in local]
let v4: string | number = "";
function f27() {
  if (typeof v4 === "string") {
    const cb = () => {
      v4; // v4: string | number => since v4 will be on the window object. so any imported module can mutate this value.
    };
  }
}
// ⚠️ CORRECTION — this case does NOT reproduce here. Verified: v4 is `string` at that
// line, narrowing intact. The reason is that THIS FILE IS A MODULE (it has `export let v3`
// and `export { v5 }` below), so v4 is module-scoped and TS can see every assignment.
// The commented behaviour only happens in a true SCRIPT file — no top-level import or
// export anywhere — where v4 becomes a global and any other file could mutate it.
// Move this snippet to its own export-free file to actually observe it. 🧪

// Fix - use const inside the branch
export { v5 };
let v5: string | number = "";
function f282() {
  v5 = 1;
}

function f28() {
  if (typeof v5 === "string") {
    const safe = v5;
    const cb = () => {
      safe; // narrowing survives for reassignment on line 280 and export of variable on line 277 as well because of copy to const variable.
    };
  }
}
// ⭐ THE GENERAL FIX: copy the narrowed value into a `const` inside the branch, then
//    close over the const. A const can't be reassigned, so TS has nothing to invalidate.
//    This is exactly why `const { data } = props` before a callback is such a common
//    React pattern — same rule, different setting. ✅

/* 💡 SECTION 7 TAKEAWAY
   - Narrowing is per control-flow path, not per variable. Reassignment ends it.
   - Inside a closure, TS keeps the narrowing only if it can prove no reassignment
     exists anywhere it can see. Summary of the cases above:
       f22/f23  param or local let, never reassigned  -> SURVIVES ✅
       case 1   module-level let, never reassigned    -> SURVIVES ✅
       case 2   assigned in another function          -> LOST ❌
       case 3   exported (any importer could write)   -> LOST ❌
       case 4   true script-file global               -> LOST ❌ (not reproducible here)
   - Universal fix: assign to a `const` inside the branch and close over that. */

/**
 ** Interview questions
    type Dog = { bark: () => void };
    type Cat = { meow: () => void };

    1. v => object -> nothing narrows, because typeof null === 'object'
    2. v => number | undefined,  because of truthiness check and 0 goes to else block, so v in else block becomes 'number' | undefined.
    3. p => Dog by inference
    4. p => Dog | Cat because narrowing will be lost because of boolean return type
    5. Error - Throws error at call site since assert function requires type annotation since const variable has the type of return. Two fixes for this issue - 
        1. use function declaration syntax  -> since function declarations have built in types.
          
            function assetStr(v: unknown): asserts v is string {}
        
        2. Create a assert function type and type annotate the variable in arrow function case.

            type AssertStr = (v: unknown) => asserts v is string;
            function assertStr: AssertStr = (v) => {}

    6. {pet: Dog | Cat; extra: number } => Since extra prop doesn't exist on the instance it intersects the extra prop to current this prop.
    7. Yes, it does because typescript doesn't check the function body whether actual type check is happening or not. It believes the type predicate and do the type narrowing.
    8. Error comes in the default case where _x variable is getting assigned to s and it is 'square can't be assigned to never' because square case is not handled in the switch and it falls into default case and square cant be assigned to never.
    9. Since o is a object type and v prop can still be mutated outside of the function scope, so o.v type stays same i.e string | number
    10. p's type will still be Dog | Cat because helper check doesn't have the type predicate / assert as return type and narrowing will be lost outside of helper scope. So, it stays same.
*/

// Bonus gotcha: predicates and assertions can only ever NARROW, never widen. 🔒
// `x` is declared as Dog, but the assertion claims Dog | Cat — which is WIDER.
function f29(x: Dog): asserts x is Dog | Cat {
  // ❌ TS2677: "A type predicate's type must be assignable to its parameter's type."
  // Dog | Cat is not assignable to Dog, so the compiler rejects it.
  // ✅ `asserts x is Dog` or a narrower shape would be fine.
  // 👉 Same constraint applies to `x is T` predicates — T must be a subtype of the
  //    parameter's declared type. Narrowing only ever moves DOWN the type hierarchy.
}