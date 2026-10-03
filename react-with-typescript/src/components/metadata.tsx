/* ============================================================================
   DOCUMENT METADATA & THE REACT COMPILER — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the result BEFORE you click
     ❓ = not something a browser test can settle
     `// => X` (Part 1) = read from document.head in real Chrome on React 19.2.4.
     `// => X` (Part 2) = compiled with babel-plugin-react-compiler 1.0.0 and checked for the
     memo cache (`import { c as _c } from "react/compiler-runtime"`).

   ▶️ npm run dev -> the "Metadata: ..." entries in the App.tsx switcher. Watch the browser TAB
      and the <head> in DevTools, not the page.

   CONTENTS
     PART 1 — Document metadata
       1. What gets hoisted ....... <title>, <meta>, <link>
       2. Gotchas ................. 2 of yours + 4 more ⚠️
       3. Exercise
     PART 2 — React Compiler
       4. What it memoizes ........ and what it silently skips (measured)
     5. Interview Q&A 🎤

   THE MODEL 🧠
     PART 1: in React 19, <title>, <meta> and <link> are special. Render them anywhere and
     React moves them into <head>; unmount the component and it takes title and meta back out.
     It is hoisting, not merging — React doesn't know two titles are "the same thing".

     PART 2: the compiler is a build step that inserts the memoization you'd write by hand.
     It can only do that for code it can PROVE is pure, so anything that breaks the Rules of
     React is left exactly as you wrote it — no error, no memoization.

   💡 THE ONE-LINERS: metadata is declarative hoisting, with no deduplication for title and
      meta. The compiler is automatic useMemo, opt-out by breaking the rules.
   ============================================================================ */

/**
 ** Part 1 : Document Metadata
    In React 19, you can render <title>, <meta> and <link> in the component itself. React moves them into the <head> when component mounts and removes them on unmount. No need to use react-helmet or useEffect to set document.title.
    ** on component unmounts: only title and meta tags were removed but link is kept due to added precedence attribute and setting it would make stylesheet as a shared resource. Please scope your classnames.
    ** If other component in the tree below tries to add
        1. title tag, it will be placed on top of before one. (browser uses the top one)
        2. meta tag, it will be placed below the before one. order doesn't matter here and crawler checks the first meta and ignores rest. Don't keep the product related meta tags in index.html.
    ** If another component tries to add the link with same href, react keep only one copy and href value will be considered as identifier.

    ✅ EVERY STRUCTURAL CLAIM ABOVE MEASURED (document.head read after each step):
         mount ProductPage            -> title, meta and link all in <head>, none inside #root
         unmount it                   -> title gone, meta gone, link STILL THERE
         ProductPage + DupProductPage -> titles  ["Overridden title", <ProductPage's>, "react-with-typescript"]
                                         metas   ["Buy Sony headphones", "Overridden meta "]
                                         links   1  (same href, deduplicated)
       So: a later title goes ABOVE the earlier one (and wins the tab), a later meta goes BELOW.
    ❓ "crawler checks the first meta and ignores the rest" — plausible, but that's crawler
       behaviour, not something a browser test shows. What IS measurable: both description
       metas sit in <head> at once, so don't rely on one overriding the other.
 */

import { useState } from "react";
// ⚠️ `?url` gives the stylesheet's real, bundler-resolved URL. A hand-written relative href
//    does NOT work — see Gotcha 5.
import productCssUrl from "../styles/Product.css?url";

// ─────────────────────────────────────────────────────────────────────────────
// 1. WHAT GETS HOISTED 🏗️
// ─────────────────────────────────────────────────────────────────────────────
export const ProductPage = ({ name }: { name: string }) => {
  return (
    <article className="product-page">
      <title>{ `${name} | Shop`}</title>
      {/* ❌ the version that was live here: <title>Order {a} of 10</title>
          Three children, so the tab title came out EMPTY — measured document.title === "".
          See Gotcha 1. */}
      <meta name="description" content={`Buy ${name}`} />
      <link rel="stylesheet" href={productCssUrl} precedence="default"/>
      <p>Product: {name}</p>
    </article>
  );
}

export const DupProductPage = () => {
  return (
    <article className="product-page">
      <title>{`Overridden title`}</title>
      <meta name="description" content={`Overridden meta `} />
      <link
        rel="stylesheet"
        href={productCssUrl}
        precedence="default"
      />
      <p>Second page, same stylesheet href</p>
    </article>
  );
}
// => MEASURED with both mounted: ONE <link> in <head> (React keys stylesheets by href), TWO
//    description metas, and the tab shows "Overridden title".

