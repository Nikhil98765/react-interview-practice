"use strict";

/* ============================================================================
   `this`, call / apply / bind — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     `// => X` is the ACTUAL logged value, verified by running this file under
     node (ESM — package.json says "type": "module"). Not guessed.

   ▶️ To see it for yourself, uncomment the 🚀 console.logs and run:  node src/bind.js

   CONTENTS
     1. The four rules ......... the precedence ladder
     2. Precedence proofs ...... new > bind, bind beats call, double-bind
     3. Arrow functions ........ no own `this`; the object-literal trap ⚠️
     4. Arrows in classes ...... the broken/fixed setInterval pair
     5. Arrow fields vs methods  instance vs prototype, and the identity cost
     6. No dot, no `this` ...... why call/apply/bind have to exist at all
     7. Polyfills .............. myCall / myApply / myBind + fidelity gaps ⚠️
     8. Interview Q&A 🎤

   THE MODEL 🧠
     `this` is decided by HOW a function is CALLED, not where it is written.
     At every call site, walk the ladder top-down and take the first match:

       1. new          -> a fresh object linked to fn.prototype
       2. call/apply/bind -> the thisArg you passed
       3. implicit     -> whatever is left of the dot
       4. default      -> undefined in strict mode / ESM, globalThis in sloppy mode

     Arrow functions are NOT on this ladder at all. They have no `this` slot, so
     `this` inside one is just a closure variable read from the enclosing scope.

   💡 THE ONE-LINER: regular functions get `this` at CALL time; arrows capture it at
      WRITE time. Every gotcha below is a consequence of that one sentence.
   ============================================================================ */

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE FOUR RULES 🪜  (written bottom-up, rule 4 first)
// ─────────────────────────────────────────────────────────────────────────────

// 4. DEFAULT — no dot, no binding, no new
function f() {
  return this; // => undefined ✅ ("use strict" + ESM. In sloppy mode this would be globalThis)
}

// 3. IMPLICIT — whatever sits left of the dot
const a = {
  id: '42',
  m() {
    return this.id;
  }
};
const b = {
  id: 'b-1',
};
b.m = a.m; // the SAME function object, now reachable from a second owner
// console.log("🚀 ~ a.m():", a.m())   // => '42'  ✅
// console.log("🚀 ~ b.m():", b.m())   // => 'b-1' ✅ same function, different `this`
// 💡 This pair is the whole lesson: `this` is not baked into the function.

// 2. EXPLICIT — call / apply / bind
const b1 = f.bind({ id: 'bind' })();
// console.log("🚀 ~ b1:", b1);   // => { id: 'bind' }  ✅
const b2 = f.call({ id: 'call' });
// console.log("🚀 ~ b2:", b2);   // => { id: 'call' }  ✅
const b3 = f.apply({ id: 'apply' });
// console.log("🚀 ~ b3:", b3);   // => { id: 'apply' } ✅
// 💡 call vs apply is ONLY the argument shape: call(thisArg, a, b) vs apply(thisArg, [a, b]).
//    bind is the odd one out — it doesn't invoke, it returns a new function.

// 1. NEW — highest priority
function f1(v) {
  this.v = v;
}
const f11 = new f1('new');
// console.log("🚀 ~ f11.v:", f11.v)   // => 'new' ✅

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRECEDENCE PROOFS ⚔️
// ─────────────────────────────────────────────────────────────────────────────

// new BEATS bind
function F(v) {
  this.v = v;
  this.m = function () {
    return this.v;
  };
}
const F2 = F.bind({ v: 'From bind' });
// console.log("🚀 ~ new F2('from new').v:", new F2('from new').v)
// => 'from new' ✅ — F2 has { v: 'From bind' } bound, but `new` overrode it outright.

// bind BEATS call — a bound function's `this` is sealed
const g = function () {
  return this.tag;
}.bind({ tag: 'this is from bind' });
// console.log("🚀 ~ g.call({ tag: 'this is from call' }, []):", g.call({ tag: 'this is from call' }, []))
// => 'this is from bind' ✅ — call CANNOT override an existing bind.

