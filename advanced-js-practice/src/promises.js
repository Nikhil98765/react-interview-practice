/* ============================================================================
   PROMISES, MICROTASKS & ASYNC — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` is the ACTUAL logged value, verified by running this file under node
     (ESM — package.json says "type": "module", so top-level await works). Not guessed.

   ▶️ Most demos are commented out so the file runs fast. Uncomment a block and run:
        node src/promises.js

   CONTENTS
     1. States & the constructor .... settles exactly once
     2. Microtask ordering .......... the 1-7 trace everyone gets asked
     3. Chaining & error propagation  what each link passes down
     4. finally ..................... the three exceptions to "pass it through"
     5. Flattening .................. returning a promise from .then
     6. Aggregators ................. all / allSettled / race / any + empty-input table
     7. Polyfills ................... myAll / myAllSettled / myRace / myAny ✅ match native
     8. Gotchas ..................... 12 of them, the meat of the sheet ⚠️
     9. Interview Q&A 🎤

   THE MODEL 🧠
     A promise is an object for a value that isn't here yet. Three states — pending,
     fulfilled, rejected — and it SETTLES EXACTLY ONCE; every later resolve/reject is a no-op.

     `.then` does two things at once, and that's the whole mental model:
       1. registers a callback, and
       2. returns a NEW promise for whatever that callback returns.
     Chaining and error propagation both fall out of (2). A chain is not one promise —
     it's N promises, each one link's output feeding the next link's input.

     Callbacks run as MICROTASKS: the microtask queue is drained completely after the
     current synchronous run, and always before the next macrotask (timer, I/O).

   💡 THE ONE-LINER: `.then` is a transform, not a subscription. Every link returns a new
      promise, so what a link RETURNS (or throws) is what the rest of the chain sees.
   ============================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATES & THE CONSTRUCTOR 🎬
// ─────────────────────────────────────────────────────────────────────────────
const p = new Promise((resolve, reject) => {
  const isTrue = true;
  if (isTrue) {
    resolve(23);
    resolve(34); // ⚠️ ignored — proof it settles only once. No error, no warning; silently dropped.
  } else {
    reject(new Error("error from promise executor body"));
  }
});

// p.then(val => console.log(val))          // => 23 ✅ (never 34)
//   .catch(err => {
//     console.log("🚀 ~ err:", err);
//   });

// A throw inside the executor becomes a REJECTION — the constructor catches for you.
// const p1 = new Promise((resolve, reject) => {
//   throw new Error('Error thrown from executor body of p1');
// });

// p1.then(val => {
//   console.log("🚀 ~ val:", val)
// }, (reason) => {
//   console.log("🚀 ~ reason:", reason)     // => the Error ✅ the 2nd arg of .then IS the rejection handler
// })
//   // ⚠️ This .catch does NOT run: the onRejected above already handled it, and a handled
//   //    rejection produces a FULFILLED promise. Recovery is the default, not an opt-in.
//   .catch(err => {
//   console.log("🚀 ~ err:", err)
//   })

// The executor body is SYNCHRONOUS; only the .then callback is deferred.
// const p2 = new Promise((resolve, reject) => {
//   resolve(23);
//   console.log("🚀 ~ A");   // runs immediately, inside `new Promise(...)`
// });
// p2.then((val) => {
//   console.log("🚀 ~ C");   // deferred to the microtask queue
// });
// console.log("🚀 ~ B");
// => A, B, C ✅ — resolving does not run the callback, it only schedules it.

// ─────────────────────────────────────────────────────────────────────────────
// 2. MICROTASK ORDERING 🔬
// ─────────────────────────────────────────────────────────────────────────────
// The log numbers ARE the verified execution order — uncomment and confirm.
// console.log('🚀 ~ 1 Sync');
// setTimeout(() => console.log('🚀 ~ 7 Macro'), 0);
// queueMicrotask(() => console.log('🚀 ~ 3 Micro'));
// new Promise((res, rej) => res()).then(() => console.log('🚀 ~ 4 Micro')).then(() => console.log('🚀 ~ 6 Micro'));
// queueMicrotask(() => console.log('🚀 ~ 5 Micro'));
// console.log('🚀 ~ 2 Sync');
// => 1, 2, 3, 4, 5, 6, 7 ✅
// 💡 READ IT THIS WAY: all sync first (1,2). Then the microtask queue drains in FIFO order
//    (3,4,5). The second .then (6) wasn't queued until its parent resolved, so it joins the
//    back of the queue — after 5, not next to 4. The macrotask (7) waits for an empty queue.
// ⚠️ A chained .then costs one FULL tick per link. That's why `.then` chains interleave with
//    other microtasks instead of running as one block.

/**
  ** 3. Chaining and Error propagation
    .catch and .then both return promises and every link can transform or recover.
    .catch and .then callbacks need to return a value to pass downstream; if not, they wrap
    undefined in a promise and pass that down.
      Exceptions
        1. finally doesn't need to return — it passes through the original value.
        2. a missing callback still passes values through — .then(null) and .catch(null)
 */
