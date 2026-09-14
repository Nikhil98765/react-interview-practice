/* ============================================================================
   DEEP CLONE & IMMUTABILITY — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you uncomment it
     `// => X` = actual output from node v22 (ESM, strict mode). Benchmarks are one machine.

   ▶️ Demos are commented out. Uncomment a block and run: node src/deep-clone.js

   CONTENTS
     1. Shallow vs deep ............ spread / Object.assign share nested refs
     2. structuredClone ............ what it keeps, what it throws on, what it silently drops
     3. JSON.parse(JSON.stringify) . the lossy classic
     4. deepClone() exercise ....... WeakMap for cycles, and its gaps vs structuredClone
     5. Gotchas .................... React structural sharing, arrays, freeze + 6 more ⚠️
     6. When NOT to deep clone
     7. Interview Q&A 🎤

   THE MODEL 🧠
     A copy is only as deep as the level where you stopped creating NEW objects. Spread
     copies level 1; every nested object below it is the same object in both copies.
     A deep clone makes a new object at every level — which is exactly what React does NOT
     want for state: React compares by reference, so "new everywhere" means "changed
     everywhere". The React answer is STRUCTURAL SHARING: new objects along the path you
     changed, the old references everywhere else.

   💡 THE ONE-LINER: clone deep to get an independent copy; share structure to update state.
   ============================================================================ */

/*
  * Deep clone and immutability
    {...obj} and object.assign() creates clone upto 1 level and nested objects are still shared references. changing nested object prop value will change the original nested object prop value. For a true deep copy, use structuredClone which is available to all modern day runtimes. It can handle cycles, arrays, objects, sets, Map, Date but not functions. Use lodash deep clone to clone functions, classes.
    ⚠️ Half right about lodash: _.cloneDeep keeps a class instance's prototype ✅, but it does NOT
       clone functions — top-level _.cloneDeep(fn) returns {}, and a nested function is copied
       by REFERENCE (verified, lodash 4.18). Nothing clones functions; see section 4.

  * Problem
    React re-renders based on references, if we mutate the state, reference won't be changed since react checks by reference, it wont rerender. using a shallow copy just changes the top level reference but nested reference is still shared and component re-renders but state was silently corrupted.
    This breaks the time travel debugging, undo stacks (which relies on app state) and useMemo comparisons.
*/

const userObj = { user: { name: "Nikhil", tags: ["a", "b"] } };

// ─────────────────────────────────────────────────────────────────────────────
// 1. SHALLOW vs DEEP 🪞
// ─────────────────────────────────────────────────────────────────────────────
// 📝 predict each log first (run ONE block at a time — s1 mutates userObj for the others)
// const s1 = { ...userObj };
// s1.user.name = 'Test';
// console.log("🚀 ~ userObj.user.name:", userObj.user.name); // name got corrupted, reference is being shared.
//   // => 'Test' ✅ s1 !== userObj, but s1.user === userObj.user

// const s2 = Object.assign({}, userObj);
// s2.user.name = 'Test1';
// console.log("🚀 ~ userObj.user.name:", userObj.user.name) // name got changed, reference is being shared.
//   // => 'Test1' ✅ same depth as spread

// const s3 = structuredClone(userObj);
// s3.user.name = 'Test2';
// console.log("🚀 ~ userObj.user.name:", userObj.user.name) // no change in name, new reference.
//   // => 'Nikhil' ✅

// ─────────────────────────────────────────────────────────────────────────────
// 2. structuredClone 🧬
// ─────────────────────────────────────────────────────────────────────────────
// * structuredClone
const cloned = structuredClone({
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2]),
  regex: /x/g,
  buf: new ArrayBuffer(8),
  undef: undefined,
  nan: NaN,
});
// console.log("🚀 ~ cloned:", cloned)
/*
   ✅ Verified what survives:
     Date, Map, Set, ArrayBuffer, typed arrays (Uint8Array), BigInt 10n  -> real instances/values
     undefined (key KEPT), NaN, -Infinity, -0                           -> exact
     Error (new TypeError('boom'))                                       -> TypeError, message kept
     RegExp /x/g                                                          -> flags kept, ⚠️ lastIndex reset to 0
*/

