/* ============================================================================
   ADVANCED TYPESCRIPT — INTERVIEW REVISION SHEET  📘
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` after a line is the ACTUAL resolved type (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ is a demo of a rule.

   CONTENTS
     1. Discriminated Unions ......... tags, narrowing, exhaustiveness, literal widening
     2. Mapped Types ................. +/- modifiers, `as` remapping, key filtering, homomorphism
     3. Conditional Types ............ assignability, distribution, never/any/unknown edge cases
     4. The `infer` Keyword .......... positions, variance, overloads, recursion, DeepPartial
     5. Template Literal Types ....... slots, patterns, string parsing, recursion limits

   THE 6 RULES THAT COVER MOST QUESTIONS
     1. A discriminant must be a LITERAL type present on every union member.
     2. `extends` means "is assignable to" — not "inherits from".
     3. A naked type param in a conditional DISTRIBUTES over unions; wrap in [T] to stop it.
     4. `never` is the empty union: it disappears in unions and short-circuits distribution.
     5. Mapped types keep `?`/`readonly` (even with `as`) but `as` destroys array/tuple-ness.
     6. `infer` unions in covariant positions, INTERSECTS in contravariant ones.
   ============================================================================ */

// 1. Discriminated Unions 🏷️

// No shared literal "tag" => TS can't narrow, so only the common members are accessible.
type Response = { data: string } | { error: string };

function handle(res: Response) {
  res.data; // ❌ error: 'data' doesn't exist on the { error } member
}

// `status` is the discriminant: a literal-typed property present in every member.
type Response1 =
  | { data: string; status: "success" }
  | { error: string; status: "error" }
  | { status: "test" };

function handle1(res: Response1) {
  if (res.status === "success") {
    console.log("🚀 ~ handle1 ~ res.data:", res.data); // ✅ narrowed to the success member
    res.error; // ❌ error: success member has no 'error'
  } else if (res.status === "error") {
    console.log("🚀 ~ handle1 ~ res.error:", res.error); // ✅ narrowed to the error member
    res.data; // ❌ error: error member has no 'data'
  }
}

function handle2(res: Response1) {
  switch (res.status) {
    case "success":
      return res.data;
    case "error":
      return res.error;
    default:
      // Exhaustiveness check: in `default` res is whatever is left over.
      // ❌ errors here on purpose — { status: 'test' } is unhandled, so res isn't `never` yet.
      // Add `case 'test'` and the error disappears. This is how you get a compile-time
      // failure when someone later adds a new member to the union.
      const response: never = res;
      return res;
  }
}

// Same pattern in reducer
type Action = { type: "increment"; by: number } | { type: "reset" };

function reducer(state: number, action: Action) {
  switch (action.type) {
    case "increment":
      return action.by;
    case "reset":
      return 0;
  }
}

// `type` widens to `string` when stored in a variable first, so it no longer
// matches the literal 'increment'.
const action1 = { type: "increment", by: 10 };
reducer(0, action1); // ❌ error: string is not assignable to "increment"

// Fix: pin the discriminant with `as const` (either on the property or the whole object).
// const action2 = { type: 'increment', by: 5 } as const;
const action2 = { type: "increment" as const, by: 5 };
reducer(1, action2); // ✅

// Works for inline literals — contextual typing keeps `type` literal, no widening.
reducer(2, { type: "increment", by: 15 }); // ✅

// The discriminant doesn't have to be a string — boolean literals work too.
type Result = { ok: true; value: string } | { ok: false; error: string };

function unwrap(r: Result) {
  if (r.ok) return r.value;
  throw r.error;
}

/* 💡 SECTION 1 TAKEAWAY
   - Narrowing needs a literal discriminant on EVERY member; without it you only see common props.
   - `const x: never = value` in `default` is the exhaustiveness idiom: it breaks the build
     when someone adds a union member, which is exactly what you want.
   - Object literals widen `type: 'increment'` to `string` when assigned to a variable first.
     Fix with `as const`, or pass the literal inline so contextual typing applies. */

// 2. Mapped Types 🗺️

// 2.a Modifier add/remove ➕➖

// ⚠️ NOTE: this interface merges with `class User` declared further down (section 4.5).
// Declaration merging is silent, which is why `UserGetters` below also contains `getGreet`.
interface User {
  id: number;
  name?: string;
  readonly email: string;
}

