# Next.js — interview revision sheets

Next 16.3.8 (App Router) · React 19.2.8. Each topic is a folder under `app/`: a **sheet** you
read in the browser, with **live demo routes** beside it that prove each claim.

```bash
npm install
npm run dev          # http://localhost:3000 — keep the terminal visible, the server log is half the proof
```

> This Next version has breaking changes from older ones (`params` is a Promise, `error.tsx`
> receives `retry`, typed `LayoutProps` / `PageProps` helpers). `AGENTS.md` points at the
> bundled docs in `node_modules/next/dist/docs/` — check those before trusting a tutorial.

## Layout

```
app/
  layout.tsx          root layout; the nav is built from _lib/topics.ts
  page.tsx            home: the list of sheets
  globals.css         plain CSS for the sheets (no Tailwind setup needed)
  _lib/
    sheet.ts          the Sheet type — every topic's notes are data in this shape
    topics.ts         the registry: one entry per topic
  _components/
    SheetView.tsx     renders any Sheet
  _template/          copy this to start a topic
  routing/            TOPIC: App Router
    sheet.ts          the notes (model, tables, gotchas, Q&A, demo links)
    page.tsx          renders the sheet at /routing
    ...               demo routes: (shop)/, about/, docs/[...slug]/, gotchas/
```

Folders starting with `_` are private: Next never routes them, so `/_template` is a 404.

## Topics

| Topic | Sheet | Covers |
| --- | --- | --- |
| App Router | `/routing` | special files and their hierarchy, layouts that persist, route groups, dynamic and catch-all segments, `loading` / `error` / `not-found`, status codes when streaming |

Planned topics are listed (greyed out) on the home page and in `app/_lib/topics.ts`.

## Adding a topic

1. `cp -r app/_template app/<slug>`
2. Fill in `app/<slug>/sheet.ts`. Text fields accept `` `backticks` `` for inline code.
3. Build the demo routes in the same folder and point the sheet's `demos` at them.
4. In `app/_lib/topics.ts`, add the topic or flip it to `status: "ready"`. It then appears in the nav.

Demos that must run on every request (a slow layout, a layout that throws) take a dynamic
segment such as `[ms]` or `[mode]`. Without one, `next build` prerenders the route once and the
behaviour you wanted to watch never happens again at runtime.

## Checking a sheet

A `verified` line in a sheet means it was actually measured. The three checks used so far:

```bash
npx next typegen && npx tsc --noEmit    # typed route helpers catch wrong params / props
npx eslint .
npx next build                          # the real gate; also prints which routes are static (○) or dynamic (ƒ)
```

Status codes are measured against `npx next start`, not `next dev` — streaming changes them.
After moving folders, `tsc` may report missing modules from `.next/dev/types`; delete that
folder and run `npx next typegen` again.
