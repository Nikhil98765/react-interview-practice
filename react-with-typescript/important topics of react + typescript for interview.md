# important topics of react + typescript for interview ?

Here are the most important React + TypeScript topics you should prepare for interviews:

## Core TypeScript Fundamentals

- **Basic types** — `string`, `number`, `boolean`, `null`, `undefined`, `any`, `unknown`[^5]
- **`type` vs `interface`** — differences, when to use each, extending vs intersecting[^7]
- **Union \& intersection types** — `A | B`, `A & B`
- **`void` vs `never` vs `undefined`** — return type differences[^5]
- **Type assertions** — `as` keyword, `!` non-null assertion
- **`strict` mode** — what it enables and why it matters[^3]


## Generics

- What generics are and why to use them over `any`[^8]
- Generic functions, interfaces, and components
- Generic constraints with `extends`
- Default generic parameters


## React + TypeScript Specifics

- **Typing props** — `interface` vs `type`, optional props, extending HTML element props[^7]
- **`React.FC` vs plain function** — why `React.FC` is often avoided
- **`ReactNode` vs `ReactElement` vs `JSX.Element`** — when to use each[^7]
- **Typing `children`** — `ReactNode` vs `ReactElement`
- **Typing `useState`** — `useState<Type>(initialValue)`[^7]
- **Typing `useRef`** — `useRef<HTMLDivElement>(null)`
- **Typing `useReducer`** — action types as discriminated unions
- **Typing custom hooks** — return type tuples, generics[^7]
- **Typing event handlers** — `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent`
- **Typing `forwardRef`** — `React.forwardRef<RefType, PropsType>`
- **Typing context** — `React.createContext<Type>(defaultValue)`


## Utility Types

- `Partial<T>` — all props optional[^9]
- `Required<T>` — all props required
- `Readonly<T>` — immutable properties
- `Record<K, V>` — key-value mapping
- `Pick<T, K>` — select specific properties
- `Omit<T, K>` — exclude specific properties
- `Exclude<T, U>` / `Extract<T, U>` — filter union types
- `ReturnType<T>` — infer return type of a function
- `Parameters<T>` — infer parameter types


## Advanced TypeScript

- **Discriminated unions** — narrowing with a `type` / `kind` field
- **Type guards** — `typeof`, `instanceof`, custom `is` guards
- **Enums** — const enums vs regular enums
- **Mapped types** — `{ [K in keyof T]: ... }`
- **Conditional types** — `T extends U ? X : Y`
- **Template literal types** — `type EventName = \`on\${string}\``
- **`keyof` and `typeof`** — extracting keys and types


## Common Interview Questions to Prepare

- What is the difference between `type` and `interface`?[^2]
- When would you use `unknown` over `any`?
- What are generics and why are they useful?[^8]
- How do you type props with optional and required fields?[^3]
- What is the difference between `ReactNode` and `ReactElement`?[^7]
- How do you type a custom hook?[^7]
- What is a discriminated union and when do you use it?
- Explain `Partial`, `Pick`, and `Omit` with examples[^9]
- How do you handle `null` and `undefined` safely in TypeScript?
- What does `strict: true` enable in `tsconfig.json`?[^3]
<span style="display:none">[^1][^10][^4][^6]</span>

<div align="center">⁂</div>

[^1]: https://www.interviewbit.com/react-interview-questions/

[^2]: https://www.geeksforgeeks.org/typescript/typescript-interview-questions/

[^3]: https://www.datacamp.com/blog/typescript-interview-questions

[^4]: https://www.greatfrontend.com/blog/100-react-interview-questions-straight-from-ex-interviewers

[^5]: https://github.com/Devinterview-io/typescript-interview-questions

[^6]: https://www.turing.com/interview-questions/typescript

[^7]: https://dev.to/m_midas/30-frontend-interview-questions-typescript-12c2

[^8]: https://arc.dev/talent-blog/typescript-interview-questions/

[^9]: https://www.interviewbit.com/typescript-interview-questions/

[^10]: https://www.simplilearn.com/tutorials/typescript-tutorial/typescript-interview-questions

