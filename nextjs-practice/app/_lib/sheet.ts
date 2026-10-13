/* ============================================================================
   THE SHEET SHAPE — every topic's notes are DATA in this shape
   ============================================================================
   A topic folder holds a `sheet.ts` exporting one `Sheet`, and its `page.tsx` renders it with
   <SheetView>. The demos next to it are ordinary routes. So adding a topic never means writing
   layout markup: fill in this object, then build the demo routes it links to.

   Text fields accept `backticks` for inline code — SheetView turns them into <code>.
   ============================================================================ */

/** A live route to open, and what to watch for when you do. */
export type Demo = {
  href: string;
  label: string;
  /** what proves the point — the log line, the status code, what stays on screen */
  lookFor: string;
};

/** A reference table: file conventions, segment syntax, status codes... */
export type Table = {
  title: string;
  head: string[];
  rows: string[][];
  caption?: string;
};

/** Preformatted text: a hierarchy, a folder tree, a snippet. */
export type Block = {
  title: string;
  pre: string;
  caption?: string;
};

export type Gotcha = {
  title: string;
  /** your own note, kept as you wrote it */
  note?: string;
  /** ✅ what was measured, one line each */
  verified?: string[];
  /** ⚠️ corrections and traps */
  warn?: string[];
  /** 💡 the interview takeaway */
  tip?: string;
  /** the route that demonstrates it */
  demo?: Demo;
};

export type QA = { q: string; a: string };

export type Sheet = {
  title: string;
  /** e.g. "Next 16.3.8 · React 19.2.8 — measured with next dev, next build and Chrome" */
  verifiedOn: string;
  /** THE MODEL 🧠 — one string per paragraph */
  model: string[];
  /** 💡 the one-liner */
  oneLiner: string;
  blocks?: Block[];
  tables?: Table[];
  demos: Demo[];
  gotchas: Gotcha[];
  whenNotToUse: string[];
  qa: QA[];
  /** 👉 where to go next */
  next?: string;
};
