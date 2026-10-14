import { Component } from "@angular/core";

/* /01/test1 — referenced with `component:` (not loadComponent), so it is bundled into the lazy
   standalone-route chunk rather than getting a chunk of its own.
   No `standalone` flag: it is standalone by default (v19+). */
@Component({
  imports: [],
  template: `
    <h2>Test1 Component</h2>
  `,
})
export class Test1Component {

}