// `+` is the default and can be omitted; it's spelled out here for symmetry with `-`. 🔁
type AllOptional<T> = { [K in keyof T]+?: T[K] }; // Partial<T>
type UserOptional = AllOptional<User>;
type AllRequired<T> = { [K in keyof T]-?: T[K] }; // Required<T>
type UserRequired = AllRequired<User>;
type AllReadonly<T> = { +readonly [K in keyof T]: T[K] }; // Readonly<T>
type UserReadonly = AllReadonly<User>;
type AllMutable<T> = { -readonly [K in keyof T]: T[K] }; // the "unfreeze" direction
type UserMutable = AllMutable<User>;

// ⚠️ Gotcha: `-?` only removes the `undefined` that optionality itself added.
// An explicit `| undefined` on a *required* property survives.
type WithUndef = { a?: string | undefined; b: string | undefined };
type Stripped = { [K in keyof WithUndef]-?: WithUndef[K] };
// => { a: string; b: string | undefined }  👈 `b` keeps its undefined

// 2.b Key remapping with `as` 🏷️
// The `as` clause rewrites the *key*; the value type is computed separately.
// `K & string` is needed because keyof T can include number | symbol, which
// Capitalize (a string-only intrinsic) rejects.
type Getter<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};

// 👀 Also picks up `getGreet` because of the interface/class merge flagged above.
type UserGetters = Getter<User>;

// 2.c Filtering Keys 🚮 - map a key to never to drop it

type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

type StringProps = OnlyStrings<Mixed>; // => { name: string; email: string } ✅

type MethodNames<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};

interface Service {
  url: string;
  fetch(): void;
  save(): void;
}

type Methods = MethodNames<Service>; // => { fetch: () => void; save: () => void } ✅

// Second implementation of Omit 🛠️
// Note the flipped branches vs. OnlyStrings: keys that match K become never (dropped).
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type MyService = MyOmit<Service, "fetch" | "save">; // => { url: string } ✅

// homomorphic vs non-homomorphic mapped types 🧬
// Homomorphic = the map iterates `keyof T` for a *generic* T, so TS knows it's
// walking an existing type and carries its `?` / `readonly` modifiers across.

interface Src {
  a?: string;
  readonly b: number;
}

type Homomorphic<T> = {
  [K in keyof T]: T[K];
};
type H = Homomorphic<Src>; // ✅ persists the modifiers => { a?: string; readonly b: number }

// Iterates a bare key union K, not `keyof T`, so there's no source type to copy from.
type NonHomomorphic<K extends keyof any, V> = {
  [P in K]: V;
};
type N = NonHomomorphic<keyof Src, string>; // ❌ modifiers gone => { a: string; b: string }

// Renaming with `as` keeps modifier preservation for objects,
// but breaks the array/tuple preservation. 📐
type Renamed<T> = {
  [K in keyof T as `new_${string & K}`]: T[K];
};
type R = Renamed<Src>; // ✅ still { new_a?: string; readonly new_b: number }

// Homomorphic map over a tuple maps the *elements* and stays a tuple.
type Plain<T> = { [K in keyof T]: T[K] };
type PlainTuple = Plain<[string, number]>; // ✅ => [string, number]

// Adding an `as` clause (even an identity one!) drops out of the array/tuple
// fast path — now every key of the tuple is mapped, including `length`, `push`,
// `map`, ... so you get a giant object type instead of a tuple. 💥
type Remapped<T> = { [K in keyof T as K]: T[K] };
type RemappedTuple = Remapped<[string, number]>; // ❌ => { 0: string; 1: number; length: 2; push: ...; ... }

/* 💡 SECTION 2 TAKEAWAY
   - `[K in keyof T]` over a GENERIC T is homomorphic: it copies `?` and `readonly` across.
     Iterating a bare key union (`[P in K]`) is not, and drops them.
   - `as` remapping KEEPS modifiers but LOSES array/tuple-ness — even an identity `as K`.
   - Map a key to `never` to delete it. That single trick implements Omit, Pick and filters.
   - Two ways to filter: `as` in the KEY slot keeps an object; K in the VALUE slot plus
     `[keyof T]` indexing gives you a union of key names. */

// 3. Conditional types ❓
// `T extends U ? X : Y` — read `extends` as "is assignable to", not "inherits from".
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // => true  ('hello' is a subtype of string) ✅
type B = IsString<32>; // => false ❌

// Nested chains — evaluated top to bottom, first match wins, so order matters. ⬇️
// (`object` is the fallback, which is why tuples/arrays land there.)

type TypeName<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends undefined
        ? "undefined"
        : T extends (...args: any[]) => any
          ? "function"
          : "object";

type AB = TypeName<32>; // => 'number'
type BC = TypeName<() => {}>; // => 'function'
type CD = TypeName<[2, 3]>; // => 'object'  (tuple falls through to the fallback) 📦

