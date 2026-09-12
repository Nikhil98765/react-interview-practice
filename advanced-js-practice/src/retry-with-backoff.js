/* ============================================================================
   RETRY WITH EXPONENTIAL BACKOFF — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you uncomment it
     `// => X` = actual output from node v22 (ESM, top-level await). Timings ±5ms.

   ▶️ Demos are commented out. Uncomment a block and run: node src/retry-with-backoff.js

   CONTENTS
     1. retry() ................. attempts, backoff, isRetryable
     2. withTimeout() ........... retry can't fire without a failure
     3. retry + limiter ......... which one wraps which
     4. Gotchas ................. 10 of them ⚠️
     5. When NOT to retry
     6. Interview Q&A 🎤

   THE MODEL 🧠
     Retry only pays off for TRANSIENT failures: 503, 429, a dropped socket. Retrying a
     deterministic error (400, a parse error) is pure added latency.
     Three knobs, and an interview answer needs all three:
       1. BACKOFF — wait longer each time (100, 200, 400…), so a struggling server recovers.
       2. JITTER — randomize each wait, so N clients don't retry in lockstep.
       3. A RETRYABLE CHECK — decide per error, never blanket-retry.
     Plus a CAP: max attempts (or better, a deadline), because a retry loop is also an
     amplifier — every client retrying 4× is 4× the load on the thing that's already down.

   💡 THE ONE-LINER: backoff protects the server, jitter protects it from your OTHER clients,
      and the retryable check protects you from wasting time on errors that can't improve.
   ============================================================================ */

/**
 ** Retry with exponential backoff - retry a failed operation few times and waiting longer before each retry with exponential delay because if it gives time for server to recover and trying it in every 100ms will make things worse. Two non negotiable's - jitter (random delay) and retryable error check (client errors)
 */

import { pLimit } from "./concurrency-limiter.js"; // ⚠️ the .js is REQUIRED in ESM (§4.7)

// Helpers
const sleep = (n) => new Promise((res, _) => {
  setTimeout(() => { res() }, n);
});

function fakeApi(failTimes, status = 503) {
  let calls = 0;
  const fn = async () => {
    calls++;
    if (calls <= failTimes) {
      const e = new Error(`HTTP ${status}`);
      e.status = status;
      throw e;
    }
    return "success";
  };
  fn.calls = () => calls;
  return fn;
}

function hangingApi(ms) {
  let calls = 0;
  const fn = async () => {
    calls++;
    await sleep(ms);
    return "late";
  };
  fn.calls = () => calls;
  return fn;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. retry() 🔁
// ─────────────────────────────────────────────────────────────────────────────
/*
   Loop forever; return on the first success. On failure, decide: retryable? attempts left?
   If either says no, rethrow. Otherwise sleep and go again.

   ⚠️ `attempts` counts TOTAL CALLS, not extra retries: attempts 4 = 4 calls, 3 sleeps (§4.6).
   Backoff ladder (baseMs 100, maxMs 2000): 100, 200, 400, 800, 1600, 2000, 2000 …
   `exp * Math.random()` is FULL jitter — the real wait is anywhere in [0, exp).
*/
async function retry(fn, {
  attempts = 4,
  maxMs = 2000,
  baseMs = 100,
  isRetryable = (e) => e.status >= 500 || e.status === 429 || e.name === 'FetchError' // ⚠️ misses real fetch errors (§4.7)
} = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();     // ⚠️ fn must be a FUNCTION, not a promise (§4.8)
    } catch (e) {
      if (!isRetryable(e) || attempt >= attempts - 1) throw e; // ✅ rethrow the ORIGINAL error
      const exp = Math.min(maxMs, baseMs * 2 ** attempt); // 100, 200, 400, 800
      await sleep(exp * Math.random());
    }
  }
}
// const api1 = fakeApi(2);
// const a1 = await retry(api1);
// console.log(`🚀 ~ a1 with API calls ${api1.calls()} : $${a1}`)
//   // => 'success', 3 calls, ~228ms (2 failures + 2 jittered sleeps)

// const api2 = fakeApi(4);
// const a2 = await retry(api2);
// console.log(`🚀 ~ a2 with API calls ${api2.calls()} : $${a2}`);
//   // => ❌ THROWS 'HTTP 503' after 4 calls — attempts(4) exhausted, and this line has no
//   //    try/catch, so uncommenting it alone kills the file.