// * catch - recovers and the chain continues as FULFILLED
const result = await new Promise((resolve, reject) => {
  throw new Error("error from promise executor");
})
  .catch((reason) => "recovered") // ✅ handling a rejection RESUMES the happy path
  .then((val) => `${val} !`);
// console.log("🚀 ~ result:", result)   // => 'recovered !' ✅

// * A throw inside .then routes to the next .catch DOWNSTREAM
// const result1 = await Promise.resolve(1)
//   .then(val => {
//     throw new Error('error from .then block')
//   }).catch(error => {
//     console.log("🚀 ~ error:", error.message);   // => 'error from .then block' ✅
//     return error;
//   });
// console.log("🚀 ~ result1:", result1)

// * ⚠️ A .catch placed BEFORE the throw does nothing — errors only flow FORWARD.
// await Promise.resolve(12)
//   .catch((reason) => {              // ⚠️ never runs, nothing has rejected yet
//     console.log("🚀 ~ reason:", reason);
//   })
//   .then((val) => {
//     console.log("🚀 ~ val:", val)   // => 12 ✅ passed through the idle .catch untouched
//     throw new Error("error from .then block");
//   })
//   .catch((error) => {
//     console.log("🚀 ~ error:", error.message);   // => 'error from .then block' ✅
//   }).then(val => {
//     console.log("🚀 ~ val in 2nd then block:", val)   // => undefined ✅ the catch returned nothing
//   })
// 💡 THE RULE: put .catch at the END, or immediately after the link you want to protect.

// * No return from .then / .catch => downstream receives undefined.
//   The two exceptions: finally, and an ABSENT handler.
// await Promise.resolve(33)
//   .then(null)                        // ✅ no handler = pure pass-through, value survives
//   .then(val => {
//     console.log("🚀 ~ val inside 1st .then:", val)   // => 33 ✅
//     // no return here -> undefined gets wrapped and sent on
//   })
//   .then(val => {
//     console.log("🚀 ~ val inside 2nd .then:", val);  // => undefined ✅
//   })
// ⚠️ Forgetting `return` in a .then is the single most common promise bug. An arrow with a
//    body `{ ... }` returns undefined; `.then(v => doThing(v))` returns, `.then(v => { doThing(v) })` does not.

// ─────────────────────────────────────────────────────────────────────────────
// 4. finally — cleanup that stays out of the way 🧹
// ─────────────────────────────────────────────────────────────────────────────
/* finally receives NO value, passes the original outcome through untouched, and its return
   value is IGNORED. Each .finally still returns a new promise.
   Three things it CAN do:
     1. delay the result (by returning a promise — the value is still ignored, only timing changes)
     2. ⚠️ THROW — that DOES replace the outcome, and downstream .catch sees the new error
     3. nothing else. It cannot transform, and it cannot recover. */
const fResult = await Promise.resolve(45)
  .then((val) => `${val}`)
  .finally(() => {
    throw new Error("error from finally block"); // ⚠️ hijacks the outcome
  })
  .catch((reason) => reason);