/*
  Distribution over union ➗
    conditions:
      1. T should not be wrapped
      2. If T is union, it will be distributed over all members.
      (Only *naked* type parameters distribute, and only in the checked position.)
*/
type ToArray<T> = T extends any ? T[] : never;

type R1 = ToArray<string | number>; // => string[] | number[]  (NOT (string|number)[]) ⚠️

// Disabling distribution with tuple wrapping 🎁
type ToNonDistArr<T> = [T] extends any ? T[] : never;
type N1 = ToNonDistArr<string | number>; // => (string | number)[] ✅

//  detecting never 🕳️
type IsNever<T> = T extends never ? true : false;

type I1 = IsNever<never>; // Ideally true should be returned but in this case never shortcircuits the operation and returns never without even checking the condition.
// (never is the empty union — distributing over zero members yields zero results => never.)

type IsNever2<T> = [T] extends [never] ? true : false; // wrapping in tuple breaks the distribution.
type I2 = IsNever2<never>; // => true ✅

type IsString1<T> = T extends string ? "yes" : "no";

// any is assignable to everything and everything is assignable to it.
// For any, conditional type returns union of both branches.
type P1 = IsString1<any>; // => 'yes' | 'no' 🤷

// unknown is only assignable to unknown/any, so it takes the false branch.
type P2 = IsString<unknown>; // => false

// Readonly array fails mutable array check 🔒
// Assignability is one-way: T[] is assignable to readonly T[], never the reverse.
type IsArray<T> = T extends any[] ? true : false;

type A1 = IsArray<[1, 2, 3]>; // => true ✅
type A2 = IsArray<readonly [4, 5, 6]>; // => false ❌ readonly can't widen to mutable

// But readonly check works for mutable arrays
// 👉 So `readonly any[]` is the safer constraint when you just mean "any array".
type IsReadonlyArray<T> = T extends readonly any[] ? true : false;

type R3 = IsReadonlyArray<[1, 2, 3]>; // => true ✅ mutable IS assignable to readonly
type R4 = IsReadonlyArray<readonly [1, 2, 3]>; // => true ✅

// Unwrap array element type 📤
type ElementType<T> = T extends (infer U)[] ? U : T;

type E1 = ElementType<string[]>; // => string
type E2 = ElementType<number>; // => number (falls to the else branch, passthrough)

// Function-property keys of an object 🔑
// 🆚 Contrast with MethodNames in 2.c: that one remaps the *key* with `as` to keep
// a filtered object; this one puts K in the *value* slot then indexes to get a key union.
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type Widget = {
  id: number;
  label: string;
  render: () => void;
  destroy: () => void;
};

type WidgetKeys = FunctionKeys<Widget>; // => 'render' | 'destroy' ✅

/**
  Builds up a object type
  type WidgetKeys = {
      id: never;
      label: never;
      render: "render";
      destroy: "destroy";
  }
  if we index with keys of Widget, Object type distributes over union and get the key values union.
  {
      id: never;
      label: never;
      render: "render";
      destroy: "destroy";
  }['id' | 'render' | 'destroy']
  => never | never | 'render' | 'destroy'
  => 'render' | 'destroy'

  (never vanishes in a union, which is what makes this filtering trick work. 🪄)
*/

/* 💡 SECTION 3 TAKEAWAY
   - Read `A extends B` as "is A assignable to B".
   - Distribution: only a NAKED type param distributes over a union. `[T] extends [U]`
     turns it off — that's how IsNever, and any "treat the union as a whole" check, works.
   - The three edge cases interviewers love:
       never   => distributing over zero members gives never (the condition never runs).
       any     => returns the UNION of both branches.
       unknown => takes the false branch for everything except unknown/any.
   - `readonly T[]` is the safe "any array" constraint; `T[]` rejects readonly arrays. */

// 4. Infer keyword 🔎 - If we want to check a condition, extends gives yes/no but infer can give what's inside it.
// Infer can be used only inside extends clause of conditional type.
// Infer declares a type variable inside extends clause that captures whatever matches in that position.
// The inferred variable is only in scope in the *true* branch.
type IsPromise<T> = T extends Promise<any> ? "yes" : "no";

type IP1 = IsPromise<Promise<string>>; // => 'yes' — but we lost the `string` 😕

type Unwrap<T> = T extends Promise<infer U> ? U : T; // infer keeps it 🎯
type UW1 = Unwrap<Promise<string>>; // => string

// Basic positions 📍
// 1. Return type — this is how the built-in ReturnType<T> is written.
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type RT1 = MyReturnType<() => string>; // => string