// const api3 = fakeApi(Infinity);
// try {
//   await retry(api3, { attempts: 10 });
// } catch (e) {}
// console.log(`🚀 ~ a3 with API calls ${api3.calls()}`);
//   // => 10 calls in ~5.3s. Sleeps observed: 98, 85, 294, 568, 52, 1342, 1223, 13, 1585
//   //    — that spread IS the jitter; two of them were under 60ms.

// const api4 = fakeApi(3, 400);
// try {
//   await retry(api4, { attempts: 4 })
// } catch (e) {}
// console.log(`🚀 ~ a4 with API calls ${api4.calls()}`);
//   // => 1 call, 0ms ✅ a 400 isn't retryable, so it gives up instantly. With 429: 4 calls.

// ─────────────────────────────────────────────────────────────────────────────
// 2. withTimeout() ⏱️
// ─────────────────────────────────────────────────────────────────────────────
// ** withTimeout - retry only helps if failure is found. If a network call stays forever and wont return error, we wrap it with a timer so that after certain time, timer rejects with error and retry can happen again.
function withTimeout(promise, ms) {
  let id;
  const timer = new Promise((_, rej) => {
    id = setTimeout(() => {
      rej(new Error('Attempt Timeout'));
    }, ms);
  });
  return Promise.race([timer, promise]);
  // ⚠️ `id` is assigned but never cleared — that's the leak in §4.1. The one-line fix:
  //    return Promise.race([timer, promise]).finally(() => clearTimeout(id));
}

// const t0 = Date.now();

// // const api5 = hangingApi(200);
// // try {
// //   const result = await retry(() => withTimeout(api5(), 5000), { attempts: 1 });
// //   console.log("🚀 ~ result:", result)
// // } catch (e) {
// //   console.log("🚀 ~ e:", e);
// // }
// // console.log(`🚀 ~ a5 with API calls ${api5.calls()}`);

// process.on("exit", () => console.log(`exited at ${Date.now() - t0}ms`)); // Process exits after the timer was done which is a leak, so use clearTimeout / id.unref(it ignores the timer and node exits instead of waiting) / process.exit (terminates immediately)
// 💡 retry(() => withTimeout(api(), ms)) — the timeout goes INSIDE the retried thunk, so each
//    attempt gets its own fresh deadline.

// ─────────────────────────────────────────────────────────────────────────────
// 3. retry + CONCURRENCY LIMITER — which wraps which ⚖️
// ─────────────────────────────────────────────────────────────────────────────
// * Gotcha 5 - retry inside a limit holds the slot
// const limit = pLimit(3);
// const api = fakeApi(3);                  // ⚠️ call fakeApi ONCE — it RETURNS the api function
// await limit(() => retry(() => api()));   // ✅ allocates one slot for retries, concurrency stays capped
// await retry(() => limit(() => api()));   // ⚠️ each attempt takes a slot of its own
//
// ⚠️ Your two lines had `retry(() => fakeApi(3))`: fakeApi RETURNS a function, so that thunk
//    resolved to a function object on the first try and the API was never called at all.
//    It needs `const api = fakeApi(3)` first, then `retry(api)` or `retry(() => api())`.
//
// => MEASURED, pLimit(2), two APIs that fail twice (20ms/call, 200ms backoff) plus one quick
//    task Q submitted at the same time:
//      limit(() => retry(api))   A@467  B@468  Q@488ms   max in-flight 2
//      retry(() => limit(api))   A@466  B@466  Q@43ms    max in-flight 2
// 💡 Both CAP concurrency — that part of the ❌ isn't a real failure. The difference is who
//    waits: outside, the backoff sleep occupies a slot and Q is stuck behind it (488ms);
//    inside, slots free during backoff and Q slips in (43ms), but every retry re-queues and
//    competes with fresh work. Default to limit(() => retry(...)): it caps what the SERVER
//    sees, sleeps included. Choose the other when slot time is your scarce resource.

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOTCHAS ⚠️  — reread the morning of the interview
// ─────────────────────────────────────────────────────────────────────────────

