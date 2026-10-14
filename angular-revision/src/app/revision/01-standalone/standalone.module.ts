/* A legacy-style NgModule, kept to show the two worlds mixing.
   It DECLARES Test3Component (which therefore needs standalone: false) and EXPORTS it, so any
   standalone component that imports this module can use <standalone-test3 />.
   ✅ Measured: a standalone component can also go in this module's `imports` (and be
      re-exported) and it builds — the reverse direction works too. */

import { NgModule } from "@angular/core";
import { Test3Component } from "./test3.component";

@NgModule({
  declarations: [Test3Component],
  exports: [Test3Component]
})
export class StandaloneModule {}
