// Building blocks

interface Product {
  id: number;
  name: string;
  price: number;
}

// keyof
type ProductProps = keyof Product; // 'id' | 'name' | 'price' (union of product keys)
const a: ProductProps = 'name';

// in
type ProductFlags = {
  [K in ProductProps]: boolean; // Iterates over the union and builds an object type
}
// Error: missing 'name' and 'price' - 'in' with no modifier makes every mapped key required, unlike Partial
const b: ProductFlags = {
  id: false
}

// extends
function getProductField<K extends keyof Product>(p: Product, key: K): Product[K] {
  return p[key];
}

getProductField({name: 'as', id: 12, price: 23}, 'name')


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
updateUser(23, { name: 'fef', address: {} });
updateUser(23, { email: 'fefrwer' })
updateUser(23, { id: 12 });


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


updateUser1(23, { name: '', id: 12, address: { zip: 12 }, email: '' });
// Error: address's own shape (Address1.zip) is still required regardless of MyRequired - -?/required only affects the top-level optional modifier, not nested types
const c: MyRequired<User1> = { name: '', id: 12, address: {}, email: '' }


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
d.id = 213;

// Blocks assignment even if it optional field
d.email = 'sada';

// one way to bypass TS error
(d as any).id = 21;

// Doesn't work for nested properties
d.address.city = 'da';


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
 
type PublicUser = Pick<User3, 'name' | 'email'>;
const e: PublicUser = { name: 'da', email: 'Test@test.com' };

type PublicUser1 = MyPick<User3, 'name'>;


// Omit (No Modifier change)

interface User4 {
  name: string;
  email: string;
  id: number;
  password: string;
}

// It's a composition, not a raw mapped type (built using Pick and Exclude)
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>; // Exclude K keys from list of keys in T and build type from remaining keys in T using Pick.

const f: Omit<User4, 'password'> = { name: 'ad', id: 12, email: 'Test@test.com' };



// Record
type Role = 'admin' | 'editor' | 'viewer'; // literal type
type RolePermissions = Record<Role, string[]>; // object type

// Error: missing 'viewer' - Record<K, T> requires a value for every member of the key union, unlike an index signature
const g: RolePermissions = {
  admin: ['sda'],
  editor: ['ad']
};

type StringRecord = Record<string, number>; // Acts like {[key: string]: number} (key is not limited and has infinite possibilities)
// Error: key '2' is fine (any string/numeric key allowed), but the value '1' is a string, not a number
const g1: StringRecord = { 2: '1' };

type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
}

// Exclude  - remove union members
type Status = 'pending' | 'active' | 'completed' | 'cancelled';
type ActiveStatus = Exclude<Status, 'completed' | 'cancelled'>;

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
type FinishedStatus = Extract<Status, 'completed' | 'cancelled' | 'expired'>;

/**
 * Note:  U don't need to be subset of T, extra members will silently ignored unlike Pick which throws error for invalid key
 */
type MyExtract<T, U> = T extends U ? T : never;

type FinishedStatus1 = MyExtract<Status, "completed" | "cancelled" | "expired">;

// NonNullable - strips null or undefined from union.
type MaybeString = string | null | undefined;
type DefinedString = NonNullable<MaybeString>;

type MyNonNullable<T> = T extends null | undefined ? never : T;
type MyDefinedString = MyNonNullable<MaybeString>;


// ReturnType
function createUser(name: string, age: number) {
  return { id: Date.now(), name, age };
}

type CreatedUser = ReturnType<typeof createUser>;

// The `never` branch is unreachable dead code - every function type satisfies `(...args: any) => any` (even ones returning void), so the conditional always takes the `infer R` branch
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
type MyCreatedUser = MyReturnType<typeof createUser>;

// `never` is an empty union, so distributing a conditional type over it produces `never` directly, without the conditional check ever running
type MyCreatedUser1 = MyReturnType<never>;


// Parameters - infer function's parameters as tuple

type CreateUserParams = Parameters<typeof createUser>;

type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type CreateUserParams1 = MyParameters<typeof createUser>;

// Write a generic function wrapper that logs before calling any function, preserving its exact signature.
function withLogging<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log("🚀 ~ calling with args: ", args);
    return fn(...args);
  }
}
const loggedCreateUser = withLogging(createUser);
loggedCreateUser('Nikhil', 23)

// Tuples - Bonus
type UserTuple = [number, string, boolean];
const user: UserTuple = [12, 'da', false];
const da = user[0]

type ApiResult = [error: Error | null, user: User | null];

function fetchUser(): ApiResult {
  return [null, { id: 12, name: 'ada', email: '', address: { city: 'da', zip: 23 } }];
}

const [error, user1] = fetchUser();

// Gotcha's
// optional parameters
type Point = [number, number, number?];
const pd1: Point = [1, 2];
const pd2: Point = [1, 2, 3];

// Rest elements
type StringNumberBooleans = [string, number, ...boolean[]];
const t: StringNumberBooleans = ['ad', 12];

// Named Tuple
type NamedTuple = [id: number, name: string];
function getUser(): [id: number, name: string] {
  return [12, "da"];
}

const result = getUser();