// 2. Parameters type — infers into a rest position, so P comes back as a tuple.
type MyParametersType<T> = T extends (...args: infer P) => any ? P : never;
type PT1 = MyParametersType<(p: string, q: number) => void>; // => [p: string, q: number]

// 3. Array element
type ArrayElement<T> = T extends (infer E)[] ? E : T;
type AE1 = ArrayElement<number[]>; // => number

// 4. First and last element in a tuple. 🎬
// Variadic tuple patterns let you infer at either end.
type First<T> = T extends [infer F, ...any[]] ? F : never;
type F1 = First<[2, 1, 3]>; // => 2

type Last<T> = T extends [...any[], infer L] ? L : never;
type L1 = Last<[2, 3, "Test"]>; // => 'Test'

// 5. Constructor instance type 🏗️
type MyInstance<T> = T extends new (...args: any) => infer I ? I : never;
// ⚠️ NOTE: this class merges with `interface User` from section 2.a (same name, same scope).
class User {
  static version = 1;
  constructor(public name: string) {} // ❌ parameter properties are banned by `erasableSyntaxOnly`
  greet() {}
}
const u1 = new User("nikhil");
// ⚠️ `typeof u1` is the *instance* type (User), not the constructor, so nothing matches
// the `new (...) => infer I` pattern and we fall to the false branch.
type I12 = MyInstance<typeof u1>; // => never ❌
type I13 = MyInstance<typeof User>; // => User ✅ — pass the class itself

// Multiple infers 👯
type SplitFn<T> = T extends (arg: infer P) => infer R
  ? { input: P; output: R }
  : never;
type S = SplitFn<(s: number) => string>; // => { input: number; output: string }

// Gotcha - same variable inferred in multiple positions ⚡
// Covariant positions (return types, object properties)
type Cov<T> = T extends { a: infer U; b: infer U } ? U : never;
type C1 = Cov<{ a: string; b: boolean }>; // Produces union => string | boolean

// Contravariant positions (function params)
// Same U in two param slots collapses to an INTERSECTION instead. 🔀
type Cot<T> = T extends { a: (p: infer U) => any; b: (p: infer U) => any }
  ? U
  : never;
type C2 = Cot<{ a: (p: { m: 1 }) => void; b: (p: { n: 2 }) => void }>; // => { m: 1 } & { n: 2 }

// Overloaded functions infer from the last signature 📚
// A single `infer` can only match one call signature, and TS picks the LAST one.
interface Overload {
  (x: string): number;
  (x: number): string;
}

type A11 = Overload extends (...a: any[]) => infer U ? U : never; // Always returns the last signature => string
type A12 = Parameters<Overload>; // Always returns the last signature => [x: number] ⚠️ the (x: string) overload is invisible

// To solve the last signature issue with overload, we need to enumerate them
// (there's no variadic way to do this — you write one infer per overload you want.)
type A21 = Overload extends {
  (...a1: any[]): infer R1;
  (...a2: any[]): infer R2;
}
  ? R1 | R2
  : never; // => string | number ✅ both signatures captured

// infer U[] matches tuples and reject readonly arrays. 🚫
type Elem<T> = T extends (infer U)[] ? U : never;

type B1 = Elem<[string, number]>; // => string | number ✅ tuples match (they're array subtypes)
type B2 = Elem<string[]>; // => string ✅
type B3 = Elem<readonly string[]>; // => never ❌ readonly isn't assignable to mutable

// Fix: Widen the pattern - readonly check since it works for both readonly as well as mutable arrays.
type Elem2<T> = T extends readonly (infer U)[] ? U : never;
type B11 = Elem2<readonly string[]>; // => string ✅
type B12 = Elem2<string[]>; // => string ✅
type B13 = Elem2<readonly [1, 2]>; // => 1 | 2 ✅

// Generic signature will be collapsed to unknown. 🫥
// The type param T has no argument to bind at inference time, so it erases to unknown.
type L11 = (<T>(x: T) => T) extends (x: infer U) => any ? U : never; // => unknown
type L12 = ReturnType<<T>(x: T) => T>; // => unknown

type P12 = ((this: Window, a: string) => void) extends (...p: infer P) => void
  ? P
  : never; // this parameter is silently dropped. => [a: string], not [this: Window, a: string]

// Recursion 🔁
// 1. Awaited
type Shallow<T> = T extends Promise<infer U> ? U : T;
type E = Shallow<Promise<Promise<string>>>; // => Promise<string> ❌ peeled one layer only

// Recursing on U keeps peeling until the conditional stops matching. 🧅
type Deep<T> = T extends Promise<infer U> ? Deep<U> : T;
type E12 = Deep<Promise<Promise<string>>>; // => string ✅