// * circular references works
const a = { name: "Nikhil" };
a.self = a;
const c = structuredClone(a);
// console.log("🚀 ~ c.self === c:", c.self === c) // structuredClone preserved circular references, but JSON.parse(JSON.stringify()) cant handle it.
//   // => true ✅

// * What breaks
// structuredClone({fn: ()=>{}}); // cant clone a function
//   // => ❌ DataCloneError: () => {} could not be cloned. (a Symbol throws the same)
// structuredClone(document.body); // checked in browser, HTMLBodyElement can't be cloned.
const classObjClone = structuredClone(new (class Foo {})()); // prototype is lost, no error thrown
// ✅ Verified on `class Foo { #secret = 42; x = 1; get double() {…}; hi() {…} }`:
//    instanceof Foo -> false, methods gone (typeof c.hi -> 'undefined'), own fields kept ({ x: 1 }),
//    the #private field silently dropped. Throws on functions, SILENT on classes — the
//    silent one is the dangerous one.

// ─────────────────────────────────────────────────────────────────────────────
// 3. JSON.parse(JSON.stringify(...)) — the lossy classic 🧻
// ─────────────────────────────────────────────────────────────────────────────
// * Gotcha 1 - JSON.parse(JSON.stringify(...)) is lossy
/*
  * still a go to answer for how do you deep clone.
    1. It silently destroys data and gives unintended results.
    2. slower than structuredClone in many non-trivial cases.
    3. throws error when cloning cyclic references.

    ✅ 1 and 3 verified. ⚠️ 2 is only half true — it depends on the SHAPE (3 runs, Node 22):
         small object      ×100k : JSON  ~85ms  vs structuredClone ~125ms  -> JSON 1.5× faster
         1000-row table    ×500  : JSON ~300ms  vs structuredClone ~400ms  -> JSON 1.3× faster
         100k-number array ×50   : JSON ~330ms  vs structuredClone  ~75ms  -> structuredClone 4-5× faster
       💡 Don't argue speed in an interview; argue CORRECTNESS. JSON is often faster on plain
          object-heavy data and wrong on everything else.
*/
const jsonResult = JSON.parse(
  JSON.stringify({
    date: new Date(), // string of date but not date obj
    map: new Map([["a", 1]]), // empty {}
    set: new Set([1, 2]), // empty {}
    regex: /x/g, // empty {}
    buf: new ArrayBuffer(8), // empty {}
    nan: NaN, // null
    undef: undefined, // key missing in result
    fn: () => {}, // key missing in result
  }),
);
// console.log("🚀 ~ jsonResult:", jsonResult);
//   // => ✅ all eight comments above verified. Plus:
//   //    Infinity -> null · new Error('boom') -> {} · { big: 10n } -> ❌ TypeError: Do not know how to serialize a BigInt
// ⚠️ Arrays are different from objects: [undefined, () => {}, NaN] -> [null, null, null].
//    In an OBJECT those keys vanish; in an ARRAY they become null (removing them would shift indexes).

