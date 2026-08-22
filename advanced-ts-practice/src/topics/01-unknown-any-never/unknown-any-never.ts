/* ============================================================================
   unknown / never / any / void — INTERVIEW REVISION SHEET  🔺🔻
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` is the ACTUAL resolved type (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.
   👉 Companion files: Narrow.ts, Inference.ts, utilityTypes.ts, AdvancedTypes.ts.

   CONTENTS
     1. unknown ....... the TOP type — safe boundary type
     2. never ......... the BOTTOM type — exhaustiveness + filtering
     3. any ........... the escape hatch that disables checking
     4. void vs undefined

   THE TYPE LATTICE 🪜  (everything below follows from this one picture)

         unknown          ← TOP: every type is assignable TO it
            ▲                     nothing can be done WITH it until narrowed
            │
      string, number, Dog, ...    ← ordinary types
            │
            ▼
          never           ← BOTTOM: assignable TO every type
                                  nothing is assignable to IT (except never)

     any sits OUTSIDE the lattice: assignable both directions, to and from
     everything (the single exception: any is NOT assignable to never).

   THE DUALITY TABLE — the fastest way to remember all of it 📊
                      in a UNION            in an INTERSECTION
       unknown        absorbs  (-> unknown)  vanishes (-> the other type)
       never          vanishes (-> other)    absorbs  (-> never)
     They are exact mirrors. If you remember one row you can derive the other.
   ============================================================================ */

// 1. unknown - its a safe counter part to any and everything cane be assigned to it but unknown cant be assigned to every type except any and unknown. value type can't be used until we narrow it down to a certain type. Correct type for values entering your program from outside - API response, JSON.parse and catch bindings. It is a top type.

// Assigning any value types to unknown  ✅ everything goes IN
const a1: unknown = 'a';
const a2: unknown = 23;
const a3: unknown = true;

// Assigning unknown to any time - only unknown and any type can accept unknown type to be assigned.
const b1: unknown = '';
const b2: number = b1; // ❌ error — nothing comes back OUT without narrowing
const b3: string = b1; // ❌ error (even though the runtime value really IS a string)
const b4: any = b1;    // ✅ any accepts it (that's what makes any unsafe)
const b5: unknown = b1; // ✅ unknown to unknown

// Can't perform any operations until it is narrowed down.
b1.length; // ❌ TS18046: 'b1' is of type 'unknown'

// Narrowing unlocks it
function f1(v: unknown) {
  if (typeof v === 'string') {
    v; // narrowed to string type
  }
}

function f2(v: unknown) {
  if (typeof v === 'object' && v !== null && 'id' in v) {
    v; // typed to (object & Record<'id', unknown>)
  }
}

function f3(v: unknown) {
  if ('id' in v) { // in fails on raw unknown type. Fix: check with object type first and not null and then use in on it.
    // ❌ TS18046 — `in` needs an object operand; unknown isn't one yet. See f2 for the fix order:
    //    typeof === 'object'  ->  !== null  ->  'id' in v
  }
}

/**
  ** Gotcha - unknown absorbs union because unknown union to any other type will be unknown in union but in intersection, it vanishes.
*/
type A1 = string | unknown; // unknown
type A2 = string & unknown; // string - string & unknown -> string
// ** Note - unknown is the top type, other types are subtype of it.
// 👉 Compare with A11/A12 in section 2 — never behaves as the exact mirror. 🪞


// ** Gotcha - truthiness of unknown becomes {} but nothing something useful
declare const c1: unknown; // `declare` so the demo below is the only error here
function f4() {
  if (c1) {
    c1; // {} - just means it is not null / undefined but wont be useful until narrowing is done.
    c1.keys(); // ❌ error: Property 'keys' does not exist on type '{}'
  }
}
// ⚠️ `{}` means "anything except null/undefined" — NOT "an empty object". It has no
// members, so truthiness alone unlocks nothing. You still need a real type check.

/* 💡 SECTION 1 TAKEAWAY
   - unknown is the TOP type: everything is assignable to it, it's assignable to nothing
     (except unknown/any). That asymmetry is the entire safety property.
   - Use it at every data boundary: JSON.parse, fetch responses, catch bindings.
   - Narrowing is the only way out: typeof, instanceof, `in`, or a type predicate.
   - `in` needs an object first — check typeof === 'object' and !== null before using it.
   - Truthiness narrows unknown to `{}`, which is still unusable. Not a shortcut. */

/**
  ** When Not to use
     1. For internal code where u know the type - forces narrowing on every usage. If the shape is known, better to type it.
     2. Migrating a large JS codebase - using any at the boundary wont be useful since it silently passes any error but converting to unknown means fixing every call site before anything compiles.
*/

/**
  2. Never - bottom type
     Nothing is assignable to it and but it can be assigned to any other type. Its what a function that never returns is typed as (only function expressions but not declarations) and what a union becomes when every member is removed - Thats why it helps in exhaustiveness checking
*/

