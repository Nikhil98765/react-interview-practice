import { track, makeDefaultOptions } from "../mock/analytics";

declare module "../mock/analytics" {
  // 3b — OPTIONAL. Required would make mock/analytics.ts fail on its own
  // `return { event: "pageview" }`, because augmentation is program-wide
  // and applies inside the package too.
  interface TrackOptions { userId?: string }

  // 3c — compiles, but creates NO runtime value. Calling flush() throws
  // "flush is not a function" unless the shipped JS already has it.
  export function flush(): void;
}

track({ event: "click", userId: "u_42" });
const defaults = makeDefaultOptions();
