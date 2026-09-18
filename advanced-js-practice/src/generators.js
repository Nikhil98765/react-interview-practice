/* ============================================================================
   ITERATORS, ITERABLES & GENERATORS — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you uncomment it
     `// => X` = actual output from node v22 (ESM, top-level await).

   ▶️ Demos are commented out. Uncomment a block and run: node src/generators.js

   CONTENTS
     1. The three definitions ..... iterator, iterable, generator
     2. The iterator protocol ..... what for...of and spread actually call
     3. Laziness .................. infinite sequences, and take()
     4. yield is two-way .......... next(value) feeds the paused yield
     5. yield* delegates .......... and captures the inner return
     6. Gotchas ................... 9 of them ⚠️
     7. When not to use them
     8. Exercises (with verified answers)
     9. Interview Q&A 🎤

   THE MODEL 🧠
     ITERATOR   = an object with .next() returning { value, done }.
     ITERABLE   = an object with [Symbol.iterator]() that returns an iterator.
     GENERATOR  = function* — calling it runs NO code, it hands back an object that is both
                  an iterator and an iterable, and that resumes where it left off on each
                  next(). The engine keeps the local state, so you don't.

     for...of, spread, destructuring, Array.from and Promise.all all do the same thing:
     call [Symbol.iterator](), then next() until done.

   💡 THE ONE-LINER: a generator is a function you can pause. Everything else — laziness,
      infinite sequences, two-way messaging, tree walks — falls out of that one ability.
   ============================================================================ */

/**
  ** Iterators - object which has a next method which returns {value, done}.
     Iterable - object which contains [Symbol.iterator]() method which returns iterator. This is what for...of and spread requires.
     generators - a function(function*) which returns a iterator and which pauses on every yield and resumes where it left off.These have local states managed by engine so these were called as state machines.
     Note - generators objects were both iterator and iterable as well.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE THREE DEFINITIONS 🧩
// ─────────────────────────────────────────────────────────────────────────────
// Iterator - Object that can have a next method which returns {value, done}
const obj1 = {
  counter: 0,
  next() {
    return {
      value: this.counter++,
      done: this.counter > 10   // ⚠️ off-by-one, see the note under the demo
    }
  },
  // After adding [Symbol.iterator] this object became iterable
  [Symbol.iterator]() {
    return this;   // ⚠️ returning `this` makes it ONE-SHOT: state lives on the object itself
  }
};


// console.log("🚀 ~ obj1.next():", obj1.next())   // => { value: 0, done: false } … and so on
//   // 11th call => { value: 10, done: true }
// for (const item of obj1) console.log("🚀 ~ item:", item);
//   // => 0 … 9 ✅ only TEN values
// ⚠️ The 11th result pairs value 10 with done:true, and every consumer DISCARDS the value of a
//    done:true result. To emit 0..10, compute done BEFORE the increment:
//      const value = this.counter;  return { value, done: value > 10 } … then bump.

function range(from, to) {
  let i = from;
  return {
    next: () => i <= to ? { value: i++, done: false } : { value: undefined, done: true }, // we need to manually track the index
    [Symbol.iterator]() {
      return this;
    }
  }
}

const it1 = range(1, 10);
// console.log("🚀 ~ it1.next():", it1.next())   // => { value: 1, done: false } …
//   // after the 10th: { value: undefined, done: true } forever ✅
// console.log([...range(1, 3)])                 // => [1, 2, 3] ✅

function* range1(from, to) {
  for (let i = from; i <= to; i++) {
    yield i; // generators takes care of tracking position and resumes where it left off. Works like a state machine with few lines of code.
  }
}
const it2 = range1(1, 10);
// console.log("🚀 ~ it2.next():", it2.next())   // => { value: 1, done: false } … same results, no manual bookkeeping
// 💡 Compare the two: range() hand-writes next(), done and the counter. range1() is a for loop.
//    That difference IS the interview answer for "why generators?".

// * generator
function* genExample() {
  yield 1;
} 

const g = genExample();
// console.log("🚀 ~ g.next():", g.next())   // => { value: 1, done: false }
// console.log("🚀 ~ g.next():", g.next())   // => { value: undefined, done: true } — and forever after ✅

// ─────────────────────────────────────────────────────────────────────────────
// 2. THE ITERATOR PROTOCOL 🔌
// ─────────────────────────────────────────────────────────────────────────────
/*
  * Iterator protocol - an object is considered as iterator if it implements next method and returns IteratorResult. IteratorResult is interface which contains 2 props, value and done
    for...of, spread destructing, Promise.all and Array.from were all doing the same thing under the hood.Arrays, Map, Set, NodeList, arguments are all iterable.
    Plain objects were not iterable, that why [...obj] will break and [...Object.entries(obj)] will not.
*/
const it3 = ['1', '2'][Symbol.iterator]();
// console.log("🚀 ~ it3.next():", it3.next())   // => { value: '1', done: false }, then '2', then done ✅