// ─────────────────────────────────────────────────────────────────────────────
// 2. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
 ** Gotcha 1 - title needs a single string
    title should be a single string. Tried to pass variable inside the tag text, returns empty. pass a single string using template literals.

    ✅ MEASURED: <title>Count: {count}</title> rendered a <title> with EMPTY text and
       document.title === "". JSX turns that into two children ("Count: " and the number), and
       <title> accepts exactly one.
    ⚠️ And it fails SILENTLY — React 19.2.4 logged nothing at all on the client. No warning, no
       error, just a blank tab. That's what makes it worth memorizing.
 */

/**
 ** Gotcha 2 - React doesn't pick a winner between title tags
    If multiple tags were added by multiple component, react moves them on top of each other. Last added will be on top and browser only reads the first title tag. Render only one title per route.

    ✅ MEASURED: three <title>s in <head> at once, newest first; document.title was the newest.
 */

/**
 ** Gotcha 3 - index.html's <title> never goes away ⚠️
    ✅ MEASURED on the exercise: head held ["Count: 0", "react-with-typescript"] — React puts
       its title ABOVE the static one from index.html rather than replacing it. Toggle the
       component off and the tab falls back to "react-with-typescript".
    💡 So the static title is your fallback, and an SPA always has at least two <title>s while a
       page title is mounted. Keep index.html's title generic (the app name).
 */

/**
 ** Gotcha 4 - a stylesheet with `precedence` outlives its component ⚠️
    ✅ MEASURED: after unmounting ProductPage the <link> was still in <head> (title and meta
       were gone). React treats a precedence stylesheet as a shared resource and never removes
       it — so its rules keep applying to anything that matches. Scope the class names, as the
       note at the top says; `.product-page` in Product.css is that scope.
    💡 `precedence` is also what opts the link into hoisting + dedup. Without it, the <link>
       stays where you rendered it and behaves like plain HTML.
 */

/**
 ** Gotcha 5 - the href is resolved by the BROWSER, not by your bundler ⚠️
    href="../styles/Product.css" looks like an import path but is a URL, resolved against the
    PAGE address. From http://localhost:5173/ that is /styles/Product.css — which doesn't exist.
    ✅ MEASURED: Vite's SPA fallback answered it with 200 text/html (index.html!), and the sheet
       parsed to 0 rules. No 404, no console error: a stylesheet that silently does nothing.
       The real file, requested as a stylesheet, is /src/styles/Product.css -> 200 text/css.
    ✅ Fix: `import url from "../styles/Product.css?url"` and pass that to href (done above), or
       put the file in /public and reference it as an absolute path.
 */

/**
 ** Gotcha 6 - only these three tags, and only in the client tree you render
    <script> has its own rules (async + src to be hoisted/deduped), and anything else — <base>,
    <style> without precedence — stays put. There's also no API to READ the current metadata
    back; it's write-only from the component's point of view.
 */

/**
 *! When not to use
    In next.js use metadata export or generateMetadata. It handles merging across layouts and streaming. Raw tags are for plain react SPA's.
 */

