import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'magazines', loadChildren: () => import('./magazines/magazines.module').then(m => m.MagazinesModule) },
  { path: 'magazines/:id', loadChildren: () => import('./magazines/magazines.module').then(m => m.MagazinesModule) },
  { path: ':ctx', loadChildren: () => import('./journal/journal.module').then(m => m.JournalModule) },
  { path: '', redirectTo: 'magazines', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