// console.log("🚀 ~ fResult:", fResult)   // => Error: error from finally block ✅ ('45' is lost)

// * A downstream finally STILL RUNS when an upstream finally throws — cleanup is not skipped.
// await Promise.resolve(45)
//   .finally(() => {
//     throw new Error("Cleanup failed");
//   })
//   .then((val) => console.log("🚀 ~ value from 1st .then block ", val))  // ⚠️ skipped — chain is now rejected
//   .finally(() => console.log("🚀 ~ 2nd finally block log"))             // ✅ RUNS anyway
//   .catch((error) =>
//     console.log("🚀 ~ caught the error from 1st finally block and error is ", error.message),
// );
// => '2nd finally block log', then 'caught ... Cleanup failed' ✅
// 💡 finally is for cleanup precisely because it runs on BOTH paths. That's also why throwing
//    in it is so dangerous: it converts a success into a failure from a "cleanup" block.

/*
  5. Returning a promise from .then FLATTENS it — no nesting, ever.
     `.then(v => somePromise)` waits for somePromise and passes its VALUE on,
     never a Promise<Promise<T>>. This is why chains stay flat and why await composes.
*/
const fResult1 = await Promise.resolve(45)
  .then((val) => val + 1)
  .then((val) => `${val} recovered!`);
// console.log("🚀 ~ fResult1:", fResult1)   // => '46 recovered!' ✅

// ─────────────────────────────────────────────────────────────────────────────
// 6. AGGREGATORS 🧺
// ─────────────────────────────────────────────────────────────────────────────
/*
  1. all -
      fulfills - all fulfill
      rejects  - first rejection (fail fast)
      result   - array, INPUT order
  2. allSettled -
      fulfills - always
      rejects  - never
      result   - array of {status, value | reason}
  3. race -
      fulfills - first SETTLE fulfills
      rejects  - first SETTLE rejects
      result   - first settled value
  4. any -
      fulfills - first FULFILLMENT (rejections are ignored until all reject)
      rejects  - only if all reject
      result   - that value / AggregateError

  * Array results preserve INPUT order for all aggregators. Single-value results follow
    COMPLETION order. race vs any is the classic pair: race cares about the first to settle
    (either way), any cares about the first to SUCCEED.

  ** EMPTY INPUT — the table interviewers probe, all ✅ verified:
      Promise.all([])        -> fulfills []              (vacuously true)
      Promise.allSettled([]) -> fulfills []
      Promise.any([])        -> REJECTS AggregateError   (no success is possible)
      Promise.race([])       -> ⚠️ PENDING FOREVER       (nothing can ever settle it)
  💡 The asymmetry is logical, not arbitrary: "all of nothing" is satisfied, "any of nothing"
     can never be, and "first of nothing" never happens.
*/
const ok = (val, ms = 10) =>
  new Promise((res) => setTimeout(() => res(val), ms));
const bad = (err, ms = 10) =>
  new Promise((_, rej) => setTimeout(() => rej(new Error(err)), ms));

// * all
// const a1 = await Promise.all([ok(1, 10), ok(2, 5)]);
// console.log("🚀 ~ a1:", a1);          // => [1, 2] ✅ input order, NOT completion order

// * allSettled
// const a2 = await Promise.allSettled([ok(1, 10), bad("x", 5), ok(3, 0)]);
// console.log("🚀 ~ a2:", a2);
// => [{status:'fulfilled',value:1}, {status:'rejected',reason:Error(x)}, {status:'fulfilled',value:3}] ✅

// * race
// const a3 = await Promise.race([ok(2, 20), bad("fast", 5)]);
// console.log("🚀 ~ a3:", a3)           // => throws Error('fast') ✅ 5ms settles first, and it's a REJECT

// * any
// const a4 = await Promise.any([
//   // ok(1, 10),
//   // ok(3, 5),
//   bad("fast", 10),
//   bad("fast1", 1),
// ]);
// console.log("🚀 ~ a4:", a4);
// => with the ok()s uncommented: 3 (first to FULFILL) ✅
// => with only bad()s: throws AggregateError ✅ — note any IGNORED the 1ms rejection,
//    where race would have taken it. That one line is the whole race-vs-any distinction.

