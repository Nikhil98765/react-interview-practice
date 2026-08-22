// Generic examples for advanced TypeScript practice

// --- Basic generic constrained by an interface ---

type HasLength = {
  length: number;
}

const identity = <T extends HasLength>(arg: T) => {
  return arg;
}

const a = identity<string>("ada");
const b = identity(23);

// --- Generic + keyof for type-safe property access ---

const getKeyProp = <T, K extends keyof T>(obj: T, key: K) => {
  return obj[key];
}

const result = getKeyProp({ name: 'Test', age: 20 }, 'name');

// --- Generic interface with a default type param ---

interface ApiResponse<T = unknown> {
  data: T[];
  status: number;
  error: string;
}

const userRes: ApiResponse = {
  data: [{ id: '1', name: 'adad' }],
  status: 200,
  error: ''
}

// --- Generic utility type ---

type Nullable<T> = T | null;

const a1: Nullable<string> = null;

/*
  1. Why do you need a trailing comma in <T,> for arrow function generics in React (.tsx files)?
    Without comma, react will consider it as opening tag and its only for arrow function declared in .tsx files.

  2. Why not just type key: string instead of K extends keyof T in getProp?
      type key: string loses connection with T and error will be thrown because key:string cant be used to index T

  3. When would you use unknown over a generic T?
    when output is not related to input argument type and also if no re-using the function in those cases. But while using unknown, we need to narrow the type before using it.
*/

export { identity, getKeyProp, a, b, result, userRes, a1 };
export type { HasLength, ApiResponse, Nullable };
