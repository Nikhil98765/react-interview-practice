/* ============================================================================
   CONCURRENCY LIMITER — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you uncomment it
     `// => X` = actual output from node v22 (ESM, top-level await). Timings ±5ms.

   ▶️ Demos are commented out. Uncomment a block and run: node src/concurrency-limiter.js

   CONTENTS
     1. The problem ............. serial (limit 1) vs Promise.all (no limit)
     2. Chunking ................ the tempting middle ground, and why it's slow
     3. Pool pattern ............ N runners pulling from one shared index
     4. pLimit .................. one closure per task, a shared slot counter
     5. Pool vs pLimit .......... when to reach for which
     6. Gotchas ................. 9 of them ⚠️
     7. Interview Q&A 🎤

   THE MODEL 🧠
     A promise starts running when it's CREATED. Promise.all starts nothing and limits
     nothing, it just waits. So to limit, control CREATION: pass functions (thunks) and
     let the limiter decide when to call each one.
       "At most N started-but-not-settled. When one settles, start the next."

   💡 THE ONE-LINER: Promise.all is a waiter, not a scheduler. Pass functions, not promises.
   ============================================================================ */

/*
  * Concurrency limiter - runs a list of async tasks so that at most N are in flight at once, starting next one only when a slot is frees up. This requires in Promise.all because all promises inside it will be running in parallel and might hit the rate limit of an API or might crash the server. With concurrency limiter, we can limit how many promises can be inflight at a time. Promise.all is not a scheduler but a waiter.

     Trick - instead of having promises inside Promise.all have a function which returns promises
*/

// Helpers
const ids = [1, 2, 3, 4, 5];
const results = [];
const fetchOne = (id) =>
  new Promise((res) => setTimeout(() => res({ id, name: `The ${id} id` }), id*10)); // id 1 = 10ms … id 5 = 50ms
const sleep = (ms) => new Promise(res => setTimeout(() => res(''), ms));

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE PROBLEM — the two extremes 🎚️
// ─────────────────────────────────────────────────────────────────────────────

// Method 1 - run in serial, concurrency - 1
// const start1 = performance.now();
// for (const id of ids) {
//   results.push(await fetchOne(id)); // one at a time
// }
// const end1 = performance.now();
// console.log(`🚀 ~ time taken for sequential: ${end1 - start1}`);   // => ~156ms (SUM: 10+20+30+40+50)

// Method 2 - Promise.all => faster, no limit on how many can run in parallel
// const start2 = performance.now();
// const p = await Promise.all(ids.map(fetchOne)); // parallel, concurrency - N. This might hit rate limit of an API or make the server crash if it is implemented in Node JS code.
// const end2 = performance.now();
// console.log(`🚀 ~ time taken for parallel: ${end2 - start2}`);     // => ~52ms (MAX: slowest one)
// ⚠️ `ids.map(fetchOne)` starts all 5, not Promise.all. Fine for 5, a self-DoS for 5,000 (§6.1).

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHUNKING — the tempting middle ground 🧱
// ─────────────────────────────────────────────────────────────────────────────
// Middle ground - slice the items and use Promise.all => will be slow because chunk waits for the slowest one to complete and others needs to sit idle.
async function mapChunked(items, limit, worker) {
  const results = [];

  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    results.push(...await Promise.all(chunk.map(worker))); // ✅ order kept
  }
  return results;
}
// const start3 = performance.now();
// const chunked = await mapChunked(ids, 2, async (n) => {
//   await sleep(n * 10);
//   return n * 2;
// })
// const end3 = performance.now();
// console.log(`🚀 ~ time taken for middle ground(chunks): ${end3 - start3}`, chunked);
//   // => ~114ms, [2, 4, 6, 8, 10]. Chunks [1,2] [3,4] [5] -> 20 + 40 + 50 = 110.
//   //    The slot that finished 3 sits idle 10ms waiting on 4. The pool fixes that.
// ❌ limit 0 or -1 freezes the process (§6.6).

