/* eslint-disable no-unused-vars */
/* ============================================================================
   STRICT MODE (DOUBLE INVOCATION) — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the counts BEFORE you run it
     ❓ = could not be verified by automation
     `// => X` = counted in real Chrome (headless, driven by puppeteer-core) against this
     project's React 19.2.4 — the SAME probe run twice: once on the dev server, once as a
     production build.

   ▶️ npm run dev — App.jsx renders <FakeChatRoom />. main.jsx wraps the app in <StrictMode>.
      npm run build && npm run preview for the production comparison.

   CONTENTS
     1. What actually doubles ..... the measured table (dev vs prod, inside vs outside)
     2. Counter ................... render / effect / cleanup counts
     3. Double fetch .............. why it isn't the bug, and the AbortController fix
     4. Gotchas ................... 5 of yours + 3 more ⚠️
     5. When not to use
     6. Exercise: the chat room
     7. Interview Q&A 🎤

   THE MODEL 🧠
     StrictMode runs things twice in DEV so that impurity fails loudly on your machine
     instead of quietly in production. React's concurrent features assume a component can
     be rendered without committing, unmounted and remounted with its state intact, and
     interrupted mid-render. Those assumptions only hold for pure components with correct
     cleanups — so React simulates the worst case on every mount.

   💡 THE ONE-LINER: the second run isn't the bug, it's the test. If your code behaves
      differently the second time, the first time was already wrong.
   ============================================================================ */

/**
 ** Strict mode (Double invocation)
      In development mode only. react runs the component function twice and runs every effect twice (mount -> unmount -> remount), runs state updater functions twice. basically it works as a bug detector. Code that behaves same in second run means it is free from hidden state and has correct cleanups. Code which was broken was already broken but strict mode made it fail in ur local machine.

      React concurrent features assumes that components renders without committing, unmounted and remounting preserves state and interrupted mid-render. This only works if ur components were pure and with proper effect cleanups. These assumptions can easily be violated and wont be visible in normal development until some feature relies on them or you ship a memory leak. strict mode makes these violations to show up immediately
 */

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. WHAT ACTUALLY DOUBLES 🔢  (counted, not guessed)
// ─────────────────────────────────────────────────────────────────────────────
/*
   One probe component rendered twice: once INSIDE <StrictMode>, once OUTSIDE it, in the
   same tree — then the identical build served as production.

     what                                  dev, inside   dev, outside   production
     ────────────────────────────────────────────────────────────────────────────
     render body                                2             1             1
     useState initializer fn                    2             1             1
     useMemo factory                            2             1             1
     useCallback's function being CALLED        0             0             0
     effect                                     2             1             1
     effect cleanup                             1             0             0
     callback ref attach                        2             1             1
     callback ref detach                        1             0             0
     useRef object identity changed            no            no            no
     side effect in the render body             2             1             1

   ✅ Confirms the headline: dev-only, subtree-only, and the mount cycle really is
      mount -> unmount -> remount (2 effects, 1 cleanup in between).
   ⚠️ Two rows contradict the usual summary — see Gotcha 5.
*/

