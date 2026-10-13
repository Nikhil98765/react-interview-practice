import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '01',
    loadComponent: () =>
      import('./revision/01-standalone/standalone-demo').then((m) => m.StandaloneDemo),
  },
  // add one line per exercise
];