// ─────────────────────────────────────────────────────────────────────────────
// 3. APPROACH 1 — POOL PATTERN 🏊  (limit RUNNERS, each pulls the next index)
// ─────────────────────────────────────────────────────────────────────────────
/*
   `limit` runner loops share one index. Each claims the next item, awaits it, loops.
   No batches: a runner that finishes early grabs the next item right away.

     t=0   A takes 1 (10ms)   B takes 2 (20ms)
     t=10  A takes 3 (→ 40)
     t=20  B takes 4 (→ 60)
     t=40  A takes 5 (→ 90)
     t=60  B exits.   t=90  A exits.   total ≈ 90ms
*/
async function asyncPool(items, limit, worker) {
  if (!(Number.isInteger(limit) && limit > 0)) throw new TypeError('limit must be a positive integer'); // ⚠️ §6.6

  const result = new Array(items.length); // pre-allocate.
  let i = 0; // state shared between runners
  let abort = false;

  const asyncRunner = async () => {
    while (i < items.length && !abort) {
      const index = i;
      i++; // increment is safe, because i is in parent scope of runner and shared by all runners. before await everything runs synchronous and doesn't run into any race condition.
      // ✅ Precisely: read + bump happen in one sync step. An await between them = duplicates (§6.5).
      // * Gotcha 2 - If worker rejects it, Promise.all will reject right away but other workers will still be running even though Promise.all is rejected.
      //   ✅ No abort flag, item 1 fails at 10ms: rejects at ~12ms with [1, 2] started, yet
      //      3, 4, 5, 6 all start later anyway.
      /**
       * Fix 1 - swap Promise.all with Promise.allSettled - will get the data of failures.
       *   ❌ allSettled settles per RUNNER, not per item. The runner that threw is dead:
       *      concurrency drops 2 -> 1, the failed slot is a hole, one error per dead runner.
       *   ✅ Real fix: catch PER ITEM so no runner dies:
       *        try   { result[index] = { status: 'fulfilled', value: await worker(items[index], index) }; }
       *        catch (reason) { result[index] = { status: 'rejected', reason }; }
       *      => 6 items, odd ones fail, limit 2: all 6 records in order, max in-flight 2.
       * Fix 2 - catch the error using try / catch and set a flag that will stop loop for other workers as well.
       *   ✅ Fail on item 2 of 6: started [1, 2, 3], nothing more. But 3 still finishes.
       *      The flag stops NEW work only (cancel in-flight: §6.2).
       */
      // Fix 2
      try {
        result[index] = await worker(items[index], index);
      } catch (e) {
        abort = true;
        throw e;
      }
      // result[index] = await worker(items[index], index); // await suspends and gives back control to caller, then next runner runs. result[index] maintains the order.
      // ✅ By INDEX keeps order: [5,4,3,2,1] finish in reverse -> still [10, 8, 6, 4, 2]. push = completion order.
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, asyncRunner)); // Promise.all wait for runner's promise to be resolved that is when while loop exits and it means all the items were resolved.
  // 💡 Math.min: no idle runners. asyncPool([1, 2], 10, …) -> [2, 4], max in-flight 2.
  // ⚠️ Array.from calls asyncRunner(undefined, k). Harmless (no params), same trap as map(parseInt).
  return result;
  // ⚠️ Was `return results` (the OUTER array) — a one-letter typo that returned Method 1's data.
}

// 📝 predict the time and the output first
// const start = performance.now();
// const out = await asyncPool(ids, 2, async (n) => {
//   await sleep(n * 10);
//   return n * 2;
// })
// const end = performance.now();
// console.log(`🚀 ~ time taken for pool pattern: ${end - start}`, out);
//   // => ~93ms, [2, 4, 6, 8, 10], max in-flight 2. Chunked was ~114ms at the same limit.

// console.log(await asyncPool([], 3, async (n) => n));           // => [] (no runners, no hang)
// console.log(await asyncPool([1, 2], 1, () => { throw new Error('sync') }).catch(e => e.message));
//   // => 'sync' ✅ sync throw is caught by the runner's try