// 2. Objects - deep partials
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Settings {
  theme: string;
  window: {
    size: {
      width: number;
    };
  };
}

type A32 = DeepPartial<Settings>;
const patch: A32 = {
  window: {
    size: {},
  },
};

// Extends object silently breaks the arrays and functions. 💣
// `T[K] extends object` is true for arrays AND functions, so both get mapped
// like plain objects and lose what made them special.
interface WithFn {
  run: () => void;
  type: string[];
}

const patch1: DeepPartial<WithFn> = {
  // ⚠️ No error here, and that's the bug: mapping over string[] is homomorphic, so
  // `?` lands on every *element* and the type degrades to (string | undefined)[].
  type: ["1", undefined],
  // ⚠️ Also no error: DeepPartial<() => void> is `{}`, so the call signature is gone.
  // keyof (() => void) is never (a function has no enumerable own props), and mapping
  // over never keys yields `{}` — which accepts almost any object.
  run: {},
};

type FnMapped = DeepPartial<() => void>; // {}
type FnMapped1 = keyof (() => void); // => never  👈 why FnMapped collapses to {}
type FnMapped2 = keyof Function; // => 'apply' | 'call' | 'bind' | ... (only on the Function interface)

patch1.run?.(); // ❌ error: "This expression is not callable" — the damage surfaces here 💥

// ✅ Fix: check functions and arrays BEFORE the generic `object` branch.
// Order matters — `object` would swallow both if it came first.
type DeepPartial1<T> = T extends (...args: any[]) => any
  ? T // functions pass through untouched
  : T extends (infer U)[]
    ? DeepPartial1<U>[] // rebuild the array so `?` never reaches the elements
    : T extends object
      ? { [K in keyof T]?: DeepPartial1<T[K]> }
      : T;

type FnMapped3 = DeepPartial1<() => void>; // => () => void ✅ signature preserved

const patch2: DeepPartial1<WithFn> = {
  type: ["1", "2"], // ✅ undefined elements are now correctly rejected
  run: {}, // ❌ error (as it should be): {} is not assignable to () => void 🎉
};

patch2.run?.();

const patch3: DeepPartial1<WithFn> = {
  type: ["2", "3"],
  run: () => {
    return 2; // ✅ fine: a non-void return is assignable to a () => void slot
  },
};

const r = patch3.run?.();
type R32 = typeof r; // => void | undefined (undefined from the optional call `?.`)

// Interview questions on infer
// 1. Implement ReturnType from scratch
type MyReturnType1<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;

type RT5 = MyReturnType1<() => string[]>; // => string[] ✅
// 👇 The `T extends (...args) => any` constraint means bad input is rejected at the
// call site instead of silently returning never — same behavior as the built-in.
type RT6 = MyReturnType1<string>; // ❌ error: string doesn't satisfy the constraint
type RT7 = ReturnType<string>; // ❌ same error from the real ReturnType

// 2. Write DeepReadonly - needs to support functions, arrays and objects.
// use recursion
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// 👉 No array branch needed here — see the note below DeepPartial2 for why
// readonly behaves differently from `?` when mapped over an array.

type DR1 = DeepReadonly<{ tags: string[] }>; // => { readonly tags: readonly string[] } ✅

type DeepPartial2<T> = T extends (...args: any) => any
  ? T
  : T extends readonly (infer U)[]
    ? DeepPartial2<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial2<T[K]> }
      : T;

type DP1 = DeepPartial2<{ tags: string[] }>["tags"]; // => string[] | undefined ✅
const dp1: DP1 = ["1", undefined]; // ❌ error (correctly!) — undefined isn't a valid element

type DP2 = DeepPartial2<{ tags: readonly string[] }>["tags"]; // => string[] | undefined (readonly is dropped by the rebuild)

// For readonly, we dont need to have the array branch since readonly for each member folds into an array type of readonly but for ? it doesn't, so each member becomes (<type> | undefined)[] which accepts undefined in the array which was not expected, so we have the branch for catching arrays which skips ? and adds only at key level like (key: string[] | undefined) but not (key: (string | undefined)[])
// TL;DR 🔑  readonly on every index === `readonly string[]` (harmless, same meaning).
//           `?` on every index === `(string | undefined)[]` (WRONG — lets undefined in).
//           That asymmetry is the whole reason DeepPartial needs an array branch and DeepReadonly doesn't.

// 3. why does Awaited needs recursion - Nested promises; single level unwraps peels one layer only
type MyAwaitedOneLayer<T> = T extends Promise<infer U> ? U : never; // Promise<Promise<string>> => Promise<string>