// ✅ Verified: [...{a: 1}] -> ❌ TypeError: {(intermediate value)} is not iterable
//              [...Object.entries({a: 1})] -> [['a', 1]] ✅
//              Promise.all(gen()) works — it takes any ITERABLE, not just an array ✅
// ⚠️ One exception to "they all do the same thing": Array.from also accepts ARRAY-LIKES
//    (an object with .length), which have no iterator at all:
//      Array.from({ length: 3 }, (_, i) => i) -> [0, 1, 2] ✅   but [...{length: 3}] throws.
// ⚠️ And OBJECT spread is not iteration: { ...{a: 1} } -> { a: 1 } ✅ — it copies own
//    enumerable keys and never touches Symbol.iterator. Same three dots, different machinery.

// ─────────────────────────────────────────────────────────────────────────────
// 3. LAZINESS 😴
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Generators were lazy
    Generators wont execute their body until next method is called. state, loop, counters were all preserved. while(true) never hangs because nothing runs until asked. This is what makes infinite sequence possible.
*/
function* genLazy() {
  console.log("🚀 ~ genLazy ~ body executed");
  yield 1;
  console.log("🚀 ~ genLazy ~ resumed");
  yield 2;
  return 'done';
}

const it4 = genLazy();   // ✅ nothing logged yet — calling a generator runs NO code
// console.log("🚀 ~ it4.next():", it4.next())   // => logs 'body executed', then { value: 1, done: false }
// console.log("🚀 ~ it4.next():", it4.next())   // => logs 'resumed',       then { value: 2, done: false }
// console.log("🚀 ~ it4.next():", it4.next())   // => { value: 'done', done: true }   <- the RETURN value
// console.log("🚀 ~ it4.next():", it4.next())   // => { value: undefined, done: true } ✅ done stays done

function* infiniteSequence() {
  let i = 0;
  while (true) { // never hangs, generators were lazy
    yield i++;
  }
}

// ⚠️ This take() never pulled from the iterator: it pushed the loop counter `i`, so `it` was
//    unused and the generator body never ran. It LOOKED right for naturals starting at 0 —
//    the worst kind of bug. Fixed to consume the iterator and to stop early when it ends:
function take(cb, takes) {
  const it = cb();
  const result = [];
  for (let i = 0; i < takes; i++) {
    const { value, done } = it.next();
    if (done) break;
    result.push(value);
  }
  return result;
}

// console.log("🚀 ~ take(infiniteSequence, 100):", take(infiniteSequence, 100));
//   // => [0, 1, 2, … 99] ✅ and it returns instantly: only 100 values were ever computed

// for (const i of infiniteSequence()) {
//   console.log("🚀 ~ i:", i);
// }
// ⚠️ THAT one really is infinite — it has no break. And [...infiniteSequence()] hangs the
//    process (spread has no early exit at all). Laziness protects the GENERATOR, not the consumer.

// ─────────────────────────────────────────────────────────────────────────────
// 4. yield IS TWO-WAY ↔️
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** yield is two-way
    yield sends a value out and whatever arg is used in next next() call will be send back in for that yield expression
    ** This is how async await works, async function is a generator which yields promises and it has a driver that calls next(resolvedValue) when each promise settles.
*/

function* gen2Way() {
  const a = yield 'first';
  console.log("🚀 ~ gen2Way ~ a:", a)
  const b = yield 'second';
  console.log("🚀 ~ gen2Way ~ b:", b)
} 

const it5 = gen2Way();
// console.log("🚀 ~ it5.next():", it5.next('arg 1')) // arg ignored, received: first
//   // => { value: 'first', done: false } ✅ nothing is paused yet, so there's no yield to receive 'arg 1'
// console.log("🚀 ~ it5.next('input 1'):", it5.next('input 1')) // received: input 1 -> second  
//   // => logs a = input 1, returns { value: 'second', done: false } ✅
// console.log("🚀 ~ it5.next('input 2'):", it5.next('input 2')) // received : input 2 -> { value: undefined, done: true}
//   // => logs b = input 2, returns { value: undefined, done: true } ✅
// 💡 `const a = yield 'first'` is TWO events at different times: the value goes OUT now, and
//    `a` is filled IN on the next call. That's exactly `const a = await somePromise`, where the
//    driver is the engine resuming you when the promise settles.