const a1 = { name: "Nikhil" };
a1.self = a1;
// const circularJson = JSON.parse(JSON.stringify(a1));
// console.log("🚀 ~ circularJson:", circularJson) // throws error since JSON.parse(JSON.stringify(...)) can't handle circular references
//   // => ❌ TypeError: Converting circular structure to JSON

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXERCISE — deepClone() 🛠️
// ─────────────────────────────────────────────────────────────────────────────
/*
  * Exercise - deepClone
    1. Need to handle circular references
    2. handles special cases - Map, Set, Date
    3. mutation on clone doesn't change the original
    4. check how we can clone functions, classes (extra)

    Two things in implementation which differ from the actual structuredClone
    1. functions
          structuredClone -> throws error
          below implementation -> return same function reference (not cloned)
    2. class objects
          structuredClone -> prototype is lost
          below implementation -> need to make 2 below changes for it to make work.

    Functions are passed by reference, so cloning them is meaningless since it is immutable code.
    class objects can be fixed by making 2 changes.
      1.In object case, instead of create a plain obj (const result = {}) create a object by Object.create(Object.getPrototypeOf(value)) -> creates the new obj with a prototype chain of value's prototype.
      2. In object case, use Reflect.ownKeys(value) instead of Object.entries(value)

    ✅ Your two changes work — verified: instanceof Bar -> true, b.hi() -> 'hi 1', symbol keys kept.
    ⚠️ Three things they still can't do:
       • #private fields: a getter reading #secret on the clone THROWS
         "TypeError: Cannot read private member #secret from an object whose class did not declare it".
         No userland clone can copy private fields — only the constructor creates them.
       • Reflect.ownKeys + plain assignment turns non-enumerable props ENUMERABLE.
         Copy descriptors instead: Object.defineProperty(result, key, descriptor).
       • Frozen-ness isn't copied (Object.isFrozen(clone) -> false).
*/
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value; // base case - handles primitives, function and null

  if (seen.has(value)) return seen.get(value); // base case - handles circular references, if its already there in the weakmap return the result
  // 💡 WeakMap, not Map: keys are held weakly, so nothing leaks after the clone finishes.
  // 💡 seen.set happens BEFORE recursing into children — that's what lets a cycle find its
  //    half-built parent instead of recursing forever.

  // base case - leaf nodes
  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (Array.isArray(value)) {
    const result = [];
    seen.set(value, result);
    for (const item of value) {
      result.push(deepClone(item, seen)); // ⚠️ for…of + push fills holes: [1, , 3] -> [1, undefined, 3]
    }
    return result;
  }

  if (value instanceof Map) {
    const result = new Map();
    seen.set(value, result);
    for (const [key, val] of value) {
      result.set(deepClone(key, seen), deepClone(val, seen)); // ⚠️ object keys become NEW objects (section 5.4)
    }
    return result;
  }

  if (value instanceof Set) {
    const result = new Set();
    seen.set(value, result);
    for (const val of value) {
      result.add(deepClone(val, seen));
    }
    return result;
  }

  // Object case
  const result = {};
  seen.set(value, result);
  for (const [key, val] of Object.entries(value)) { // ⚠️ skips symbol keys and non-enumerable props
    result[key] = deepClone(val, seen);
  }
  return result;
}
/*
   Gaps vs structuredClone, all verified — each lands in the "Object case" and becomes a plain object:
     new Uint8Array([1, 2]) -> { '0': 1, '1': 2 }     structuredClone -> Uint8Array [1, 2]
     new ArrayBuffer(8)     -> {}                      structuredClone -> ArrayBuffer(8)
     new Error('boom')      -> {}  (message is non-enumerable)   structuredClone -> Error 'boom'
     { [Symbol('s')]: 1 }   -> {}                      (structuredClone drops symbol keys too)
   💡 In an interview, NAME these as known limits rather than handling every built-in.
*/

const original = {
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2]),
  nested: {
    a: {
      b: {
        c: [new Map([["b", 3]]), new Set([1, 5])],
      },
    },
  },
};
const original2 = {
  a: {},
};
original2.a.self = original2.a;
const cloned1 = deepClone(original);
// console.log("🚀 ~ cloned1:", cloned1.nested.a.b.c[1] === original.nested.a.b.c[1]);
//   // => false ✅ new Set, same contents [1, 5]. Mutating cloned1's nested Map leaves original's at 3.

const cloned2 = deepClone(original2);
// console.log("🚀 ~ cloned2:", cloned2.a.self === cloned2.a);
//   // => true ✅ the cycle points at the CLONE, not back into the original

const shared = { x: 1 };
const original1 = { p: shared, q: shared };
const clone3 = deepClone(original1);
// console.log("🚀 ~ clone3.p === shared:", clone3.p === shared); // shared object is cloned again for clone3 and is not equal to shared obj reference.
//   // => false ✅
// console.log("🚀 ~ clone3.p === clone3.q:", clone3.p === clone3.q) // p and q keys reference to same cloned share obj.
//   // => true ✅
// 💡 The same WeakMap that fixes cycles also preserves SHARED references (a DAG, not just a
//    cycle). Without `seen`, p and q would be two different objects — structuredClone keeps them shared too.

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOTCHAS ⚠️  — reread the morning of the interview
// ─────────────────────────────────────────────────────────────────────────────

/* ---- 5.1 ⚠️ You rarely want a deep clone in React ---------------------------- */
/*
  * Gotcha 2 - You rarely want the deep clone in react
  Deep cloning all of state is not useful and breaks the memoization. Since it changes the object references, react will re-render every react element in tree and breaks the React.memo used in avoiding re-renders even though nothing was changed.
  correct path is structural sharing - copy the only path that you were changing.
*/
// ⚠️ FIXED: `prev` was `{}`, so the demo threw "TypeError: Cannot read properties of undefined
//    (reading 'address')" — prev.user was undefined. It needs a real state shape.
const prev = { user: { name: 'Nikhil', address: { city: 'Hyd', pin: 500001 } }, settings: { theme: 'dark' } };
const setState = (cb) => cb(prev);

