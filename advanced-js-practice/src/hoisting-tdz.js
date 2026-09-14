/* ============================================================================
   HOISTING & THE TEMPORAL DEAD ZONE — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you uncomment it
     `// => X` = actual output from node v22. This file is an ES module, so it runs in
     STRICT mode — that changes two answers (section 5.6, section 5.8).

   ▶️ Demos are commented out. Uncomment a block and run: node src/hoisting-tdz.js

   CONTENTS
     1. Mechanics ................ creation phase vs execution phase + the table
     2. Scope .................... var is function-scoped, let/const are block-scoped
     3. The loop question ........ var -> [3,3,3], let -> [0,1,2], and the IIFE fix
     4. Your gotchas ............. typeof, const, default params, redeclaration
     5. More gotchas ............. 8 more ⚠️
     6. Exercises (yours, with verified answers)
     7. Interview Q&A 🎤

   THE MODEL 🧠
     Entering a scope is two passes. First the engine creates a binding for every
     declaration in it; then it runs the code top to bottom. What differs is the binding's
     STARTING STATE:
       var       -> created AND set to undefined
       function  -> created AND set to the whole function
       let/const/class -> created but UNINITIALIZED — touching it throws, until its
                          declaration line actually runs
     That uninitialized window is the TDZ. It's measured in TIME (when the line runs), not
     in position on the page — section 5.1.

   💡 THE ONE-LINER: everything is hoisted; only var and function are hoisted WITH a value.
   ============================================================================ */

/*
  * Hoisting and Temporal dead zone
    var/let/const/class/function - everything is hoisted. Difference is that trying to access early before the declaration. for var, it is hoisted and initializes with undefined, so early access will return undefined. for class/let/const, these variables are still `hoisted` but will be uninitialized and an early access before declaration in code will lead to ReferenceError. Temporal dead zone is the area between scope and variable and any access between this time will lead to ReferenceError. functions declaration will still be hoisted and can be accessed early and it is the only case which works fine.
    ✅ All correct. Sharper wording for the TDZ: from the START of the scope until the
       declaration line EXECUTES. "Temporal" because a function defined above the `let` can
       read it fine — as long as it's called after that line runs (section 5.1).
*/

// var hoisting, let it use before it means anything. Using this variable in a function later before declaration will make them fail. TDZ will turns it into a immediate error.
// console.log("🚀 ~ a:", a) // undefined.      ✅
var a = 'something';


// let hoisting, will throw ReferenceError
// console.log("🚀 ~ b:", b) // ❌ ReferenceError   ✅ "Cannot access 'b' before initialization"
let b = 'something';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MECHANICS ⚙️
// ─────────────────────────────────────────────────────────────────────────────
/*
  * 1. Mechanics
      Entering scope happens in 2 phases.
        1. Creation - Checks the scope and registers declaration
        2. Execution - run the statements top to bottom

        Creation
          Variable types            hoisted       Initialized to         usable before the line ?
            var                       ✅            undefined                yes, undefined
            function declaration      ✅            function itself          yes, fully
            let                       ✅            nothing(TDZ)             ❌ ReferenceError
            const                     ✅            nothing(TDZ)             ❌ ReferenceError
            var f = function() {}  (only var part)  undefined                ❌ TypeError, f is not a function
            class                     ✅            nothing(TDZ)             ❌ ReferenceError        <- added
            const f = () => {}        ✅            nothing(TDZ)             ❌ ReferenceError        <- added

    ✅ Every row verified. The two errors to tell apart:
       var f = function(){} ; f()   -> TypeError: f is not a function          (f EXISTS, it's undefined)
       const f = () => {}   ; f()   -> ReferenceError: Cannot access 'f' ...    (f is in the TDZ)
    💡 The error TYPE tells you which declaration keyword was used.
*/

const result = fnDecl();
function fnDecl() { return 'works' };
// console.log("🚀 ~ fnDecl ~ result:", result) // ✅ 'works'

// new C(); // throws ReferenceError, class C is still in TDZ
//   // => ❌ ReferenceError: Cannot access 'C' before initialization ✅
class C {}
// 💡 Classes behave like let, not like functions — a class is not callable before its line.

// ─────────────────────────────────────────────────────────────────────────────
// 2. SCOPE 📦
// ─────────────────────────────────────────────────────────────────────────────
/*
  * 2. Var is function scoped and let is block scoped
*/

