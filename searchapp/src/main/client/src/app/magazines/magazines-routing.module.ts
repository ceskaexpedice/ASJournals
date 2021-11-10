import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeznamCasopisuComponent } from './components/seznam-casopisu/seznam-casopisu.component';
import { MagazinesComponent } from './pages/magazines/magazines.component';

const routes: Routes =[

  {
    path: 'magazines', component: MagazinesComponent,
    children: [
      {path: '', component: SeznamCasopisuComponent},
      // {path: 'admin', component: AdminMagazinesComponent, canActivate: [AuthGuard]},
      // {path: 'prihlaseni', component: LoginComponent},
      // {path: 'seznam-casopisu', component: SeznamCasopisuComponent},
      // {path: 'magazines', component: SeznamCasopisuComponent},
      // {path: 'o-projektu', component: OProjektuComponent},
      // {path: 'vydavatele', component: VydavateleComponent},
      // {path: 'vydavatel/:id', component: VydavateleDetailComponent},
      // {path: 'kontakt', component: KontaktComponent}
    ]
  },
  { path: '', redirectTo: 'magazines', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MagazinesRoutingModule { }