// ⚠️ …which means bind is a ONE-SHOT operation. The second bind is a no-op on `this`.
function once() {
  return this.t;
}
const r1 = once.bind({ t: "once" }).bind({ t: "twice" })();
// console.log("🚀 ~ r1:", r1);   // => 'once' ✅ the FIRST bind is permanent
// 💡 WHY: the second bind binds the already-bound wrapper, and that wrapper ignores its
//    own `this`. Nothing is "re-pointed" — you just wrapped a sealed function.

// ─────────────────────────────────────────────────────────────────────────────
// 3. ARROW FUNCTIONS — off the ladder entirely 🏹
// ─────────────────────────────────────────────────────────────────────────────
/**
  Arrow functions have no `this` slot, so `this` inside one resolves like any other
  closure variable: outward through the ENCLOSING SCOPES until something has a `this`.

  What module-scope `this` is, by environment:
    ES module  -> undefined
    CommonJS   -> {} (module.exports)
    browser script -> globalThis (window)
    class body -> the instance, because the class's `this` comes from the constructor
                  (a regular function whose `this` is the new instance)
*/

// ⚠️ THE TRAP: an object literal is NOT a scope. Arrows skip straight past it.
const arrowFnObj = {
  id: 'arrow-fn-obj-id',
  m: () => this, // ⚠️ does NOT see arrowFnObj
  method1() {
    this.id = 'method-1 inside arrowFnObj';
    const inner = () => this; // ✅ inherits method1's `this` (a real function scope)
    return inner();
  }
};

const id = arrowFnObj.m();
// console.log("🚀 ~ id:", id)   // => undefined ✅
// WHY: object literals create no scope, so the arrow looks past it to the next enclosing
// scope — here, module scope — and in an ES module that `this` is undefined.

const m1Id = arrowFnObj.method1();
// console.log("🚀 ~ m1Id:", m1Id)   // => arrowFnObj itself ✅
// WHY: method1 is a REGULAR function called as arrowFnObj.method1(), so rule 3 gives it
// arrowFnObj, and the inner arrow simply borrows that.
// 💡 RULE OF THUMB: method -> regular function (needs its own `this`);
//                   callback inside a method -> arrow (needs to BORROW that `this`).

// ⚠️ thisArg is silently IGNORED on an arrow — call/apply/bind can't touch it.
((arg) => {
  // console.log("🚀 ~ r2:", this, arg);   // => undefined 'arg 1' ✅
  // The argument still arrives; only the thisArg is discarded.
}).call({ a: "arrow's call" }, 'arg 1');

// ─────────────────────────────────────────────────────────────────────────────
// 4. ARROWS IN CLASSES — the classic callback bug 🐛
// ─────────────────────────────────────────────────────────────────────────────
class Timer {
  constructor(n) {
    this.n = 0;
  }

  broken() {
    // ❌ setInterval invokes this callback with nothing to the left of a dot, so rule 4
    //    applies and `this` is undefined -> TypeError on this.n++
    setInterval(function () {
      this.n++;
      // console.log("🚀 ~ Timer ~ broken ~ this.n:", this.n)
    }, 2000);
  }

  fixed() {
    // ✅ the arrow has no `this` of its own, so it captures fixed()'s `this` — the instance.
    //    How setInterval calls it is irrelevant; the binding was decided where it was WRITTEN.
    setInterval(() => {
      this.n++;
      // console.log("🚀 ~ Timer ~ fixed ~ this.n:", this.n);
    }, 2000);
  }
}

const t = new Timer();
// t.broken();   // ⚠️ leave commented — it throws every 2s and never stops
// t.fixed();

// ─────────────────────────────────────────────────────────────────────────────
// 5. ARROW CLASS FIELDS vs PROTOTYPE METHODS ⚖️
// ─────────────────────────────────────────────────────────────────────────────
/**
  Arrow functions can never be used with `new`, because `new` needs two things an arrow
  simply doesn't have:
    1. a `prototype` property to link the new object to
    2. a `this` slot for the constructor to write into
*/
const arrowFn = () => { };
// const aFn = new arrowFn();   // ❌ TypeError: arrowFn is not a constructor
// console.log("🚀 ~ aFn:", aFn)