// With empty arrays — see the table above
// const b1 = await Promise.all([]);        // => [] ✅
// const b2 = await Promise.allSettled([]); // => [] ✅
// const b4 = await Promise.any([]);        // => AggregateError ✅
// const b3 = await Promise.race([]);       // => ⚠️ hangs forever ✅ (nothing to settle it)

// ─────────────────────────────────────────────────────────────────────────────
// 7. POLYFILLS 🛠️
// ─────────────────────────────────────────────────────────────────────────────
/* ✅ ALL FOUR VERIFIED against native across: mixed resolve/reject, plain values, empty
   input, thenables, and a Set (non-array iterable). Identical results in every case.

   💡 THE THREE MOVES EVERY AGGREGATOR POLYFILL NEEDS — say these out loud in an interview:
     1. `Promise.resolve(x)` on each item. Handles plain values AND thenables in one step,
        so you never need an `instanceof Promise` check (which breaks on thenables).
     2. Write results BY INDEX, count completions separately. Never `.push` — completion
        order isn't input order.
     3. Handle the empty-input case FIRST; the loop can't settle a promise it never enters. */

// * 5.1 - all
Promise.myAll = (promisesArr) => {
  // store output array if every promise is fulfilled and maintain input order
  // If any of the promise rejects, first reject error should be returned.
  // returns promise of array results if every promise fulfills and rejects if one of them rejects.
  // for plain values, it should return as is.
  // for empty array, it should return empty array

  return new Promise((res, rej) => {
    const resultArr = [];
    let counter = 0;
    const inputArr = [...promisesArr];

    if (inputArr.length === 0) return res([]); // ✅ move 3

    const resultStore = (i, val) => {
      counter++;              // ⚠️ count separately — resultArr[i] can be assigned out of order
      resultArr[i] = val;
      if (counter === inputArr.length) {
        res(resultArr);
      }
    }

    for (let i = 0; i < inputArr.length; i++) {
      const promise = inputArr[i];
      // ❌ THE VERSION THAT BREAKS ON THENABLES — kept as a reminder of why move 1 exists:
      // if (!(promise instanceof Promise)) {   // a thenable isn't `instanceof Promise`,
      //   resultStore(i, promise);             // so it gets stored RAW instead of awaited
      //   continue;
      // }
      // promise
      //   .then((val) => {
      //     resultStore(i,val);
      //   })
      //   .catch((reason) => {
      //     rej(reason);
      //   });
      // ⚠️ ALSO: .then().catch() is subtly wrong here — the catch would also fire for an
      //    error thrown INSIDE resultStore. The 2-arg .then below only catches upstream.
      Promise.resolve(promise).then((val) => {
        resultStore(i, val);
      },
        rej   // ✅ first rejection wins; later rej() calls are no-ops (settles once)
      )}
  });
};

// const a12 = await Promise.myAll([ok(1, 10), ok(2, 5), bad("X", 20)]);
// console.log("🚀 ~ a12:", a12);   // => throws Error('X') ✅ matches native

// const a13 = await Promise.myAll([1, 2, 'p', bad('X1', 20)]);
// console.log("🚀 ~ a13:", a13)    // => throws Error('X1') ✅ plain values pass straight through

// const a14 = await Promise.myAll([]);
// console.log("🚀 ~ a14:", a14)    // => [] ✅

// const a15 = await Promise.myAll([{ then(res, rej) { res('from thenable') } }]);
// console.log("🚀 ~ a15:", a15);   // => ['from thenable'] ✅
// Promise.resolve checks for a native Promise first, then for a callable .then; if present it
// invokes it. That is the entire definition of a "thenable", and why move 1 is free.

// const a16 = await Promise.myAll(new Set([1, 2]));
// console.log("🚀 ~ a16:", a16)    // => [1, 2] ✅ [...x] means ANY iterable works, like native

