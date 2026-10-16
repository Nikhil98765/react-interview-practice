/* ============================================================================
   @defer (DEFERRABLE VIEWS) — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the result BEFORE you try it
     ❓ = could not be verified here (says why)
     `=> X` = actual output on Angular 22.2.2: `ng build` for errors and chunk lists, and a
     production build in headless Chrome for what renders and when the chunk is requested.
     Every variant was built in a throwaway copy of this project — nothing is from memory.

   ▶️ nvm use && npm start, then open /03 and scroll down to the Toggle button. To try a
      trigger, swap the @defer line in 03-@defer.component.html. `ng build` lists the
      `heavy-chart-component` lazy chunk while the block is really deferred.

   FILES IN THIS FOLDER
     03-@defer.component.ts .... this sheet + the demo component (route /03)
     03-@defer.component.html .. the demo template, with your trigger notes
     heavy-chart.component.ts .. the component being deferred

   CONTENTS
     1. The block & its states ... what renders when (measured timings)
     2. Triggers ................. which event, and on WHICH element
     3. prefetch ................. download early, render later
     4. What makes it eager ...... four ways to lose the lazy chunk, all silent
     5. Gotchas .................. 6 ⚠️
     6. When not to use
     7. Exercise
     8. Interview Q&A 🎤

   THE MODEL 🧠
     @defer splits part of a template into its own chunk. Until a trigger fires, the
     @placeholder is in the DOM. When it fires, Angular downloads the chunk (showing
     @loading if that takes long enough) and swaps the placeholder for the real content.
     Two separate questions: WHEN to download (prefetch) and WHEN to render (the trigger).

   💡 THE ONE-LINER: @defer lazy-loads a piece of a template, not a route. The compiler
      makes the chunk, and a trigger decides when it loads. It renders once and stays.
   ============================================================================ */

/**
  ** Defer
      Used to lazy load a part of template in a component without any import(). deferred view will be downloaded as a separate chunk when trigger is fired.
      works for standalone components, directives and pipes.
      3 states:
        1. placeholder - shown in the real DOM instead of the actual content.
        2. loading - shown when chunk is downloading
        3. error -  when error occurs in download of the chunk
*/

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE BLOCK & ITS STATES ⏳
// ─────────────────────────────────────────────────────────────────────────────
import { Component } from '@angular/core';
// import { viewChild } from '@angular/core'; // with the chart = viewChild(...) line below: no lazy chunk (Gotcha 3)
import { HeavyChartComponent } from './heavy-chart.component';

@Component({
  selector: 'app-03-@defer', // never used: the component is routed. It builds.
  // ✅ Listed in imports but used ONLY inside @defer, so it still gets its own chunk:
  //    => heavy-chart-component | 321 bytes (lazy)
  imports: [HeavyChartComponent],
  templateUrl: './03-@defer.component.html',
})
export class DeferDemo {
  // chart = viewChild(HeavyChartComponent);
  isVisible = false;
}

/*
  Measured with the demo's `@loading (after 100ms; minimum 1s)`:

    chunk served at once        Toggle → chart after ~24ms. "Loading..." never appears.  ✅
    chunk delayed by 600ms      +0ms     click, chunk requested
                                +115ms   "Loading..." replaces the placeholder (after 100ms)
                                +1115ms  chart appears: the chunk arrived at +600ms, but
                                         `minimum 1s` held the loading block a full second

  `@placeholder (minimum 800ms)` with `on immediate`: the chunk was requested at once, but
  the placeholder stayed ~800ms (74ms → 875ms) before the chart replaced it.  ✅

  💡 `after` stops a flash on fast networks; `minimum` stops a flash once it does show.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRIGGERS 🎯
// ─────────────────────────────────────────────────────────────────────────────
/*
  | Trigger                  | Fires when                                  | Measured                                          |
  |--------------------------|---------------------------------------------|---------------------------------------------------|
  | (none)  = on idle        | browser is idle                             | chunk requested ~50ms after load                  |
  | on immediate             | right after the non-deferred content renders| chunk requested ~60ms after load                  |
  | on timer(700ms)          | after the time                              | fired at ~700ms with nothing clicked              |
  | when isVisible           | the expression becomes truthy               | chunk requested on the Toggle click               |
  | on interaction           | click/keydown on the PLACEHOLDER            | clicking another button: nothing. Placeholder: yes|
  | on interaction(btn)      | click/keydown on #btn                       |                                                   |
  | on hover                 | mouse over / focus on the PLACEHOLDER       | hovering another element: nothing. Placeholder: yes|
  | on viewport              | the PLACEHOLDER scrolls into view           | same no-target rule (NG8019)                      |

  Several triggers are OR'ed: `on timer(700ms); when isVisible` rendered at ~700ms
  without the toggle ever being clicked.  ✅
*/