// ─────────────────────────────────────────────────────────────────────────────
// 4. APPROACH 2 — pLimit 🎟️  (one closure per task, a shared slot counter)
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Compared to pool pattern, pLimit pattern kind of creates N individual runners for N different task and resolves them when there is active slot available and less than the limit. This patterns is useful when there is a restriction of only N async tasks should run through out the application since it shares the limiter through closure.
 ** Pool - limit runners
 ** pLimit - one run closure per task, limit comes from active
*/
export function pLimit(concurrency) {
  if (!(Number.isInteger(concurrency) && concurrency > 0)) throw new TypeError('concurrency must be a positive integer'); // ⚠️ pLimit(0) hangs forever (§6.6)

  const queue = []; // contains runners for deferred tasks, once run function got resolved the returned promise to promise.all will be resolved.
  let active = 0; // count of active runners in flight.

  const next = () => {
    active--;
    if (queue.length > 0) queue.shift()(); // ⚠️ shift() is O(n): fine for thousands, not 100k (§6.9)
  }

  return function limit(worker, ...args) {
    return new Promise((resolve, reject) => { // returns pending promise, if fn is synchronous and slot is free.
      // 💡 Caller gets this promise NOW; it settles whenever `run` eventually calls resolve/reject.
      const run = () => {
        active++;
        new Promise((res) => res(worker(...args))) // ✅ sync throw -> rejection (§6.8)
          .then(resolve, reject)
          .finally(next);
        // ⚠️ Was `Promise.resolve(worker(...args))`: a sync throw skipped .finally(next) and leaked the slot.
        //    Free slot: caller rejected but active stuck -> pLimit(1) hung forever after.
        //    Queued task: unhandled rejection (fatal in Node) + caller's promise never settled.
        //    (Promise.try also works, but isn't in Node 22.20.)
      };
      active < concurrency ? run() : queue.push(run);
      // console.log("🚀 ~ limit ~ args:", args)       // debug: logs on EVERY call
      // console.log("🚀 ~ limit ~ queue:", queue);
    });
  }
}

// const limit = pLimit(2);
// const start4 = performance.now();
// const outResults = await Promise.all(ids.map(id => limit(async (n) => {
//   await sleep(n * 10);
//   return n * 2;
// }, id)));
// const end4 = performance.now();
// console.log(`🚀 ~ time taken for pLimit pattern: ${end4 - start4}`);  // => ~94ms (same schedule as the pool)
// console.log("🚀 ~ outResults:", outResults);                            // => [2, 4, 6, 8, 10], max in-flight 2

// 💡 ONE limiter, TWO unrelated batches — pLimit can, the pool can't.
// const ids2 = ids.map(id => id * 2);
// const worker = async (n) => {
//   await sleep(n * 10);
//   return n * 2;
// }
// const limit2 = pLimit(3);
// const ourResults2 = await Promise.all([
//   ...ids.map((id) => limit2(worker, id)),
//   ...ids2.map((id) => limit2(worker, id)),
// ]);
// console.log("🚀 ~ ourResults2:", ourResults2)
//   // => [2, 4, 6, 8, 10, 4, 8, 12, 16, 20] in ~195ms, max in-flight 3 across BOTH batches

// console.log(await pLimit(1)(() => ({ then(r) { r('T') } })));   // => 'T' (thenables work)
// console.log(await pLimit(1)((x) => x + 1, 5));                 // => 6   (sync workers work)

// ─────────────────────────────────────────────────────────────────────────────
// 5. POOL vs pLimit ⚖️
// ─────────────────────────────────────────────────────────────────────────────
/*
                        POOL (asyncPool)                  pLimit
   shape                 fn(items, limit, worker)         limit = pLimit(n); limit(fn, ...args)
   what's limited        number of RUNNER loops           shared `active` counter
   objects alive         `limit` runners                  promise + closure PER TASK, all at once (§6.9)
   scope                 one batch                        app-wide, shared across modules/requests
   input                 whole array up front             tasks can arrive any time
                         (iterator version is lazy, §6.9)
   stop on first error   easy: one flag (Fix 2)           not built in
   result order          by index                         Promise.all keeps it

   💡 Pool = "process THIS list with N workers."
      pLimit = "never more than N of THIS KIND of thing, anywhere" (e.g. 5 requests to one API).
*/