// * 5.2 - allSettled
Promise.myAllSettled = (promisesArr) => {
  return new Promise((res, rej) => {
    const inputArr = [...promisesArr];

    if(inputArr.length === 0) return res([]);

    let counter = 0;
    const resultArr = new Array(inputArr.length);

    inputArr.forEach((element, index) => {
      Promise.resolve(element).then((value) => {
        resultArr[index] = { status: 'fulfilled', value }
       }, (reason) => {
          resultArr[index] = {status: 'rejected', reason}
      }).finally(() => {     // 💡 neat: finally runs on BOTH paths, so it's a natural counter
        counter++;
        if (counter === inputArr.length) {
          res(resultArr);
        }
      })
    });
  })
}
// 💡 allSettled never rejects, so `rej` is unused here — that's the point of the combinator.

// const b11 = await Promise.myAllSettled([ok(1, 10), bad("x", 5), ok(3, 0)]);
// console.log("🚀 ~ b11:", b11);   // ✅ matches native exactly
// const b12 = await Promise.myAllSettled([1, 2, 'p']);      // ✅ all fulfilled
// const b13 = await Promise.myAllSettled([]);               // => [] ✅
// const b14 = await Promise.myAllSettled([
//   { then(res, rej) { res("resolved from 1st thenable"); } },
//   { then(res, rej) { rej("rejected from 2nd thenable"); } },
// ]);                                                       // ✅ thenables, both outcomes
// const b15 = await Promise.myAllSettled(new Set([1, 2, 3]))  // ✅ iterable

// * myAllSettled built ON TOP of myAll — the elegant version
// 💡 THE TRICK: map every outcome to a FULFILLMENT first, so `all` can never fail.
//    Worth knowing as a one-liner answer to "implement allSettled".
Promise.myAllSettled1 = (promiseArr) => {
  return Promise.myAll([...promiseArr].map(p =>
    Promise.resolve(p)
      .then(
        value => ({ status: 'fulfilled', value }),
        reason => ({ status: 'rejected', reason })   // ✅ rejection converted to a value
    )
  ));
}
// ✅ verified identical to native (and to myAllSettled) on all five cases.

// const b21 = await Promise.myAllSettled1([ok(1, 10), bad("x", 5), ok(3, 0)]);
// const b23 = await Promise.myAllSettled1([]);
// const b25 = await Promise.myAllSettled1(new Set([1, 2, 3]))

// * 5.3 - race
Promise.myRace = (promiseArr) => {
  return new Promise((res, rej) => {
    // const inputArr = [...promiseArr];
    // inputArr.forEach(p => {
    //   Promise.resolve(p).then(res,rej);
    // })

    // * for...of consumes the iterable directly — no spread needed.
    for (const p of promiseArr) {
      Promise.resolve(p).then(res, rej); // ✅ first to settle wins; the rest are no-ops
    }
  });
}
// 💡 The simplest of the four, because "settles once" does all the work: attach res/rej to
//    every input and let the first one through. No counter, no results array.
// ⚠️ Note there's no empty-input guard — and none is needed: an empty iterable means the loop
//    never runs and the promise stays pending forever, which is EXACTLY what native does.

// const c11 = await Promise.myRace([ok(2, 10), bad("fast", 5)]);  // => throws Error('fast') ✅
// const c12 = await Promise.myRace([21, 2, 'p']);                 // => 21 ✅
// const c13 = await Promise.myRace([]);                           // => ⚠️ hangs ✅ (matches native)
// const c14 = await Promise.myRace(new Set([201, 2]));            // => 201 ✅

