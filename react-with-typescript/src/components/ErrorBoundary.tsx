/* ============================================================================
   ERROR BOUNDARIES — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the outcome BEFORE you click
     `// => X` = measured in real Chrome (headless, puppeteer-core) against this project's
     React 19.2.4, one scenario per page load. Type errors are from
     `npx tsc -p tsconfig.app.json --noEmit`.

   ▶️ npm run dev — uncomment the exercise block in App.tsx.

   CONTENTS
     1. What a boundary is ........ the two methods, and which one is mandatory
     2. What it catches ........... and the rethrow trick for what it doesn't
     3. Gotchas ................... 4 of yours + 4 more ⚠️
     4. Resetting ................. key vs resetKeys, measured
     5. Suspense pairing
     6. When not to use
     7. Exercise
     8. Interview Q&A 🎤

   THE MODEL 🧠
     Since React 16, an uncaught error during React's own work unmounts the whole tree — a
     blank screen, deliberately, because a half-rendered UI is worse than nothing. A boundary
     is a class component that intercepts that error on the way up and swaps the subtree for
     a fallback, so the blast radius stops there.
     It only sees errors thrown inside React's call stack: render, lifecycles, and effects.
     An event handler or a setTimeout callback runs on its own stack — React isn't on it.

   💡 THE ONE-LINER: a boundary is a try/catch for RENDERING. If React wasn't the one calling
      your code, the boundary never sees the error.
   ============================================================================ */

/**
 ** Error Boundary
  * It is a component which catches error thrown while rendering its sub tree and shows the fallback instead of crashing the whole app. It is a class based component, there is no hook for it.
  * It only catches the errors during react's work: render, lifecycle methods and effects. It won't be able to catch errors in event handlers and async code since they run out of react's callstack.
  * Problem - Since React 16, any uncaught error during render will unmount the whole app. one bad field in the widget and react will show a blank screen. react do this deliberately because showing corrupted UI is worse than showing nothing. Boundary contains the blast radius, broken widget above may show like `couldn't load this widget` and rest of the page keeps working.
  * 2 methods needs to implemented for error boundary
    1. getDerivedStateFromError - static method and should be pure, returns {hasError: true} => mandatory for catching errors because in render methods we check the hasError and render the fallback. => render phase
    2. componentDidCatch - lifecycle method, handles side effects, gets the error and errorInfo params. used for logging , analytics etc. => not mandatory to implement. => commit phase
    * Note - If we didn't implement method #1 and did implement method #2, page still crashes.

    ⚠️ That last note needs one correction, measured. With ONLY componentDidCatch:
         - componentDidCatch DOES run (once) — either method makes the class a boundary
         - React logs "will try to recreate this tree from scratch" and RETRIES the render
           (a child that always throws was re-attempted 3 times)
         - having no way to render anything else, React then UNMOUNTS the subtree: the
           boundary's area goes blank, no fallback appears, and a sibling OUTSIDE the boundary
           keeps working
         - window.onerror never fires — React handled it
       So: not an uncaught crash, but a blank subtree, which looks identical to the user if the
       boundary wraps the app. getDerivedStateFromError is what turns "blank" into a fallback.
 */

import React, { useState, type ReactNode } from 'react';

type Props = {
  fallback: React.ReactNode,
  children: React.ReactNode
};