type MyAwaitedNested<T> = T extends Promise<infer U> ? MyAwaitedNested<U> : T; // => string ✅
// (The real Awaited<T> also handles thenables and unions, and guards against infinite recursion.)

/* 💡 SECTION 4 TAKEAWAY
   - `infer` only lives in an `extends` clause and is only in scope in the TRUE branch.
   - Same variable inferred twice: covariant positions UNION, contravariant (param) INTERSECT.
   - Overloads: a single infer sees only the LAST signature. Enumerate them to get all.
   - Generic signatures collapse their type params to `unknown` during inference.
   - Ordering in recursive helpers matters: check function → array → object, because
     `extends object` is true for functions and arrays too.
   - `readonly` mapped over an array is harmless; `?` mapped over an array is a BUG
     (it becomes (T | undefined)[]) — which is why DeepPartial needs an explicit array branch. */

// 5. Template literal types 🔤
// Apply js template syntax at the type level to build string literal types from other types.

const routes = ["/home", "/settings"] as const;
type Route = (typeof routes)[number];
// type ApiRoute = '/api/home' | '/api/settings'; // handwritten, silently stale while routes grows
type ApiRoute = `/api${Route}`;

// Supported slot types - number, boolean, string, bigint, undefined, null
type S1 = `${Symbol}`; // ❌ error: symbol is NOT a valid slot type (it has no implicit string conversion)

type BOO = `${boolean}`; // "false" | "true"  👈 boolean is a union, so it expands to two literals
type Num = `${number}`; // any number in strings;
type D = `${100n}`; // "100"

// unions multiply - cross product ✖️
type Size = "sm" | "md";
type Color = "red" | "blue";
type Variant = `${Size}-${Color}`; // => "sm-red" | "sm-blue" | "md-red" | "md-blue" (2 × 2)

// Enum
enum Status {
  Active = "active",
  Done = "done",
}
// ⚠️ `typeof Status` is the enum OBJECT type ({ Active: ...; Done: ... }), NOT the member union.
// The member union is the bare enum name used as a type: `Status`.
type ST1 = typeof Status; // the object shape — this is what `st1` below must satisfy
type ST2 = Status; // => Status.Active | Status.Done  👈 the union you usually want
// const st1: ST1 = {
//   Active : Status.Active,
//   Done: Status.Done
// }
// enum as type => union of its members => Status.Active | Status.Done => 'active' | 'done'
type StatusType = `status-${Status}`; // => "status-active" | "status-done" ✅ (uses the union, not typeof)

// Pattern types - a wide `string`/`number` in a slot makes the type a PATTERN
// that TS checks literals against, instead of a finite union. 🎯
type PageRoute = `/page/${number}`;
const r1: PageRoute = '/page/12';   // ✅
const r2: PageRoute = '/page/dasd'  // ❌ error: 'dasd' isn't a number

// Intrinsics- implemented by compiler, not written in TS
/* It doesn't have the body like written in TS, just a intrinsic marker
    type Uppercase<S extends string> = intrinsic;
    type Lowercase<S extends string> = intrinsic;
    type Capitalize<S extends string> = intrinsic;
    type Uncapitalize<S extends string> = intrinsic;
    type NoInfer<T> = intrinsic;
*/
type U1 = Uppercase<'name'>;      // => "NAME"
type L2 = Lowercase<'NAME'>;      // => "name"
type C12 = Capitalize<'name'>;    // => "Name"
type UC1 = Uncapitalize<'Name'>;  // => "name"

// Parsing strings with infer ✂️
// ⚠️ Key rule: infer in a template is NON-GREEDY — the first slot takes as little as possible.
type SplitFirst<S> = S extends `${infer A}.${infer B}` ? [A, B] : never;
type SF1 = SplitFirst<'a.b.c'>; // => ["a", "b.c"]  👈 splits at the FIRST dot, not the last

// With no separator between them, A grabs exactly one char and B takes the rest.
type Split2<S> = S extends `${infer A}${infer B}` ? [A, B] : never;
type S2 = Split2<'hello'>; // => ["h", "ello"]

// S = 's,b,a' , D=','  output = ['s', 'b', 'a'];
// Recurse on Tail and spread the result to flatten it into one tuple. 🔁
type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S];
type S3 = Split<'s.a.b', '.'>; // => ["s", "a", "b"] ✅

// typed dot path lookup - react-hook form and typed-i18n
// object type = {user: {address: {city: string}}} , 'user.address.city' => return type of city
// Peel one segment, verify it's a real key, recurse into T[K]. The base case
// (no dot left) does the final lookup. `never` on a bad key = a typo'd path won't compile. 🛡️
type Get<T, P extends string> =
  P extends `${infer K}.${infer Rest}` ? (K extends keyof T ? Get<T[K], Rest> : never) : (P extends keyof T ? T[P]: never);

