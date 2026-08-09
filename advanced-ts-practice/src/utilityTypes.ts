/* ============================================================================
   TYPESCRIPT UTILITY TYPES — INTERVIEW REVISION SHEET  🧰
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` after a line is the ACTUAL resolved type (verified against tsc, not guessed).

   ⛳ The red squiggles in this file are intentional. Every ❌ demonstrates a rule.
   👉 Companion file: AdvancedTypes.ts (mapped types, conditional types, infer, template literals).

   CONTENTS
     0. Building blocks .......... keyof, `in`, extends
     1. Modifier changers ........ Partial, Required, Readonly   (SHALLOW — all three)
     2. Key selectors ............ Pick, Omit, Record
     3. Union filters ............ Exclude, Extract, NonNullable (distributive conditionals)
     4. Function types ........... ReturnType, Parameters, and a typed wrapper
     5. Tuples ................... optional / rest / named elements

   THE ONE-LINE MENTAL MODEL
     Every utility below is either (a) a mapped type that adds/removes `?` / `readonly`,
     (b) a mapped type over a chosen key set, or (c) a distributive conditional that
     keeps or drops union members. There is no magic — you can hand-write all of them.
   ============================================================================ */

// 0. Building blocks 🧱

interface Product {
  id: number;
  name: string;
  price: number;
}

// keyof — turns an object type into the UNION of its keys.
type ProductProps = keyof Product; // 'id' | 'name' | 'price' (union of product keys)
const a: ProductProps = 'name'; // ✅ only those three strings are assignable

// in — the reverse direction: consumes a key union and builds an object type.
type ProductFlags = {
  [K in ProductProps]: boolean; // Iterates over the union and builds an object type
} // => { id: boolean; name: boolean; price: boolean }

// Error: missing 'name' and 'price' - 'in' with no modifier makes every mapped key required, unlike Partial
const b: ProductFlags = {
  id: false
}

// extends — constrains a type param. Pairing `K extends keyof T` with a `T[K]` return
// is THE generic-accessor pattern: the return type tracks whichever key you pass. 🔑
function getProductField<K extends keyof Product>(p: Product, key: K): Product[K] {
  return p[key];
}

getProductField({name: 'as', id: 12, price: 23}, 'name') // => string (not string | number) ✅

/* 💡 SECTION 0 TAKEAWAY
   keyof and `in` are inverses: keyof goes object -> key union, `in` goes key union -> object.
   `T[K]` is an indexed access — it's what makes generic getters return a precise type
   instead of a union of all property types. */


// 1. Modifier changers: Partial / Required / Readonly  ➕➖
// ⚠️ All three are SHALLOW. That single fact is the source of every gotcha below.

// Partial (Modifier change)

interface User {
  name: string;
  id: number;
  email: string;
  address: Address;
}

interface Address {
  city: string;
  zip: number;
}

type MyPartial<T> = {
  [K in keyof T]? : T[K] 
} 


function updateUser(id: number, user: MyPartial<User>) {
  console.log("🚀 ~ updateUser ~ user:", user)
}

// Error: Partial is shallow - `address` becomes optional, but if provided it must still fully satisfy Address (city, zip)
updateUser(23, { name: 'fef', address: {} }); // ❌ the `{}` is what fails, not `address` itself
updateUser(23, { email: 'fefrwer' }) // ✅ any subset of top-level keys is fine
updateUser(23, { id: 12 }); // ✅
// 👉 Need it deep? You have to write it recursively — see DeepPartial in AdvancedTypes.ts.


// Required (Modifier change)

interface User1 {
  name: string;
  id?: number;
  email?: string;
  address?: Address1;
}

interface Address1 {
  city?: string;
  zip: number;
}

type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}

function updateUser1(id: number, user: MyRequired<User1>) {}


