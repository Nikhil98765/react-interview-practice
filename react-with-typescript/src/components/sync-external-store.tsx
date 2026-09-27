/* ============================================================================
   useSyncExternalStore — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you click
     `// => X` = measured in real Chrome (headless, puppeteer-core) on React 19.2.4, plus
     node checks for the SSR path (react-dom/server) and for zustand 5.0.15.

   ▶️ npm run dev — pick a demo from the switcher in App.tsx.

   CONTENTS
     1. The problem ............... the gap and tearing that useState + useEffect can't fix
     2. The hook .................. subscribe / getSnapshot / getServerSnapshot
     3. Gotchas ................... 4 of yours + 3 more ⚠️
     4. Mini store ................ selectors, and why mutation breaks everything
     5. When not to use
     6. Exercise
     7. Interview Q&A 🎤

   THE MODEL 🧠
     React owns its own state, so it can guarantee every component in one render sees the
     same value. External state — navigator.onLine, a module object, a Redux/zustand store —
     changes behind React's back, and a concurrent render can be paused in the middle. Read
     it with useState + useEffect and two components can render two different values from the
     same source. That's TEARING.
     The hook fixes it by making React the one who reads: you hand it subscribe (how to hear
     about changes) and getSnapshot (how to read the value now), and React re-reads at commit.
     If the value moved mid-render, it throws that render away and redoes it synchronously —
     the "sync" in the name.

   💡 THE ONE-LINER: useState+useEffect COPIES external state into React (and the copy can
      go stale or disagree); useSyncExternalStore lets React READ it, so it can't tear.
   ============================================================================ */

/**
 ** useSyncExternalStore
    It is a react hook. It is the correct way to read the data which outside of react: browser API, a third party store, a module level object. 2 functions needs to be provided, subscribe and getSnapshot, and react keeps the component in sync with store.
    The more traditional way of handling external data is to use useState + useEffect, it can show diff values in diff components between single concurrent render. That inconsistency is called tearing. 
    Zustand, Redux internally uses it.
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
      subscribe => starts listening, calls callback and returns an unsubscribe (cleanup function)
      getSnapshot => function which returns the current value, same reference if nothing changed.
      getServerSnapshot => function which returns the current value used in SSR. since useEffect doesn't run in SSR, this will be useful.
 */

import { useSyncExternalStore } from "react";
// (useState/useEffect were imported for the commented-out "flawed" version below — the hook
//  replaces both, so they are no longer needed.)

// ─────────────────────────────────────────────────────────────────────────────
// 1-2. THE PROBLEM, AND THE HOOK 🔌
// ─────────────────────────────────────────────────────────────────────────────
export const SyncExternalStore = () => {
  /**
   * 2 flaws
   *   1. Gap -  If state got changed in external store between render and effect subscribing, change is missed until next event.
   *   2. Tearing - React renders a subtree and pauses it for some other work and in the meantime external state got changed and react continues where it left off. The remaining components which gets rendered after pause will see a different value than the old components which were rendered before pause. Like header shows 3 but list has 4. React's owned state wont tear because it controls the changes.
   */
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   const updateOnline = () => setIsOnline(navigator.onLine)

  //   window.addEventListener("online", updateOnline);
  //   window.addEventListener("offline", updateOnline);

  //   return () => {
  //     window.removeEventListener("online", updateOnline);
  //     window.removeEventListener("offline", updateOnline);
  //   };
  // }, []);
  const isOnline = useSyncExternalStore(subscribe,
    () => navigator.onLine, // client snapshot — a BOOLEAN, so Object.is can compare it (Gotcha 1)
    () => true // server snapshot
  );
  // ⚠️ `subscribe` is declared at module level on purpose: a new function identity on every
  //    render makes React unsubscribe and resubscribe every time (measured in Gotcha 2).
  // ⚠️ The server snapshot here says `true` while the client may say false — that is a
  //    hydration mismatch by construction. Pick the value the server would have rendered.

  return (
    <div>
      <p style={{color: `${isOnline ? 'green' : 'red'}`}}>{ isOnline ? 'Online' : 'Offline'}</p>
    </div>
  )
}

