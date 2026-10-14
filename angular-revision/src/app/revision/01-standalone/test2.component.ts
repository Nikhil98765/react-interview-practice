import { Component } from "@angular/core";

/* /01/test2 — loaded with loadComponent, so it gets its own lazy chunk (test2-component, 310 B),
   fetched only when you navigate here. */
@Component({
  imports: [],
  template: `
  <h2>Test2 Component</h2>
  `
})
export class Test2Component {

}