/* ---- 4.1 ⚠️ clearTimeout is not optional ------------------------------------- */
// * Gotcha 1 - clearTimeout is not optional, if task completes early and node still wait for timer to complete and then process exits. In current state, it is not visible but take a case of 100 req/sec for 30 secs, we would have 3000 dead timers sitting in memory and node keeps the event loop and memory is piled up with closures and rejection handlers for 3000 timers and node waits for it to complete, if we use clearTimeout it frees up memory and node process will exit after task completes.
// => 50ms task, 3000ms timeout: as written the process exits at 3004ms. With
//    `.finally(() => clearTimeout(id))` it exits at 54ms; with `id.unref()`, 53ms.
// 💡 unref lets node exit but the timer still sits in memory — clearTimeout is the real fix.

/* ---- 4.2 ⚠️ Promise.race doesn't cancel the loser ---------------------------- */
// * Gotcha 2 - Promise.race doesn't cancel the looser
// const slow = async () => {
//   await sleep(3000);
//   console.log('✅ slow task completes')
// };
// try {
//   await withTimeout(slow(), 1000);
// } catch (e) {
//   console.log("🚀 ~ e:", e);
//  }
// => caught 'Attempt Timeout' at 1002ms, then '✅ slow task completes' at 3001ms.
//    You stopped WAITING; the work carried on and held the process open.
//  Real cancellation needs AbortController and pass signal to fetch so the request will cancel.
// ⚠️ So a timed-out attempt still consumes a server connection while the retry runs: your
//    timeout can DOUBLE the load instead of shedding it.

/* ---- 4.3 ⚠️ Never retry non-idempotent operations ---------------------------- */
// * Gotcha 3 - Never retry non idempotent operations
/**
  Idempotent operations like /GET and /PATCH is safer for retry but for POST /payments, if timeout happens that wont indicate whether server has processed it or not and If retry is performed then probable chance that it will be charged twice. So, make sure send a idempotent key which server deduplicates on.
*/
// 💡 A timeout is the ambiguous case: "no response" ≠ "not processed".

/* ---- 4.4 ⚠️ Nested retries multiply ----------------------------------------- */
// * Gotcha 4 - nested retries multiply
/*
  Retry at http client, retry in service wrapper and retry in the call makes - 4 * 4 * 4 = 64 retries and this might flood the server with many calls and it makes things worse. Pick one layer in application code and have the retry mechanism used over there but not everywhere.
*/

/* ---- 4.5 ⚠️ Retry inside a limit holds the slot — see §3 --------------------- */

/* ---- 4.6 ⚠️ `attempts` counts CALLS, not retries ----------------------------- */
// => attempts 4 -> 4 calls, 3 sleeps. attempts 1 -> 1 call, no retry. attempts 0 -> 1 call
//    (0 >= -1 is already true, so it throws after the first failure).
// 💡 Name it `attempts` or `maxRetries` and say which you mean — the off-by-one is a classic
//    review comment. A guard like `Math.max(1, attempts)` documents the intent.

/* ---- 4.7 ⚠️ The default isRetryable misses real network errors --------------- */
// A failed global fetch in node throws: TypeError, message 'fetch failed', and NO .status.
// => `e.status >= 500 || e.status === 429 || e.name === 'FetchError'` -> false, so the most
//    common transient failure of all is never retried. ('FetchError' is node-fetch v2's name.)
// ✅ Add the no-response case, e.g.
//    e instanceof TypeError || ['ECONNRESET','ETIMEDOUT','ENOTFOUND','EAI_AGAIN'].includes(e.cause?.code)
// ⚠️ Also: `undefined >= 500` is false, which is why a missing status silently means
//    "don't retry" rather than throwing.

/* ---- 4.8 ⚠️ Retry takes a THUNK — retrying a promise does nothing ------------ */
// const p = api();                        // started once, settles once
// await retry(() => p);                   // => throws the SAME error, api calls: 1
// await retry(() => api());               // => 'success', api calls: 3 ✅
// 💡 Same rule as the concurrency limiter: a promise is already running, so only a function
//    can give you a second attempt.