// * 5.4 - any
Promise.myAny = (promiseArr) => {
  return new Promise((res, rej) => {
    const inputArr = [...promiseArr];

    if (inputArr.length === 0) rej(new AggregateError([], 'All promises were rejected'));
    // ⚠️ NOTE: no `return` here. It happens to be harmless — the forEach below has nothing to
    //    iterate, and a settled promise ignores later calls — but `return rej(...)` is the
    //    habit to keep, matching the guards in myAll/myAllSettled above.

    const aggregateErrors = new Array(inputArr.length);
    let counter = 0;

    inputArr.forEach((p, index) => {
      Promise.resolve(p).then(
        res,                       // ✅ first FULFILLMENT wins immediately
        reason => {
          aggregateErrors[index] = reason;  // ✅ by index — AggregateError preserves input order
          counter++;
          if (counter === inputArr.length) { // only reject once EVERY input has failed
            rej(
              new AggregateError(aggregateErrors, "All promises were rejected"),
            );
          }
        }
      )
    })
  })
}
// 💡 any is race with the rejection path inverted: rejections are COLLECTED instead of
//    propagated, and only a full sweep of failures settles it.

// const d11 = await Promise.myAny([bad("fast", 10), bad("fast1", 1)]);
// => AggregateError with both errors in INPUT order ✅ matches native
// const d12 = await Promise.myAny([]);            // => AggregateError([]) ✅
// const d13 = await Promise.myAny([12, 2, 3]);    // => 12 ✅
// const d14 = await Promise.myAny(new Set([13, 3]));  // => 13 ✅

// ⚠️ ONE FIDELITY GAP IN ALL FOUR: native aggregators are called with `this` = the constructor
//    and use it to build results, so `class MyPromise extends Promise` gets MyPromise back.
//    These are arrow functions that hard-code `Promise`, so subclassing is lost. Fine for an
//    interview; worth naming if asked "what's different from the real one?"

// ─────────────────────────────────────────────────────────────────────────────
// 8. GOTCHAS ⚠️  — the section to reread the morning of the interview
// ─────────────────────────────────────────────────────────────────────────────
const ids = [1, 2, 3];
const results = [];
const fetchOne = (id) => new Promise((res) => setTimeout(() => res({ id, name: `The ${id} id` })));
const delay = (ms, val) => new Promise((res) => setTimeout(() => res(val), ms));

/* ---- 8.1 Sequential await in a loop ---------------------------------------- */
// const start = performance.now();
// for (const id of ids) {
//   results.push(await fetchOne(id)); // ⚠️ SERIAL — each await parks the whole loop
// }
// const end = performance.now();
// console.log(`1st block Execution time: ${end - start} ms`);
// console.log("🚀 ~ results:", results);

// const start1 = performance.now();
// const results1 = await Promise.all(ids.map(fetchOne)); // ✅ PARALLEL — all started, then awaited
// const end1 = performance.now();
// console.log(`2nd block Execution time: ${end1 - start1} ms`);
// console.log("🚀 ~ results1:", results1)
// 💡 Only await inside a loop when an iteration genuinely NEEDS the previous one's value.
//    Otherwise it's N × latency instead of 1 × latency.

/* ---- 8.2 ⚠️ forEach doesn't wait — and the work still lands LATER ----------- */
// ids.forEach(async (id) => {
//   return results.push(await fetchOne(id));  // ⚠️ forEach ignores the returned promise AND the return
// });
// console.log("🚀 ~ results:", results);   // => [] ✅ nothing has resolved yet
//
// for (const id of ids) {
//   results.push(await fetchOne(id));
// }
// console.log("🚀 ~ results:", results);
// => ⚠️ SIX entries: [1,2,3, 1,2,3] — VERIFIED.
// 💡 THE SECOND HALF OF THE GOTCHA, and the part people miss: forEach didn't CANCEL the async
//    work, it just didn't wait for it. Those three pushes landed during the awaits below and
//    silently corrupted `results`. "Doesn't wait" is not "doesn't happen".
// ✅ FIX: for...of for sequential, Promise.all(map(...)) for parallel. Never async+forEach.

/* ---- 8.3 Promises start immediately, not on await -------------------------- */
// const p1 = fetchOne(19);   // ⚠️ already in flight — the executor ran on THIS line
// const p2 = await p1;       // await only waits for the result; it does not start the work
// 💡 CONSEQUENCE: `const a = slow(); const b = slow(); await a; await b;` is PARALLEL, while
//    `await slow(); await slow();` is serial. The await placement is the only difference.
//    Corollary: to make something lazy you need a FUNCTION, not a promise. () => fetch(...)

