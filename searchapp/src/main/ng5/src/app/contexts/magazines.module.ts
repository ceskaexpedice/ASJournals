import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';
//import { FormsModule } from '@angular/forms';
//import { HttpModule, Http } from '@angular/http';
//import { HttpClientModule, HttpClient} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


import {
  MzCardModule, MzNavbarModule, MzSidenavModule, MzIconModule, MzInputModule,
  MzIconMdiModule, MzCollapsibleModule, MzCollectionModule, MzTooltipModule,
  MzCheckboxModule, MzTextareaModule, MzTabModule, MzToastModule 
} from 'ngx-materialize'; // _app

import {MagazineState} from './magazine.state';
import {MagazinesService} from './magazines.service';

import {MagazinesComponent} from './magazines.component';
import {MagazineEditComponent} from './admin-magazines/magazine-edit/magazine-edit.component';
import {EditorEditComponent} from './admin-magazines/editor-edit/editor-edit.component';
import {SeznamCasopisuComponent} from './seznam-casopisu/seznam-casopisu.component';
import {OProjektuComponent} from './o-projektu/o-projektu.component';
import {VydavateleComponent} from './vydavatele/vydavatele.component';
import {KontaktComponent} from './kontakt/kontakt.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {FacetsComponent} from './seznam-casopisu/facets/facets.component';
import {SeznamItemComponent} from './seznam-casopisu/seznam-item/seznam-item.component';
import {SortBarComponent} from './seznam-casopisu/sort-bar/sort-bar.component';
import {FacetsUsedComponent} from './seznam-casopisu/facets-used/facets-used.component';
import {VydavateleDetailComponent} from './vydavatele/vydavatele-detail/vydavatele-detail.component';
import {AdminMagazinesComponent} from './admin-magazines/admin-magazines.component';
import {AuthGuard} from 'app/contexts/auth-guard';
import {LoginComponent} from 'app/contexts/login/login.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MagazinesComponent,
    SeznamCasopisuComponent,
    OProjektuComponent,
    VydavateleComponent,
    KontaktComponent,
    HeaderComponent,
    FooterComponent,
    FacetsComponent,
    SeznamItemComponent,
    SortBarComponent,
    FacetsUsedComponent,
    VydavateleDetailComponent,
    AdminMagazinesComponent,
    MagazineEditComponent,
    EditorEditComponent,
    LoginComponent
  ],
  imports: [
    CommonModule, FormsModule,
    MzCardModule, MzNavbarModule, MzSidenavModule, MzInputModule,
    MzIconModule, MzIconMdiModule, MzCollapsibleModule, MzCollectionModule,
    MzTooltipModule, MzCheckboxModule, MzTextareaModule, MzTabModule, MzToastModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),

    RouterModule.forChild([

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
    ])
  ],
  providers: [MagazineState, MagazinesService, AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [MagazinesComponent],
  //bootstrap: [MagazinesComponent]
})
export class MagazinesModule {}