{
  var varScopedVar = "var";
}
// console.log("🚀 ~ varScopedVar:", varScopedVar);   // => 'var' ✅ the block doesn't contain it

{ let letScopedVar = 'let' };
// console.log("🚀 ~ letScopedVar:", letScopedVar)
//   // => ❌ ReferenceError: letScopedVar is not defined ✅
// ⚠️ Different message from the TDZ one. "is not defined" = no binding in any reachable
//    scope. "Cannot access 'x' before initialization" = the binding exists, it's in the TDZ.

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE LOOP QUESTION 🔁
// ─────────────────────────────────────────────────────────────────────────────
// * Most asked hoisting question
/**
 ** Reason - one i for whole loop in var case and when closure carries final value = 3. let creates a fresh binding per iteration which closures capture separately. Before let, fix was using IIFE
 */
// 📝 predict result1, result2, result3 first
const lets = [];
for (let i = 0; i < 3; i++)
lets.push(() => {
  // console.log("🚀 ~ i in let push:", i);
  return i
});

const result1 = lets.map(j => j());
// console.log("🚀 ~ result1:", result1)   // => [0, 1, 2] ✅

const vars = [];
for (var i = 0; i < 3; i++) vars.push(() => {
  // console.log("🚀 ~ i in var push:", i)
  return i
});
const result2 = vars.map(item => item());
// console.log("🚀 ~ result2:", result2)   // => [3, 3, 3] ✅ one shared i, and the loop exits at 3

// IIFE way - Since params copy by value, it creates a own copy inside the IIFE. Basically, calling the IIFE makes a copy.
const iifes = [];
for (var i = 0; i < 3; i++) {
  (function (copy) {
    iifes.push(() => copy);
  })(i);
}
const result3 = iifes.map(j => j());
// console.log("🚀 ~ result3:", result3);  // => [0, 1, 2] ✅

// ⚠️ Why 3 and not 2: the closures run AFTER the loop, and i had to reach 3 for `i < 3` to fail.
// ⚠️ The per-iteration copy happens at the START of each iteration, so a closure sees
//    changes made later in the same pass: `for (let i = 0; i < 3; i++) { a.push(() => i); i++; }`
//    -> [1, 3]. "Fresh binding" doesn't mean "frozen value".
// 💡 This is really a CLOSURE question: closures capture bindings, not values.

// ─────────────────────────────────────────────────────────────────────────────
// 4. YOUR GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Gotcha 1 - typeof is not safe in TDZ
   * typeof undeclared variables were still safe but typeof variables in TDZ will still throw referenceError
*/
// console.log("🚀 ~ typeof undeclaredVar:", typeof undeclaredVar); // undefined   ✅ 'undefined'

// console.log("🚀 ~ typeof c:", typeof c) // Reference error   ✅ "Cannot access 'c' before initialization"
// let c = 'something';
// 💡 So the old `if (typeof x === 'undefined')` feature check is only safe for names that
//    are NOT declared later with let/const in the same scope.

/**
  ** Gotcha 2 - const is not immutable
  * values of const variables which holds reference type can still be modified but reassignment of the variable throws error.
 */
const o = { n: 3 };
o.n = 1; // value can still be changed.
// console.log("🚀 ~ o.n:", o.n)   // => 1 ✅

// o = {}; // throws error
//   // => ❌ TypeError: Assignment to constant variable. ✅ — at RUNTIME, when the line runs
// 💡 const freezes the BINDING (the arrow), not the VALUE (the object). For the value, see
//    Object.freeze — and deep-clone.js section 5.3 for why that's shallow too.

/**
  ** Gotcha 3 - Default params have their own TDZ
   * params initialize left to right, so a later one is still in TDZ for earlier one.
*/

function defaultParamCheck(p = q, q = 2) { return p; } // ReferenceError: cannot access q before initialization
// ⚠️ Defining it is fine — it throws when CALLED without a p:
// defaultParamCheck();     // => ❌ ReferenceError: Cannot access 'q' before initialization ✅
// defaultParamCheck(1);    // => 1 ✅ p was passed, so its default never evaluates
// ((p = 1, q = p) => q)(); // => 1 ✅ the other direction works

/**
  ** Gotcha 4 - Duplicate declarations
*/
var x1 = 1;
var x1 = 2; // silently redeclares
// console.log("🚀 ~ x1:", x1)   // => 2 ✅