/* ---- 4.9 ⚠️ No jitter = thundering herd ------------------------------------- */
// 5 clients failing together, 3 attempts each, baseMs 100:
//   no jitter   -> calls at 0,1,1,1,1 | 102,102,102,102,102 | 302,304,304,305,305
//   full jitter -> calls at 1,1,1,1,1 | 2,36,39,47,97 | 137,137,140,173,196
// => without jitter every client hammers the server in the same 3 instants, forever in sync.
// 💡 Full jitter `rand(0, exp)` can retry almost instantly; equal jitter
//    `exp/2 + rand(0, exp/2)` keeps a floor. Say which you chose and why.

/* ---- 4.10 ⚠️ Attempts × timeout = worst-case latency ------------------------ */
// attempts 4, a 5s timeout per attempt, backoff 100+200+400:
// => up to 20,700ms before the caller hears anything. Nobody's request budget survives that.
// ✅ Prefer a DEADLINE over a count: pass AbortSignal.timeout(500) and stop when it fires.
// ⚠️ Check the deadline BEFORE sleeping and clamp the sleep to what's left — a naive check
//    after the failure overshot a 500ms deadline to 853ms (5 calls) in testing.

// ─────────────────────────────────────────────────────────────────────────────
// 5. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
// ! When not to use
/*
  1. when error is deterministic, a 400 error, parse error etc.. Retrying is pure latency.
  2. when operation is non-idempotent.
  3. when upstream handles retries and current layer adds retries then it multiplies the retries which makes things worse on server side
*/
// 4. when the caller has a tight deadline — 4 attempts can cost 20s (§4.10).
// 💡 At scale the next question is a CIRCUIT BREAKER: after N consecutive failures, stop
//    calling for a cooling-off period instead of retrying every request.

// ─────────────────────────────────────────────────────────────────────────────
// 6. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Why exponential backoff and not a fixed 100ms?
      Fixed retries keep the same pressure on a server that's already failing. Doubling gives
      it room to recover, and caps the number of calls in the window. (§1)

 ** Q2. Why is jitter non-negotiable?
      Without it, every client that failed together retries together — verified: 5 clients hit
      at the same 3 instants. Jitter spreads them out. (§4.9)

 ** Q3. Which errors do you retry?
      Transient only: 5xx, 429, and no-response network errors. Never 4xx — it can't improve.
      Watch out: a failed global fetch is a TypeError with NO status, so a status-only check
      silently skips it. (§1, §4.7)

 ** Q4. Why does retry need a timeout?
      A hung request never fails, so retry never fires. Wrap each attempt: retry(() =>
      withTimeout(api(), ms)), timeout INSIDE, so every attempt gets a fresh deadline. (§2)

 ** Q5. Does the timeout cancel the request?
      No. Promise.race only stops you listening — verified: the loser finished 2s later and
      held the process open. Only AbortController, with the signal threaded into fetch,
      actually cancels. (§4.2)

 ** Q6. What must you never retry?
      Non-idempotent writes. A timeout doesn't tell you whether the server processed it —
      retrying a POST /payments can charge twice. Send an idempotency key. (§4.3)

 ** Q7. `attempts: 4` — how many calls?
      Four: one initial plus three retries, with three sleeps between them. (§4.6)

 ** Q8. Retry inside the concurrency limiter, or outside?
      Both cap concurrency. Inside (limit(() => retry(...))) the backoff holds a slot, which
      caps what the server sees — the usual default. Outside frees slots during backoff but
      makes retries queue against fresh work. Measured: an unrelated task waited 488ms vs
      43ms. (§3)

 ** Q9. Why can't you retry a promise?
      It already ran and it settles once, so every attempt sees the same outcome. Retry needs
      a function. (§4.8)

 ** Q10. Attempts or a deadline?
      A deadline. Four attempts with a 5s timeout each can burn 20.7s of a caller's budget.
      Pass AbortSignal.timeout(...), check it before sleeping, and clamp the sleep to the
      time left. (§4.10)

 ** Q11. Three retry layers, 4 attempts each — what's the real number?
      64 calls for one logical request. Retry at ONE layer. (§4.4)
 */

// 👉 NEXT: no file yet. The natural follow-ups are AbortController/cancellation (§4.2 is the
//    only unsolved gotcha here) and a circuit breaker (§5). See concurrency-limiter.js §6.4
//    for the rate-limit side of the same problem.
