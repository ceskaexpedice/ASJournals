import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'magazines', pathMatch: 'full'},
    { path: 'magazines', loadChildren: () => import('./magazines/magazines.routes').then(mod => mod.Magazines_Routes)},
    { path: ':ctx', loadChildren: () => import('./journal/journal.routes').then(m => m.Journal_Routes) },
];
