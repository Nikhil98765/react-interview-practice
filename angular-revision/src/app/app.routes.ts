import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '01',
    loadChildren: () =>
      import('./revision/01-standalone/standalone.route').then((m) => m.routes),
  },
  // add one line per exercise
];