// let y1 = 1; // throws syntax error
// let y1 = 3;
// ⚠️ And it's a PARSE-time SyntaxError ("Identifier 'y1' has already been declared"), so
//    uncommenting these kills the WHOLE file — line 1 never runs, and no try/catch can
//    catch it. Verified: a `console.log` on line 1 printed nothing.
// ⚠️ Contrast Gotcha 2: const reassignment is a RUNTIME TypeError (catchable), duplicate
//    let is a PARSE-time SyntaxError (not). Same for `const z;` — "Missing initializer in
//    const declaration" fails the whole file too.

// ─────────────────────────────────────────────────────────────────────────────
// 5. MORE GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/* ---- 5.1 ⚠️ The TDZ is about TIME, not position ------------------------------ */
// const read = () => later;
// let later = 'ok';
// read();                   // => 'ok' ✅ the function is written ABOVE the let, but runs after it
// Call read() one line earlier, before `let later` runs:
//                           // => ❌ ReferenceError: Cannot access 'later' before initialization ✅
// 💡 That's why mutually-referencing functions at module level work: they only read each
//    other's bindings when called.

/* ---- 5.2 ⚠️ Shadowing puts the OUTER variable out of reach ------------------- */
// let x = 1;
// { console.log(x); let x = 2; }
//   // => ❌ ReferenceError: Cannot access 'x' before initialization ✅ — NOT 1
// The inner `let x` is hoisted to the top of the block, so every `x` in that block means
// the inner one, which is still in its TDZ. Classic trick question.

/* ---- 5.3 ⚠️ A declaration can't read itself --------------------------------- */
// let sx = sx + 1;   // => ❌ ReferenceError: Cannot access 'sx' before initialization ✅
// The right-hand side runs before the binding is initialized.

/* ---- 5.4 ⚠️ function vs var with the same name ------------------------------ */
// console.log(typeof foo);   // => 'function' ✅
// var foo = 1;
// function foo() {}
// console.log(typeof foo);   // => 'number' ✅
// Creation: the function declaration wins and `var foo` adds nothing. Execution: `foo = 1`
// is an ordinary assignment that overwrites it.

/* ---- 5.5 ⚠️ const is a runtime error, redeclaring is a parse error ----------- */
// See Gotcha 4. The quick test: can a try/catch around it catch it? TypeError yes,
// SyntaxError from redeclaration no.

/* ---- 5.6 ⚠️ Function declarations inside blocks depend on strict mode -------- */
// { function inner() {} }
// typeof inner
//   // => 'undefined' in this file ✅ (ES module = strict: block-scoped, like let)
//   // => 'function'  in a sloppy .cjs script ✅ (legacy web-compat rule leaks it out)
// ⚠️ This is why the section 6 exercise that calls fnDeclaration() inside a try works: the function
//    is hoisted to the top of THAT block. Don't rely on it leaking out.

/* ---- 5.7 ⚠️ let/const in the global scope don't create window properties ------ */
// In a classic browser <script> (verified in a node vm script context):
//   var gv = 1; let gl = 2; function gf() {}
//   'gv' in globalThis -> true · 'gf' in globalThis -> true · 'gl' in globalThis -> false
// ⚠️ And in an ES module or CommonJS file, NONE of them do: 'aTop' in globalThis -> false,
//    because the module has its own scope.

/* ---- 5.8 ⚠️ Hoisting is per SCOPE, and the TDZ covers the whole scope --------- */
// The table in section 1 applies to every function body and every block, not just the
// top of the file. A `let` declared at the bottom of a function is in its TDZ from the
// function's first line.

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXERCISES — your blocks, with verified answers 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Exercise
    Predict each block, then uncomment it.
*/

// try {
//   console.log("🚀 ~ e1:", e1)
//   var e1 = 'something';

//   e12; // ReferenceError: Can't access e12 before initialization
//   let e12 = 'something 1';

// } catch (e) {
//    console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => e1: undefined, then ReferenceError: Cannot access 'e12' before initialization ✅

// try {
//   console.log("🚀 ~ typeof undeclaredVar:", typeof undeclaredVar); // undefined

//   console.log("🚀 ~ typeof e21:", typeof e21); // ReferenceError: Can't access e21 before initialization
//   let e21 = 'something';
// } catch (e) {
//    console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => 'undefined', then ReferenceError: Cannot access 'e21' before initialization ✅


