/* ============================================================================
   EXERCISE 4 — THE REAL-WORLD ONE: adding `user` to Request  🎯   [ 4 of 5 ]
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = works / expected result      ❌ = compile error (deliberate — the error IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = write your prediction BEFORE running tsc

   📖 THEORY: ../declaration-merging.ts §4 (namespace merging) + ../module-augmentation.ts §4
   🎯 TARGET: ./mock/express.ts — pretend it's express + @types/express. DO NOT EDIT IT.
   🔑 SOLUTION: ./solutions/04-express-request.ts

   DRILLS
     4a. augment a type that lives in a GLOBAL NAMESPACE, not a module export
     4b. ⚠️ required vs optional, again — but now with a concrete middleware story

   💡 WHY THIS ONE MATTERS: "how do you add `req.user` in a TypeScript express app" is a
      standard interview question, and the answer is this exact shape.

   THE MODEL 🧠
     express declares `Request` inside `namespace Express` in the GLOBAL scope — not as a
     module export. So `declare module "express"` is the WRONG tool here; you need
     `declare global { namespace Express { ... } }`.
     👉 Read the target: whether you augment a module or the global scope is decided by where
        the library put the type, not by how you import it.
   ============================================================================ */

import { get } from "./mock/express";

export interface User {
  id: string;
  email: string;
}

/* ---- 4a. Make both handlers below compile. -------------------------------- */
declare global {
  namespace Express { // ✅ merges with the library's own global namespace (namespace + namespace)
    interface Request {
      user?: User; // optional — see 4b
    }
  }
}

get("/profile", (req) => {
  console.log(req.user?.email); // ✅ user is visible on Request everywhere in the program
});

/* ---- 4b. ⚠️ Is `user` optional or required? Try the other and see what breaks.
   Which file reports the error, and why that one?                            */
// 📝 ANSWER: ./mock/express.ts breaks — on `handler({ url, method })` inside `get`.
// The library CONSTRUCTS a Request before any auth middleware has run, so at that moment
// there is genuinely no `user`. Marking it required makes the library's own source invalid.
// 💡 And it's the honest type anyway: on an unauthenticated route `req.user` really is absent.
//    Optional isn't a workaround here — it's the accurate model of the runtime.
get("/health", (req) => {
  console.log(req.url, req.method); // ✅ original members still there — merge, not replace
});
