# Advanced TypeScript — interview revision sheets

One folder per topic, ordered as a study path. Each sheet opens with a banner explaining how to
read it, a CONTENTS list, and a `THE MODEL 🧠` block — read that block first, then the drills.

| # | Topic | Sheet | Exercises |
|---|---|---|---|
| 01 | Type primitives | [`01-unknown-any-never/unknown-any-never.ts`](01-unknown-any-never/unknown-any-never.ts) | — |
| 02 | Narrowing & control flow | [`02-narrowing/narrowing.ts`](02-narrowing/narrowing.ts) | — |
| 03 | Inference | [`03-inference/inference.ts`](03-inference/inference.ts) | — |
| 04 | Generics | [`04-generics/generics.ts`](04-generics/generics.ts) | — |
| 05 | Utility types | [`05-utility-types/utility-types.ts`](05-utility-types/utility-types.ts) | — |
| 06 | Advanced types | [`06-advanced-types/advanced-types.ts`](06-advanced-types/advanced-types.ts) | — |
| 07 | `satisfies` | [`07-satisfies/satisfies-keyword.ts`](07-satisfies/satisfies-keyword.ts) | — |
| 08 | Declaration merging & module augmentation | 3 sheets, see below | [5 drills](08-declaration-merging/exercises/) |

## Reading the sheets

```
✅ works / expected result       ❌ compile error (deliberate — the error IS the lesson)
⚠️ gotcha worth memorizing       💡 interview takeaway
📝 write your prediction BEFORE running tsc
// => X   the ACTUAL inferred type at that point, verified against tsc
```

**The red squiggles are intentional.** Every `❌` demonstrates a rule. A sheet that compiles clean
has lost half its content.

## Topic 08 spans three chained sheets

They form one live chain — file 1 exports `Session`, file 2 augments it, file 3 consumes it:

1. [`declaration-merging.ts`](08-declaration-merging/declaration-merging.ts) — the RULES: what merges with what
2. [`module-augmentation.ts`](08-declaration-merging/module-augmentation.ts) — the AUGMENTOR: reaching into a module you don't own
3. [`global-augmentation.ts`](08-declaration-merging/global-augmentation.ts) — the CONSUMER: program-wide effects, `declare global`, and the **interview Q&A**

## Run

From `advanced-ts-practice/`:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

⚠️ Keep `--noEmit`. Without it tsc writes a `.js` next to every `.ts` in these folders; those are
build artifacts and are gitignored.

## ⚙️ Current tsconfig deviations

Topic 08 needs `"moduleDetection": "legacy"` and `"erasableSyntaxOnly": false` in
`tsconfig.app.json`. Both are project-wide — revert them when you move off that topic.