type State = {
  hasError: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE BOUNDARY 🧱
// ─────────────────────────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  // RENDER phase: must be pure, no side effects. This is the one that shows the fallback.
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // COMMIT phase: side effects belong here — logging, analytics, Sentry.
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log("🚀 ~ ErrorBoundary ~ componentDidCatch ~ error:", error);
    console.log("🚀 ~ componentStack:", errorInfo.componentStack);   // ⚠️ was unused: TS6133
    // 💡 errorInfo.componentStack is the "which component" part you send to your logger —
    //    error.stack alone tells you the JS frames, not the React tree.
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
// => MEASURED on a render error: fallback shown ✅, a sibling outside the boundary still alive ✅,
//    window.onerror never fired ✅, and the hooks ran in this order:
//      getDerivedStateFromError -> getDerivedStateFromError -> componentDidCatch
//    (twice, because StrictMode double-invokes the render-phase method — it must be pure.)
// ⚠️ React still console.errors the whole thing in dev ("The above error occurred in the
//    <Buggy> component"). A visible fallback does NOT mean a quiet console.

// ─────────────────────────────────────────────────────────────────────────────
// 2. WHAT IT CATCHES — and the rethrow 🎣
// ─────────────────────────────────────────────────────────────────────────────
/*
     thrown in...                      caught by the boundary?
     ─────────────────────────────────────────────────────────
     render                                   ✅ (measured)
     useEffect / useLayoutEffect body         ✅
     class lifecycles                         ✅
     a state updater fn during re-render      ✅ (measured — that's the trick below)
     an onClick handler                       ❌ (measured: no fallback, component alive)
     setTimeout / promise callback            ❌
     an async function after its first await  ❌
     event handlers in the FALLBACK           ❌ (and see Gotcha 2)
*/

/**
 ** Gotcha 1 - Rethrow pattern for event handlers and async error
    This is the standard way of routing the errors caused in event handlers and async code through state updater functions so that react error boundary will catch it. Catch it yourself and rethrow it in render via state updater fns.
    Generally handle the event handler error locally and use this rethrow approach only when the component genuinely can't continue.
 */

export function SaveButton() {
  const [, setState] = useState();

  const saveApi = async () => {
    try {
      throw new Error('error from save api');
    } catch (e) {
      setState(() => { throw e }); // runs during next render cycle and error will be thrown to error boundary.
    }
  }
  // => MEASURED: fallback appears, componentDidCatch receives the original error ✅
  // 💡 WHY it works: the updater function is called by React, during React's render work — so
  //    the throw happens on React's stack, which is the only place a boundary can see it.

  return <button onClick={saveApi}>Save</button>
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
 ** Gotcha 2 - a boundary can't catch its own errors.
    Error boundary can't catch the errors thrown in its own render method and errors happened in fallback. It reaches to a parent error boundary wrapping around it in the tree, if not the page crashes. keep the fallback dumb.

    ✅ MEASURED with a fallback that throws: the root went EMPTY, the sibling outside the
       boundary died too, and the error escaped to window.onerror ("fallback error").
       That is the real full-page crash — worse than the error you were containing.
    💡 "Keep the fallback dumb" means: static markup, no data access, no optional chaining on
       things that might be missing. Text and a button.
 */

/**
 ** Gotcha 3 - boundary never resets on its own
    once hasError is set to true, there is no way to flip it back to false. If same error boundary is wrapped for 2 routes, error happened in one route will flip hasError to true and shows fallback and when we switch to another route, hasError is still true and fallback is shown for that route as well even though no error is thrown from that route.
    Fix - 
      1. set key prop to location.pathname in error boundary, it resets hasError on route change. It remounts the children. -> wrap only the page content because even if no error is occurred, nodes in sub-tree will still be remounted. => key trick is built into react.
      <ErrorBoundary key={location.pathName} fallback={<Oops />}></ErrorBoundary>
      2. set resetKeys, it takes array of keys if any of the key changes it resets the error boundary. It resets the hasError but doesn't remount the children -> use it for persistent UI. => this is not built into react and resetKeys is a prop exposed by react-error-boundary package.
      <ErrorBoundary resetKeys={[userId]} fallback={<Oops />}></ErrorBoundary>

    ✅ BOTH MEASURED, with a mount counter inside the child (see section 4).
 */

/**
 ** Gotcha 4 - Placement is the actual design decision
    Have one boundary at the app level. Whole app still swap to fallbacks for any error.

    App root -> fallback = something went wrong, reload , why => last line of defense
    Per route -> fallback = page level error but nav still works, why => one broken page doesn't kill navigation
    per risky widget -> fallback = chart unavailable, why => third party libraries may break with invalid so its better to wrap it around with a error boundary.
 */

/* ---- 3.5 ⚠️ getDerivedStateFromError runs twice in dev ---------------------- */
// StrictMode double-invokes render-phase work, and this static method is render phase
// (measured: two calls, one componentDidCatch). So it must be PURE — no logging, no fetch,
// no counters. All of that goes in componentDidCatch.

/* ---- 3.6 ⚠️ There is no hook for this ------------------------------------- */
// No useErrorBoundary. A boundary must be a class, which is the one place modern React still
// requires one — or you use react-error-boundary, which wraps the same class for you and adds
// resetKeys / onReset / a render-prop fallback.

/* ---- 3.7 ⚠️ It does not catch errors during SSR or in the server render ----- */
// On the server, a throw during renderToString rejects the whole render; boundaries apply to
// hydration and client rendering. Next.js gives you error.tsx per segment for the server side.

/* ---- 3.8 ⚠️ React 19 added root-level error handlers ----------------------- */
// createRoot(el, { onUncaughtError, onCaughtError, onRecoverableError }) — onCaughtError fires
// for errors a boundary DID handle, which is the clean place to hook a logger once instead of
// repeating componentDidCatch in every boundary.

/**
 ** Suspense pairing
    When a promisee read with use() rejects it goes to nearest error boundary. If the promise is still in pending phase then it goes to the nearest suspense boundary. so, they were actually placed together.
    General convention - error boundary wraps suspense, same follows in next.js

    ✅ MEASURED with use(): a REJECTED promise rendered the error fallback (suspense fallback
       never appeared); a PENDING promise rendered the suspense fallback (error fallback never
       appeared). Two boundaries, two different states of the same promise.
 */

/**
 ** Angular parallel
    Angular's ErrorHandler is a single global service which catches every error but don't show any scoped fallback. App will still be running with whatever state it is in. react's error boundary works totally opposite, it is scoped to a subtree and can show the scoped fallback but only for error within react's own work.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
/**
 *! When not to use
    1. As a way to handle any expected failures like 404 or any validation error in data, show it as UI state but not as a exception.
    2. Handle event handler errors locally with a try/catch block and an inline message instead of showing a blank screen
    3. Wrapping error boundary to each component. Boundaries at a meaningful seems (route, widget) are enough, finer granularity adds more noise.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXERCISE 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Exercise
    File: 15-error-boundary.tsx · Time box: ~25 minutes

    Write the ErrorBoundary class above, plus a <Buggy> component with three buttons.

    Prove four things:

    1. Render errors are caught. 
        A button sets state that makes Buggy throw during render. The fallback shows, and a sibling component outside the boundary keeps working.
    2. Event-handler errors are not. 
        A button whose onClick throws directly. The fallback does not appear, and the error only hits the console.
    3. The rethrow fixes it. 
        Same handler, now using setState(() => { throw err }). The fallback appears.
    4. The boundary sticks. 
        Add a "Try again" button in the fallback that resets hasError, then confirm that resetting by key from the parent also works.

    ✅ ALL FOUR MEASURED — 1: fallback shown, sibling alive. 2: no fallback, Buggy still alive.
       3: fallback shown. 4: see section 4 below for the key-vs-resetKeys numbers.
 */

type ExerciseProps = { fallback: ReactNode; children: ReactNode; resetKeys: number[] };

export class ExerciseErrorBoundary extends React.Component<
  ExerciseProps,
  { hasError: boolean }
  > {
  state: State = { hasError: false};

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RESETTING — key vs resetKeys 🔄  (uncommented: this is the 4.a answer)
  // ─────────────────────────────────────────────────────────────────────────
  componentDidUpdate(previousProps: ExerciseProps): void {
    // 4. a. If reset keys got changed, reset the error state
    if (this.state.hasError && !this.props.resetKeys.every((item, index) => item === previousProps.resetKeys[index])) {
      this.setState({ hasError: false });
    }
  }
  /*
     MEASURED with a mount counter inside the child:
       crash                  -> fallback shown
       resetKeys changed      -> fallback cleared, child back, mount count UNCHANGED  (state kept)
       key changed (parent)   -> fallback cleared, child back, mount count +1          (remounted)
     ✅ Exactly the distinction in Gotcha 3: resetKeys clears the flag, key rebuilds the subtree.
     ⚠️ `.every` alone is wrong if the array LENGTH changes ([1] vs [1,2] compares equal) —
        compare lengths too, which is what react-error-boundary does.
     ⚠️ Whichever you use, the thing that CAUSED the error must be gone first, or you crash
        straight back into the fallback.
  */

  componentDidCatch(): void {
    // side effects (logging, Sentry) — params omitted here on purpose, they were unused (TS6133)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const ExerciseBuggyComp = () => {
  const [crash, setCrash] = useState(false);
  const [, setState] = useState();
  
  if (crash) throw new Error("render error from button 1"); // 1. render error caught by error boundary


  return (
    <>
      <button
        onClick={() =>
          setCrash(true)
        }
      >
        Button 1
      </button>
      <button
        onClick={() => {
          // throw new Error('error from event handler of button 2'); // 2. uncaught by error boundary and error is visible in browser's console.
          try {
            throw new Error("error from event handler of button 2");
          } catch (e) {
            setState(() => {
              throw e;
            }); // 3. rethrow from try/catch using state updater function. In next render cycle, error is thrown from this component to error boundary. Fallback appears now
          }
        }}
      >
        Button 2
      </button>
      <button>Button 3</button>
    </>
  );
}

// ⚠️ was `({resetErrorCb})` with no type: TS7031, "implicitly has an 'any' type".
export const ExerciseFallbackComp = ({ resetErrorCb }: { resetErrorCb: () => void }) => {
  return (
    <>
      <h2>Couldn't load buggy component</h2>
      <button onClick={resetErrorCb}>Try again</button>
    </>
  );
}
// 💡 Note what this fallback does NOT do: read props from the failed subtree, call a hook that
//    might throw, or render the data that just blew up (Gotcha 2).

export const SiblingComp = () => {
  return (
    <h2>Sibling comp</h2>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What is an error boundary and why is it a class?
      A component that catches errors thrown in its subtree during React's work and renders a
      fallback. It needs getDerivedStateFromError / componentDidCatch, which have no hook
      equivalent — so it must be a class. (sections 1, 3.6)

 ** Q2. Which of the two methods is mandatory?
      getDerivedStateFromError — it's what flips state so render can show the fallback. With
      only componentDidCatch, React catches, retries, then unmounts the subtree: a blank area,
      no fallback. (section 1)

 ** Q3. Why isn't my onClick error caught?
      The handler runs on the browser's stack, not React's. Catch it locally, or rethrow from a
      state updater so the throw happens during React's render. (section 2, Gotcha 1)

 ** Q4. Does it catch errors in useEffect?
      Yes — effects run inside React's work. Async callbacks scheduled BY the effect don't. (section 2)

 ** Q5. What happens if the fallback throws?
      The boundary can't catch itself, so it goes to the parent boundary or crashes the page.
      Measured: root emptied, sibling gone, window.onerror fired. Keep fallbacks dumb. (Gotcha 2)

 ** Q6. How do you recover from an error?
      Nothing resets hasError on its own. Change `key` to rebuild the subtree (child remounts,
      state lost), or compare resetKeys in componentDidUpdate to clear the flag while keeping
      the subtree mounted. Measured both. (section 4)

 ** Q7. How do boundaries interact with Suspense?
      A promise read with use() goes to Suspense while pending and to the error boundary when
      rejected. Convention: boundary outside, Suspense inside. (section 5)

 ** Q8. Where do you put boundaries?
      Root as the last line of defence, per route so navigation survives, and around risky
      widgets. Not around everything. (Gotcha 4, section 6)

 ** Q9. Does a caught error still show in the console?
      Yes, React logs it in dev even with a fallback rendered — and React 19 lets you handle it
      centrally with createRoot's onCaughtError. (sections 1, 3.8)
 */

// 👉 NEXT: sync-external-store.tsx — the other "React can't help you here" API: subscribing to
//    state that lives outside React, where tearing (not throwing) is the failure mode.
