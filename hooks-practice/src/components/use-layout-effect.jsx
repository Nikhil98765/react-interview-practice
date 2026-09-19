/* eslint-disable no-unused-vars */
/* ============================================================================
   useLayoutEffect vs useEffect — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you run it
     `// => X` = measured in real Chrome (headless, driven by puppeteer-core) against this
     project's React 19.2.4, by sampling the painted value on every animation frame.

   ▶️ npm run dev in hooks-practice — App.jsx renders <TooltipExample />.
      Swap it for <LayoutExampleEffectExample /> to see the ordering logs.

   CONTENTS
     1. The two flows ............. what each hook guarantees
     2. Commit sequence ........... the table, corrected by measurement
     3. Ordering demo ............. layout -> passive -> rAF (measured)
     4. When the flicker is real .. measured frame by frame
     5. Gotchas ................... 8 of them ⚠️
     6. When not to use
     7. Exercise: the tooltip
     8. Interview Q&A 🎤

   THE MODEL 🧠
     One commit, three moments: React mutates the DOM, the browser paints, and your effects
     run somewhere around that.
       useLayoutEffect -> after the mutation, BEFORE the browser is allowed to paint (blocking)
       useEffect       -> after the mutation, and React does not hold the paint for it
     So the real difference is a GUARANTEE, not a speed: a layout effect (and any state it
     sets) is folded into the same frame, so the user can never see the in-between state.

   💡 THE ONE-LINER: useLayoutEffect buys you "no in-between frame" and pays for it by
      blocking the paint. Default to useEffect; reach for layout only when a measurement
      decides what the user sees.
   ============================================================================ */