// const next = setState(prev => ({
//   ...prev,
//   user: {
//     ...prev.user,
//     address: {
//       ...prev.user.address,
//       city: 'Bangalore'
//     }
//   }
// }))
// console.log(next !== prev, next.user !== prev.user, next.user.address !== prev.user.address);
//   // => true true true ✅ every object ON the path is new
// console.log(next.settings === prev.settings, prev.user.address.city);
//   // => true 'Hyd' ✅ off-path refs reused, original untouched
//   //    With structuredClone(prev) instead, settings === prev.settings -> false: every memoized child re-renders.

// everything outside the path keeps old reference, so memoized siblings don't re-render.
// * Immer removes the nesting, it gives mutable looking syntax and produces structural shared immutable result. RTK uses immer internally and it is why RTK reducers mutate state legally.
// setState(produce(draft => { draft.user.address.city = 'Bangalore' }));
//   // (needs `import { produce } from 'immer'` — not installed in this project)

/* ---- 5.2 ⚠️ Arrays need the same discipline --------------------------------- */
/*
  * Gotcha 3 - arrays needs the same discipline.
    array methods returns the wrong thing or nothing at all.
    array.sort returns the original array sorted but not a new copy.
    push, pop, shift, unshift, splice, reverse, sort, arr[i] = x  - mutable
    [...arr], arr.slice(0, 1), toSpliced, toSorted, toReversed, with(i,x) - immutable
*/
// ✅ arr.sort() === arr -> true (sorted IN PLACE). [3,1,2].toSorted() -> new [1,2,3], original [3,1,2].
// ✅ [1,2,3].toReversed() -> [3,2,1] · .with(1, 9) -> [1,9,3] · .toSpliced(0, 1) -> [2,3]  (ES2023, Node 20+)
// ⚠️ Add to the mutable list: fill ([1,2,3].fill(0) -> [0,0,0]) and copyWithin.
// ⚠️ The immutable versions are SHALLOW: [{n:1}].toSorted()[0].n = 99 changes the original's n to 99.
// ⚠️ Bonus: [3, 10, 2].sort() -> [10, 2, 3]. The default compare is STRING order — pass (a, b) => a - b.

/* ---- 5.3 ⚠️ Object.freeze is shallow too ------------------------------------ */
/*
  * Gotcha 4 - Object.freeze is shallow too
    Deep freeze might a few lines but has performance costs. Make use of TS readonly which avoids mutating object at compile but still object can be mutated at runtime.
*/

const unfreezeObj = Object.freeze({ nested: { a: 1 } });
unfreezeObj.nested.a = 2; // Locks the object only at top level.
// console.log("🚀 ~ unfreezeObj:", unfreezeObj);
//   // => { nested: { a: 2 } } ✅ Object.isFrozen(unfreezeObj.nested) -> false
// unfreezeObj.nested = {};
//   // => ❌ TypeError: Cannot assign to read only property 'nested' — THROWS here because ES
//   //    modules are strict mode. The same write in a sloppy .cjs script is silently ignored.
// 💡 So "freeze fails silently" is only true outside strict mode.

/* ---- 5.4 ⚠️ Cloning a Map clones its object KEYS ---------------------------- */
// const key = { id: 1 };
// const m = new Map([[key, 'v']]);
// structuredClone(m).get(key)   // => undefined ✅ (deepClone(m).get(key) -> undefined too)
// The clone's key is a NEW object, and Map lookups are by reference. Any code that keeps the
// original key object around loses access to the entry. Primitive keys are unaffected.

/* ---- 5.5 ⚠️ Getters become plain values ------------------------------------- */
// const withGetter = { x: 2, get double() { return this.x * 2; } };
// Object.getOwnPropertyDescriptor(structuredClone(withGetter), 'double')
//   // => { value: 4, writable: true, … } ✅ the getter RAN once and its result was frozen in.
//   //    Change clone.x and clone.double stays 4. deepClone does the same (Object.entries invokes it).

