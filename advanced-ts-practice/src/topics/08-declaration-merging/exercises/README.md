# Declaration Merging — hands-on exercises

Companion drills for the three revision sheets one level up:

| Sheet | Covers |
|---|---|
| [`../declaration-merging.ts`](../declaration-merging.ts) | the RULES — what merges with what |
| [`../module-augmentation.ts`](../module-augmentation.ts) | the AUGMENTOR — reaching into a module you don't own |
| [`../global-augmentation.ts`](../global-augmentation.ts) | the CONSUMER — program-wide effects, `declare global`, interview Q&A |

## Layout

```
exercises/
  01-interface-merging.ts    ← your attempts live here
  02-global-window.ts
  03-module-augmentation.ts
  04-express-request.ts
  05-class-mixin.ts          ← still blank, not yet attempted
  mock/                      stand-ins for node_modules packages — do NOT edit
    analytics.ts
    express.ts
  solutions/                 open only after compiling your own attempt
```

## Files

| Exercise | Covers | Status |
|---|---|---|
| `01-interface-merging.ts` | member merging, TS2717, overload ordering + literal hoist, TS2428 | ✅ done |
| `02-global-window.ts` | `declare global`, `export {}`, script vs module, generic `Array<T>` augmentation | ✅ done |
| `03-module-augmentation.ts` | `declare module`, the required-property trap, augmenting a value | ✅ done |
| `04-express-request.ts` | the real-world pattern: `namespace Express { interface Request }` | ✅ done |
| `05-class-mixin.ts` | class+interface (instance side), class+namespace (static side), the runtime crash | ⬜ blank |

## Do these in order

1 → 2 → 5 are self-contained. **3 and 4 are the two you will actually use at work**, and 3b / 4b
are the interview questions.

Rule for every exercise: write your prediction in the `📝` comment **before** running `tsc`.
Only open `solutions/` after you've compiled your own attempt.

## Run

From `advanced-ts-practice/`:

```bash
npx tsc -p tsconfig.app.json --noEmit    # --noEmit matters: without it tsc litters .js next to your .ts
```

Deliberate errors are expected — every `❌` in these files marks one. Compare the error codes
tsc prints against the ones annotated in the comments.

## ⚙️ Two tsconfig flags this topic depends on

`tsconfig.app.json` currently sets:

- `"moduleDetection": "legacy"` — Vite's template default is `"force"`, which makes every file a
  module. That silently hides drill **2a** and the script-vs-module trap behind exercise 3.
- `"erasableSyntaxOnly": false` — the template default `true` bans the `namespace` needed in **5d**.

Both are project-wide, so revert them when you move on to another topic.