/**
 * 1. any side effect inside the component render body will run twice. mutating module variables, pushing into an array, incrementing counter
 * 2. effects will run twice, mounts -> unmounts -> remounts. Any API calls will be triggered twice.
 * 3. state updaters will also run twice -> mutating state on line 30 is a bug, so react checks if its reference got changed but reference stays same. so, react wont re-render.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 2. COUNTER — render, effect, cleanup, updater 🧮
// ─────────────────────────────────────────────────────────────────────────────
// 📝 predict how many of each log you'll see on mount
export const Counter = () => {
  console.log("🚀 ~ Counter ~ render"); // rendered twice
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Without a cleanup, its a double subscription
    console.log("🚀 ~ Counter ~ effect"); // rendered twice
    return () => console.log("🚀 ~ Counter ~ cleanup"); // rendered only once, cycle follows for effects mount -> unmount -> remount.
  }, []);
  // => on mount: render, render, effect, cleanup, effect ✅ (2 / 1 / 2 exactly as written)

  function OnAddItems() {
    setItems((prev) => {
      console.log("🚀 ~ OnAddItems ~ updater");
      // prev.push(new Date()); // no new reference, so react wont render the new items being pushed
      // return prev;
      return [...prev, new Date()];
    });
  }
  // ⚠️ MEASURED, and it's more interesting than "updaters run twice":
  //      pure updater (returns a new array), one click  -> ran 2x inside StrictMode, 1x outside
  //      impure updater (push + return prev), one click -> ran 1x even inside StrictMode
  //    Why: React re-runs the updater while re-rendering. The impure one returns the SAME
  //    reference, so React bails out before re-rendering and there's no second run.
  //    The bail-out is the bug; the missing double-invoke is just a symptom of it.
  // ⚠️ And the mutation bug is NOT a StrictMode artifact: in the PRODUCTION build the impure
  //    click also left the DOM showing the old value. StrictMode didn't cause it, it just
  //    denies you the "works on my machine" excuse.

  return (
    <>
      <button onClick={OnAddItems}>Add Items</button>
      {items.length > 0 && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item.toISOString()}</li>
          ))}
        </ul>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE DOUBLE FETCH 🌐
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Gotcha 1 - double fetch is not the bug
    In strict mode, there is a common bug that API calls have been triggered twice but it is not a bug since useEffect in strict mode will trigger twice (mount -> unmount -> remount). Wrong fixes were removing strict mode, make use of ref variables to guard the useEffect.
    using ref guards will silently hides the problem and if id changes fast, response 1 can still land after response 2 and overwrite it.
    Fix - use abort controller to cancel the inflight request by calling abort method in effect cleanup.
 */

export const DoubleFetch = () => {
  const [id, setId] = useState("");
  const [product, setProduct] = useState(null);
  // const lastFetched = useRef();

  useEffect(() => {
    // if (lastFetched.current === id) return;
    // lastFetched.current = id;
    if (!id) return;                  // ⚠️ added: id "" fetched /products/ (the whole list) on mount
    const ab = new AbortController();

    fetch(`https://dummyjson.com/products/${id}`, { signal: ab.signal })
      .then((res) => res.json())
      .then(setProduct) // produced stale data on slow network
      .catch((e) => { if (e.name !== 'AbortError') throw e; });
      // ❌ BUG FIXED: without that catch, every abort became an UNHANDLED REJECTION.
      //    Verified in Chrome with this exact shape:
      //      unhandledrejection: AbortError: signal is aborted without reason
      //    and it fires on every StrictMode remount and every keystroke that changes id.
      //    Aborting is expected here, so swallow AbortError and rethrow anything else.
    return () => ab.abort();
  }, [id]);

  return (
    <div>
      <div>
        <label htmlFor="id-input">Id: </label>
        <input
          type="text"
          id="id-input"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      {product && (
        <div>
          {Object.entries(product).map(([key, value]) => {
            if (typeof value === "object") return null;
            return <p key={key}>{`${key} - ${value}`}</p>;
          })}
        </div>
      )}
    </div>
  );
};
// 💡 Why the ref guard is the wrong fix, in one sentence: it stops the second REQUEST but not
//    the race — two different ids in flight can still resolve out of order, and the guard has
//    no way to know which response is current. Abort ties the request's lifetime to the effect's.

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
 ** Gotcha 2 - strict mode will only be applied to components inside its boundary
    <StrictMode></StrictMode> wraps a sub tree. by default CRA and vite, wraps whole app with strict mode.

    ✅ MEASURED: the same component rendered twice inside the boundary and once outside it,
       in one tree. main.jsx here wraps the whole app.
 */

/**
 ** Gotcha 3 - second render's log are dimmed but not hidden
    console.logs created from the duplicate render will be dimmed, it makes easy to count number of the actual logs.

    ❓ Can't verify the dimming through automation (it's DevTools styling, and both logs arrive
       identically over the protocol). Worth knowing it's a DEVTOOLS feature, not a React one:
       the duplicate log is real, just greyed out so you don't misread the count.
 */