// ─────────────────────────────────────────────────────────────────────────────
// 5. yield* DELEGATES 🪆
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** yield* delegates
  yield* forwards every value from another iterable and evaluates to that generator's return. Essential for recursive travel - yield* walk(child)
*/

function* inner1() {
  yield 'a';
  yield 'b';
  return 'inner1 return';
}

function* inner2() {
  const a = yield* inner1();
  console.log("🚀 ~ inner2 ~ a:", a)
  yield 'x';
  yield 'y';
  return 'inner2 return';
}

function* outer() {
  const r = yield* inner2();
  console.log("🚀 ~ outer ~ r:", r)
  yield 'z';
}

// const result = [...outer()];
// console.log("🚀 ~ result:", result)
//   // => logs 'inner2 ~ a: inner1 return', 'outer ~ r: inner2 return'
//   //    then ['a', 'b', 'x', 'y', 'z'] ✅
// 💡 Two things at once: yield* forwards every yielded value to the outer consumer, AND
//    evaluates to the inner generator's RETURN. It's the only clean way to read a return
//    value (section 6.1), and it's what makes recursive walks one line — section 8.

// ─────────────────────────────────────────────────────────────────────────────
// 6. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
  ** Gotcha 1 - for...of discards the return value.
  spread, for...of and other loops which works with iterators will ignore the return value of generators. use yield* or manual next() to capture return value. Don't keep any meaningful data in return instead use yield.
*/

function* withReturn() {
  yield '1';
  yield '2';
  return 'return val';
}
const results1 = [];

for (const item of withReturn()) {
  results1.push(item);
}
// console.log("🚀 ~ results1:", results1)   // => ['1', '2'] ✅ spread gives the same
// ✅ The three ways to see 'return val':
//    manual: it.next(); it.next(); it.next() -> { value: 'return val', done: true }
//    yield*: function* d() { const v = yield* withReturn(); yield 'captured: ' + v; }
//            [...d()] -> ['1', '2', 'captured: return val']
//    (never from for...of or spread — a done:true value is always dropped, section 1)

/**
  ** Gotcha 2 - Generators are one shot.
    Once iterator object is completed, it is done with returning results. The reason why generators works for for...of loop is that each loop generates a new iterator object when generator is called.
*/

function* gen2() {
  yield 1;
  yield 2;
  yield 3;
}
const g1 = gen2();
const results2 = [...g1]; 
// console.log("🚀 ~ results2:", results2) // [1, 2, 3]      ✅
const results21 = [...g1];
// console.log("🚀 ~ results21:", results21) // []           ✅ same object, already exhausted

const results23 = [];
for (const item of gen2()) {
  results23.push(item);
}

for (const item of gen2()) {
  results23.push(item);
}
// console.log("🚀 ~ results23:", results23) // [1, 2, 3, 1, 2, 3] - twice because each loop created fresh iterator object by calling generator.
//   // ✅ verified
// 💡 An ARRAY is re-iterable because its [Symbol.iterator]() hands out a FRESH iterator each
//    time; a generator object hands back itself. To make something re-iterable, expose a
//    factory: { *[Symbol.iterator]() { … } } — section 8's tree does exactly that.

/**
  ** Gotcha 3 - early exit runs finally
    break, return or error thrown in for..of calls, the iterator return() will be called and resumes the generator at finally block. it.throw(err) will throw error at paused yield and if no try/catch inside the generator then error propagates to caller.
    This is how a generator releases resources
*/

function* genEarlyExit() {
  try {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
  } catch (e) {
      console.log("🚀 ~ genEarlyExit ~ e:", e)
  }
  finally {
    console.log(`🚀 ~ finally got executed`);
  }
}

// const arr1 = [];
// function test() {
//   for (const item of genEarlyExit()) {
//     if (item === 3) {
//       throw new Error('custom error'); 
//     }
//     arr1.push(item);
//   }
// }
// test()
//   // => 'finally got executed' runs, then the error propagates out of test() ✅
//   //    (break and an early `return` from the enclosing function do the same ✅)

