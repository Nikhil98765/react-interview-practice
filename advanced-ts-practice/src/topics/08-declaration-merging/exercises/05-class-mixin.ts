/* ============================================================================
   EXERCISE 5 — CLASS MERGING: instance side vs static side  🎯    [ 5 of 5 ]
   ============================================================================
   ⚠️ NOT YET ATTEMPTED — this is the one exercise still blank. The other four carry your
      worked answers; this one only had a solution file, so the drills below are unsolved.
      Fill in the 📝 lines, compile, THEN open ./solutions/05-class-mixin.ts.

   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = write your prediction/answer BEFORE running tsc

   📖 THEORY: ../declaration-merging.ts §4 (namespace + class) and §6 (interface + class)
   🔑 SOLUTION: ./solutions/05-class-mixin.ts

   DRILLS
     5a. interface + class -> merges into the INSTANCE type
     5b. ⚠️ the runtime crash — the half the compiler doesn't check
     5c. instance side vs static side
     5d. namespace + class -> merges into the STATIC side
     5e. explain WHY 5a and 5d need different tools

   THE MODEL 🧠
     A class declaration produces TWO types: the INSTANCE type (what `new C()` gives you) and
     the STATIC type (the constructor object `C` itself). Merging targets them with different
     tools — `interface` reaches the instance side, `namespace` reaches the static side.
   ============================================================================ */

export {};

class Widget {
  constructor(public id: number) {}
}

/* ---- 5a. Give Widget a `render(): string` WITHOUT editing the class body. -- */
// TODO: add the declaration.

/* ---- 5b. ⚠️ Now call it. What happens at compile time vs runtime? ---------- */
// 📝 PREDICTION (compile): ______________________
// 📝 PREDICTION (runtime): ______________________
// TODO: then add the line that actually makes it work, and note why the compiler
//       never asked you for it.

/* ---- 5c. Which of these is legal? Predict both. --------------------------- */
// 📝 Widget.render()        -> ______  (static side)
// 📝 new Widget(1).render() -> ______  (instance side)

/* ---- 5d. Add a static `DEFAULT_ID = 0` without editing the class body. ---- */
// TODO: 5a's tool won't work here. Use the other one.
// ⚙️ NOTE: needs "erasableSyntaxOnly": false in tsconfig.app.json — namespaces emit runtime code.

// const w = new Widget(7);
// const html = w.render();
// const fallback = Widget.DEFAULT_ID;

/* ---- 5e. Explain the asymmetry. ------------------------------------------- */
// 📝 Why does the instance side accept `interface` while the static side needs `namespace`?
//    Hint: which of the two has to EMIT something?
//    ANSWER: ______________________________________________
