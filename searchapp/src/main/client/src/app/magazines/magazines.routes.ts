import { Routes } from '@angular/router';
import { SeznamCasopisuComponent } from './pages/seznam-casopisu/seznam-casopisu.component';
import * as path from 'path';
import { MagazinesComponent } from './pages/magazines/magazines.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { LoginComponent } from './pages/login/login.component';
import { OProjektuComponent } from './pages/o-projektu/o-projektu.component';
import { VydavateleDetailComponent } from './pages/vydavatele/vydavatele-detail/vydavatele-detail.component';
import { VydavateleComponent } from './pages/vydavatele/vydavatele.component';

export const Magazines_Routes: Routes = [
    {
        path: '', component: MagazinesComponent,
        children: [
            { path: '', redirectTo: 'casopisy', pathMatch: 'full' },
            { path: 'seznam-casopisu', component: SeznamCasopisuComponent },
            { path: 'casopisy', component: SeznamCasopisuComponent },

            //   {path: 'admin', component: AdminMagazinesComponent, canActivate: [AuthGuard]},
              {path: 'prihlaseni', component: LoginComponent},
              {path: 'o-projektu', component: OProjektuComponent},
              {path: 'vydavatele', component: VydavateleComponent},
              {path: 'vydavatel/:id', component: VydavateleDetailComponent},
              {path: 'kontakt', component: KontaktComponent}
        ]
    }
];