// ─────────────────────────────────────────────────────────────────────────────
// 6. GOTCHAS ⚠️  — reread the morning of the interview
// ─────────────────────────────────────────────────────────────────────────────

/* ---- 6.1 ⚠️ Passing promises instead of thunks ------------------------------- */
// * Gotcha 1 - Passing promises instead of thunks
// const started = [];
// const promises = [1, 2, 3].map(async (n) => {
//   started.push(n);
//   await sleep(1 * 10);
//   return n;
// })
// console.log("🚀 ~ started:", started) // [1, 2, 3], already running  ✅

// const promises1 = [1, 2, 3].map((n) => async (n) => {   // ❌ 2 bugs:
//   started.push(n);                                       //  1. reuses `started` -> logs [1, 2, 3], not []
//   await sleep(1 * 10);                                   //  2. inner (n) SHADOWS outer n -> calling f()
//   return n;                                              //     gives [undefined, undefined, undefined]
// })
// console.log("🚀 ~ started:", started) // [], nothing has run yet.
// ✅ Fixed: fresh array + a ZERO-arg thunk that closes over n.
// const startedLazy = [];
// const thunks = [1, 2, 3].map((n) => async () => {
//   startedLazy.push(n);
//   await sleep(1 * 10);
//   return n;
// })
// console.log("🚀 ~ startedLazy:", startedLazy)             // => [] (nothing ran yet)
// console.log(await Promise.all(thunks.map((f) => f())))   // => [1, 2, 3] (runs when CALLED)
// 💡 That's why limiters take `worker` + args, never a promise.

/* ---- 6.2 ⚠️ An error doesn't stop in-flight work (Gotcha 2) ------------------ */
// The flag stops NEW tasks; promises can't be cancelled. To stop running ones, abort a
// signal on the first error and pass it INTO the worker:
//   const ctrl = new AbortController();
//   while (i < items.length && !ctrl.signal.aborted) {
//     const index = i++;
//     try { result[index] = await worker(items[index], ctrl.signal); }
//     catch (e) { ctrl.abort(e); throw e; }
//   }
//   // worker: fetch(url, { signal })  or  signal.addEventListener('abort', cleanup)
// => item 1 fails at 10ms, item 2 is a 50ms abort-aware timer:
//    ['start 1', 'start 2', 'cancelled 2'] — 2 stops early, 3 and 4 never start.
// ⚠️ Cooperative only: fetch honours the signal, a bare setTimeout doesn't.

/* ---- 6.3 ⚠️ Unhandled rejection when awaiting a batch in sequence (Gotcha 3) -- */
// * Gotcha 3 - unhandled rejection when awaiting a batch in sequence
// ❌ Kept commented: live, it crashes the file (exit 1, "Error: unhandled").
// const p1 = [sleep(50).then(() => 1), Promise.reject(new Error('unhandled'))]; // since no handler, it is not pushed into microtask queue. Node marks set it as unhandled and doesn't throw yet.
// for (const p of p1) {
//   try {
//     await p;
//   } catch (e) {
//
//   }
// }
// * Node throws unhandled rejection ❌, since Promise.reject doesn't have any handler attached and node marked it at time of declaration. We thought it can handle it in for loop but only for p[0], the handler was attached and since p[0] was not resolved yet and microtask queue is empty and its an end of tick, so node checks for any unhandled rejections if found any then throws error.
// ✅ Right. Rule: Node checks for handler-less rejections once the microtask queue drains;
//    still unhandled = fatal (--unhandled-rejections=throw). The 50ms await is a macrotask,
//    so the check runs before the loop reaches p1[1].
// ⚠️ Flip side: [Promise.resolve(1), Promise.reject(err)] does NOT crash — awaiting a resolved
//    promise is microtasks only, so the handler attaches in time. Passes with instant mocks,
//    crashes with real I/O.
// ✅ Fix: handle every promise up front —
//    await Promise.allSettled(p1);          // => ['fulfilled', 'rejected']
//    p1.map((p) => p.catch((e) => e))       // then await in order, no crash
//    Best: create them late (thunks, §6.1).