const it6 = genEarlyExit();
// console.log("🚀 ~ it.next():", it6.next())
//   // => { value: 1, done: false }
// console.log("🚀 ~ it6.throw('custom error'):", it6.throw('custom error'))
//   // => logs the catch and the finally, returns { value: undefined, done: true } ✅
//   //    the generator CAUGHT it, so throw() doesn't rethrow — it just finishes
// console.log("🚀 ~ it6.return('stopped'):", it6.return('stopped'));
//   // => { value: 'stopped', done: true } ✅ finally does NOT run again (already finished)
// ✅ On a LIVE generator, return('stopped') runs the finally and gives { value: 'stopped', done: true }.
// ⚠️ With no try/catch inside, it.throw(err) propagates to YOUR call site and leaves the
//    generator done. An error thrown inside the body surfaces at the next() that resumed it.
// ⚠️ A `return` inside finally overrides the result: { value: 'from finally', done: true }.

/* ---- 6.4 ⚠️ done is final -------------------------------------------------- */
// Once a generator finishes, every later next() is { value: undefined, done: true }. No
// throwing, no restarting. Call the generator function again for a fresh run.

/* ---- 6.5 ⚠️ Laziness protects the producer, not the consumer ---------------- */
// [...infiniteSequence()] and a for...of with no break both hang forever. Bound it with
// take(gen, n), a break, or a condition inside the generator.

/* ---- 6.6 ⚠️ A done:true value is always discarded --------------------------- */
// Both the obj1 off-by-one (section 1) and the return value (Gotcha 1) are the same rule:
// consumers stop at done:true and throw that value away. Never pair your last real value
// with done:true.

/* ---- 6.7 ⚠️ Returning `this` from [Symbol.iterator] makes it one-shot ------- */
// obj1 and range() do that, so they can only be consumed once — the second for...of sees an
// exhausted iterator. Fine for a generator object; a trap for a "collection" you expect to
// re-read.

/* ---- 6.8 ⚠️ Async iteration is a separate protocol -------------------------- */
// async function* aGen() { yield 1; await sleep(5); yield 2; }
// for await (const v of aGen()) …            // => [1, 2] ✅
// It uses [Symbol.asyncIterator] and next() returns a PROMISE of { value, done }. for...of
// over an async generator throws — the two protocols don't mix.

/* ---- 6.9 ⚠️ There is no arrow generator ------------------------------------- */
// `const f = *() => {}` is a ❌ SyntaxError. The forms are: function* f(){}, an object
// method *name(){}, a computed method *[Symbol.iterator](){}, a class method *name(){},
// and async function* f(){}.

// ─────────────────────────────────────────────────────────────────────────────
// 7. WHEN NOT TO USE THEM ❌
// ─────────────────────────────────────────────────────────────────────────────
/**
  *! When not to use them
    1. Iterating a finite array - for..of or map works fine. generators adds machinery for nothing.
    2. Async work - async/await exits. use async await generators for streams but not for one-off calls.
    3. Anywhere a plain array is small enough. laziness costs readability. use it for infinite, expensive or streaming sequences.
*/
// 💡 Where they DO earn their place: infinite or unknown-length sequences, paginated APIs
//    (yield a page, fetch the next only when asked), recursive walks over trees, and
//    anything you want to stop halfway without computing the rest.

// ─────────────────────────────────────────────────────────────────────────────
// 8. EXERCISES 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Exercise
 
    Build three things and prove each.

    1. range(from, to, step) as a generator — confirm [...range(1,10,3)] is [1,4,7,10].
    2. take(iterable, n) over an infinite naturals() — confirm it returns 5 values and doesn't hang.
    3. A tree object of nested nodes with a *[Symbol.iterator]() that walks it depth-first using yield* — confirm spreading it twice gives the same result both times.

    Then prove two behaviors: a generator with try/finally runs its finally when you break out of a for...of, and next('A') shows up as the value of the paused yield.
*/

function* range12(from, to, step) {
  for (let i = from; i <= to; i = i + step) {
    yield i;
  }
}

const results = [...range12(1, 10, 3)];
// console.log("🚀 ~ results:", results)   // => [1, 4, 7, 10] ✅

function* naturals() {
  let i = 1;
  while (true) {
    yield i++;
  }
}

function take1(iterable, n) {
  const results = [];
  let counter = 0;

  for (const item of iterable) {
    counter++;
    results.push(item);
    if (counter === n) break;   // ✅ the break is what makes an infinite source safe
  }
  return results;
}

const it21 = naturals();
// console.log("🚀 ~ it21[Symbol.iterator]():", it21[Symbol.iterator]()) // generator object is also an iterator
//   // => the SAME object: it21[Symbol.iterator]() === it21 -> true ✅

