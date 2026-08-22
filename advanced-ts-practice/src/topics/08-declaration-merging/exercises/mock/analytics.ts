// Mock third-party package. DO NOT EDIT — pretend this lives in node_modules.
//
// ⚠️ NOTE: `flush` is intentionally NOT exported. Exercise 3c is about augmenting a value into
// existence from the outside — exporting it here would hand you the answer and hide the
// runtime crash the drill is built around.

export interface TrackOptions {
  event: string;
}

export function makeDefaultOptions(): TrackOptions {
  return { event: "pageview" };
}

export function track(options: TrackOptions): void {
  console.log(options.event);
}

function flush() {

}