function subscribe(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
}
/**
 ** Note - How react prevents tearing  ✅ (this is also why the hook can't be deferred — Gotcha 4)
    react checks the current value during render as well as during commit phase. If value got changed between render and commit, then react throws away the render part and re-renders synchronously in order to get the same value in the whole tree. Thats the why the name sync used in hook name.
 */

/**
 ** Gotcha 1 - getSnapshot returns new object is an infinite loop
    if new object is returned from getSnapshot will leads to infinite re-renders. React warns in dev that snapshot should be cached. This is the reason why zustand ships useShallow for selectors which returns objects.
 */

// ⚠️ MOUNT THIS ONLY ON PURPOSE — it locks the tab. It exists so the counter-example is real
//    code you can run, not just a comment.
export const BadSnapshotDemo = () => {
  const snap = useSyncExternalStore(
    subscribe,
    () => ({ online: navigator.onLine }),   // ❌ a NEW object every call
  );
  // each time snapshot returns a new object, behind the scenes react checks with Object.is and
  // same object is returned with new reference every time and it causes infinite re-renders.
  return <p>{String(snap.online)}</p>;
};
// ✅ return primitive or a reference the store only replaces on real change.
// => MEASURED with exactly this snapshot, React 19.2.4 logs both of these:
//      "The result of getSnapshot should be cached to avoid an infinite loop"      (dev warning)
//      "Maximum update depth exceeded..."                                          (thrown)
// 💡 WHY: React compares snapshots with Object.is. A fresh object is never Object.is-equal to
//    the previous one, so React concludes the store changed, re-renders, reads again... forever.

/**
 ** Gotcha 2 - inline subscribe resubscribes on every render
    same identity problem, on each render inline subscribe is unsubscribe + subscribe. declare it outside of the component or use useCallback
 */
// const value = useSyncExternalStore(() => { }, () => false);
// => MEASURED with an inline `(cb) => store.subscribe(cb)`: after mount { sub: 1, unsub: 0 };
//    after ONE unrelated re-render { sub: 2, unsub: 1 } ✅ it really does tear down and re-add.
// ⚠️ Worse than wasted work for real sources: a resubscribe window can DROP an event that
//    fires between the unsubscribe and the new subscribe.


/**
 ** Gotcha 3 - no getServerSnapshot, no SSR
    On server there is no window object, react needs a snapshot value to render thats when getServerSnapshot is called without it component render fails in server. It also should match what client renders during hydration or else we get a hydration mismatch.

    ✅ MEASURED with react-dom/server renderToString:
         no getServerSnapshot   -> ❌ Error: "Missing getServerSnapshot, which is required for
                                    server-rendered content. Will revert to client rendering."
         with getServerSnapshot -> renders fine (<p>false</p>)
 */

/**
 ** Gotcha 4 - Its opt out of transitions
    when external store updates re-renders will always be synchronous, deferring them to startTransition wont make them unblocking. For expensive trees driven by store, derive or use memoise below the hook.

    ✅ MEASURED with useTransition + a 150ms-per-child tree, logging every render:
         startTransition(store.bump)      -> first render already shows store=1   (NOT deferred)
         startTransition(setLocalState)   -> first render still shows local=0, the new value
                                             only appears in the later, low-priority render
       So a store update is treated as urgent even inside a transition, exactly as you wrote.
    💡 It follows from the tearing guarantee: React cannot show a half-updated external value,
       so it can't spread that update across two commits.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 4. MINI STORE — selectors and mutation 🏪
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Mini Store
    2 things to say it in interview
      1. selectors give granular re-renders: Below example reads the count prop from state but if name changes it doesn't cause re-render since react checks snapshot value by Object.is with previous one. Context can't do this and re-renders consumers on every change.
      2. consumers always needs to return new reference in setState, if not Object.is check fails and sees old reference which don't cause re-render. If selector return value is of primitive then mutating will work, but if return value is reference type then it won't. So, its always best to return a new reference type no matter what return type selector has.

    ** Note - For libraries like zustand primitive return type in selectors still breaks. Object.is check is done after new state got returned and if returned state has new reference, then only listeners will be notified.

    ✅ BOTH POINTS MEASURED.
       1. granularity: with three components selecting name / count / whole state, an immutable
          count++ re-rendered the count and whole-state components and NOT the name one.
       2. mutation: `setState(p => { p.count++; return p })` on THIS hand-rolled store ->
            component selecting s.count      -> re-rendered, DOM showed 2
            component selecting s (whole)    -> did NOT re-render, DOM still showed 1
          ⚠️ Read that again: the same store rendered 2 in one component and 1 in another, at
             the same time. Mutation doesn't merely "fail to update" — it TEARS the UI, which
             is the exact failure this hook exists to prevent.
       3. zustand 5.0.15 (node, vanilla store): an immutable update fired the listener once;
          `setState(s => { s.count++; return s })` fired it ZERO times, while getState().count
          had really become 2. Your note is right — zustand's Object.is check means a mutating
          update notifies nobody, so not even a primitive selector recovers.
    💡 The one-liner: this hook is only as correct as your store's immutability.
*/
type Listener = () => void;

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  
  return {
    getState: () => state,
    setState: (next: T | ((prev: T) => T)) => { 
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      listeners.forEach(l => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    }
  };
}