// Problem it solves
type Shape = { kind: 'circle', r: number } | { kind: 'square', s: number } | {kind:'triangle', l: number};
function checkShape(s: Shape) {
  switch (s.kind) {
    case 'circle': {
      break;
    };
    case 'square': {
      break;
    }
  }
} // It doesn't break on adding new member to shape (kind: triangle)
// ⚠️ Compiles silently and falls through at runtime — the bug never mentions itself.

function checkShape1(s: Shape) {
  switch (s.kind) {
    case "circle": {
      break;
    }
    case "square": {
      break;
    }
    default: {
      const _x: never = s; // exhaustiveness check, since there is no check for kind : triangle it falls into default case and on assignment it throws compile error that we missed one type on case check.
    }
  }
}

// Nothing can be assignable to it
const d1: string = '';
const d2: number = 5;

const d3: never = d1; // ❌ error — nothing is assignable TO never
const d4: never = d2; // ❌ error

// Every type can accepts the never value
const d5: string = d3; // ✅ never is assignable to EVERY type
const d6: number = d3; // ✅
// 👆 Exactly inverted from unknown at the top of the file. Top vs bottom. 🔺🔻

/**
  ** Function expressions (arrows, function expressions, object-literal methods) infer `never`. when the body can never complete — a throw or an infinite loop. Function declarations and class methods infer `void` in the same situation. An empty body or a bare `return` is `void` in all cases — it completes.
*/
// 1. Function expressions
const fn1 = () => {
  throw new Error('');
} // => () => never  ✅ expression, so `never`

const obj1 = { m() { throw new Error(''); } } // => { m(): never }
const o1 = obj1.m(); // => never
// Same goes for infinite loops, since they don't reach the function's end.

// 2. Functions declarations
function fn2() {
  throw new Error('');
}
const f12 = fn2(); // void

class Box {
  m() {
    throw new Error('');
  }
}
const bx1 = new Box();
const bx12 = bx1.m(); // => void (class methods behave like declarations, not expressions)
// ⚠️ Odd but deliberate on TS's part: declarations are hoisted and often used before
// they're defined, so inferring `never` there would break too much existing code.
// Want `never` from a declaration? Annotate it explicitly: `function fn(): never {...}`

// Union and Intersection behavior - opposite to unknown
type A11 = string | never; // string because never is a bottom type - vanishes
type A12 = string & never; // never - absorbs

// ** Filtering in conditional type
// Never in a union branch removes that member.
type A13<T> = T extends null | undefined ? never : T;
type A14 = A13<string | undefined>; // string

// same goes in mapped types 'as' clause drops keys
type Drop<T> = {
  [K in keyof T as K extends `a` ? K : never]: T[K]
};

type A15 = Drop<{
  'a': string;
  'b' : number
}> // => { a: string }  ✅ 'b' mapped to never and dropped

// ** Gotcha - never as a conditional type input skips the condition entirely
type Dist<T> = T extends string ? 'yes' : 'no';
type Dist1 = Dist<never>; // returns never because never considers to be empty union and neither branch runs.

// Fix: wrap it in a tuple
type Dist2<T> = [T] extends [string] ? 'yes' : 'no';
type Dist3 = Dist2<never>; // => 'yes'  ⚠️ NOT 'no' — read on
/* ⚠️ Careful what "fix" means here. The tuple stops distribution, so the condition
   now actually RUNS — that's the fix. But the answer is 'yes', because never is
   assignable to string (never is assignable to everything).
   👉 So this does NOT detect never. To test for never you must compare AGAINST never:
        type IsNever<T> = [T] extends [never] ? true : false;   // ✅ the real idiom
   Mixing these two up is a classic interview stumble. */

// ** Gotcha - never type means a unreachable code
function fn3(v: number) {
  if (typeof v === 'string') {
    v; // unreachable code  => never ✅
  }
}
// 👉 Seeing `never` on a variable in your editor usually means a branch is dead —
//    often an already-exhaustive check, or a condition that can't be true. 🕵️

/* 💡 SECTION 2 TAKEAWAY
   - never is the BOTTOM type: assignable to everything, nothing assignable to it.
   - It's what a union becomes when every member is removed — which is why it powers
     both exhaustiveness checks and every filtering utility (Exclude, Omit, NonNullable).
   - never VANISHES in unions and ABSORBS in intersections (mirror of unknown).
   - Function EXPRESSIONS that always throw infer never; DECLARATIONS and class methods
     infer void. Annotate explicitly if you need never from a declaration.
   - never as a conditional input short-circuits: the condition never runs, result is never. */

/**
  ** When not to use
  1. As a TODO return type - never means unreachable so better use void or unknown return types for placeholders.
  2. Handwritten filters that already utility types provide - NonNullable<T>, Omit<T, K>, Exclude<T, K> are the never-filtering patterns.
*/


// 3. Any
/**
  any disables type checking entirely. Errors wont occur for the any type variables in compile time but possible in runtime. Any operations can be performed and every other type can be assigned to it and vice-versa. where to use - JS code migration to TS and few library internal escapes and at data boundaries, unknown is the best choice.

  ** Problem it solves
     escape hatch for code TS can't express or hasn't been resolved yet - legacy JS, dynamic shapes, gradual migration.
     Without this, migration to TS wont be possible.
*/