/* ---- 6.4 ⚠️ A concurrency limiter is not a rate limiter (Gotcha 4) ------------ */
// * Gotcha 4 - Limiter is not a rate limiter
/**
  ** Concurrency - how many can run at once
  ** Rate - how many can start per unit time
*/
// => pLimit(2) with 2ms tasks STARTED 86 tasks in 100ms. Never >2 running, still way over "10/sec".
// Rate spacer — at most one START every `intervalMs`:
// function spaced(intervalMs) {
//   let nextSlot = 0;
//   return async (worker, ...args) => {
//     const now = performance.now();
//     const wait = Math.max(0, nextSlot - now);
//     nextSlot = Math.max(now, nextSlot) + intervalMs; // book the slot SYNCHRONOUSLY, before awaiting
//     await sleep(wait);
//     return worker(...args);
//   };
// }
// const gate = spaced(20); const t0 = performance.now(); const starts = [];
// await Promise.all([1, 2, 3, 4, 5].map((n) => gate(() => starts.push(Math.round(performance.now() - t0)))));
// console.log(starts);   // => [2, 20, 41, 61, 80] (one start per ~20ms)
// 💡 Need both? Nesting ORDER matters. pLimit(2) + spaced(20), tasks [100, 80, 60, 40, 100, 100]:
//      limit(() => gate(task))   starts [1, 21, 103, 122, 165, 185]  min gap 19ms ✅
//      gate(() => limit(task))   starts [0, 20, 99, 101, 142, 161]   min gap  2ms ❌
//    Outside, the gate spaces QUEUEING; when 2 slots free together, 2 queued tasks start at once.
//    Spacer goes INSIDE the limit (cost: a task waiting its turn holds a slot).

/* ---- 6.5 ⚠️ An `await` between reading and bumping the shared index ---------- */
//   while (i < items.length) { const idx = i; await sleep(1); i++; seen.push(items[idx]); await sleep(5); }
// => [1,2,3,4], 2 runners -> seen [1, 1, 3, 3] ❌ 1 and 3 twice, 2 and 4 never.
// 💡 Claim + bump in one sync step: `const index = i++;`. No locks needed in single-threaded JS.

/* ---- 6.6 ⚠️ Bad limit values fail silently ----------------------------------- */
// Without the guards:
//   asyncPool([1, 2], 0, job)   // => [ <2 empty items> ] — nothing ran, no error
//   asyncPool([1, 2], -1, job)  // => same (Array.from({ length: -1 }) is [])
//   asyncPool([1, 2], NaN, job) // => same (Math.min(NaN, 2) is NaN -> length 0)
//   pLimit(0)(job)              // => pending FOREVER
// ❌ Worst: mapChunked (§2, still unguarded) with 0 or -1. `i += 0` never ends, and each pass
//    awaits Promise.all([]) (a microtask), so the event loop never runs: a 50ms timer never
//    fired, process had to be killed. Frozen, not just hung.
// ⚠️ Typical source: config/env. Number(undefined) -> NaN, Number('') -> 0. Validate at the boundary.
// ⚠️ pLimit throws synchronously; asyncPool is async, so its throw arrives as a REJECTION.
// ⚠️ The guards reject Infinity (Number.isInteger(Infinity) is false), which worked before
//    ([1, 2]) and which the real p-limit accepts. Allow with `limit === Infinity ||`.

