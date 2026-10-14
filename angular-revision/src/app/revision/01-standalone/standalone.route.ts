/* Child routes for /01. app.routes.ts loads this whole file lazily (loadChildren), so:
     ''       loadComponent -> its own chunk (standalone-demo)
     'test1'  component     -> no chunk of its own: it ships inside THIS file's chunk
     'test2'  loadComponent -> its own chunk (test2-component)
   ✅ Measured in `ng build`: standalone-route 502 B, standalone-demo 1.16 kB, test2-component 310 B. */

import { Routes } from "@angular/router";
import { Test1Component } from "./test1.component";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./standalone-demo').then(m => m.StandaloneDemo)
  },
  {
    path: 'test1',
    component: Test1Component
  },
  {
    path: 'test2',
    loadComponent: () => import('./test2.component').then(m => m.Test2Component)
  }
]