// console.log("🚀 ~ take1(naturals(), 5):", take1(naturals(), 5))
//   // => [1, 2, 3, 4, 5] ✅ (this call used to pass 10 while the label said 5)
// 💡 take1 takes an ITERABLE and take() above takes a generator FUNCTION. The iterable
//    version is the better API: it also accepts arrays, Sets and Maps.

const treeObj = {
  value: 1,
  children: [
    {
      value: 2,
      children: [
        {
          value: 4,
          children: [],
        },
        {
          value: 5,
          children: [],
        },
      ],
    },
    {
      value: 3,
      children: [{
        value: 6,
        children: [],
      }],
    },
  ],
  *[Symbol.iterator]() {

    function* walk(node) {
      yield node.value;
      for (const item of node.children) {
        yield* walk(item);   // ✅ recursion + delegation in one line
      }
    }

    yield* walk(this);
  }
};



const result31 = [...treeObj];
// console.log("🚀 ~ result31:", result31)   // => [1, 2, 4, 5, 3, 6] ✅ depth-first
const result32 = [...treeObj];
// console.log("🚀 ~ result32:", result32)   // => [1, 2, 4, 5, 3, 6] ✅ SAME again —
//   // because *[Symbol.iterator]() is a factory: each spread calls it and gets a fresh
//   // generator object. Contrast Gotcha 2, where the generator object itself was reused.

function* gen12() {
  try {
    let i = 0;
    while (true) {
      yield i++;
    }
  }
  finally {
    console.log(`🚀 ~ finally triggered`);
  }
}

// for (const item of gen12()) {
//   if (item === 3) {
//     break;
//   }
// }
//   // => 'finally triggered' ✅ break calls it.return(), which resumes the generator at finally

function* gen13() {
  const a = yield '1';
  console.log("🚀 ~ gen13 ~ a:", a)
  const b = yield '2';
  console.log("🚀 ~ gen13 ~ b:", b)
}

const it13 = gen13();

// console.log("🚀 ~ it13.next():", it13.next())                   // => { value: '1', done: false }
// console.log("🚀 ~ it13.next('input 1'):", it13.next('input 1'))  // => logs a = input 1, { value: '2', done: false }
// console.log("🚀 ~ it13.next('input 2'):", it13.next('input 2'))  // => logs b = input 2, { value: undefined, done: true }

// ─────────────────────────────────────────────────────────────────────────────
// 9. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Iterator vs iterable?
      An iterator has next() returning { value, done }. An iterable has [Symbol.iterator]()
      returning an iterator. A generator object is both. (section 1)

 ** Q2. What does for...of actually do?
      Calls [Symbol.iterator](), then next() until done is true — and on break/return/throw
      it calls return() so the generator can clean up. (section 2, Gotcha 3)

 ** Q3. Why use a generator instead of a hand-written iterator?
      The engine keeps the position and locals. Compare range() (manual counter, manual
      done) with range1() (a for loop and one yield). (section 1)

 ** Q4. Why doesn't while(true) hang?
      Nothing runs until next() asks. The generator computes one value per call. But the
      CONSUMER can still hang — spread over an infinite generator never returns. (section 3, 6.5)

 ** Q5. What does next(value) do?
      It becomes the value of the yield the generator is paused on. The first next() has no
      paused yield, so its argument is dropped. (section 4)

 ** Q6. How does async/await relate to generators?
      Same machinery: pause at a point, resume with a value. An async function is a
      generator yielding promises, driven by the engine calling next(resolvedValue). (section 4)

 ** Q7. What is yield* for?
      Forward every value from another iterable AND capture its return value. The clean way
      to do recursive walks. (section 5, section 8)

 ** Q8. Where does a generator's return value go?
      Into the final { value, done: true } — which for...of and spread discard. Read it with
      manual next() or yield*. (Gotcha 1)

 ** Q9. Why did my second spread give []?
      Generators are one-shot, and [Symbol.iterator]() returns the same object. Call the
      generator function again, or expose *[Symbol.iterator]() so each consumer gets a fresh
      one. (Gotcha 2, section 8)

 ** Q10. How do generators release resources?
      try/finally. break, return, throw and it.return() all resume the generator at its
      finally block. (Gotcha 3)

 ** Q11. it.throw(err) — where does it land?
      At the paused yield, inside the generator. With a try/catch there it's handled and the
      generator continues or finishes; without one it propagates to the caller of throw()
      and the generator is done. (Gotcha 3)
 */

// 👉 NEXT: promises.js section 8 — async/await is this file's pause-and-resume with a driver
//    attached. Generators + promises is literally how co/redux-saga (and Babel's async
//    transpilation) work.