updateUser1(23, { name: '', id: 12, address: { zip: 12 }, email: '' }); // ✅ note `city?` stays optional
// Error: address's own shape (Address1.zip) is still required regardless of MyRequired - -?/required only affects the top-level optional modifier, not nested types
const c: MyRequired<User1> = { name: '', id: 12, address: {}, email: '' }
// ⚠️ Mirror of the Partial gotcha: `-?` removed `?` from User1's OWN keys, but Address1's
// `zip` was already required and `city?` is still optional. Depth is untouched. 🧅


// Readonly - Only compile time (modifier change)

interface User2 {
  name: string;
  id: number;
  address: Address2;
  email?: string;
}

interface Address2 {
  city: string;
  zip?: number;
}

type MyReadOnly<T> = {
  readonly [K in keyof T] : T[K]
}

const d: Readonly<User2> = { name: 'adsa', id: 12, address: { city: 'da' } };
d.id = 213; // ❌ error: Cannot assign to 'id' because it is a read-only property

// Blocks assignment even if it optional field
d.email = 'sada'; // ❌ error too — `readonly` and `?` are independent modifiers

// one way to bypass TS error
(d as any).id = 21; // ✅ compiles — proof that readonly is COMPILE-TIME ONLY, no runtime freeze 🧊

// Doesn't work for nested properties
d.address.city = 'da'; // ✅ no error! `address` is readonly, but what's INSIDE it isn't

/* 💡 SECTION 1 TAKEAWAY
   - Partial / Required / Readonly are one-line mapped types: `?`, `-?`, `readonly`.
   - ALL THREE ARE SHALLOW. Nested objects keep their original modifiers.
   - `readonly` stops assignment at compile time only — `as any` or plain JS walks right
     past it. Use Object.freeze() if you need an actual runtime guarantee.
   - `readonly` blocks writing the PROPERTY, not mutating the object it points to. */

// 2. Key selectors: Pick / Omit / Record 🎯

// Pick -  (No modifier change)

interface User3 {
  name?: string;
  email: string;
  id: number;
  password: string;
}

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
}
 
type PublicUser = Pick<User3, 'name' | 'email'>; // => { name?: string; email: string } 👈 `name?` stays optional
const e: PublicUser = { name: 'da', email: 'Test@test.com' };

type PublicUser1 = MyPick<User3, 'name'>; // => { name?: string }
// ⚠️ Interview nuance: `[P in K]` is NOT homomorphic (K is a bare union, not `keyof T`),
// yet modifiers survive here. TS special-cases `[P in K]` when K is constrained to keyof T.
// Pick also ERRORS on a key that doesn't exist — contrast with Extract below.


// Omit (No Modifier change)

interface User4 {
  name: string;
  email: string;
  id: number;
  password: string;
}

// It's a composition, not a raw mapped type (built using Pick and Exclude)
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>; // Exclude K keys from list of keys in T and build type from remaining keys in T using Pick.

const f: Omit<User4, 'password'> = { name: 'ad', id: 12, email: 'Test@test.com' }; // ✅ password is gone

// ⚠️ Note the constraint: `K extends keyof any` (i.e. string | number | symbol), NOT `keyof T`.
// That's why Omit<User4, 'typo'> compiles silently while Pick<User4, 'typo'> errors.
// A well-known TS wart — worth naming in an interview. 🐛


// Record 🗂️
type Role = 'admin' | 'editor' | 'viewer'; // literal type
type RolePermissions = Record<Role, string[]>; // object type
// => { admin: string[]; editor: string[]; viewer: string[] }

// Error: missing 'viewer' - Record<K, T> requires a value for every member of the key union, unlike an index signature
const g: RolePermissions = {
  admin: ['sda'],
  editor: ['ad']
};
// 👉 This exhaustiveness is the reason to reach for Record over an index signature:
// add a role to the union and every Record of it fails to compile until you handle it. ✅