/* ---- 6.7 ⚠️ Nested calls to the same pLimit deadlock ------------------------- */
// const limit3 = pLimit(1);
// await limit3(() => limit3(() => 'inner'));   // => never settles (active 1, queued 1)
// Outer holds the slot waiting on inner; inner waits for a slot. With pLimit(n): once n
// parents each wait on a child. Classic in recursive crawlers.
// 💡 Don't await same-limiter work from inside it: use a separate limiter, or queue children from outside.

/* ---- 6.8 ⚠️ A sync throw in the worker leaks a slot -------------------------- */
// Promise.resolve(fn()) doesn't catch: fn() runs FIRST, as an argument. Bookkeeping around a
// call (active++ / --) must survive sync throws:
//   new Promise((res) => res(fn()))      ✅ executor catches
//   Promise.resolve().then(fn)           ✅ but costs a tick before fn starts
//   (async () => fn())()                 ✅
// => with the fix, sync throws (free slot AND queued) reject cleanly; state back to { active: 0, queued: 0 }.

/* ---- 6.9 ⚠️ pLimit + map still creates everything up front ------------------- */
// ids.map((id) => limit(worker, id)) — the WORK waits, but every promise/closure exists now.
// => 1,000 tasks through pLimit(2): { active: 2, queued: 998 } right after the map.
// Huge inputs (10k–1M): use the pool, fed from an ITERATOR, so memory stays at `limit`.
// shift() drain is O(n²): 10k 15ms, 100k 774ms, 300k ~7s. Head index (queue[head++]): ≤1ms.

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Why can't Promise.all limit concurrency?
      It starts nothing — its promises are already running. Limit CREATION: take thunks. (§1, §6.1)

 ** Q2. Why is chunking slower than a pool at the same limit?
      A chunk waits for its slowest item; freed slots idle. A pool refills at once.
      5 jobs, limit 2: ~114ms vs ~93ms. (§2, §3)

 ** Q3. The pool shares `let i`. Race condition?
      No — read + bump is one sync step. An await between them -> [1, 1, 3, 3]. (§3, §6.5)

 ** Q4. How does the pool keep input order?
      `result[index] = …`, never push. (§3)

 ** Q5. One task fails. What happens to the rest?
      Promise.all rejects, but started tasks keep running (no cancel). A flag stops NEW ones;
      an AbortController passed into the worker stops running ones — if the worker listens. (§3, §6.2)

 ** Q6. allSettled over the runners = every failure collected?
      No — one result per RUNNER. A thrower leaves its loop, concurrency drops. Catch per
      item and store { status, value | reason }. (§3 Fix 1)

 ** Q7. Pool or pLimit?
      Pool: one known list, easy stop-on-error, memory = limit. pLimit: shared app-wide cap,
      tasks arrive any time. (§5)

 ** Q8. Implement pLimit — the pieces?
      Counter + FIFO queue of `run` closures + limit() returning a new Promise: run now if
      active < n, else queue; on settle, decrement and start the next. Wrap the call so a
      SYNC throw still frees the slot. (§4, §6.8)

 ** Q9. Concurrency vs rate limit?
      Running at once vs starts per time. pLimit(2) started 86 in 100ms. Both needed? Spacer
      INSIDE the limit — outside, queued tasks start 2ms apart despite 20ms spacing. (§6.4)

 ** Q10. How can a limiter deadlock?
      A task awaits same-limiter work while holding a slot; once all slots wait, nothing moves. (§6.7)

 ** Q11. [sleep(50), Promise.reject(e)] in for...of + try/catch crashes Node. Why? And why not
         with Promise.resolve(1) first?
      The rejection is still handler-less when the microtask queue drains (the 50ms await
      guarantees a drain). A resolved first item costs only microtasks, so the handler lands
      in time. Fix: allSettled, or .catch each up front. (§6.3)
 */

// 👉 NEXT: retry-with-backoff.js — handling a failed task. Pair it: limit(() => retry(fn))
//    keeps retries under the cap, but the backoff sleep holds the slot (same trade-off as §6.4).
