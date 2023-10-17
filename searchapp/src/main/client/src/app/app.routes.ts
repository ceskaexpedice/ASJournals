import { Routes } from '@angular/router';

export const routes: Routes = [
    //{ path: 'magazines', loadComponent: () => import('./magazines/pages/magazines/magazines.component').then(mod => mod.MagazinesComponent)},
    { path: '', redirectTo: 'magazines', pathMatch: 'full'},
    { path: 'magazines', loadChildren: () => import('./magazines/magazines.routes').then(mod => mod.Magazines_Routes)}
];