/* ---- 8.4 One try/catch around several awaits hides which one failed -------- */
// try {
//   await fetchOne('ada');
//   await fetchOne('da');
// } catch (e) {   // ⚠️ nothing here says WHICH call failed
//   // error handling
// }
// ✅ FIX: a .catch per call that tags the error, or Promise.allSettled and inspect by index.

/* ---- 8.5 ⚠️ race/all don't CANCEL the losers ------------------------------- */
// A promise has no cancellation. Settling the race only stops you LISTENING — the losing
// work keeps running, keeps its side effects, and keeps the process alive.
// const p21 = await Promise.race([delay(5000, 'slow timer'), fetchOne(1)]);
// console.log("🚀 ~ p21:", p21);   // => { id: 1, ... } ✅ fetchOne wins instantly
// ...but the 5000ms timer is still pending and holds node open for 5 more seconds.
//
// ⚠️ WATCH THE SHAPE: `Promise.resolve(setTimeout(() => ..., 5000))` does NOT model a delay.
//    setTimeout returns a Timeout OBJECT immediately, so that's an already-resolved promise
//    and it wins the race at 0ms with a Timeout object. Verified. Use the `delay` helper above.
//
// Same for all(): a rejection settles the chain at once, but the slow sibling keeps going —
// verified, its side effect landed 35ms AFTER Promise.all had already rejected.
// ✅ FIX: AbortController, and pass its signal into the work itself. Nothing else cancels.

/* ---- 8.6 ⚠️ Branching is not chaining -------------------------------------- */
// const base = Promise.resolve(1);
// base.then(v => { console.log('A', v); return 100; });
// base.then(v => console.log('B', v));   // => 1, NOT 100 ✅ verified
// 💡 Calling .then TWICE on the same promise creates two INDEPENDENT branches off one value.
//    Chaining means feeding one .then's RESULT into the next. `p.then(a); p.then(b);` and
//    `p.then(a).then(b)` are completely different programs.

/* ---- 8.7 ⚠️ `return` vs `return await` inside try/catch -------------------- */
// const boom = () => Promise.reject(new Error('inner'));
// async function plainReturn(){ try { return boom(); }       catch { return 'caught'; } }
// async function returnAwait(){ try { return await boom(); } catch { return 'caught'; } }
// => plainReturn  ESCAPES the catch and rejects ✅ verified
// => returnAwait  returns 'caught' ✅
// 💡 WHY: `return promise` hands the promise to the caller and EXITS the try block — the
//    rejection happens after the try is gone. `return await` settles it while you're still
//    inside. This is the one place `return await` is not redundant.

/* ---- 8.8 ⚠️ A late .catch is too late -------------------------------------- */
// const late = Promise.reject(new Error('rejected now'));
// setTimeout(() => late.catch(e => console.log('handled at last:', e.message)), 10);
// => 'unhandledRejection' FIRES FIRST ✅ verified, then the catch runs and node warns
//    "PromiseRejectionHandledWarning: Promise rejection was handled asynchronously".
// ⚠️ In Node an unhandled rejection is FATAL — the process exits non-zero and pending timers
//    never run. Verified. Attach handlers in the same tick you create the promise.

/* ---- 8.9 ⚠️ async callbacks swallow errors into unhandled rejections ------- */
// [1].forEach(async () => { throw new Error('lost inside forEach'); });
// => no try/catch can see this; it surfaces as an unhandledRejection ✅ verified.
// 💡 Any array method that ignores its callback's return value (forEach, sort comparators,
//    addEventListener handlers) turns an async callback's error into a silent unhandled
//    rejection. Only map+Promise.all gives you a promise to actually attach a handler to.

/* ---- 8.10 Promise.resolve(p) returns the SAME promise ---------------------- */
// const inner = Promise.resolve(5);
// Promise.resolve(inner)   === inner   // => true  ✅ pass-through, no wrapper allocated
// new Promise(r => r(inner)) === inner // => false ✅ a genuinely new promise that ADOPTS inner
// 💡 That identity is why `Promise.resolve(x)` is the free, correct normalizer in every
//    polyfill above — it costs nothing on something that's already a promise.