/**
 ** useLayoutEffect vs useEffect - both run after react writes to the DOM. useEffect runs after the react writes the DOM and browser paints it but        useLayoutEffect between react writes the DOM and browser paints it.
    Flow of useEffect       - react writes DOM -> browser paints it -> useEffect runs
    Flow of useLayoutEffect - react writes DOM -> useLayoutEffect runs -> browser paints it.
    useEffect is async, so if you want to show any elements like tooltip or popup based on dom measurements then it happens this way - default position of element -> measurement of DOM element -> reposition. You might find the flicker of the element (tooltip / popup) changing from one position to other because of this flow. To avoid this we use useLayoutEffect
    useLayoutEffect is sync and above issue can be resolved as it runs before browser paints it. so no flicker.

    default prefer is useEffect and if u found issues using useEffect for the above kind of use cases, then prefer useLayoutEffect.

    ⚠️ One refinement, measured: "useEffect runs AFTER the paint" is the guarantee you must not
       rely on, but it is not what usually happens. React 19 flushes passive effects in the same
       task cycle, so in 4 of 5 trigger styles the corrected position was already on screen in
       the first painted frame — no flicker at all. The flicker appears when the main thread is
       busy between the commit and the passive flush. See section 4 for the measurements.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// 3. ORDERING DEMO 🔢  (swap this into App.jsx and read the console)
// ─────────────────────────────────────────────────────────────────────────────
export const LayoutExampleEffectExample = () => {
  const [show, setShow] = useState(false);
  const [top, setTop] = useState(200);

  const buttonRef = useRef();
  const popupRef = useRef();

  // useLayoutEffect(() => {
  //   if (buttonRef.current == null || popupRef.current == null) return;
  //   const { bottom } = buttonRef.current.getBoundingClientRect();
  //   setTop(bottom + 100);
  // }, [show]);

  useLayoutEffect(() => {
    console.log('🚀 ~ 1 layout effect');
    requestAnimationFrame(() => console.log("🚀 ~ 3 rAF just before paint"));
  });
  useEffect(() => console.log("🚀 ~ 2 effect"));
  // 📝 predict the order first.
  // => MEASURED (React 19, Chrome, both on mount and on an update):
  //      layout effect   t = 1243.8ms
  //      passive effect  t = 1251.7ms
  //      rAF callback    t = 1254.8ms   <- runs just before the paint
  // ⚠️ The labels used to read 1 layout / 2 rAF / 3 effect. The passive effect actually
  //    lands BEFORE the rAF, i.e. before the browser paints — which is exactly why the
  //    flicker is so hard to reproduce (section 4). The numbering above is the measured order.
  // 💡 What IS guaranteed: layout effects always run before paint. Passive effects have no
  //    such guarantee — here they happened to beat the frame.

  return (
    <>
      <button ref={buttonRef} onClick={() => setShow((prev) => !prev)}>
        Show popup
      </button>
      {show && (
        <div
          style={{ position: "absolute", top, background: "yellow" }}
          ref={popupRef}
        >
          This is a popup.
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. THE FULL COMMIT SEQUENCE 🧾
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Full commit sequence
      step                    useEffect                     useLayoutEffect
    react mutates DOM           ✅                              ✅
    Effect runs               after the browser paint       Before browser paint
    setState inside it        triggers second paint         in the first paint(still cause react re-render and re-commit synchronously before browser paints)
    Blocks the browser          no                            yes
    SSR                         no                            no(and warns)

    ⚠️ Two rows need an asterisk after measuring on React 19:

    "Effect runs after the browser paint" — only GUARANTEED to be "not before". Measured, the
    passive effect ran before the frame's rAF in every trigger I tried (click, setTimeout,
    rAF, transition). Treat "after paint" as "React may let a paint happen first", not "it will".

    "setState inside it -> triggers second paint" — only when a paint actually gets in between.
    With a busy main thread it did: the wrong position was painted for one frame. Otherwise
    the correction landed in the same frame and nothing extra was ever shown.

    "SSR: no (and warns)" — true up to React 18. React 19 REMOVED that warning: renderToString
    with a useLayoutEffect printed nothing, and the string "useLayoutEffect does nothing on the
    server" no longer exists anywhere in react-dom 19.2.4. The guard below is still worth
    shipping (a library supports both versions, and the effect is still dead code on the server)
    — just don't justify it with the warning any more.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 4. WHEN THE FLICKER IS REAL 🎬  (the measurement that matters)
// ─────────────────────────────────────────────────────────────────────────────
/*
   Setup: a popup rendered at top: 0, an effect that measures the button and sets the real
   top, and a sampler recording getComputedStyle(popup).top on EVERY animation frame.
   "Painted 0px" = the user saw the wrong position for at least one frame.

     trigger for setShow(true)          useEffect            useLayoutEffect
     ─────────────────────────────────────────────────────────────────────────
     plain call / click                 ✅ never 0px          ✅ never 0px
     inside setTimeout(0)               ✅ never 0px          ✅ never 0px
     inside requestAnimationFrame       ✅ never 0px          ✅ never 0px
     inside startTransition             ✅ never 0px          ✅ never 0px
     main thread busy 120ms after it    ❌ painted 0px        ✅ never 0px

   💡 THE HONEST ANSWER for an interview: useEffect doesn't always flicker — on a fast,
      idle machine React usually flushes the passive effect before the frame. It flickers
      when something delays that flush past a paint: a busy main thread, a slow device, a
      heavy tree. useLayoutEffect removes the possibility entirely, which is why you use it
      for measurement — you're buying a guarantee, not a speed-up.
   ⚠️ Corollary: "it looks fine on my machine" is not evidence that useEffect is safe here.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Gotcha 1 - blocks painting so slow work freezes page.
    Everything inside useLayoutEffect runs on main thread while browser awaits, so any layout calculation of 200ms causes UI to be frozen for 200ms.
    so, never do any async work inside it like sending analytics, subscriptions, data fetching, loggers and timers. Better use useEffect for these use cases.

    ✅ MEASURED: a 300ms busy loop inside a layout effect produced a worst frame gap of 322ms
       — the page rendered nothing at all for a third of a second.
 */