class A {
  arrow = () => 'A.arrow'; // a FIELD — created fresh per instance
  method1() {              // a METHOD — lives once on A.prototype
    return 'A.method';
  }
}

// console.log("🚀 ~ Object.getOwnPropertyNames(A.prototype):", Object.getOwnPropertyNames(A.prototype));
// => ['constructor', 'method1'] ✅
// console.log("🚀 ~ Object.getOwnPropertyNames(new A()):", Object.getOwnPropertyNames(new A()))
// => ['arrow'] ✅ — the arrow field is an OWN property of the instance

const a1 = new A();
const a2 = new A();
// console.log("🚀 ~ a1.method1 === a2.method1:", a1.method1 === a2.method1)  // => true  ✅ shared via prototype
// console.log("🚀 ~ a1.arrow   === a2.arrow:",   a1.arrow === a2.arrow)      // => false ✅ one closure per instance
// 💡 THE TRADE-OFF: arrow fields are auto-bound (great for React handlers) but cost one
//    function object per instance, and they're invisible on the prototype — so they can't
//    be spied on, patched, or overridden by a subclass's prototype method.

// ─────────────────────────────────────────────────────────────────────────────
// 6. NO DOT, NO `this` — why call/apply/bind must exist 🔑
// ─────────────────────────────────────────────────────────────────────────────
// There is no raw syntax in JS for "invoke fn with `this` = X". The only native mechanism
// is the dotted call — so to fake it you must temporarily PARK the function on the target:
function greet(punct) {
  return `${this.name}${punct}`;
}

const target = { name: 'Nikhil' };
target.temp = greet;
// console.log("🚀 ~ target.temp('!'):", target.temp('!'));   // => 'Nikhil!' ✅
delete target.temp;
// 💡 That park–call–delete dance IS the call polyfill. Everything below is this trick,
//    made safe.

// ─────────────────────────────────────────────────────────────────────────────
// 7. POLYFILLS 🛠️
// ─────────────────────────────────────────────────────────────────────────────

//* Call polyfill — fn.myCall(thisArg, ...args)
Function.prototype.myCall = function (thisArg, ...args) {
  const fn = this;
  if (typeof fn !== 'function') throw new TypeError('myCall must be called on a function');

  // ⚠️ THE IRREDUCIBLE GAP (see note below): the park-on-an-object trick can only deliver an
  //    OBJECT as `this`. When the callee needs a primitive, null, or undefined receiver
  //    verbatim, no amount of parking can express that — only the engine can. So route those
  //    through Reflect.apply and keep the hand-rolled path for the case it can actually model.
  if (thisArg === null || thisArg === undefined || Object(thisArg) !== thisArg) {
    return Reflect.apply(fn, thisArg, args);
  }

  const key = Symbol();  // Symbol so we can never clobber a real property
  // defineProperty, not `ctx[key] = fn`: non-enumerable keeps the temp invisible to anything
  // that walks the object, and it sidesteps an inherited setter for this key.
  Object.defineProperty(thisArg, key, { value: fn, configurable: true, enumerable: false });
  try {
    return thisArg[key](...args);
  } finally {
    delete thisArg[key]; // ✅ runs even if fn throws — no leaked property
  }
};
// console.log("🚀 ~ greet.myCall:", greet.myCall(target, '!'))   // => 'Nikhil!' ✅

/* 💡 WHAT THE THREE GUARDS ABOVE ARE FOR — this is the "what's wrong with the naive
   polyfill?" answer, and the naive version is the one-liner `Object(thisArg ?? globalThis)`:

     1. PRIMITIVES WERE BOXED. Naive: `who.call(7)` gave `this` as a Number OBJECT; native
        strict mode gives the number 7. Verified: native -> 'number', naive -> 'object'.
     2. IT APPLIED SLOPPY-MODE COERCION. `?? globalThis` swapped globalThis in for
        null/undefined; a strict-mode callee must receive them UNCHANGED.
        Both are now handled by the Reflect.apply branch — because they CANNOT be fixed
        within the parking trick. Parking requires an object to park on. That limit is the
        interesting part of the answer: know which gaps are bugs and which are the technique.
     3. IT MUTATED thisArg UNSAFELY. `try/finally` now guarantees cleanup when fn throws, and
        defineProperty keeps the temp property non-enumerable.
        ⚠️ STILL A REAL LIMIT: a frozen/sealed object still throws
        ❌ TypeError "Cannot define property Symbol(), object is not extensible",
        and a Proxy with a defineProperty trap still observes the write. Parking is
        fundamentally a mutation — you can make it tidy, not invisible.
   ⚠️ And the guard now THROWS `new TypeError` instead of returning one, matching myBind. */

