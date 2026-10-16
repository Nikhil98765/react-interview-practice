/* ============================================================================
   SERVER & CLIENT COMPONENTS — sheet data (rendered at /server-client by ./page.tsx)
   ============================================================================
   `note` fields and the Q&A answers are your own words. `verified` lines were measured on
   Next 16.3.8 with next dev, next build + next start, the page HTML, the client JS chunks and
   headless Chrome. Bundled docs: 01-getting-started/05-server-and-client-components.md.
   ============================================================================ */

import type { Sheet } from "../_lib/sheet";

export const sheet: Sheet = {
  title: "server vs client components",
  verifiedOn:
    "Next 16.3.8 · React 19.2.8 — measured with next dev, next build + next start, the HTML and JS chunks, and headless Chrome",

  model: [
    "In App router, every component is server component by default. It runs only on the server, can fetch data directly and ships no JS. If any component contains interactions like useState, event handling and effects then it should be marked with 'use client'. That file marks as a boundary and everything it imports should be shipped to browser too.",
    "UI interactions happen in browser so we need to ship those components which has them to browser since interactions can't be handled by server",
    "Problem it solves: In SPA's(Angular / React), we ship every component to browser and JS related to it even for static content components and data fetching. server component solves this issue by separating non-interactive(static and data parts) JS in server component and interactive (state, event handling, effects) JS in client components(normal react components). server components don't ship the JS and sends the output html + RSC payload to browser but client components JS will be shipped to browser and hydrate in browser (attaching state, events etc)",
  ],
  oneLiner:
    "components in App router is by default server components. use 'use client' at the top of the file to mark it as client component, server can't handle user interactions(useState, effect and event handling)",

  tables: [
    {
      title: "Where each kind runs",
      head: ["", "Server Component", "Client Component"],
      rows: [
        ["First page load", "renders on the server → HTML + RSC payload", "ALSO renders on the server (HTML), then hydrates in the browser"],
        ["Later navigations", "RSC payload only", "renders entirely in the browser, no HTML"],
        ["JS shipped", "none", "its code + everything it imports"],
        ["Can be `async`", "yes", "no — dev error (Gotcha 2)"],
        ["Hooks, events, browser APIs", "no", "yes"],
        ["Non-`NEXT_PUBLIC_` env vars", "real value", "real value during the server render, empty in the browser (Gotcha 3)"],
      ],
      caption: "The navigation rows are from the bundled docs (Subsequent Navigations). The rest was measured on /server-client/basics.",
    },
    {
      title: "What can cross the server → client boundary (props)",
      head: ["Prop", "Result"],
      rows: [
        ["string, number, boolean, plain object, array", "✅"],
        ["`Date`, `BigInt`, `Map`", "✅ arrived as a real `Date` / `bigint` / `Map`"],
        ["JSX / a Server Component as `children`", "✅ (ServerStats inside SearchBox)"],
        ["a `'use server'` function (Server Action)", "✅ arrived as `typeof === \"function\"`"],
        ["any other function", "❌ `Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\"`"],
      ],
    },
  ],

  demos: [
    {
      href: "/server-client/basics",
      label: "Products (server) → SearchBox (client) → ServerStats (server, as children)",
      lookFor:
        "next dev: terminal shows getUsers, Badge and SearchBox logs; the browser shows SearchBox and the client Badge (each twice: StrictMode), plus server logs replayed with a `Server` tag",
    },
  ],

  gotchas: [
    {
      title: "'use client' follows the import, not the file",
      note: "Even though Badge doesn't have use client directive, if it is imported in client component then it will be a client component no matter if it is imported in any other server component.",
      verified: [
        "Badge is imported by both `Products` (server) and `SearchBox` (client). Both copies rendered, but differently.",
        "The copy under `Products` ran on the server only: its log is tagged `Server` in the dev browser console.",
        "The copy under `SearchBox` was bundled: \"Badge rendered\" is in the client chunk, and it logged in the browser.",
      ],
      warn: [
        "The second half is wrong: imported from a server component, the same file stays a server component. The directive doesn't decide what a file IS; each import decides which side that copy runs on.",
      ],
      tip: "'use client' marks an entry point into the client bundle. A file with no directive goes to whichever side imports it, and can end up on both.",
      demo: { href: "/server-client/basics", label: "Two Badges, two environments", lookFor: "two `Badge` headings; in the dev browser console one Badge log has the `Server` tag, the other has none (and prints twice: StrictMode)" },
    },
    {
      title: "A client component can't be `async`",
      verified: [
        "Badge was `async`. Imported into SearchBox, next dev logged: `<Badge> is an async Client Component. Only Server Components can be async at the moment.`",
        "Then: `A component was suspended by an uncached promise`, and Badge rendered 3 times in the browser.",
        "The production build hides both errors, so you only see them in dev.",
      ],
      warn: ["An `async` component without a directive works until a client file imports it. Badge is no longer `async`."],
      tip: "Async is a server-component feature. In a client component, fetch with `use()` and a promise passed from the server, or with a data library.",
    },
    {
      title: "Client components render on the server, so secrets can leak",
      note: "secrets stay un-prefix and mark the env variables which were used in client components with prefix NEXT_PUBLIC_. Next.js ships env vars with only this prefix.",
      verified: [
        "In the browser, `process.env.DB_VAR` in SearchBox logged empty. The client chunk keeps `process.env.DB_VAR` unreplaced; only `NEXT_PUBLIC_TEST1` was inlined.",
        "During the server render the same line logged `DB Variable`.",
        "Rendering `{process.env.DB_VAR}` in SearchBox put `<p id=\"secret\">[DB Variable]</p>` into the prerendered HTML. No hydration error in production, so the secret stays on the page.",
      ],
      warn: ["Missing the prefix keeps a value out of the JS bundle, not out of the HTML. Never read a secret in a file that can become a client component."],
      tip: "Read secrets only in server-only files (`import 'server-only'`) and pass the client the result, never the key.",
    },
    {
      title: "`server-only` fails on any import that survives, not on usage",
      note: "For functions in a file which were related to server only, use import \"server-only\" on top of the file which makes import of this function in client component as error on usage but not on just import.",
      verified: [
        "`import { getUsers } from '../_lib/db'` in SearchBox, unused: builds ✅.",
        "The same import, called in `useEffect`: ❌ `You're importing a module that depends on \"server-only\" into a React Client Component module.`",
        "`import '../_lib/db'` (bare, never called): ❌ the same error.",
      ],
      warn: ["The unused named import builds because the compiler drops imports that are never used, so `db.ts` never enters the client graph. Any import that is kept fails, whether or not anything is called."],
      tip: "`server-only` turns 'oops, my DB code is in the browser bundle' into a build error.",
    },
    {
      title: "Passing a function fails at render time, not compile time",
      note: "If any server components send props to client component, only serializable props work (primitives, objects, date) but not function. so sending function to client component as a prop will cause build issue. Fix: mark it as a server action ('use server')",
      verified: [
        "`changeHandler={() => {}}` from Products: `✓ Compiled successfully`, then `Error occurred prerendering page \"/server-client/basics\"` with `Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\"`.",
        "The fix works: an inline `\"use server\"` function arrived in SearchBox as `typeof === \"function\"`.",
        "`Date`, `BigInt` and `Map` also crossed fine.",
      ],
      warn: ["It broke `next build` only because /basics is static and prerenders at build time. On a dynamic page the same error happens on each request."],
    },
    {
      title: "/basics is static: the fetch runs once, at build",
      verified: [
        "`next build` lists `○ /server-client/basics` (static), and the getUsers / Badge / SearchBox logs print during \"Generating static pages\".",
        "`next start` served the saved list. No server logs per request.",
      ],
      warn: ["A plain `fetch` in a server component doesn't make the page dynamic. Read `searchParams` or another request-time API and the route becomes ƒ."],
      tip: "This leads straight into the data-fetching topic: static vs dynamic, and caching.",
    },
    {
      title: "Dev only: server logs show up in the browser console",
      verified: ["In next dev, getUsers and the server Badge logged in the browser too, each with a grey `Server` tag. In next start they appear only in the terminal."],
      warn: ["Don't read a log in the browser console as proof the code ran in the browser. Check for the tag, or use the production build."],
    },
  ],

  whenNotToUse: [
    "Don't mark a whole page or layout `'use client'` for one button: wrap only the button, so the rest stays server-rendered with no JS.",
    "A server component is the wrong choice for anything that needs state, effects, event handlers or browser APIs (`window`, `localStorage`).",
  ],

  qa: [
    {
      q: "What's the default component type in the App Router, and why?",
      a: "will be server component because server component gives certain advantages like less bundle size, less JS, able to do data fetch directly and no need to push whole component to browser for just static content.",
    },
    {
      q: "What does a Server Component send to the browser?",
      a: "output HTML from rendering + RSC payload. ⚠️ That's the first page load. On later navigations it's the RSC payload only (bundled docs).",
    },
    {
      q: "What can a Server Component do that a Client Component can't, and vice versa?",
      a: "server component - async, fetch/DB/secrets, fileRead. client - browser interactions, event handling, state, effects. ⚠️ A client component also can't be `async` (Gotcha 2).",
    },
    {
      q: "Does a Client Component render on the server? Explain hydration.",
      a: "yes, it renders on server first and logs shows up in terminal. html is rendered in server and then browser downloads the JS related to it and react attaches the state and event handlers to it which makes it interactive.",
    },
    {
      q: "What does 'use client' do to the files it imports?",
      a: "make them as client components. ⚠️ Only the copies imported through it. The same file imported by a server component stays a server component (Gotcha 1).",
    },
    {
      q: "How do you render a Server Component inside a Client Component?",
      a: "through prop or as children",
    },
    {
      q: "Which props can cross the server → client boundary? Why can't you pass a function?",
      a: "props which were serializable. functions cant be passed because converting them into text and getting back as function is not possible which is called serialization exception is server actions which is reference passed to browser and client component calls it as a rest endpoint and function is executed in server. (Gotcha 5)",
    },
    {
      q: "How do you use React Context in the App Router?",
      a: "make a client file which has context creation and context provider created in it and pass it in the root layout and pass the {children} where server components still work. ⚠️ The docs add: render providers as deep as possible (wrap `{children}`, not the whole `<html>`).",
    },
    {
      q: "Why push 'use client' to the leaves?",
      a: "marking one component as client on the top level will make the sub tree as client components where every components will be shipped to browser which is a bad practice.",
    },
    {
      q: "How do you stop server-only code (DB, secrets) from reaching the client bundle?",
      a: "secrets stay un-prefix and mark the env variables which were used in client components with prefix NEXT_PUBLIC_. Next.js ships env vars with only this prefix. For functions in a file which were related to server only, use import \"server-only\" on top of the file which makes import of this function in client component as error on usage but not on just import. ⚠️ An unprefixed secret still renders into the HTML from a client component (Gotcha 3), and `server-only` fails on any import that is kept, not on usage (Gotcha 4).",
    },
    {
      q: "Angular angle: how is this different from Angular SSR + hydration?",
      a: "angular render HTML in server and also ships JS but RSC renders HTML but don't ship JS and just ships the output HTML + RSC payload to browser. angular ssr re-hydrates in browser and RSC doesn't but client component do hydrate in browser.",
    },
  ],

  next: "Data fetching & caching: Gotcha 6 already shows a fetch frozen at build time. Next: what makes a route dynamic, and how revalidation works.",
};