type StringRecord = Record<string, number>; // Acts like {[key: string]: number} (key is not limited and has infinite possibilities)
// Error: key '2' is fine (any string/numeric key allowed), but the value '1' is a string, not a number
const g1: StringRecord = { 2: '1' };
// ⚠️ With a WIDE key (string/number) you get an index signature and lose exhaustiveness
// entirely — any key is allowed, so only the value type is still checked.

type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
}

/* 💡 SECTION 2 TAKEAWAY
   - Pick keeps modifiers; Omit = Pick + Exclude, so it inherits that behavior.
   - Pick's K is constrained to `keyof T` (typos error); Omit's is `keyof any` (typos pass 🐛).
   - Record<K, V> with a LITERAL union key = exhaustive object. With `string` = index
     signature, no exhaustiveness. Same utility, completely different guarantee. */

// 3. Union filters: Exclude / Extract / NonNullable  🔍
// ⚠️ All three are distributive conditionals. Same engine, different branch kept.

// Exclude  - remove union members
type Status = 'pending' | 'active' | 'completed' | 'cancelled';
type ActiveStatus = Exclude<Status, 'completed' | 'cancelled'>; // => 'pending' | 'active' ✅

/* 
  since T is naked type, doesn't have anything included with T (like [T] or {value: T}). so, distribution is possible,
  If T is a union then, distribution happens and calculates for each member of union.
*/
type MyExclude<T, U> = T extends U ? never : T;
/*
  Tracing - 
  'pending' -> 'pending' extends 'completed' | 'cancelled' -> false -> 'pending'
  <-- same for active as well -->
  'completed' -> 'completed' extends 'completed' | 'cancelled' -> true -> never
  'cancelled' -> 'cancelled' extends 'completed' | 'cancelled' -> true -> never
  result => 'pending' | 'active' | never | never
  Unions automatically drops never members => 'pending' | 'active'
*/

// Extract - keep only specific union members
// Identical to Exclude with the branches swapped. 🔄
type FinishedStatus = Extract<Status, 'completed' | 'cancelled' | 'expired'>;
// => 'completed' | 'cancelled'  👈 'expired' vanishes silently, no error

/**
 * Note:  U don't need to be subset of T, extra members will silently ignored unlike Pick which throws error for invalid key
 */
type MyExtract<T, U> = T extends U ? T : never;

type FinishedStatus1 = MyExtract<Status, "completed" | "cancelled" | "expired">; // => same ✅
// ⚠️ That silence is the trap: a typo'd member just drops out and you get a narrower
// type than you expected, with nothing flagged. Pick would have errored. 🐛

// NonNullable - strips null or undefined from union.
type MaybeString = string | null | undefined;
type DefinedString = NonNullable<MaybeString>; // => string ✅

type MyNonNullable<T> = T extends null | undefined ? never : T;
type MyDefinedString = MyNonNullable<MaybeString>; // => string ✅
// ⚠️ This whole section only MEANS anything under `strict` / `strictNullChecks`. With it
// off, null and undefined are absorbed into every type, so MaybeString is already
// assignable to string and NonNullable looks like a no-op. (strict is ON in this repo.)

/* 💡 SECTION 3 TAKEAWAY
   - Exclude<T,U> = `T extends U ? never : T`. Extract is the same with branches swapped.
     NonNullable is Exclude<T, null | undefined>. Three names, one mechanism.
   - They work ONLY because of distribution over a naked type param, and because
     `never` silently disappears from a union. That's the whole trick.
   - U does not have to be a subset of T — extra members are ignored without error. */

// 4. Function types: ReturnType / Parameters  🔧

// ReturnType
function createUser(name: string, age: number) {
  return { id: Date.now(), name, age };
}

// 👉 `typeof createUser` is essential: ReturnType needs the function's TYPE, not its value.
type CreatedUser = ReturnType<typeof createUser>; // => { id: number; name: string; age: number }