/**
 ** Angular parallel - It replaces the Title and Meta services which were imperative calls and this is declarative.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 4. PART 2 — REACT COMPILER ⚙️
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Part 2 - React compiler
    It is a build step where it adds memoisation for you. It gives the effect of useMemo, memo and useCallback without u writing it. Need to turn it on in the config.

    ** For interviews
      1. It memoizes for the components which follow react rules. Mutating prop, state and reading ref during render is skipped silently and un-memoized. eslint-plugin-react-hooks recommended config report these issues.
      2. "use no memo" will make compiler to skip the component for memoization. use it as a escape hatch for debugging.
      3. useMemo and useCallback will still work and useful when you need a guaranteed stable identity such as an effect dependency.
      4. Doesn't fix everything; doesn't virtualize a long list or split code or fix a slow algorithm.

    ** Angular parallel - closest to onPush + signals being applied for you by the build, instead of u opting in per component.

    ✅ MEASURED by compiling each case and checking the output for the memo cache:

         component                                   result
         ───────────────────────────────────────────────────────────────────
         pure (sorts a copy, maps to JSX)            memoized
         props.count = 5          (assignment)       SKIPPED, no build error
         state.n = 1              (assignment)       SKIPPED, no build error
         reads ref.current in render                 SKIPPED, no build error
         writes ref.current in render                SKIPPED, no build error
         hook called conditionally                   SKIPPED, no build error
         mutates a module-level variable             SKIPPED, no build error
         "use no memo" directive                     SKIPPED
         already uses useMemo + useCallback          memoized (manual ones keep working)
         items.push(1)            (method call)      ⚠️ STILL MEMOIZED
         props.items.push(1)      (method call)      ⚠️ STILL MEMOIZED

    ✅ Points 1-3 hold: violations are skipped SILENTLY (the build succeeds), "use no memo"
       opts out, and hand-written useMemo/useCallback still compile.
    ⚠️ One hole in point 1: "mutating a prop is skipped" is true for ASSIGNMENT, not for a
       mutating METHOD CALL. `items.push(1)` on a prop compiled to a memoized component — the
       compiler can't see that push mutates, so it caches a render that depends on a mutation.
       That is the case that produces stale UI, and it's why the lint rules matter more than
       the compiler's own bail-outs.
    ✅ "the lint config reports these": seen in this repo — eslint flagged `inputRef.current`
       read during render in imperative-handle.tsx with react-hooks/refs.
    ⚠️ NOT enabled here: vite.config.ts has the plugin line commented out, and
       babel-plugin-react-compiler isn't in package.json, so uncommenting alone would fail the
       dev server. `npm i -D babel-plugin-react-compiler` first.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXERCISE 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Exercise

    Time box: 10 min

    Build: a <Page> component with a count state, a +1 button, and <title>{Count ${count}}</title>. In a parent, add a button that toggles <Page> on and off.

    Done when you've seen:

    The browser tab reads Count 0, and in DevTools the <title> is inside <head>, not inside #root.
    Clicking +1 changes the tab to Count 1.
    Toggling <Page> off removes that <title> from <head>.
    Changing it to <title>Count {count}</title> breaks the tab title. Then change it back.

    There's no compiler exercise. It's config only, and the four answers above cover what gets asked.

    ✅ ALL FOUR MEASURED:
       mounted     -> head titles ["Count: 0", "react-with-typescript"], 0 titles inside #root
       +1          -> ["Count: 1", "react-with-typescript"], tab reads "Count: 1"
       toggled off -> ["react-with-typescript"], tab falls back to the index.html title
       broken form -> an empty <title>, tab blank, and no console warning
 */

const TestChildComp = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <title>{`Count: ${count}`}</title>
      {/* Empty title rendered in browser since it didn't render as a single string */}
      {/* <title>Count: {count}</title>  */}
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </>
  );
}

const TestParentComp = () => {
  const [toggle, setToggle] = useState(true);
  return (
    <>
      <button onClick={() => setToggle(prev => !prev)}>Toggle child component</button>
      {toggle && <TestChildComp />}
    </>
  )
}


export function DocumentMetadataAndCompilerRoot() {
  return (
    <>
      {/* <ProductPage name="Sony headphones" />
      <DupProductPage /> */}
      <TestParentComp />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. How do you set the page title in React 19?
      Render <title> in the component. React hoists it into <head> and removes it on unmount —
      no react-helmet, no useEffect on document.title. (section 1)

 ** Q2. Two components both render a <title>. Which wins?
      The one rendered later: React places it above the earlier one and the browser reads the
      first <title> in the document. React doesn't merge or dedupe them. (Gotcha 2)

 ** Q3. Why is my tab title blank?
      <title>Count: {count}</title> is two children, and <title> takes one string. Use a
      template literal. It fails silently — no warning. (Gotcha 1)

 ** Q4. What happens to the tags on unmount?
      title and meta are removed; a stylesheet <link> with `precedence` stays, because it's a
      shared resource. So scope its class names. (Gotcha 4)

 ** Q5. What does `precedence` do on a <link rel="stylesheet">?
      Opts it into hoisting, ordering and deduplication by href — two components asking for
      the same href produce one <link>. (section 1)

 ** Q6. When shouldn't you use these raw tags?
      In Next.js: use the `metadata` export or generateMetadata, which merges across layouts
      and works with streaming. Raw tags are for a plain React SPA. (When not to use)

 ** Q7. What does the React Compiler do?
      A build step that inserts memoization automatically — the effect of memo, useMemo and
      useCallback without writing them. (Part 2)

 ** Q8. What happens when a component breaks the Rules of React?
      The compiler skips it silently: the build passes and that component just isn't
      memoized. Measured for prop/state assignment, ref access in render and conditional
      hooks. But a mutating METHOD CALL like items.push() is not detected. (Part 2)

 ** Q9. Do you delete your useMemo and useCallback?
      Not necessarily. They still compile, and they're still right when you need a GUARANTEED
      stable identity, e.g. an effect dependency. "use no memo" opts one component out. (Part 2)

 ** Q10. What doesn't the compiler fix?
      Anything that isn't re-render cost: a long list still needs virtualization, a big bundle
      still needs code-splitting, a slow algorithm is still slow. (Part 2)
 */

// 👉 NEXT: this closes the React 19 set in this project (actions, useFormStatus, useOptimistic,
//    metadata). real-world-scenarios-js/vite.config.js has the compiler actually enabled, if
//    you want to see it running rather than described.