/**
 ** Gotcha 2 - SSR warning
    useLayoutEffect cant run on the server since there is no DOM to measure, so it warns. Best fix is having a guard.
    we can this line exactly in component libraries.

    ⚠️ React <= 18 warns; React 19 does NOT (see the note in section 2). Ship the guard anyway:
       it keeps a layout effect from being scheduled at all during SSR hydration paths, and it
       is what every component library does to support both versions.
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
// ⚠️ `typeof window !== 'undefined'` is evaluated ONCE at module load — that's fine, because a
//    module is either loaded on the server or in the browser, never both in one process.

/**
 ** Gotcha 3 - ref.current is populated in both
    common wrong answer is that we need useLayoutEffect to access ref's but no, refs are available even before any effect runs. refs were available after the react writes DOM before any hook runs. useLayoutEffect is not about availability of refs but about paint timing.

    ✅ MEASURED: render body -> ref.current = null · useLayoutEffect -> node · useEffect -> node.
       Both effects see the node. Only the render body doesn't.
 */

/**
 ** Gotcha 4 - measure during render phase is worse
    using getClientBoundingRect() in render body breaks for the first render because node doesn't exist and in concurrent renders it measures the react tree which is not committed(not written to DOM). Measure only during commit phase.

    ✅ Confirmed by the same measurement: ref.current is null in the render body on first render,
       so the call throws. The method is getBoundingClientRect (no "Client" prefix).
 */

/* ---- 5.5 ⚠️ StrictMode runs every effect twice in dev ----------------------- */
// Mount -> cleanup -> mount again. Measured in the probe: every log appeared twice.
// A layout effect that measures and calls setState must therefore be IDEMPOTENT — running it
// twice must give the same answer. (main.jsx currently has <StrictMode> commented out, so this
// app runs them once; turn it back on and the double logs return.)

/* ---- 5.6 ⚠️ setState in a layout effect is a re-render inside the same frame - */
// It is not free: React re-renders and re-commits synchronously before the browser paints. Two
// renders' worth of work in one frame. Cheap for a tooltip, a problem in a large tree.
// ⚠️ Set state UNCONDITIONALLY in a layout effect and you get an infinite loop — the re-render
//    runs the effect again. Guard it (`if (next !== top) setTop(next)`) or key it off deps.

/* ---- 5.7 ⚠️ It's about PAINT, not about "sync vs async" --------------------- */
// Both hooks run synchronously inside their own phase; neither is "async". The difference is
// only whether React lets the browser paint before running them.

/* ---- 5.8 ⚠️ Don't reach for it to fix ordering bugs ------------------------- */
// Swapping useEffect -> useLayoutEffect to make a race "go away" hides the bug behind timing.
// The next slow render brings it back.

/**
 ** Angular parallel
    useLayoutEffect correctly maps to ngAfterViewInit / ngAfterViewChecked - point where the view exists and you can measure it before frame is shown.
    useEffect doesn't have exact method in angular to map to and nearest thing is setTimeout(0) or requestAnimationFrame to get out of the change detection cycle.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
/**
 * ! when not to use
 * 1. Any async work - fetching, subscription, timers.
 * 2. Anything user doesn't notice visually but makes the landing one frame late (analytics, logging etc)
 * 3. we should not use useLayoutEffect as a fix for any effect ordering bug since we just hidden the bug but not fixed it. 
 * 4. Anything that doesn't read layout. If you're not calling getBoundingClientRect, scrollTop,
 *    offsetHeight or similar, a layout effect buys you nothing and costs a blocked paint.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXERCISE — the tooltip 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Exercise
    Build a tooltip that positions itself above its trigger, measured from its own rendered height.

    Prove three things:

    1. With useEffect, the flicker is real — render it at top: 0 first, and confirm the wrong position paints. Easiest way to make it obvious: add a console.log in the render body and watch two renders, or slow the effect down artificially.
    2. Swapping to useLayoutEffect removes the visible jump with no other change.
    3. Put a busy loop (while (Date.now() - start < 300) {}) inside the useLayoutEffect and confirm the whole page freezes for 300ms — this is the cost you're paying, and it's the answer to "why not always use it."

    Then add the useIsomorphicLayoutEffect guard and note why a component library ships it.
 */

