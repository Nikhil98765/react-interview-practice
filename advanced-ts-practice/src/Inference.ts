/* ============================================================================
   TYPE INFERENCE, typeof / keyof, `as const` — INTERVIEW REVISION SHEET  🔍
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` after a line is the ACTUAL resolved type (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.
   👉 Companion files: utilityTypes.ts (the built-in utilities),
                       AdvancedTypes.ts (mapped / conditional types, infer, template literals).

   CONTENTS
     1. Widening ................. let vs const, why literals get lost
     2. Contextual typing ........ inference flowing INWARDS from the expected type
     3. typeof ................... reading a type off a value (value space -> type space)
     4. keyof + indexed access ... deriving unions from a runtime object
     5. as const ................. freezing literals, readonly, tuples
     6. Awaited<T> ............... promise unwrapping + hand-rolled polyfill

   THE ONE IDEA BEHIND THIS WHOLE FILE 🧠
     TypeScript has TWO SEPARATE NAMESPACES: values and types.
     `typeof` is the bridge FROM a value TO its type. `keyof` then operates on that type.
     Chaining them — `typeof Roles[keyof typeof Roles]` — lets you derive types from
     runtime data so the two can never drift apart. That chain is the payoff of the file.

   THE WIDENING RULE IN ONE LINE
     If a binding can be reassigned, TS widens the literal to its base type.
     `let` widens. `const` doesn't (for primitives). Object PROPERTIES always widen
     regardless of const — only `as const` stops that.
   ============================================================================ */

// 1. Basic type inference (let vs const) ---
// TS infers the "best common type" from the initializer.
// `let` gets the widened primitive type since it can be reassigned later.
let x = 5;          // inferred as number
let name = 'da';    // inferred as string
// Object literals bound to `const` still widen their property types
// (id: number, name: string) even though the binding itself can't be reassigned.
// ⚠️ This is the one people get wrong: `const` protects the BINDING, not the contents.
const user = { id: 1, name: 'anda' }; // inferred as { id: number; name: string }

// --- Literal widening: let vs const ---
let a = 'hello';   // widened to type `string` (reassignable, so TS generalizes)
const b = 'hello'; // kept as literal type `'hello'` (can never change, so TS narrows)

// --- Widening pitfall: literal types lost when assigned via `let` ---
function move(direction: 'up' | 'down') { }

// `dir` is declared with `let`, so its type widens from the literal 'up' to `string`.
let dir = 'up';
move(dir); // ERROR: `string` is not assignable to `'up' | 'down'` (widened type lost the literal)

// `dir2` is declared with `const`, so TS keeps the narrow literal type `'up'`.
const dir2 = 'up';
move(dir2); // OK: `dir2` is of literal type 'up', which satisfies 'up' | 'down'
// 👉 Three fixes when widening bites you: use `const`, add `as const`, or annotate
//    the variable (`let dir: 'up' | 'down' = 'up'`). Same fix set as the reducer
//    action gotcha in AdvancedTypes.ts §1 — it's the same rule in a different costume.

/* 💡 SECTION 1 TAKEAWAY
   - `let` widens a literal to its base type; `const` keeps the literal (primitives only).
   - Object/array literal MEMBERS widen even under `const` — the binding is const, the
     contents aren't. Only `as const` prevents that.
   - Widening is why a variable "works inline but fails when extracted". Classic bug. */

// 2. Contextual typing 📥
// Inference normally flows outwards from a value. Contextual typing is the reverse:
// the EXPECTED type flows inwards and types the parameters for you.
// TS infers the type of `event` from the expected handler signature of
// `onmousedown` (MouseEvent), even though no annotation is written here.
window.onmousedown = (event) => {} // event => MouseEvent ✅ (no annotation needed)

// --- Array literal inference ---
// With mixed element types, TS infers a union array type rather than `any[]`.
let arr = [2, 3, 'three']; // inferred as (string | number)[]
// 👉 "Best common type": TS unions the element types rather than falling back to any.

/* 💡 SECTION 2 TAKEAWAY
   Contextual typing is why callbacks rarely need annotations, and why an object literal
   passed INLINE keeps its literal types while the same literal assigned to a variable
   first does not. The expected type only reaches the value at the point of assignment. */

// 3. typeof (type query operator) 🌉
// `typeof` in a type position reads the inferred type of a value.
const config = { host: 'localhost', port: 3000 };

type Config = typeof config; // { host: string; port: number }

function createUser(name: string, email: string) {
  return { id: Date.now(), name, email };
}

// typeof works on functions too, capturing the full function type.
type CreateUser = typeof createUser; // (name: string, email: string) => { id: number; name: string; email: string }
type User = ReturnType<CreateUser>;       // { id: number; name: string; email: string }
type UserParams = Parameters<CreateUser>; // [name: string, email: string]

// ERROR: `CreateUser` here is already a *type* (declared above via `type CreateUser = ...`),
// but `typeof` expects a *value* (a variable/function/expression) to query.
// You can't take `typeof` of a type — this is a value/type namespace mixup.
type Bad = typeof CreateUser; // ❌ TS2693 — resolves to `any` via error recovery
// ⭐ The lesson: `typeof createUser` (the FUNCTION, a value) is legal.
//    `typeof CreateUser` (the TYPE alias) is not. Same-looking name, different namespace.
//    Note a `class` lives in BOTH namespaces — that's why `typeof MyClass` (constructor)
//    and `MyClass` (instance type) are two different, both-valid types.