//* Apply polyfill — same thing, array-shaped args
Function.prototype.myApply = function (thisArg, args) {
  return this.myCall(thisArg, ...(args ?? []));
};
// console.log("🚀 ~ greet.myApply:", greet.myApply(target, ["!"]));   // => 'Nikhil!' ✅

//* Bind polyfill
/**
  The four requirements — this is the interview checklist:
    1. RETURN a function, don't call it.
    2. Args passed after thisArg are stored and PREPENDED (partial application).
    3. The returned function must work with `new`, and `new` must OVERRIDE the bound this.
    4. `instanceof` must still work through it — so the returned function's prototype
       chain has to link back to the original's.
*/
Function.prototype.myBind = function (thisArg, ...bound) {
  const fn = this;
  if (typeof fn !== 'function') throw new TypeError('myBind must be called on a function');

  function Bound(...args) {
    // ✅ requirement 3: `new Bound()` makes `this` an instance of Bound, which is how we
    //    detect construction and let the new object win over thisArg.
    const boundThis = this instanceof Bound ? this : thisArg;
    return fn.myApply(boundThis, [...bound, ...args]); // ✅ requirement 2: bound args first
  }

  Bound.prototype = Object.create(fn.prototype ?? null); // ✅ requirement 4: link the chain

  // 💡 Fidelity touches the naive version misses — native bind sets both of these:
  //    name becomes "bound greet", and length drops by the count of pre-applied args
  //    (never below 0). Cheap to add, and a nice detail to mention in an interview.
  Object.defineProperty(Bound, 'name', {
    value: `bound ${fn.name}`, configurable: true,
  });
  Object.defineProperty(Bound, 'length', {
    value: Math.max(0, fn.length - bound.length), configurable: true,
  });

  return Bound;
};
// console.log("🚀 ~ greet.myBind:", greet.myBind(target)('!'));                  // => 'Nikhil!'  ✅
// console.log("🚀 ~ greet.myBind:", greet.myBind({ name: 'jon doe' })('!'));     // => 'jon doe!' ✅

// ---- The `new` vs plain-call proof, and the instanceof answer ----
function Person(first, last) {
  this.first = first;
  this.last = last;
  return this; // ⚠️ this explicit return is what makes the difference OBSERVABLE below
}

const PBind = Person.myBind({ first: 'IGNORED-BY-NEW' }, 'Ada'); // 'Ada' is partially applied

const pBind1 = PBind('Lovelace');
console.log("🚀 ~ pBind1:", pBind1);
// => { first: 'Ada', last: 'Lovelace' } ✅ — note 'Ada' overwrote 'IGNORED-BY-NEW'
console.log("🚀 ~ pBind1 instanceof Person:", pBind1 instanceof Person);
// => false ✅
// REASON: a plain call means `this instanceof Bound` is false, so boundThis is the thisArg
// object literal. Person writes onto it and returns it — but that object was created by an
// object literal, never by `new Person`, so Person.prototype is nowhere in its chain.
// 💡 Native bind behaves identically here (verified) — this is correct, not a polyfill bug.

const PBindNew = new PBind('New');
console.log("🚀 ~ PBindNew:", PBindNew);
// => Person { first: 'Ada', last: 'New' } ✅ — 'IGNORED-BY-NEW' lives up to its name
console.log("🚀 ~ PBindNew instanceof Person:", PBindNew instanceof Person);
// => true ✅ — this is requirement 4 paying off. Delete the Object.create line and it
//    turns false, which is the fastest way to prove to yourself why that line is there.

