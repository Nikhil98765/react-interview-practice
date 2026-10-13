/* ============================================================================
   APP ROUTER — sheet data (rendered at /routing by ./page.tsx)
   ============================================================================
   `note` fields are your own words. `verified` lines were measured on Next 16.3.8 with
   next dev, next build + next start (status codes), and headless Chrome (what the user sees).
   Next's bundled docs (node_modules/next/dist/docs) were the reference for this version.
   ============================================================================ */

import type { Sheet } from "../_lib/sheet";

export const sheet: Sheet = {
  title: "App Router — file conventions, layouts, dynamic segments",
  verifiedOn:
    "Next 16.3.8 · React 19.2.8 — measured with next dev, next build + next start, and headless Chrome",

  model: [
    "Folders are URL segments. A folder becomes a route only when it contains `page.tsx` (or `route.ts`); everything else in it is just code that happens to live there.",
    "Special files in a segment are not siblings — they NEST. `layout` wraps `template`, which wraps `error`, which wraps `loading`, which wraps `not-found` and the `page`. Almost every gotcha below is that nesting order read from one side or the other.",
    "A layout is rendered once and KEPT across client navigations. That is the feature (state survives, no re-fetch) and the restriction (it cannot see the URL change).",
  ],
  oneLiner:
    "A special file only protects what is BELOW it in the hierarchy — so a segment's `error.tsx` and `loading.tsx` never cover that segment's own `layout.tsx`.",

  blocks: [
    {
      title: "The hierarchy (one segment)",
      pre: [
        "layout.tsx",
        "  template.tsx",
        "    error.tsx          <- React error boundary",
        "      loading.tsx      <- React Suspense boundary",
        "        not-found.tsx  <- boundary for notFound()",
        "          page.tsx  /  the child segment's layout.tsx",
      ].join("\n"),
      caption:
        "Matches the bundled docs exactly. Read it as: whatever a file wraps, it can catch; whatever is above it, it cannot.",
    },
    {
      title: "How this project is laid out",
      pre: [
        "app/",
        "  layout.tsx            root layout (<html>, nav built from _lib/topics.ts)",
        "  page.tsx              home: the list of sheets",
        "  _lib/                 sheet.ts (the Sheet type) + topics.ts (the registry)",
        "  _components/          SheetView.tsx renders any sheet",
        "  _template/            copy this to start a topic  (private folder: /_template is a 404)",
        "  routing/              THIS topic",
        "    sheet.ts  page.tsx  the notes, and the page that renders them",
        "    layout.tsx          topic layout (sub-nav + an input that persists)",
        "    (shop)/             route group: /routing/products, /routing/cart",
        "    about/  docs/[...slug]/",
        "    gotchas/            one runnable route per gotcha",
      ].join("\n"),
    },
  ],

  tables: [
    {
      title: "Special files",
      head: ["File", "What it is", "Receives", "Note"],
      rows: [
        ["`layout.tsx`", "UI shared by a segment and its children; kept across navigation", "`children`, `params`", "no `searchParams`, no pathname"],
        ["`template.tsx`", "like a layout, but remounts when its segment changes", "`children`", "state resets on navigation"],
        ["`page.tsx`", "makes the folder a route", "`params`, `searchParams`", "both are Promises — `await` them"],
        ["`loading.tsx`", "Suspense fallback for the page", "—", "streamed at once, so the status is already 200"],
        ["`error.tsx`", "error boundary; must be `'use client'`", "`error`, `retry`", "`retry`, not `reset`, in Next 16"],
        ["`not-found.tsx`", "UI for `notFound()`", "—", "nearest one wins"],
      ],
    },
    {
      title: "Dynamic segments",
      head: ["Folder", "Matches", "`params`"],
      rows: [
        ["`[id]`", "exactly one part: `/products/1`", "`{ id: string }`"],
        ["`[...slug]`", "one or more: `/docs/a`, `/docs/a/b` — NOT `/docs`", "`{ slug: string[] }`"],
        ["`[[...slug]]`", "zero or more: also matches `/docs`", "`{ slug?: string[] }`"],
        ["`(group)`", "nothing — organises files, absent from the URL", "—"],
        ["`_private`", "nothing — opted out of routing entirely", "—"],
      ],
      caption:
        "Measured: `/routing/docs` -> 404, `/routing/docs/a/b` -> slug `[\"a\",\"b\"]`, `/_template` -> 404.",
    },
    {
      title: "next build — which routes are static",
      head: ["Route", "Result", "Why"],
      rows: [
        ["`/routing`, `/routing/about`, `/routing/cart`, `/routing/products`", "○ static", "nothing request-specific"],
        ["`/routing/products/[id]`", "ƒ dynamic", "dynamic segment, and the page reads `searchParams`"],
        ["`/routing/docs/[...slug]`", "ƒ dynamic", "dynamic segment with no `generateStaticParams`"],
        ["`/routing/gotchas/slow-layout/[ms]` and the other `[param]` demos", "ƒ dynamic", "the param is there precisely to keep them dynamic"],
      ],
      caption: "○ = prerendered at build time · ƒ = rendered on every request.",
    },
    {
      title: "HTTP status codes (production, next start)",
      head: ["Request", "Status", "Why"],
      rows: [
        ["`/routing/products/999` — `notFound()` after 2s", "200", "`loading.tsx` already started the response"],
        ["`/routing/products/404` — `notFound()` before the slow work", "200", "same boundary; faster (14ms) but still streamed"],
        ["`/routing/products/0` — the page throws", "200", "same reason"],
        ["`/routing/docs/missing` — `notFound()`, no `loading.tsx` above", "404", "nothing had been sent yet"],
        ["`/routing/docs` — no matching route", "404", "decided at the routing level"],
      ],
      caption:
        "The two streamed not-found responses did carry `<meta name=\"robots\" content=\"noindex\">`, as the docs promise.",
    },
  ],

  demos: [
    { href: "/routing/products", label: "Shop — a layout that persists", lookFor: "bump the counter, go Products <-> Cart: it stays. Go to About and back: it resets." },
    { href: "/routing/products/1", label: "loading.tsx, then the page", lookFor: "2 seconds of \"Loading Product...\"" },
    { href: "/routing/products/0", label: "error.tsx with retry", lookFor: "\"Something went wrong: boom\" and a Try again button" },
    { href: "/routing/products/999", label: "notFound() -> not-found.tsx", lookFor: "\"No such product\" — and check the status code in the Network tab" },
    { href: "/routing/products/1?color=red&color=blue&size=m", label: "searchParams with a repeated key", lookFor: "the server logs `{ color: [ 'red', 'blue' ], size: 'm' }`" },
    { href: "/routing/docs/react/hooks", label: "Catch-all segment", lookFor: "slug is an array of the parts" },
    { href: "/routing/gotchas", label: "The gotcha demos", lookFor: "one route per gotcha below" },
  ],

  gotchas: [
    {
      title: "A layout can't read `searchParams` or the pathname",
      note: "Since layout's don't re-render on navigation, the values will become stale. layout receives children and params. For queryString and active link,  use usePathname() or useSearchParams() in a client component rendered inside layout.",
      verified: [
        "The shop layout declared a `searchParams` prop and logged it: `undefined` on every request.",
        "`tsc` rejects it too — `TS2344: Property 'searchParams' is missing in type 'LayoutProps<\"/\">'` — so `next build` fails.",
        "The fix works: a client component inside the layout showed `pathname = /routing/products · query = sort=price` after a `<Link>` navigation.",
      ],
      warn: ["`useSearchParams` wants a `<Suspense>` above it, or a prerendered route falls back to client rendering up to the nearest boundary."],
      demo: { href: "/routing/products?sort=price", label: "See the client component read the URL", lookFor: "the pathname/query line inside the shop layout" },
    },
    {
      title: "`error.tsx` doesn't catch errors from its own layout",
      note: "since layout is not wrapped inside the error boundary, error thrown inside layout goes to parent segment's error.tsx. For root layout, that is global-error.tsx.",
      verified: [
        "A layout that throws, with an `error.tsx` right next to it: the browser showed \"caught by the PARENT error.tsx\". The segment's own boundary never rendered.",
      ],
      tip: "The boundary is rendered INSIDE the layout, so the error has escaped before the boundary exists.",
      demo: { href: "/routing/gotchas/layout-error/throw", label: "Throw from a layout", lookFor: "which boundary's label appears" },
    },
    {
      title: "`loading.tsx` doesn't cover slow work in its own layout",
      note: "since layout.tsx sits on top loading.tsx, slow work in layout.tsx will be captured by parent segment's loader.tsx. If layout is awaiting for something slow, navigation blocks and fallback never shown, move the slow work into page.tsx or wrap it with its own <Suspense></Suspense>",
      verified: [
        "A layout awaiting 2s, with its own `loading.tsx` beside it: during the wait the browser showed \"PARENT loading.tsx\". The segment's own fallback never appeared.",
      ],
      warn: ["With no `loading.tsx` anywhere above, there is no fallback at all — the navigation just hangs until the layout resolves."],
      demo: { href: "/routing/gotchas/slow-layout/2000", label: "Navigate to a slow layout", lookFor: "click it from the gotchas index and read the ⏳ line" },
    },
    {
      title: "A layout can't pass data to its page",
      note: "There is no prop from layout to children. fetch the same data in both places and identical fetch calls will be deduplicated within a render.\nreact cache() does same for database calls",
      verified: [
        "Layout and page both called `getUser(7)` wrapped in `React.cache`: the server logged ONE run per request, and both showed the same timestamp.",
        "A second request for the same id ran it again (call #2) — the memo is per request, not shared between requests.",
      ],
      demo: { href: "/routing/gotchas/shared-data/7", label: "Two callers, one call", lookFor: "equal timestamps, and one \"actually ran\" line per request in the server log" },
    },
    {
      title: "Two root layouts means a full page reload",
      note: "If app/layout.tsx is removed and give each route group its own layout.tsx, then navigating between groups is a full page reload.",
      warn: [
        "Not measured here — this project has a single root layout, and proving it means removing it. The bundled docs state it under route groups → Caveats: navigating between routes that use different root layouts triggers a full page reload.",
        "With multiple root layouts there is also no single layout to build a global 404 from; that is what `global-not-found` is for.",
      ],
      verified: [
        "The inverse was measured: with ONE root layout, navigating Shop → Cart → About → Shop kept the same document (a marker on `window` survived).",
      ],
    },
    {
      title: "`loading.tsx` turns your 404s and errors into HTTP 200",
      verified: [
        "In production, `notFound()` under a `loading.tsx` returned 200 whether it ran before or after the slow work. The same call with no `loading.tsx` above returned 404.",
        "A page that throws under a `loading.tsx` is also a 200.",
        "The streamed not-found responses included `<meta name=\"robots\" content=\"noindex\">`.",
      ],
      warn: ["Calling `notFound()` \"early\" in the page is not enough: the page already renders inside the Suspense boundary, so the headers are sent before it runs."],
      tip: "If a real 404 status matters (analytics, compliance), decide before streaming starts — in a layout above the boundary, or in `proxy`.",
      demo: { href: "/routing/docs/missing", label: "A real 404", lookFor: "status 404 in the Network tab — compare with /routing/products/999" },
    },
    {
      title: "`params` is a Promise — even logging it un-awaited is an error",
      verified: [
        "`console.log(params)` before `await` made Next print on every request: `Error: Route \"/products/[id]\" used ...params or similar expression. params is a Promise and must be unwrapped with await or React.use()`.",
        "Awaiting first and logging the result is silent.",
      ],
      warn: ["`searchParams` is a Promise too, and reading it opts the route into dynamic rendering."],
    },
    {
      title: "Next 16: the error prop is `retry`, and production hides the message",
      verified: [
        "This version's docs and types use `retry`; `reset` is the name in older versions and most tutorials.",
        "In `next start`, the HTML for a page that threw `new Error(\"boom\")` did not contain \"boom\" — only a `digest` id to match against server logs.",
      ],
      tip: "Never build UI logic on `error.message` from a Server Component error; it is a dev-only convenience.",
    },
    {
      title: "The typed helpers know your folders — and go stale when you move them",
      verified: [
        "`LayoutProps<\"/routing/products/[id]\">` and `PageProps<...>` are global, generated by `next dev`, `next build` or `next typegen`.",
        "They caught a real bug here: a layout typed `params: Promise<{ id1: string }>` for an `[id]` folder was rejected.",
        "After moving folders, `tsc` reported missing modules from `.next/dev/types` until the stale types were cleared and `next typegen` re-run.",
      ],
      warn: ["A catch-all `[...slug]` is typed `string[]`, never optional. `slug?: string[]` belongs to `[[...slug]]`."],
    },
    {
      title: "`<a>` and `<Link>` are not the same navigation",
      verified: [
        "With `<Link>`: text typed into the layout's input and a `window` marker both survived three navigations.",
      ],
      warn: ["A plain `<a href>` is a full document load: every layout remounts and all client state is lost."],
      demo: { href: "/routing/products", label: "Type in the sub-nav input, then navigate", lookFor: "the text is still there" },
    },
  ],

  whenNotToUse: [
    "A logged in dashboard with no SEO needed and no server rendering: use React + Vite router is simpler.",
    "If you need state to reset on every navigation: use `template.tsx` which remounts instead of `layout.tsx`. Measured: after navigating A → B the layout counter kept 2 and the template counter was back to 0 — see /routing/gotchas/template-vs-layout/a.",
  ],

  qa: [
    { q: "What makes a folder a route?", a: "A `page.tsx` or `route.ts` inside it. Any other file can be colocated without becoming public, and a folder starting with `_` is opted out of routing altogether." },
    { q: "In what order do the special files wrap each other?", a: "layout → template → error → loading → not-found → page. A file only covers what is below it." },
    { q: "Why can't a layout read searchParams?", a: "It isn't re-rendered on navigation, so the value would be stale. It gets `children` and `params` only. Use `usePathname` / `useSearchParams` in a client component rendered inside it." },
    { q: "My error.tsx doesn't catch an error thrown in the layout next to it. Why?", a: "The boundary is rendered inside that layout. The error goes to the parent segment's `error.tsx`; for the root layout that is `global-error`." },
    { q: "The loading fallback doesn't show while my layout fetches. Why?", a: "`loading.tsx` wraps the page, not its own layout. The parent segment's fallback shows instead — or nothing, if there is none. Move the slow work into the page or wrap it in its own `<Suspense>`." },
    { q: "Layout and page need the same data. How do you avoid fetching twice?", a: "Call it in both. Identical `fetch` calls are de-duplicated within a request, and `React.cache` does the same for a database call. Measured: one run per request." },
    { q: "`[...slug]` vs `[[...slug]]`?", a: "Catch-all needs at least one part, so `/docs` is a 404 and `slug` is always a `string[]`. The optional form also matches `/docs`, where `slug` is `undefined`." },
    { q: "What is a route group for?", a: "`(name)` organises routes and lets a subset share a layout without adding a URL segment. Give each group its own root layout and crossing between them is a full page reload." },
    { q: "layout.tsx or template.tsx?", a: "Layout persists and keeps client state; template remounts when its segment changes. Use a template when you want the reset — an input that should clear, an effect that should re-run." },
    { q: "Why is my not-found page returning 200?", a: "A `loading.tsx` above it already started streaming, so the status can't change. Next adds a `noindex` meta instead. For a real 404, decide before streaming begins." },
    { q: "What makes a route dynamic?", a: "Reading request-time data such as `searchParams`, or a dynamic segment with no `generateStaticParams`. `next build` marks it ƒ; everything else is prerendered ○." },
  ],

  next: "the planned topics in `app/_lib/topics.ts` — Server & Client Components is the natural follow-up, since the `'use client'` files here (`error.tsx`, the counters) are the first place that boundary shows up.",
};