/* ---- 8.11 `await` always costs a tick, even on a non-promise -------------- */
// (async () => { order.push('before'); await 42; order.push('after await 42'); })();
// order.push('sync after call');
// => 'before | sync after call | after await 42' ✅ verified — `await 42` still defers.
// 💡 An async function runs SYNCHRONOUSLY up to its first await, then always yields.

/* ---- 8.12 Executor code after resolve still runs; a throw there vanishes --- */
// const swallow = new Promise((res) => { res('settled'); throw new Error('never seen'); });
// => await swallow is 'settled' ✅ verified. The throw is silently discarded, because the
//    promise had ALREADY settled and the executor's catch-and-reject is a no-op by then.
// ⚠️ So `resolve()` is not `return`. Code after it runs — put an explicit `return` in front.

// ─────────────────────────────────────────────────────────────────────────────
// 9. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Trace the 1-7 ordering in §2.
      All sync first; then the microtask queue drains FIFO; then macrotasks. A chained .then
      is only queued once its parent settles, so it joins the BACK of the queue.

 ** Q2. Does a .catch make the chain fulfilled or rejected?
      FULFILLED. Handling a rejection is recovery — the chain resumes on the happy path with
      whatever the handler returned. To keep it rejected you must rethrow. (§3)

 ** Q3. What does .then(null) pass down? And a .then whose callback returns nothing?
      .then(null) passes the ORIGINAL value through untouched. A handler with no return sends
      `undefined` downstream. Missing handler ≠ handler returning nothing. (§3)

 ** Q4. Can `finally` change the result?
      Only by THROWING (or by delaying it). It gets no value, its return is ignored, and it
      can't recover — but a throw inside it replaces the outcome for everything downstream. (§4)

 ** Q5. race vs any?
      race settles on the first SETTLE either way; any waits for the first FULFILLMENT and
      only rejects (AggregateError) if every input fails. (§6)

 ** Q6. What do the four aggregators do with an empty array?
      all -> [], allSettled -> [], any -> rejects AggregateError, race -> pending FOREVER. (§6)

 ** Q7. Implement Promise.all. What are the three moves?
      Promise.resolve() each item (free thenable support), write results BY INDEX with a
      SEPARATE completion counter, and guard the empty case before the loop. (§7)

 ** Q8. Why not `if (!(x instanceof Promise))` in the polyfill?
      A thenable isn't instanceof Promise, so it'd be stored raw instead of awaited.
      Promise.resolve handles native promises, thenables and plain values uniformly. (§7)

 ** Q9. Implement allSettled in one line using all.
      Map every input through `.then(v => ({status:'fulfilled',value:v}),
      r => ({status:'rejected',reason:r}))` so nothing can ever reject, then hand it to all. (§7)

 ** Q10. `array.forEach(async ...)` — what actually happens?
      forEach ignores the returned promise, so it doesn't wait — but the work still RUNS and
      lands later, corrupting shared state, and any error becomes an unhandled rejection
      (fatal in Node). Use for...of or map+Promise.all. (§8.2, §8.9)

 ** Q11. Does Promise.race cancel the loser?
      No. Nothing cancels a promise. The loser runs to completion with all its side effects
      and can hold the process open. Use AbortController and thread the signal into the
      work itself. (§8.5)

 ** Q12. When is `return await` NOT redundant?
      Inside try/catch. `return promise` exits the try before the rejection happens, so the
      catch never fires; `return await promise` settles it while still inside. (§8.7)

 ** Q13. Are these parallel or serial?
        const a = slow(); const b = slow(); await a; await b;   -> PARALLEL
        await slow(); await slow();                             -> SERIAL
      Promises start at CREATION, not at await. To get laziness you need a function. (§8.3)
 */

// 👉 NEXT: concurrency-limiter.js — running N promises at a time (the natural follow-up to
//    §8.1, and a very common "now limit it to 3 concurrent" interview extension).