type G1 = Get<{ user: { address: { city: string } } }, 'user.address.city'>; // => string ✅

// Key remapping
interface User1 {
  name: string;
  age: number;
}

// create handlers type from interface -> {onNameChange: (x: string) => void; onAgeChange: (x: number) => void}
type Handlers<T> = {
  [K in keyof T as `on${Capitalize<K & string>}Change`]: (x: T[K]) => void
}
type H1 = Handlers<User1>; // => { onNameChange: (x: string) => void; onAgeChange: (x: number) => void } ✅

// map a key to never to drop it -> works as a filter
type Strip<T> = {
  [K in keyof T as K extends `on${infer Rest}` ? Rest : never]: T[K]
}
// Here `as` does double duty: it filters AND renames (strips the "on" prefix). 🎭
type S12 = Strip<{ onClick: () => void; onBlur: () => void;  focus: ()=> void}> // focus is dropped because it doesn't match the pattern and assigned it to never to drop it.
// => { Click: () => void; Blur: () => void }

// as preserves readonly and ? but breaks tuple-ness.  (Same lesson as section 2.c — worth
// remembering as one rule: `as` keeps MODIFIERS, loses ARRAY/TUPLE-ness.) 📌
interface Src2 {
  readonly id: string;
  nick?: number;
}

type MappedType<T> = {
  [K in keyof T as `get_${K & string}`]: T[K];
}

type Src3 = MappedType<Src2>; // => { readonly get_id: string; get_nick?: number } ✅ modifiers survive
type Src4 = MappedType<[1, 2]> // breaks tuple-ness => { get_0: 1; get_1: 2; get_length: 2; get_pop: ...; ... }
type Src5 = MappedType<string[]> // breaks arrays as well => every Array.prototype member gets a get_ key 💥


// ⭐ Classic interview trap: why does this return `never` at a call site?
type PageNum<S extends string> = S extends `page-${infer N}` ? N : never;
type PageNum1 = PageNum<'page-asd'>; // => "asd" ✅ matches the pattern
type PageNum2 = PageNum<'23'>;       // => never ❌ no "page-" prefix

function readPage(s: string): PageNum<typeof s> {
  return s.replace('page-', '') as PageNum<typeof s>;
}
const rp1 = 'page-asd' // literal type - alive
const a = readPage(rp1); // never — param annotated `string`, literal discarded

// Fix: make the parameter a type variable so inference captures the literal
/*
  Two things must hold
  1. At call site, either use const variable or as const to preserve the literal type.
  2. Make parameter type a type variable, so that it holds the literal type
*/
function readPageFix<S extends string>(s: S): PageNum<S> {
  return s.replace('page-', '') as PageNum<S>;
}

let rpf1 = 'page-42'; // literal type - dead
const a1 = readPageFix(rpf1); // literal type is broken before even it reaches the function

const rpf2 = 'page-42'; // literal type - alive because of const
const a2 = readPageFix(rpf2); // S infers as "page-42", so the return type resolves to "42". "42"  — param is a type variable, literal captured

// extraction - gives a string but not a number
type PageNum3<S extends string> = S extends `page-${infer U}` ? U : never;
type PN2 = PageNum<'page-42'>; // => "42"  👈 the STRING "42", not the number

// `infer U extends number` converts the captured text to a numeric literal type. 🔢
type PageNum4<S extends string> = S extends `page-${infer U extends number}` ? U : never;
type PN3 = PageNum4<'page-42'>; // => 42 ✅ an actual number literal

// Cross products explode 💣  10 options ^ 8 slots = 100,000,000 members.
type L = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";
const x: `${L}${L}${L}${L}${L}${L}${L}${L}` = 'aaaaaaaa'; // ❌ TS2590: union type too complex to represent
// 👉 Practical cap is ~100k members; past that use a pattern like `${string}` + infer validation.

// `${number}` isn't an integer string — it accepts ANY valid numeric literal syntax,
// so these three surprise people by being LEGAL: ✅
const a3: `${number}` = "0x1f"; // ✅ hex literal
const b3: `${number}` = "01";   // ✅ leading zero
const c3: `${number}` = "1e3";  // ✅ exponent
const d3: `${number}` = "NaN";  // ❌ error — NaN is not a numeric *literal*
const e3: `${number}` = "1_000"; // ❌ error — separators aren't allowed in the type

// `${number}`px validation might require infer since it provides better validation.