const a11: any = '';

const b11: string = a11; // can be assigned to any type

const b12: never = a11; // ❌ One thing which any can't do is assigning any to never type variable.

a11.foo(); // ✅ compiles, crashes at runtime 💥
a11 + 1;   // ✅ compiles

// ** Gotcha - any spreads through every expression it touches
declare const j: any; // `declare` so the contagion below is the only lesson here
const j1 = j.foo(); // => any  (spreads)
const m1 = j + 1;   // => any  (spreads)
// ⚠️ This is the real cost: one `any` silently un-types everything downstream of it.
//    unknown is the opposite — it forces a check at the first point of use.

// ** Gotcha - any silently defeats generic constraints
function strCheck<T extends string>(v: T): T {
  return v;
}
declare const s2: any;
const s1 = strCheck(s2); // s1: any, even though constraint guarantees that return type is string but passing any bypasses it.
// ⚠️ The constraint isn't checked AND the return type degrades to any. Both guarantees gone.

// ** Gotcha - any in conditional type resolves to union of both conditions
type Dist4<T> = T extends string ? 'yes' : 'no';
type Dist41 = Dist4<any>; // 'yes' | 'no', any is compatible to both branches and returns union of both
// 👉 Three special conditional-type inputs worth memorizing together:
//      never   -> never        (condition never runs)
//      any     -> the UNION of both branches
//      unknown -> false branch (unless the check is against unknown/any)

try { } catch (e) { // catch bindings are inferred to unknown in strict mode.
  // ✅ verified: e is `unknown` here (useUnknownInCatchVariables, on via strict).
  // Pre-TS 4.4 / without strict it was `any` — a common source of unchecked error handling.
}

/* 💡 SECTION 3 TAKEAWAY
   - any turns OFF checking; unknown turns it UP. They are not variations of each other.
   - any is contagious: every expression touching it becomes any, with no warning.
   - any defeats generic constraints and collapses inferred return types.
   - The single thing any cannot do: be assigned to never.
   - Legitimate uses are narrow — gradual JS migration and a few library internals.
     At data boundaries the answer is always unknown. */

/**
  ** When not to use it
    1. At data boundaries - use unknown instead
    2. when error is not understandable - silencing error using any will lead to runtime errors
    3. In public export / API - expose any will suppress errors in consumers code.
*/

/**
  undefined vs void
  undefined - value
  void - ignore whatever comes back

  void type is wider
*/
const a13: void = undefined; // undefined value can be assigned to void type ✅
const a14: undefined = a13; // void value type can't be assigned to undefined value type since it is value ❌

// callback return types  ⭐ THE one practically important difference
declare function each(cb: (x: number) => void): void;
each(x => x + 1); // doesn't throw any error  ✅ the number return is simply IGNORED

declare function each1(cb: (x: number) => undefined): void;
each1(x => x + 1); // throws error  ❌ must return exactly undefined

// ** This is why Array.prototype.forEach takes (value) => void
// 👉 `=> void` means "I will ignore whatever you return", which lets you pass concise
//    arrow bodies like `arr.forEach(x => list.push(x))` — push returns a number, and
//    nobody cares. `=> undefined` would reject every one of those. 🎯

// * Note - If we use void on types then it doesn't throw any error but on value's it does eg - return number in a function which has void return type
function f22(u: unknown): void {
  return 1; // ❌ error — an explicit `return 1` in a void function IS checked
}
// ⚠️ Subtle but fair game in an interview: the "void ignores the return" rule applies to
//    ASSIGNING a function to a void-returning signature, not to a direct declaration.

// Return position - both void and undefined behave identically.
function f23(): void { }
function f24(): undefined {}
function f25(): undefined {
  return;
}
function f26(): void {
  return;
}
function f27(): void {
  return undefined;
}
function f28(): undefined {
  return undefined;
}

// ** Note - Difference is visible only on return types of callbacks and assignability.

// Neither accepts null under strict
const b23: void = null;      // ❌ error under strictNullChecks
const b24: undefined = null; // ❌ error under strictNullChecks
// (Both would be allowed with strict off — another reason to keep strict on.)

/* 💡 SECTION 4 TAKEAWAY
   - undefined is a VALUE. void means "the return is ignored" — not a value you can use.
   - undefined -> void ✅ ; void -> undefined ❌ (void is the wider one).
   - The difference only shows up in two places: assignability, and CALLBACK return types.
     `(x) => void` accepts a callback returning anything; `(x) => undefined` does not.
     That's precisely why forEach, addEventListener and friends are all typed `=> void`.
   - In a direct function declaration, `return 1` in a `: void` function is still an error.

   🎤 THE FOUR-WAY SUMMARY interviewers are usually fishing for:
      unknown  — safe top type. Accepts everything, gives nothing until narrowed. Use at boundaries.
      any      — off switch. Contagious, defeats constraints. Use only for migration.
      never    — bottom type. Empty union; powers exhaustiveness and filtering.
      void     — "ignore the return". Only meaningfully different from undefined in callbacks. */