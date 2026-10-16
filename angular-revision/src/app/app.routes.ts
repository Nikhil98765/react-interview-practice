import { Routes } from '@angular/router';
import { ControlFlowDemo } from './revision/02-control-flow/control-flow-demo.component';
import { DeferDemo } from './revision/03-@defer/03-@defer.component';

export const routes: Routes = [
  {
    path: '01',
    loadChildren: () =>
      import('./revision/01-standalone/standalone.route').then((m) => m.routes),
  },
  {
    path: '02',
    component: ControlFlowDemo
  },
  {
    path: '03',
    component: DeferDemo
  }
];