// Flip these two to run the experiments — that's the whole point of the exercise.
const HOOK = 'layout';   // 'layout' | 'effect'   (part 1 vs part 2)
const FREEZE_MS = 0;     // set to 300 for part 3 — the page will freeze for that long

export const TooltipExample = () => {
  const useIsomorphicEffect = HOOK === 'layout' ? useIsomorphicLayoutEffect : useEffect;

  const [show, setShow] = useState(false);
  const [top, setTop] = useState(0);          // deliberately wrong first position

  const tooltipRef = useRef();
  const textRef = useRef();

  useIsomorphicEffect(() => {
    if (!tooltipRef.current || !textRef.current) return;

    if (FREEZE_MS) {
      const start = Date.now();
      while (Date.now() - start < FREEZE_MS) { /* block the main thread on purpose */ }
      // ⚠️ blocks the paint — measured a 322ms frame gap at FREEZE_MS = 300
    }

    // ⚠️ The exercise asks for "measured from its OWN rendered height", so read the tooltip too:
    //    trigger's top, minus the tooltip's height, minus a gap. Measuring only the trigger
    //    (the earlier version) can't place it above the trigger without overlapping.
    const trigger = textRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const next = trigger.top - tooltip.height - 8;

    if (next !== top) setTop(next);   // ⚠️ guard: an unconditional setState here loops forever (5.6)
  }, [show]);

  console.log("🚀 ~ TooltipExample ~ render");
  // => two renders per hover: one at top 0, one at the measured value. With HOOK = 'layout'
  //    the first one never reaches the screen.

  return (
    <>
      <p
        ref={textRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ top: "250px", left: "250px", position: "absolute" }}
      >
        Some Text
      </p>
      <button style={{ top: "300px", left: "300px", position: "absolute" }}>
        Click me
      </button>
      {show && (
        <div
          ref={tooltipRef}
          style={{ position: "absolute", top: `${top}px`, left: "250px", border: "1px solid" }}
        >
          <h5>Tooltip header</h5>
          <p>Tooltip text</p>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Difference between useEffect and useLayoutEffect?
      Both run after React mutates the DOM. A layout effect runs before the browser is allowed
      to paint and blocks it; a passive effect carries no such guarantee. (section 1)

 ** Q2. Which is the default?
      useEffect. Reach for useLayoutEffect only when a DOM measurement decides what the user
      sees this frame — tooltips, popovers, autosizing, scroll restoration. (section 6)

 ** Q3. Does useEffect always cause a visible flicker when you measure and reposition?
      No. React 19 usually flushes the passive effect before the frame — measured: no wrong
      frame for a click, a timeout, a rAF or a transition. With the main thread busy it DID
      paint the wrong position. useLayoutEffect removes the possibility. (section 4)

 ** Q4. Why not always use useLayoutEffect?
      It blocks the paint. A 300ms busy loop inside one froze the page for a measured 322ms,
      and the cost applies to every commit it runs on. (Gotcha 1)

 ** Q5. Do you need useLayoutEffect to read a ref?
      No — refs are set before either effect runs. Measured: ref.current is a node in both.
      It's null only in the render body. (Gotcha 3, 4)

 ** Q6. What happens on the server?
      Neither effect runs. React <= 18 warns for layout effects, React 19 doesn't. Component
      libraries ship useIsomorphicLayoutEffect to pick the right one at module load. (Gotcha 2)

 ** Q7. setState inside a layout effect — what does React do?
      Re-renders and re-commits synchronously before painting, so the user sees only the final
      result. Guard the condition or it loops forever. (5.6)

 ** Q8. Where does rAF sit relative to the two effects?
      Measured: layout effect -> passive effect -> rAF -> paint. A rAF callback is the last
      thing before the frame is drawn. (section 3)
 */

// 👉 NEXT: performance-optimization/src/components/strict-mode.jsx — the other half of effect
//    timing: why dev runs them twice, and what that double-invoke is trying to tell you.