// The `never` branch is unreachable dead code - every function type satisfies `(...args: any) => any` (even ones returning void), so the conditional always takes the `infer R` branch
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
type MyCreatedUser = MyReturnType<typeof createUser>; // => same as CreatedUser ✅

// `never` is an empty union, so distributing a conditional type over it produces `never` directly, without the conditional check ever running
type MyCreatedUser1 = MyReturnType<never>; // => never (the one input that skips the check)


// Parameters - infer function's parameters as tuple 📦

type CreateUserParams = Parameters<typeof createUser>; // => [name: string, age: number]
// 👀 Parameter NAMES survive into the tuple — they're labels, not just positions.

type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type CreateUserParams1 = MyParameters<typeof createUser>; // => [name: string, age: number] ✅

// Write a generic function wrapper that logs before calling any function, preserving its exact signature.
// ⭐ Classic interview task. The trick: capture the whole signature in ONE type param T,
// then re-derive both ends from it. Using `(...args: any[]) => any` as the parameter type
// instead would erase the caller's real types. 🎯
function withLogging<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log("🚀 ~ calling with args: ", args);
    return fn(...args);
  }
}
const loggedCreateUser = withLogging(createUser);
// => (name: string, age: number) => { id: number; name: string; age: number }  ✅ signature preserved
loggedCreateUser('Nikhil', 23)

/* 💡 SECTION 4 TAKEAWAY
   - Both are one-liners over `infer`: R in the return slot, P in the rest-param slot.
   - Always feed them `typeof fn`, never `fn` — they take types, not values.
   - Parameters gives a LABELED tuple, which is what makes generic wrappers readable.
   - To preserve a signature through a wrapper, constrain one type param to the function
     and rebuild with Parameters<T> / ReturnType<T>. This is how HOFs stay typed. */

// 5. Tuples - Bonus 📐
// A tuple is a fixed-LENGTH, position-typed array. Indexing keeps the per-slot type.
type UserTuple = [number, string, boolean];
const user: UserTuple = [12, 'da', false];
const da = user[0] // => number (not number | string | boolean) ✅

// The Go-style [error, value] pair — the everyday reason to reach for tuples.
type ApiResult = [error: Error | null, user: User | null];

function fetchUser(): ApiResult {
  return [null, { id: 12, name: 'ada', email: '', address: { city: 'da', zip: 23 } }];
}

const [error, user1] = fetchUser(); // destructuring keeps each slot's type ✅

// Gotcha's
// optional parameters
type Point = [number, number, number?];
const pd1: Point = [1, 2];    // ✅ length 2 allowed
const pd2: Point = [1, 2, 3]; // ✅ length 3 allowed
// ⚠️ The optional slot resolves to `(number | undefined)?` — Point is really
// [number, number, (number | undefined)?]. Optional implies `| undefined` under strict.

// Rest elements
type StringNumberBooleans = [string, number, ...boolean[]];
const t: StringNumberBooleans = ['ad', 12]; // ✅ zero trailing booleans is valid
// 👉 A rest element makes the tuple variable-length from that point on. Only one is
// allowed, and anything after it must be a fixed slot.

// Named Tuple
// Labels are DOCUMENTATION ONLY — they don't affect assignability, but they show up
// in tooltips and destructuring hints, which is why Parameters<T> preserves them. 🏷️
type NamedTuple = [id: number, name: string];
function getUser(): [id: number, name: string] {
  return [12, "da"];
}

const result = getUser(); // => [id: number, name: string]

/* 💡 SECTION 5 TAKEAWAY
   - Tuple = fixed length + per-position types; indexing/destructuring stays precise.
   - `?` slots must come after all required ones and pick up `| undefined`.
   - `...rest` makes the length open-ended; at most one per tuple.
   - Labels are cosmetic but flow through Parameters<T> — free readability in generic code.
   - Tuples are what make variadic type-level tricks work (see First/Last and the
     accumulator-based Split in AdvancedTypes.ts). */