/**
 * selector = (s: State) => s.value;
 */
function useStore<T, S>(store: ReturnType<typeof createStore<T>>,  selector: ((s: T) => S)) {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}

const miniStore = createStore({ name: "Nikhil", count: 0 });

export function TestMiniStore() {

  const state = useStore(
    miniStore,
    (state) => state,
  );

  return (
    <>
      <h3>Name: Nikhil</h3>
      <p>Count: {state.count}</p>
      <button onClick={() => miniStore.setState(c => ({...c, count: c.count + 1}))}>Increase Count</button>
    </>
  )
}

/**
 ** Angular Parallel
    toSignal(observable$) bridges the external data source to framework's reactivity. Both connect to external data sources and components will be updated when it changes.

    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    subscribe === observable.subscribe
    getSnapshot === behavioral subject's value
    return value of the hook === the signal

    There won't be case of tearing in angular since change detection for a render start to finish without pausing but react can pause in mid-render. 
 */

/**
 *! When not to use
    1. for state own by react: useState, context and useReducer
    2. for data fetching: use Tanstack query or use(),not a subscription.
    3. when app code is already wrapped by library. Use zustand hook instead of hand rolled one.
 */

/**
 ** Exercise

      No tearing demo. It's timing-dependent, so per our agreement it stays explained, not built.

      Prove four things:

      1. Browser API. Write useOnlineStatus with the hook. Toggle DevTools → Network → Offline and confirm the UI flips both ways.
      2. The infinite loop. Change getSnapshot to return { online: navigator.onLine }. Confirm the dev warning and the loop, then revert.
      3. The mini store. Build createStore and useStore(store, selector). Render two components, one selecting count and one selecting name, each with a console.log in its body. Click "increment" and confirm only the count component logs.
      4. Mutation breaks it. Change setState to mutate (state.count++) and confirm nothing re-renders, then restore the immutable version.

      ✅ ALL FOUR MEASURED:
         1. the hook flips both ways with the online/offline events (subscribe is module-level).
         2. the object snapshot produced the cache warning AND "Maximum update depth exceeded".
         3. only the count component logged on increment; the name component stayed silent.
         4. mutation: the primitive selector still updated, the whole-state selector froze —
            see the tearing note in section 4.
*/

// 1. Browser API
function subscribeOnlineStatus(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);

  return () => {
      window.removeEventListener("online", cb);
      window.removeEventListener("offline", cb);
  }
}

function useOnlineStatus() {
  // 2. The infinite loop.
  /** 
   * Errors in browser console
      1. installHook.js:1 The result of getSnapshot should be cached to avoid an infinite loop
      2. react-dom_client.js?v=d212374f:3524 Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.

   */
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    // () => ({ online: navigator.onLine }),
    // () => ({ online: false }),
    () => navigator.onLine,
    () => false
  );

  return isOnline;
}

export function TestExerciseComponent() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <p style={{color: `${isOnline ? 'green': 'red'}`}}>{isOnline ? 'online': 'offline' }</p>
    </div>
  )
}     

// 3.Mini store
/**
 * Output in browser console
       sync-external-store.tsx:245 🚀 ~ StoreTestCountComponent ~ count: 1
      installHook.js:1 🚀 ~ StoreTestCountComponent ~ count: 1
      sync-external-store.tsx:245 🚀 ~ StoreTestCountComponent ~ count: 2
      installHook.js:1 🚀 ~ StoreTestCountComponent ~ count: 2
 */