/* 💡 SECTION 3 TAKEAWAY
   - `typeof` in a TYPE position ≠ JavaScript's runtime `typeof`. Same keyword, two jobs.
   - It only accepts a VALUE. Feeding it a type alias is a compile error.
   - `typeof someFunction` captures the entire signature, which is what makes
     ReturnType / Parameters usable on real functions. */

// 4. keyof (index type query operator) 🔑
// `keyof` produces a union of an object type's property names as string literal types.
const config1 = { host: 'localhost', port: 5000, debug: true };

type Config1 = typeof config1;  // => { host: string; port: number; debug: boolean }
type ConfigKey = keyof Config1; // 'host' | 'port' | 'debug'

// Combining `as const` + `typeof` + `keyof` + indexed access is the standard
// pattern for deriving a union of literal values from a runtime object,
// so the union stays in sync with the object without manual duplication.
const Roles = { ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' } as const;
// => { readonly ADMIN: "admin"; readonly EDITOR: "editor"; readonly VIEWER: "viewer" }
type Role = typeof Roles[keyof typeof Roles]; // 'admin' | 'editor' | 'viewer'
/* ⭐ Read that chain INSIDE-OUT — a very common interview "explain this line":
     typeof Roles              => { readonly ADMIN: "admin"; ... }   value -> type
     keyof typeof Roles        => "ADMIN" | "EDITOR" | "VIEWER"      the KEYS
     typeof Roles[<that>]      => "admin" | "editor" | "viewer"      the VALUES
   Without `as const` the values would have widened to `string`, and Role would
   collapse to plain `string` — the whole pattern silently stops working. ⚠️
   This is the idiomatic alternative to a TS `enum`: zero runtime cost beyond the
   object itself, and the union can never drift from the data. */

// 5. as const (const assertions) 🧊
// Without `as const`, object literal properties are widened to their base
// primitive type whether bound to `let` or `const` — `const` only prevents
// reassignment of the binding, it does not narrow property types.
let a1 = { x: 1, y: 2 };   // { x: number; y: number }
const a2 = { x: 1, y: 2 }; // { x: number; y: number } — still widened, not { x: 1; y: 2 }

// `as const` freezes the literal types AND makes every property `readonly`.
const a3 = { x: 1, y: 3 } as const; // { readonly x: 1; readonly y: 3 }

// NOTE: `arr` was already declared above with `let arr = [2, 3, 'three']`
// in the same module scope — redeclaring it here with `const` is an
// intentional duplicate-identifier error (TS2451: Cannot redeclare
// block-scoped variable 'arr'), included to show that array-literal
// inference examples need their own distinct names.
const arr = ['up', 'down']; // ERROR: duplicate declaration of `arr`
let arr1 = ['up', 'down'];  // inferred as string[] (widened, mutable)

// `as const` on an array turns it into a readonly tuple of literal types
// instead of a mutable string[].
const arr2 = ['up', 'down'] as const; // readonly ['up', 'down']
// ⚠️ Note it changes THREE things at once: string[] -> tuple (fixed length),
//    string -> 'up' | 'down' (literals), and mutable -> readonly.
//    The readonly part is what makes `as const` arrays fail a `T[]` parameter —
//    see IsArray / Elem in AdvancedTypes.ts §3. Accept `readonly T[]` instead.

/* 💡 SECTION 5 TAKEAWAY
   - `as const` = deepest literal type + readonly everywhere + arrays become tuples.
   - It's the ONLY way to stop object/array property widening.
   - It powers the derive-a-union-from-an-object pattern above; drop it and the
     derived type degrades to `string` without any error to warn you. 🐛 */

// 6. Awaited<T> (built-in utility type) ⏳
// `async` functions always return a Promise; ReturnType captures that Promise wrapper as-is.
async function fetchUser() {
  return { id: Date.now() };
}

type UserResponsePromise = ReturnType<typeof fetchUser>; // Promise<{ id: number }>
// Awaited<T> unwraps the Promise to get the resolved value type.
type UserResponse = Awaited<UserResponsePromise>; // { id: number }

// Awaited<T> is recursive under the hood, so it also unwraps nested/chained
// promises (a Promise resolving to another Promise) down to the final value.
type NestedResponse = Awaited<Promise<Promise<{ name: string }>>> // { name: string }

// --- Polyfill: reimplementing Awaited<T> manually ---
// Conditional type + `infer` extracts the value type `U` inside a Promise.
// Recursing on `MyAwaited<U>` (instead of returning `U` directly) is what
// makes this handle arbitrarily nested Promise<Promise<...>> chains, mirroring
// the built-in Awaited<T> behavior above.
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type MyUserResponse = MyAwaited<UserResponsePromise>; // { id: number }

// For n-level nested promise with polyfill — confirms the recursive case works
// the same way the built-in Awaited<T> does above.
type MyNestedResponse = MyAwaited<Promise<Promise<Promise<{id: string}>>>> // { id: string }
// ⚠️ Where the polyfill differs from the real Awaited<T>: the built-in also unwraps
//    any PromiseLike/thenable (anything with a `.then`), distributes over unions, and
//    guards against a type that recursively awaits itself. Good detail to mention. 🎯

/* 💡 SECTION 6 TAKEAWAY
   - An async function's ReturnType is the PROMISE, not the resolved value —
     you almost always want Awaited<ReturnType<typeof fn>>.
   - Awaited is recursive, which is the whole reason it handles nested promises;
     a single-level `T extends Promise<infer U> ? U : T` peels exactly one layer.
   - Recursing on `MyAwaited<U>` instead of returning `U` is the entire difference. */