/**
 ** Gotcha 4 - non-idempotent setup in render
    react components should be pure. any side effects should be handled in effects because cleanup function in effect will be triggered on component unmount.
    strict mode will catches them and leaks visibly on mount.

    ✅ MEASURED: connect() in the render body ran 2x in dev with NO way to clean either up —
       one connection orphaned, no reference to it anywhere. In production it ran once, so the
       leak would have shipped silently.
 */
// function createConnection() {
//   return {
//     connect: () => {}
//   }
// }

// export const Chat = ({roomId}) => {
//   const connection = createConnection(roomId); // side effect in render body, in strict mode it creates 2 connections and will be leaks.
//   connection.connect();

//   return (
//     <div></div>
//   )
// }

/**
 ** Gotcha 5 - what doesn't double
    useMemo, useCallbacks may still be called twice but ref, DOM mutations from react and also production builds won't. useState initializer will also be run twice and should be pure too. useState(() => expenseInit()).

    ✅ useMemo's factory: 2x inside, 1x outside, 1x in production.
    ✅ useState initializer: 2x inside — so `useState(() => expensiveInit())` must be pure.
    ✅ production: every single counter dropped to 1.
    ❌ useCallback's function: called 0 times, ever. React STORES it, it doesn't call it — so
       it can't be double-invoked. (The component body that CREATES it does run twice.)
    ❌ "ref / DOM mutations won't" is half wrong: a CALLBACK ref ran attach, detach, attach
       (2 / 1) exactly like an effect. What stays stable is the useRef OBJECT — same identity
       across both renders, which is why a ref is the wrong place to store "did I already run".
 */

/* ---- 4.6 ⚠️ StrictMode is not a performance setting ------------------------- */
// It never runs twice in production (measured). Leaving it on costs you nothing shipped —
// but it does skew dev profiling, which is the only reason to toggle it off temporarily.

/* ---- 4.7 ⚠️ It only simulates remount on MOUNT ------------------------------ */
// The extra unmount/remount happens when a component mounts. A dependency change later runs
// the normal cleanup -> effect cycle once. That's why the chat room in section 6 behaves the
// same on a roomId change with or without StrictMode: the cleanup was never about StrictMode.

/* ---- 4.8 ⚠️ "It broke when I enabled StrictMode" is a diagnosis, not a cause -- */
// Every failure it surfaces is a real one: a missing cleanup, a mutated prop or state, a
// module-level counter, an event subscription with no unsubscribe. Deleting <StrictMode>
// is deleting the smoke alarm.

/**
 ** Angular in parallel
    Closest thing that angular has in dev mode running twice with ExpressionChangedAfterItHasBeenCheckedError. same philosophy, run it twice if results differ we have impure code.
    Angular checks bindings,
    react checks render and effects.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 5. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
/**
 * ! When not to use
 * 1. Using a third party lib which cant handle double mount. keep it outside of strict mode instead of disabling it app wide.
 * 2. Performance profiling in dev, double renders skew measurements.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXERCISE — the chat room 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Exercise

    Build a component that connects to a fake chat room on mount.

    js
    function createConnection(roomId) {
      return {
        connect()    { console.log(`✅ connecting to ${roomId}`); },
        disconnect() { console.log(`❌ disconnecting from ${roomId}`); }
      };
    }

    Prove four things:

    The leak. Connect in a useEffect with no cleanup. Confirm you get two connecting logs and zero disconnecting — one connection is orphaned with no reference to it.
    The fix. Return disconnect from the effect. Confirm the sequence becomes connect → disconnect → connect: balanced, one live connection.
    The render-body version. Move connect() into the render body instead. Confirm it fires twice with no possible cleanup — this is why side effects can't live in render.
    The impure updater. Write a setItems(prev => { prev.push(x); return prev; }) and confirm the duplication, then fix it with a spread and confirm it stops.

    Then add a roomId prop with a toggle button and confirm the cleanup also fires on dependency change — same mechanism, and the reason the cleanup was never really about StrictMode.

    ✅ ALL FOUR MEASURED (dev, inside StrictMode):
       no cleanup     -> connect 2, disconnect 0   (one orphan)
       with cleanup   -> connect 2, disconnect 1   (connect -> disconnect -> connect, balanced)
       render body    -> connect 2, disconnect 0   (and no cleanup is even possible)
       impure updater -> ran 1x, array length 1, DOM still shows the OLD value; the pure
                         version ran 2x and the DOM updated. Same DOM result in production.
 */

