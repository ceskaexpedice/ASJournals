import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeznamCasopisuComponent } from './pages/seznam-casopisu/seznam-casopisu.component';
import { MagazinesComponent } from './pages/magazines/magazines.component';
import { AuthGuard } from './auth-guard';
import { AdminMagazinesComponent } from './pages/admin-magazines/admin-magazines.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { LoginComponent } from './pages/login/login.component';
import { OProjektuComponent } from './pages/o-projektu/o-projektu.component';
import { VydavateleDetailComponent } from './pages/vydavatele/vydavatele-detail/vydavatele-detail.component';
import { VydavateleComponent } from './pages/vydavatele/vydavatele.component';

const routes: Routes =[

  {
    path: 'magazines', component: MagazinesComponent,
    children: [
      {path: '', component: SeznamCasopisuComponent},
      {path: 'admin', component: AdminMagazinesComponent, canActivate: [AuthGuard]},
      {path: 'prihlaseni', component: LoginComponent},
      {path: 'seznam-casopisu', component: SeznamCasopisuComponent},
      {path: 'magazines', component: SeznamCasopisuComponent},
      {path: 'o-projektu', component: OProjektuComponent},
      {path: 'vydavatele', component: VydavateleComponent},
      {path: 'vydavatel/:id', component: VydavateleDetailComponent},
      {path: 'kontakt', component: KontaktComponent}
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
