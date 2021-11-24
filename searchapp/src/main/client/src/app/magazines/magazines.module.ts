import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeznamCasopisuComponent } from './pages/seznam-casopisu/seznam-casopisu.component';
import { MagazinesComponent } from './pages/magazines/magazines.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MagazinesRoutingModule } from './magazines-routing.module';
import { AuthGuard } from './auth-guard';
import { MagazineState } from './magazine.state';
import { MagazinesService } from './magazines.service';
import { FacetsUsedComponent } from './components/facets-used/facets-used.component';
import { FacetsComponent } from './components/facets/facets.component';
import { SeznamItemComponent } from './components/seznam-item/seznam-item.component';
import { SortBarComponent } from './components/sort-bar/sort-bar.component';
import { MagazinesMaterialModule } from './magazinres-material.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { AdminMagazinesComponent } from './pages/admin-magazines/admin-magazines.component';
import { EditorEditComponent } from './pages/admin-magazines/editor-edit/editor-edit.component';
import { MagazineEditComponent } from './pages/admin-magazines/magazine-edit/magazine-edit.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { LoginComponent } from './pages/login/login.component';
import { OProjektuComponent } from './pages/o-projektu/o-projektu.component';
import { VydavateleDetailComponent } from './pages/vydavatele/vydavatele-detail/vydavatele-detail.component';
import { VydavateleComponent } from './pages/vydavatele/vydavatele.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppState } from '../app.state';
import { SidenavListComponent } from './components/sidenav-list/sidenav-list.component';
import { UserEditComponent } from './pages/admin-magazines/user-edit/user-edit.component';
import { DialogPromptComponent } from './components/dialog-prompt/dialog-prompt.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

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
    NavbarComponent,
    FooterComponent,
    FacetsComponent,
    SeznamItemComponent,
    SortBarComponent,
    FacetsUsedComponent,
    VydavateleDetailComponent,
    AdminMagazinesComponent,
    MagazineEditComponent,
    EditorEditComponent,
    UserEditComponent,
    LoginComponent,
    SidenavListComponent,
    DialogPromptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MagazinesRoutingModule,
    MagazinesMaterialModule,
    FlexLayoutModule,
    TranslateModule.forChild({
      defaultLanguage: 'cs',
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  providers: [MagazineState, MagazinesService, AuthGuard],
})
export class MagazinesModule { }