/* ---- 5.6 ⚠️ Both clones are recursive — deep nesting blows the stack --------- */
// An object nested 20,000 levels deep:
//   deepClone(deep)        // => ❌ RangeError: Maximum call stack size exceeded
//   structuredClone(deep)  // => ❌ RangeError: Maximum call stack size exceeded  (same!)
// 💡 Rare in app state, real for parsed trees (ASTs, linked lists). The fix is an explicit
//    stack/queue instead of recursion.

/* ---- 5.7 ⚠️ Private fields can't be cloned by anyone ------------------------ */
// structuredClone drops #private silently; the prototype-preserving deepClone keeps the class
// but its methods THROW when they touch #private (section 4). If a class has private state, give it
// its own clone() method — only the class can construct its private fields.

/* ---- 5.8 ⚠️ structuredClone is not in every environment you'd assume --------- */
// Browsers since 2022 and Node 17+. Older jsdom setups and some test runners lack it —
// "structuredClone is not defined" in Jest-on-old-jsdom is a classic CI failure.

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
/*
  ! When not to use
  1. If object is flat, use spread syntax instead.
  2. You're in react state - use structural sharing but not a full clone
  3. If you want to clone functions, class instances and DOM nodes, structuredClone will throw error and use a custom deep clone instead.
     ⚠️ Correction: functions and DOM nodes THROW, but class instances DON'T — they clone
        silently into plain objects (your own section 2 line, verified). And no custom clone can
        truly clone a function or a #private field (section 4, section 5.7).
  4. The data is JSON from an API that you're about to replace anyway — don't clone, re-fetch.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Is { ...obj } a deep copy?
      No — one level. Nested objects are shared, so mutating copy.user.name changes the
      original. Object.assign is the same depth. (section 1)

 ** Q2. How do you deep clone in modern JS?
      structuredClone. It handles cycles, Date, Map, Set, RegExp, typed arrays, BigInt and Error.
      It throws on functions and DOM nodes, and silently drops class prototypes. (section 2)

 ** Q3. What's wrong with JSON.parse(JSON.stringify(x))?
      Date -> string; Map/Set/RegExp -> {}; NaN/Infinity -> null; undefined/functions vanish
      from objects but become null in arrays; BigInt and cycles throw. It's not even reliably
      slower — faster on object-heavy data, 4-5× slower on big numeric arrays. (section 3)

 ** Q4. Implement deepClone. What's the key idea?
      Recurse; return primitives as-is; special-case Date/RegExp/Array/Map/Set; and keep a
      WeakMap of original -> clone, set BEFORE recursing, so cycles and shared refs resolve. (section 4)

 ** Q5. Why WeakMap and not Map for `seen`?
      Weak keys: the originals aren't kept alive by the bookkeeping. And it only accepts
      objects, which is exactly what you track. (section 4)

 ** Q6. How would your clone preserve class instances? What still breaks?
      Object.create(Object.getPrototypeOf(value)) + Reflect.ownKeys. Still broken: #private
      fields (methods using them throw), non-enumerable props become enumerable unless you copy
      descriptors, frozen-ness is lost. (section 4)

 ** Q7. Can you clone a function?
      Not meaningfully — and nothing does. structuredClone throws; lodash returns {} top-level
      and copies the reference when nested; a custom clone should return the same reference. (section 2, section 4)

 ** Q8. Should you deep clone React state before updating it?
      No. It creates new references everywhere, so every memoized child re-renders. Use
      structural sharing: spread along the changed path only — or Immer, which RTK uses. (section 5.1)

 ** Q9. Which array methods mutate?
      push, pop, shift, unshift, splice, reverse, sort, fill, copyWithin, index assignment.
      Use spread/slice/toSorted/toReversed/toSpliced/with — and remember those are shallow. (section 5.2)

 ** Q10. Does Object.freeze make an object immutable?
      Only its top level. Nested objects stay writable. In strict mode (ES modules) writes to
      the frozen level throw; in sloppy scripts they're silently ignored. (section 5.3)

 ** Q11. I cloned a Map and now map.get(myKey) is undefined. Why?
      Object keys were cloned too, and Map lookup is by reference. (section 5.4)
 */

// 👉 NEXT: advanced-redux-practice — RTK reducers run on Immer, which is section 5.1's structural
//    sharing done for you: mutate a draft, get back a new root with untouched branches reused.
