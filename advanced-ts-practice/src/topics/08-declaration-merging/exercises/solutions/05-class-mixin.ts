// class Widget {
//   constructor(public id: number) {}
// }

// // 5a — interface merges into the INSTANCE type. No implementation is checked.
// interface Widget { render(): string }

// // 5b — tsc trusts the declaration; interfaces emit nothing, so `render` never
// // existed at runtime. This line is the missing half.
// Widget.prototype.render = function (this: Widget) { return `<div>${this.id}</div>` };

// // 5d — namespace merges into the STATIC side (real property assignment).
// namespace Widget { export const DEFAULT_ID = 0 }

// const w = new Widget(7);
// const html = w.render();
// const fallback = Widget.DEFAULT_ID;

// // 5c — Widget.render ❌ (static side), new Widget(1).render ✅ (instance side)
// // 5e — `interface` is type-only and describes instances; a static member is a
// // real property on the constructor object, which needs `namespace` to emit it.
