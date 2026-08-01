
// 1. Discriminated Unions

// No shared literal "tag" => TS can't narrow, so only the common members are accessible.
type Response = { data: string } | { error: string };

function handle(res: Response) {
  res.data; // ❌ error: 'data' doesn't exist on the { error } member
}

// `status` is the discriminant: a literal-typed property present in every member.
type Response1 = { data: string, status: 'success' } | { error: string, status: 'error' } | {status: 'test'};

function handle1(res: Response1) {
  if (res.status === 'success') {
    console.log("🚀 ~ handle1 ~ res.data:", res.data); // ✅ narrowed to the success member
    res.error // ❌ error: success member has no 'error'
  } else if (res.status === 'error') {
    console.log("🚀 ~ handle1 ~ res.error:", res.error) // ✅ narrowed to the error member
    res.data; // ❌ error: error member has no 'data'
  }
}

function handle2(res: Response1) {
  switch (res.status) {
    case 'success': return res.data;
    case 'error': return res.error;
    default:
      // Exhaustiveness check: in `default` res is whatever is left over.
      // ❌ errors here on purpose — { status: 'test' } is unhandled, so res isn't `never` yet.
      // Add `case 'test'` and the error disappears. This is how you get a compile-time
      // failure when someone later adds a new member to the union.
      const response: never = res;
      return res
  }
}

// Same pattern in reducer
type Action = { type: 'increment', by: number } | { type: 'reset' };

function reducer(state: number, action: Action) {
  switch (action.type) {
    case 'increment': return action.by;
    case 'reset': return 0;
  }
}

// `type` widens to `string` when stored in a variable first, so it no longer
// matches the literal 'increment'.
const action1 = { type: 'increment', by: 10 };
reducer(0, action1); // ❌ error: string is not assignable to "increment"

// Fix: pin the discriminant with `as const` (either on the property or the whole object).
// const action2 = { type: 'increment', by: 5 } as const;
const action2 = { type: 'increment' as const, by: 5 };
reducer(1, action2); // ✅

// Works for inline literals — contextual typing keeps `type` literal, no widening.
reducer(2, { type: 'increment', by: 15 }); // ✅

// The discriminant doesn't have to be a string — boolean literals work too.
type Result = { ok: true, value: string } | { ok: false, error: string };

function unwrap(r: Result) {
  if (r.ok) return r.value;
  throw r.error;
}

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
type AllOptional<T> = { [K in keyof T]+?: T[K] };   // Partial<T>
type UserOptional = AllOptional<User>;
type AllRequired<T> = { [K in keyof T]-?: T[K] };   // Required<T>
type UserRequired = AllRequired<User>;
type AllReadonly<T> = { +readonly [K in keyof T]: T[K] };  // Readonly<T>
type UserReadonly = AllReadonly<User>;
type AllMutable<T> = { -readonly [K in keyof T]: T[K] };   // the "unfreeze" direction
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
}

// 👀 Also picks up `getGreet` because of the interface/class merge flagged above.
type UserGetters = Getter<User>;

// 2.c Filtering Keys 🚮 - map a key to never to drop it

type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
}

interface Mixed {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

type StringProps = OnlyStrings<Mixed>; // => { name: string; email: string } ✅

type MethodNames<T> = { 
  [K in keyof T as T[K] extends (...args: any[]) => any  ? K : never]: T[K];
}

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
}

type MyService = MyOmit<Service, 'fetch' | 'save'>; // => { url: string } ✅

// homomorphic vs non-homomorphic mapped types 🧬
// Homomorphic = the map iterates `keyof T` for a *generic* T, so TS knows it's
// walking an existing type and carries its `?` / `readonly` modifiers across.

interface Src {
  a?: string;
  readonly b: number;
}

type Homomorphic<T> = {
  [K in keyof T]: T[K];
}
type H = Homomorphic<Src>; // ✅ persists the modifiers => { a?: string; readonly b: number }

// Iterates a bare key union K, not `keyof T`, so there's no source type to copy from.
type NonHomomorphic<K extends keyof any, V> = {
  [P in K]: V;
}
type N = NonHomomorphic<keyof Src, string>; // ❌ modifiers gone => { a: string; b: string }