/* ⚠️ THE LAST GAP — and this one is IRREDUCIBLE in userland, which is why it's left in place:
   a natively-bound function has NO `prototype` property at all
   (verified: `'prototype' in Person.bind({})` -> false). Native bind still satisfies
   `instanceof` because the engine keeps an internal [[BoundTargetFunction]] slot and
   `instanceof` follows it straight through to the target.
   Userland has no such slot, so a polyfill must fake the link with a real
   `Bound.prototype = Object.create(fn.prototype)` — requirement 4 above. Deleting it to
   match native shape would break instanceof, so the prototype property stays.
   💡 The takeaway: some of native bind is genuinely not polyfillable. Knowing WHICH parts,
      and why, is the difference between reciting the polyfill and understanding it. */

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What decides `this`?
      The CALL SITE, not the definition. Walk the ladder: new > call/apply/bind > implicit
      (left of the dot) > default (undefined in strict/ESM, globalThis in sloppy).

 ** Q2. Same function, two owners — what's `this`?
      Whichever object it was called through. `b.m = a.m` shares one function object;
      a.m() gives a, b.m() gives b. `this` is never baked in. (§1)

 ** Q3. Can `call` override a `bind`?
      No. bind wins, and a second bind is a no-op on `this` — the first is permanent.
      The only thing that beats bind is `new`. (§2)

 ** Q4. Why doesn't an arrow in an object literal see the object?
      An object literal is not a scope. The arrow looks outward to the nearest real scope —
      module scope here, so `this` is undefined in an ES module. (§3)

 ** Q5. Why does setInterval(function(){...}) break inside a class method, but the arrow work?
      setInterval calls the callback with no receiver -> rule 4 -> undefined. The arrow never
      consults the call site at all; it captured the method's `this` when it was written. (§4)

 ** Q6. Arrow class field vs prototype method — trade-off?
      The field is auto-bound but allocated per instance and absent from the prototype (so
      it can't be spied on or overridden). The method is shared but must be bound at the
      call site. Verify with getOwnPropertyNames and a `===` comparison across instances. (§5)

 ** Q7. Why can't an arrow be a constructor?
      `new` needs a `prototype` property to link the new object to, and a `this` slot to
      write into. Arrows have neither. (§5)

 ** Q8. Implement bind. What are the requirements?
      Return (don't call); prepend the partially-applied args; make `new` override the bound
      this via `this instanceof Bound`; and relink the prototype with
      `Object.create(fn.prototype)` so instanceof still works. (§7)

 ** Q9. `Person.bind(obj, 'Ada')('Lovelace') instanceof Person` — true or false?
      FALSE, for both native bind and the polyfill. A plain call routes `this` to the thisArg
      object, which was never constructed from Person.prototype. Call it with `new` and it
      becomes true. (§7)

 ** Q10. What's wrong with the typical `Object(thisArg ?? globalThis)` call polyfill?
      Four things, and the good answer separates the bugs from the technique's limits:
        BUGS (fixable) — it leaks the temp property when fn throws (try/finally), leaves it
          enumerable (defineProperty), and returns a TypeError instead of throwing one.
        LIMITS (not fixable by parking) — boxing primitives and sloppy null/undefined
          coercion. Parking needs an object to park on, so a primitive receiver can only be
          delivered by the engine (Reflect.apply). Mutation is likewise inherent: a frozen
          thisArg still throws. (§7)

 ** Q11. Which parts of `bind` can't be polyfilled at all?
      The internal [[BoundTargetFunction]] slot. Native `instanceof` follows it to the target,
      which is why a bound function needs no `prototype` of its own. Userland has to fake that
      with `Object.create(fn.prototype)`, so a polyfilled bound function always carries a
      `prototype` property the native one doesn't have. Also worth adding for fidelity:
      `name` -> "bound fn" and `length` reduced by the pre-applied args. (§7)
 */

// 👉 NEXT: `this` as a RETURN TYPE in TypeScript class methods — polymorphic `this` for
//    chainable/fluent APIs, and how it differs from returning the class name.