// try {
//   console.log("🚀 ~ fnDeclaration():", fnDeclaration())
//   function fnDeclaration() {
//     return 'works perfectly!';
//   }

//   console.log("🚀 ~ new Foo():", new Foo()); // ReferenceError: Can't access Foo before initialization
//   class Foo { }

// } catch (e) {
//    console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => 'works perfectly!', then ReferenceError: Cannot access 'Foo' before initialization ✅
//   //    (the function works because it's hoisted to the top of the try block — section 5.6)

// try {
//   { var e31 = 'something' };
//   console.log("🚀 ~ e31:", e31) // something

//   { let e32 = 'something 2' };
//   console.log("🚀 ~ e32:", e32) // Reference Error: e32 is not defined

// } catch (e) {
//    console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => 'something', then ReferenceError: e32 is not defined ✅ ("not defined", not TDZ — section 2)

// try {
//   const vars = [];
//   for (var j = 0; j < 3; j++) {
//     vars.push(() => j);
//   }
//   const results1 = vars.map((k1) => k1());
//   console.log("🚀 ~ results1:", results1)

//   const lets = [];
//   for (let i = 0; i < 3; i++) {
//     lets.push(() => i);
//   }
//   const results2 = lets.map(k => k());
//   console.log("🚀 ~ results2:", results2)
// } catch (e) {
//    console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => [3, 3, 3], then [0, 1, 2] ✅ no error

// try {
//   const e41 = { a: { b: '12' } };
//   e41.a = { d: 42 };
//   console.log("🚀 ~ e41:", e41) // e41: {a: {d: 42}}
//   e41 = { a: 'c' }; // TypeError: Cant reassign to const variables.
// } catch (e) {
//     console.log(`🚀 ~ e.constructor with name: ${e.constructor.name} and message: ${e.message}`);
// }
//   // => { a: { d: 42 } }, then TypeError: Assignment to constant variable. ✅
//   //    (was live — commented out so the file runs silently like the other sheets)

// ─────────────────────────────────────────────────────────────────────────────
// 7. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. Are let and const hoisted?
      Yes. Their bindings are created when the scope is entered, but left uninitialized —
      that's the TDZ. Reading one early throws instead of giving undefined. (section 1)

 ** Q2. What is the temporal dead zone?
      The time from entering a scope until a let/const/class declaration runs. It's about
      time, not position: a function above the let can read it if called after. (section 5.1)

 ** Q3. var f = function(){}; vs const f = () => {} — what happens if you call f first?
      var: TypeError, f is not a function (it's undefined). const: ReferenceError, it's in
      the TDZ. The error type tells you the keyword. (section 1)

 ** Q4. The loop: for (var i...) pushing () => i — why [3, 3, 3]? Two fixes?
      One shared binding, read after the loop ended at 3. Fix with let (a fresh binding per
      iteration) or an IIFE that copies i into a parameter. (section 3)

 ** Q5. Is typeof always safe?
      Only for undeclared names ('undefined'). For a let/const still in its TDZ it throws a
      ReferenceError. (section 4, Gotcha 1)

 ** Q6. Is const immutable?
      No — the binding is, the value isn't. Mutating the object works; reassigning throws
      TypeError: Assignment to constant variable. (section 4, Gotcha 2)

 ** Q7. let x = 1; { console.log(x); let x = 2; } — what's logged?
      Nothing — ReferenceError. The inner x is hoisted to the top of the block and shadows
      the outer one while in its TDZ. (section 5.2)

 ** Q8. typeof foo, then var foo = 1 and function foo(){} — before and after?
      'function' before (declarations win at creation), 'number' after (the assignment runs). (section 5.4)

 ** Q9. Why doesn't a try/catch catch `let a; let a;`?
      It's an early SyntaxError: the file fails to parse, so no code runs. Assigning to a
      const is a runtime TypeError, which try/catch does catch. (section 4, Gotcha 4)

 ** Q10. Do default parameters have a TDZ?
      Yes. They initialize left to right, so (p = q, q = 2) throws when called without p;
      (p = 1, q = p) works. (section 4, Gotcha 3)
 */

// 👉 NEXT: bind.js — hoisting and scope decide what a NAME refers to; `this` is the one
//    thing scope doesn't decide. The loop question in section 3 is also the bridge to closures.