function createMiniStore<T>(initial : T) {
  let state = initial;
  const listeners = new Set<Listener>();

  return ({
    getState: () => state,
    setState: (updater: T | ((prev: T) => T)) => { 
      state = typeof updater === 'function' ? (updater as (prev: T) => T)(state) : updater; // This is why client should return new reference.
      listeners.forEach(l => l()); // notify listeners, in this case it will react notifier callback which sends through useSyncExternalStore hook.
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    }
  });
}

function useMiniStore<T, S>(store: ReturnType<typeof createMiniStore<T>>, selector: (state: T) => S) {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()))
}

const store = createMiniStore({ name: 'Nikhil', count: 0 });

export function StoreTestNameComponent() {
  const name = useMiniStore(store, state => state.name);
  console.log("🚀 ~ StoreTestNameComponent ~ name:", name)
  
  return (
    <div>
      <h3>Name: {name}</h3>
    </div>
  )
}

export function StoreTestCountComponent() {
  // 4. Mutation breaks it, if we have the selector return type to be primitive, re-render still happen because object.is comparison will see new value of count. Changed to have return type as reference (whole state), react sees same reference even though count got changed. so, no re-renders.
  // const state = useMiniStore(store, s => s);
  const count = useMiniStore(store, s => s.count);
  console.log("🚀 ~ StoreTestCountComponent ~ count:", count)

  function handleCounter() {
    store.setState(prev => ({ ...prev, count: prev.count + 1 }));
    // store.setState(prev => {
    //   prev.count++;
    //   return prev;
    // })
  }

  return (
    <div>
      {/* <p>count: {state.count}</p> */}
      <p>count: {count}</p>
      <button onClick={handleCounter}>Increment counter</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What problem does useSyncExternalStore solve?
      Reading state React doesn't own without tearing. useState + useEffect copies the value,
      so a change between render and subscribe is missed, and a paused concurrent render can
      show two different values in one tree. (section 1)

 ** Q2. What is tearing, exactly?
      Two components in the SAME commit showing different values for one source. Measured live
      with a mutating store: one component showed 2 while its sibling showed 1. (section 4)

 ** Q3. What are the three arguments?
      subscribe(cb) -> returns an unsubscribe; getSnapshot() -> the current value, stable by
      Object.is when nothing changed; getServerSnapshot() -> the value during SSR. (section 2)

 ** Q4. Why does my app freeze in an infinite loop?
      getSnapshot returns a new object each call, so Object.is always says "changed". Measured:
      the cache warning plus "Maximum update depth exceeded". Return a primitive, or a
      reference the store only replaces on real change (that's what useShallow is for). (Gotcha 1)

 ** Q5. Why must subscribe be stable?
      A new identity per render makes React unsubscribe and resubscribe — measured sub 1 -> 2,
      unsub 0 -> 1 after one unrelated re-render, and events can be lost in that window. (Gotcha 2)

 ** Q6. What happens on the server without getServerSnapshot?
      renderToString throws "Missing getServerSnapshot, which is required for server-rendered
      content". And the value must match what the client renders first, or you get a hydration
      mismatch. (Gotcha 3)

 ** Q7. Can you make a store update non-urgent with startTransition?
      No. Measured: the store's new value appeared in the very first render after the
      transition, while a useState update rendered the old value first. Deferring would mean
      showing a half-updated external value, which breaks the tearing guarantee. (Gotcha 4)

 ** Q8. How do selectors beat Context?
      React compares the SELECTED value, so a component reading `name` doesn't re-render when
      `count` changes — measured. A Context re-renders every consumer on any change. (section 4)

 ** Q9. When would you not use it?
      For React-owned state (useState/useReducer/Context), and for data fetching — that's
      TanStack Query or use(), not a subscription. (section 5)
 */

// 👉 NEXT: this is the last sheet in this project. The closest relatives elsewhere in the repo
//    are hooks-practice/src/components/use-layout-effect.jsx (the other timing-sensitive hook)
//    and advanced-js-practice/src/deep-clone.js section 5.1, which is the same immutability rule
//    that makes selectors work.
