/* The deferred component. While it's used only inside @defer, `ng build` lists it as its own
   lazy chunk (heavy-chart-component, 321 B). Section 4 of the sheet lists what makes it eager. */
import { Component } from "@angular/core";

@Component({
  selector: 'app-heavy-chart',
  template: `
    <h2>Heavy Chart Component</h2>
  `
})
export class HeavyChartComponent {

}