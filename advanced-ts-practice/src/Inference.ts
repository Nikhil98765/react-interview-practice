
// --- Basic type inference (let vs const) ---
// TS infers the "best common type" from the initializer.
// `let` gets the widened primitive type since it can be reassigned later.
let x = 5;          // inferred as number
let name = 'da';    // inferred as string
// Object literals bound to `const` still widen their property types
// (id: number, name: string) even though the binding itself can't be reassigned.
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

// --- Contextual typing ---
// TS infers the type of `event` from the expected handler signature of
// `onmousedown` (MouseEvent), even though no annotation is written here.
window.onmousedown = (event) => {}

// --- Array literal inference ---
// With mixed element types, TS infers a union array type rather than `any[]`.
let arr = [2, 3, 'three']; // inferred as (string | number)[]


// --- typeof (type query operator) ---
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
type Bad = typeof CreateUser;

// --- keyof (index type query operator) ---
// `keyof` produces a union of an object type's property names as string literal types.
const config1 = { host: 'localhost', port: 5000, debug: true };

type Config1 = typeof config1;
type ConfigKey = keyof Config1; // 'host' | 'port' | 'debug'

// Combining `as const` + `typeof` + `keyof` + indexed access is the standard
// pattern for deriving a union of literal values from a runtime object,
// so the union stays in sync with the object without manual duplication.
const Roles = { ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' } as const;
type Role = typeof Roles[keyof typeof Roles]; // 'admin' | 'editor' | 'viewer'

// --- as const (const assertions) ---
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


// --- Awaited<T> (built-in utility type) ---
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