// ─────────────────────────────────────────────────────────────────────────────
// 3. PREFETCH 📦
// ─────────────────────────────────────────────────────────────────────────────
/*
  `@defer (when isVisible; prefetch on idle)`:
    => chunk requested ~60ms after load, long before any click
    => Toggle → chart rendered at once, with no network wait  ✅

  prefetch takes the same triggers (`prefetch on hover`, `prefetch when x`...). It only
  downloads; rendering still waits for the main trigger.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 4. WHAT MAKES IT EAGER — four ways to lose the chunk 🚫
// ─────────────────────────────────────────────────────────────────────────────
/*
  | Change                                              | `ng build`                          |
  |-----------------------------------------------------|-------------------------------------|
  | as written (used only inside @defer)                | heavy-chart-component lazy chunk ✅ |
  | `chart = viewChild(HeavyChartComponent)` in the class | no chunk, no warning ❌           |
  | `<app-heavy-chart />` also used outside @defer      | no chunk, no warning ❌             |
  | HeavyChart declared in an NgModule (standalone: false) | no chunk, no warning ❌          |
  | `ng serve` (HMR on by default)                      | HeavyChart is inside main.js ❌     |
  | `ng serve --no-hmr`                                 | lazy again ✅                       |

  In every eager case the block still WAITS for its trigger before rendering. Only the
  download stops being lazy, so the page looks right and nothing tells you.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Gotcha 1 - `when` is one-way
     ✅ MEASURED: Toggle → chart rendered. Toggle again (isVisible = false) → chart still
        on screen.
     ⚠️ Once a @defer block has rendered, it never goes back to the placeholder.
     💡 To hide it again, wrap it: `@if (isVisible) { @defer { ... } }`. The chunk is
        downloaded once either way.
*/

/**
  ** Gotcha 2 - a trigger with no target watches the placeholder
     `on interaction`, `on hover` and `on viewport` without a reference listen on the
     @placeholder, not on the page.
     ✅ MEASURED: clicking or hovering another element did nothing; the placeholder did.
     ❌ No @placeholder => NG8019: Trigger with no target can only be placed on an @defer
        that has a @placeholder block
     ❌ Placeholder with two root elements => NG8020: ... with exactly one root element node
*/

/**
  ** Gotcha 3 - eager by accident, and silently
     A viewChild, a use outside the block, or an NgModule-declared component pulls the
     component into the main bundle (section 4).
     ⚠️ No error or warning. The only way to know is the lazy chunk list in `ng build`.
*/

/**
  ** Gotcha 4 - `ng serve` lies about bundle size
     ✅ MEASURED: with HMR (the default), HeavyChart's code was in main.js before any
        Toggle; with `--no-hmr` it was lazy. It still didn't render before the trigger.
     💡 Check deferral in a production build, not the dev server.
*/

/**
  ** Gotcha 5 - @loading may never show
     ✅ MEASURED: a local 321 B chunk arrived in ~24ms, under `after 100ms`, so "Loading..."
        never appeared. With a 600ms delay it did.
     💡 To test loading states, throttle the network in DevTools.
*/

