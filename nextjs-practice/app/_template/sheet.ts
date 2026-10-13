/* ============================================================================
   <TOPIC NAME> — sheet data
   ============================================================================
   1. Write your notes into the fields below. `backticks` become inline code.
   2. Build the demo routes in this folder and point `demos` / `gotcha.demo` at them.
   3. VERIFY before you write a ✅: run it, read the server log, check the status code.
      Anything you could not verify stays out of `verified` — put it in `note` instead.
   4. Flip this topic to status: "ready" in app/_lib/topics.ts.
   ============================================================================ */

import type { Sheet } from "../_lib/sheet";

export const sheet: Sheet = {
  title: "Topic name",
  verifiedOn: "Next <version> · React <version> — how it was checked",

  model: [
    "What the thing IS, in two or three sentences.",
    "Why it works that way — the mental model everything else follows from.",
  ],
  oneLiner: "The sentence you would say first in an interview.",

  blocks: [
    // { title: "Folder layout", pre: "app/\n  ...", caption: "optional" },
  ],
  tables: [
    // { title: "Reference", head: ["A", "B"], rows: [["`x`", "what x does"]] },
  ],

  demos: [
    // { href: "/topic/demo", label: "What it shows", lookFor: "the log line / status code that proves it" },
  ],

  gotchas: [
    {
      title: "Name the trap",
      note: "Your own explanation, in your words.",
      verified: ["What you measured, with the actual value."],
      warn: ["A correction, or the case where it bites."],
      tip: "How you would say it in an interview.",
      // demo: { href: "/topic/demo", label: "Run it", lookFor: "what to watch" },
    },
  ],

  whenNotToUse: ["A case where this is the wrong tool, and what to reach for instead."],

  qa: [{ q: "A question you expect to be asked?", a: "The answer, with the gotcha it rests on." }],

  next: "the topic this leads into",
};