type Parse<S> = S extends `${infer N extends number}` ? N : never;

// If the text round-trips to the same string, you get the exact literal;
// if it's numeric but doesn't round-trip, you get the widened `number`. 🎯
type a = Parse<'100'>; // => 100 ✅ exact literal
type b = Parse<'-1'>;  // => -1  ✅
type c = Parse<'1.5'>; // => 1.5 ✅
type d = Parse<'0x1f'>; // number  (valid, but "0x1f" !== "31" so it widens)
type e = Parse<'01'>; // number  ("01" !== "1")
type f = Parse<'1e3'>; // number  ("1e3" !== "1000")
type g = Parse<'abc'>; // ❌ NOT number — this one is `never`, the pattern doesn't match at all

// deep recursion hits the instantiation limit ⛔
// non tail recursion - fails much sooner
// Each frame must stay open waiting to spread `...Split3<Rest, D>` into its result,
// so the compiler holds the whole stack at once.
type Split3<S extends string, D extends string> = S extends `${infer H}${D}${infer Rest}` ? [H, ...Split3<Rest, D>] : [S];

type SA = Split3<
  "a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a",
  "."
  >;
// Fails at 50 segments  ❌ TS2589: "Type instantiation is excessively deep and possibly infinite"

// tail recursion - Fails at 1000 segments
// ✅ Fix: carry an accumulator so the recursive call IS the whole result (nothing left
// to do after it returns). TS optimizes that into a loop, raising the limit ~20x.
type SplitAcc<S extends string, D extends string, Acc extends string[]=[]> = S extends `${infer H}${D}${infer Rest}` ? SplitAcc<Rest, D, [...Acc, H]> : [...Acc, S];
type SACC = SplitAcc<
  "a.a.a.a.a.a.a",
  "."
>; // => ["a", "a", "a", "a", "a", "a", "a"] ✅

// ** Interview ask
/*
Write RouteParams<S> from scratch: "/users/:id/posts/:postId" → { id: string; postId: string }. It needs recursion, infer inside a template, and as remapping together — the closest thing here to an actual interview task.
*/
/* 
  "/users/:id/posts/:postId/:postName" => {id: string; postId: string; postName: string}

  Two steps:
  1. create a union of all path params => 'id' | 'postId'| 'postName';
  2. create a map => {id: string; postId: string; postName: string;}
*/
// Step 1: collect the param names as a union.
//   Branch 1 — a param followed by more path: capture A, recurse on the rest.
//   Branch 2 — the LAST param (no trailing slash): capture B and stop.
//   `${string}` before the ':' skips over the literal path segments for free. 🧹
type ParamNames<
  S extends string,
  > =
  S extends `${string}:${infer A}/${infer Rest}` ? A | ParamNames<Rest> :
  S extends `${string}:${infer B}` ? B
  : never; // no ':' left => contributes nothing to the union


// Step 2: a non-homomorphic mapped type over that union builds the object.
type RouteParams<S extends string> = {
    [K in ParamNames<S>]: string
}

// ✅ Verified: ParamNames<"/users/:id/posts/:postId"> => "id" | "postId"
//              RouteParams<"/users/:id/posts/:postId"> => { id: string; postId: string }
//              ParamNames<"/users"> => never  (no params => RouteParams gives {})
// 👇 Note this sample has a colon on `users` too, so "users" is correctly a param here.
type RP1 = ParamNames<"/:users/:id/posts/:postId/:postName">; // => "id" | "users" | "postId" | "postName"
type RP2 = ParamNames<":id">; // => "id" ✅ single-param base case works

/* 💡 SECTION 5 TAKEAWAY
   - Slots accept string | number | bigint | boolean | null | undefined. NOT symbol.
     A union in a slot expands to a cross product — `${boolean}` alone gives "true" | "false".
   - Wide `${string}` / `${number}` makes a PATTERN (checked on assignment) rather than a
     finite union. `${number}` accepts "0x1f", "01", "1e3" but rejects "NaN" and "1_000".
   - `infer` in a template is NON-GREEDY: it stops at the FIRST match of the separator.
   - `infer N extends number` converts text to a numeric literal — but only if it
     round-trips; otherwise it widens to `number`.
   - Two hard limits: ~100k union members (TS2590), and recursion depth (TS2589).
     Accumulator/tail recursion pushes depth from ~50 to ~1000.

   🎤 MOST LIKELY TO BE ASKED: implement ReturnType, DeepReadonly/DeepPartial, Split<S, D>,
      a typed dot-path Get<T, P>, and RouteParams<S> (above). They combine recursion +
      infer-in-template + `as` remapping, which is the whole toolkit in one question. */