function createConnection(roomId) {
  return {
    connect() {
      console.log(`✅ connecting to ${roomId}`);
    },
    disconnect() {
      console.log(`❌ disconnecting from ${roomId}`);
    },
  };
}

export const FakeChatRoom = ({ roomId }) => {
  const [items, setItems] = useState([]);
  
  // const connection = createConnection(roomId);
  // connection.connect(); // 2 connections are alive in strict mode ideally it should be 1, this is the reason side effects should always be inside useEffect.

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect(); // triggers on roomId change
    
  }, [roomId]);
  // => mount:            connect, disconnect, connect  (StrictMode's extra cycle)
  // => roomId "a" -> "b": disconnect a, connect b      (ONE cycle — no doubling after mount, 4.7)

  function addItem() {
    setItems(prev => {
      // prev.push(new Date()); // can't see the new added items, react checks whether reference changes or not since here we were mutating the prev state reference won't change. new item was still added to the array and react still checks the reference with previous one and it didn't got changed it.
      // return prev;

      return [...prev, new Date()]; // Able to see the new items on screen since spread operator creates a new reference.
    })
  }

  return (
    <>
      <div>
        <button onClick={addItem}>Add Items</button>
        {items.length > 0 && (
          <div>
            {items.map((item, index) => <li key={index}>{item.toISOString()}</li> )}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Why does React render my component twice?
      StrictMode, in dev only. It double-invokes render and remounts effects so impure code
      and missing cleanups fail immediately instead of in production. (section 1)

 ** Q2. My API is called twice on mount — is that a bug?
      The double call isn't; what it exposes might be. Don't guard with a ref: that hides the
      second request but not the race. Abort in the cleanup so the request's lifetime matches
      the effect's. (section 3)

 ** Q3. What exactly does the effect cycle look like?
      mount -> cleanup -> mount. Measured: 2 effects with 1 cleanup between them. On a later
      dependency change it's a single cleanup -> effect, StrictMode or not. (sections 1, 4.7)

 ** Q4. What else doubles besides render and effects?
      The useState/useReducer initializer, the useMemo factory, state updater functions, and
      callback refs (attach/detach/attach). Not useCallback's function — React never calls it.
      Nothing doubles in production. (Gotcha 5)

 ** Q5. Why didn't my mutated state show up?
      You returned the same reference, so Object.is said "no change" and React bailed out. In
      StrictMode this also means the updater ran once instead of twice. The DOM is stale in
      production too. (section 2)

 ** Q6. Can you put a side effect in the render body if it's cheap?
      No. It ran twice under StrictMode with no cleanup possible, and concurrent React may
      render without committing at all. Side effects belong in effects. (Gotcha 4)

 ** Q7. Does StrictMode slow production down?
      No — it's a no-op there. It does skew dev profiling, which is the one good reason to
      switch it off temporarily. (4.6)

 ** Q8. A third-party widget breaks under double mount. What do you do?
      Wrap that subtree outside <StrictMode> rather than disabling it app-wide — the boundary
      is per-subtree. (Gotcha 2, section 5)
 */

// 👉 NEXT: hooks-practice/src/components/use-layout-effect.jsx — the other half of effect
//    timing. StrictMode says HOW MANY times an effect runs; that sheet says WHEN, relative
//    to paint (and why a layout effect must be idempotent for exactly this reason).