// Renaming with `as` keeps modifier preservation for objects,
// but breaks the array/tuple preservation. 📐
type Renamed<T> = {
  [K in keyof T as `new_${string & K}`]: T[K]
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


// 3. Conditional types ❓
// `T extends U ? X : Y` — read `extends` as "is assignable to", not "inherits from".
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // => true  ('hello' is a subtype of string) ✅
type B = IsString<32>;      // => false ❌

// Nested chains — evaluated top to bottom, first match wins, so order matters. ⬇️
// (`object` is the fallback, which is why tuples/arrays land there.)

type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends (...args: any[]) => any ? 'function' :
  'object';
  
type AB = TypeName<32>;       // => 'number'
type BC = TypeName<() => {}>; // => 'function'
type CD = TypeName<[2, 3]>;   // => 'object'  (tuple falls through to the fallback) 📦

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

type IsString1<T> = T extends string ? 'yes' : 'no';

// any is assignable to everything and everything is assignable to it.
// For any, conditional type returns union of both branches.
type P1 = IsString1<any>; // => 'yes' | 'no' 🤷

// unknown is only assignable to unknown/any, so it takes the false branch.
type P2 = IsString<unknown>; // => false


// Readonly array fails mutable array check 🔒
// Assignability is one-way: T[] is assignable to readonly T[], never the reverse.
type IsArray<T> = T extends any[] ? true : false;

type A1 = IsArray<[1, 2, 3]>;          // => true ✅
type A2 = IsArray<readonly [4, 5, 6]>  // => false ❌ readonly can't widen to mutable

// But readonly check works for mutable arrays
// 👉 So `readonly any[]` is the safer constraint when you just mean "any array".
type IsReadonlyArray<T> = T extends readonly any[] ? true : false;

type R3 = IsReadonlyArray<[1, 2, 3]>;          // => true ✅ mutable IS assignable to readonly
type R4 = IsReadonlyArray<readonly [1, 2, 3]>; // => true ✅


// Unwrap array element type 📤
type ElementType<T> = T extends (infer U)[] ? U : T;

type E1 = ElementType<string[]>; // => string
type E2 = ElementType<number>;   // => number (falls to the else branch, passthrough)


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
}

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

// 4. Infer keyword 🔎 - If we want to check a condition, extends gives yes/no but infer can give what's inside it.
// Infer can be used only inside extends clause of conditional type.
// Infer declares a type variable inside extends clause that captures whatever matches in that position.
// The inferred variable is only in scope in the *true* branch.
type IsPromise<T> = T extends Promise<any> ? 'yes' : 'no';

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
type First<T> = T extends [(infer F), ...any[]] ? F : never;
type F1 = First<[2, 1, 3]>; // => 2

type Last<T> = T extends [...any[], infer L] ? L : never;
type L1 = Last<[2, 3, 'Test']>; // => 'Test'

// 5. Constructor instance type 🏗️
type MyInstance<T> = T extends new (...args: any) => infer I ? I : never;
// ⚠️ NOTE: this class merges with `interface User` from section 2.a (same name, same scope).
class User {
  static version = 1;
  constructor(public name: string) { } // ❌ parameter properties are banned by `erasableSyntaxOnly`
  greet() {}
}
const u1 = new User('nikhil');
// ⚠️ `typeof u1` is the *instance* type (User), not the constructor, so nothing matches
// the `new (...) => infer I` pattern and we fall to the false branch.
type I12 = MyInstance<typeof u1>;    // => never ❌
type I13 = MyInstance<typeof User>;  // => User ✅ — pass the class itself

// Multiple infers 👯
type SplitFn<T> = T extends (arg: infer P) => infer R ? { input: P, output: R } : never;
type S = SplitFn<(s: number) => string>; // => { input: number; output: string }

// Gotcha - same variable inferred in multiple positions ⚡
// Covariant positions (return types, object properties)
type Cov<T> = T extends { a: infer U; b: infer U } ? U : never;
type C1 = Cov<{ a: string; b: boolean }>; // Produces union => string | boolean

// Contravariant positions (function params)
// Same U in two param slots collapses to an INTERSECTION instead. 🔀
type Cot<T> = T extends { a: (p: infer U) => any; b: (p: infer U) => any } ? U : never;
type C2 = Cot<{ a: (p: { m: 1 }) => void; b: (p: { n: 2 }) => void }>; // => { m: 1 } & { n: 2 }