/**
  ** Gotcha 6 - `when` on a plain field only works because of the click
     `isVisible` is a plain field and Angular 22 components default to OnPush. The (click)
     event marks the view dirty, so `when isVisible` still fires on the Toggle.  ✅
     ✅ MEASURED: `setTimeout(() => this.isVisible = true, 300)` never rendered the chart.
        As a signal, `isVisible.set(true)` with `when isVisible()` rendered it at ~300ms.
     💡 Drive `when` from a signal.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHEN NOT TO USE 🚫
// ─────────────────────────────────────────────────────────────────────────────
/*
  - Above-the-fold content: it shows a placeholder, then shifts. Defer what's below the fold.
  - Tiny components: a 321 B chunk costs an extra request for almost nothing saved.
  - Content that has to be in the server-rendered HTML for SEO: on the server only the
    placeholder renders (your Q6) unless you use hydrate triggers.  ❓ not measured: no SSR here
  - Something you need to hide again: use @if (Gotcha 1).
*/

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXERCISE 📝
// ─────────────────────────────────────────────────────────────────────────────
/*
  Swap the @defer line in the HTML for each of the variants you left there:

    1. `when isVisible` + @loading(after 100ms; minimum 1s), then Toggle twice.
    2. `on viewport`, then scroll down past the three 100vh spacers.
    3. `on interaction(btn); prefetch on idle`, with <button #btn>.
    4. Add an @error block.

  ✅ MEASURED:
    1. Chart after ~24ms, no loading block; the second Toggle doesn't hide it (Gotcha 1).
       With the chunk delayed 600ms: loading at +115ms, chart at +1115ms (section 1).
    2. Nothing is requested until you scroll to the bottom; then the chunk loads and the
       chart renders. It watches the placeholder, which sits below the spacers (Gotcha 2).
    3. The chunk downloads ~60ms after load; the click renders it with no wait (section 3).
    4. 📝 Not measured: it shows only if the chunk fails to load (block the request in DevTools).
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
  🎤 Interview questions
    1. What does @defer do, and how is it different from a lazy route?
        Defer makes a section of template to lazy load by downloading them as a different chunk when trigger was fired. lazy route loads the entire component or set of components but not a section of a view inside the template. defer only works for standalone components, directives and pipes but lazy route works for non-standalone as well. no manual import()
        ⚠️ A non-standalone component inside @defer doesn't error: it just loads eagerly (section 4).
    2. Name the sub-blocks and when each one shows.
        @defer() => the actual content when trigger was fired and chunk was downloaded
        @placeholder() => placeholder content for the deferred view in dom, shows before the trigger fires. eagerly loaded.
        @loading() => loading content shows when the chunk is still downloading. only if after delay has passed.
        @error() => when chunk download has some error
        (section 1)
    3. What's the default trigger? Name four others.
        default => idle. interaction, viewport, immediate, when <condition>, hover, timer
        ✅ No trigger: chunk requested ~50ms after load. (section 2)
    4. What's the difference between prefetch and the trigger?
        prefetch => when download of the deferred view chunk should happen. default: lazily. without it, download starts after trigger fired.
        trigger => on which action the deferred view should be shown
        ✅ `prefetch on idle`: downloaded at load, rendered on the click. (section 3)
    5. Why might a component inside @defer still be in the main bundle?
        if the component used in defer is used somewhere else outside the deferred block or it might be used in @viewChild which makes it eagerly load. In dev build, HMR loads all components eagerly even for deferred components as well.
        ✅ All three measured, plus a fourth: an NgModule-declared component. (section 4, Gotcha 4)
    6. What happens to a @defer block during SSR? What does hydrate on change?
        using hydrate trigger make the actual content render in server instead of placeholder content which is default. placeholder is rendered on server because triggers won't be fired in server.
        ❓ Not measured: this project has no SSR set up.
    7. How do you avoid flicker and layout shift?
        set minimum and after on loading block, add some styling on placeholder content to match the height of the actual content and also add minimum on placeholder for quick placeholder flash.
        ✅ `after 100ms` hid the loading block for a fast chunk; `minimum 1s` held it a full second once shown. (section 1)
    8. Once rendered, can a @defer block go back to its placeholder?
        No. `when` is one-way: setting the condition back to false leaves the content. Wrap it in @if to hide it. (Gotcha 1)
    9. With `on interaction` and no reference, what do you have to click?
        The placeholder. It must exist (NG8019) and have exactly one root element (NG8020). (Gotcha 2)
*/

// 👉 NEXT: signals in depth — Gotcha 6 is where plain fields stop working under OnPush.
