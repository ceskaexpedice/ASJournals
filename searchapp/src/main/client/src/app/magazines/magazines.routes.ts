import { Routes } from '@angular/router';
import { SeznamCasopisuComponent } from './pages/seznam-casopisu/seznam-casopisu.component';
import { MagazinesComponent } from './pages/magazines/magazines.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { LoginComponent } from './pages/login/login.component';
import { OProjektuComponent } from './pages/o-projektu/o-projektu.component';
import { VydavateleDetailComponent } from './pages/vydavatele/vydavatele-detail/vydavatele-detail.component';
import { VydavateleComponent } from './pages/vydavatele/vydavatele.component';
import { AdminMagazinesComponent } from './pages/admin-magazines/admin-magazines.component';
import { MagazinesAuthGuard } from './magazines-auth-guard';

export const Magazines_Routes: Routes = [
    {
        path: '', component: MagazinesComponent,
        children: [
            { path: '', redirectTo: 'casopisy', pathMatch: 'full' },
            { path: 'seznam-casopisu', component: SeznamCasopisuComponent },
            { path: 'casopisy', component: SeznamCasopisuComponent },

            {path: 'admin', component: AdminMagazinesComponent},//, canActivate: [MagazinesAuthGuard]},
              {path: 'prihlaseni', component: LoginComponent},
              {path: 'o-projektu', component: OProjektuComponent},
              {path: 'vydavatele', component: VydavateleComponent},
              {path: 'vydavatel/:id', component: VydavateleDetailComponent},
              {path: 'kontakt', component: KontaktComponent}
        ]
    }
];
