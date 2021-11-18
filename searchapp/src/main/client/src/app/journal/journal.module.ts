import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ContextsComponent } from '../contexts/contexts.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { JournalRoutingModule } from './journal-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FreeTextComponent } from './components/free-text/free-text.component';
import { AppState } from '../app.state';
import { SearchTabsComponent } from './components/search-tabs/search-tabs.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { ActualComponent } from './pages/actual/actual.component';
import { JournalDetailsComponent } from './components/journal-details/journal-details.component';
import { ArticleResultComponent } from './components/article-result/article-result.component';
import { ArchivComponent } from './pages/archiv/archiv.component';
import { ArchivItemComponent } from './components/archiv-item/archiv-item.component';
import { ArchivItemLeftComponent } from './components/archiv-item-left/archiv-item-left.component';
import { OCasopisuComponent } from './pages/o-casopisu/o-casopisu.component';
import { FreePageComponent } from './components/free-page/free-page.component';
import { SafeHtmlPipe } from '../services/safe-html.pipe';
import { PokynyComponent } from './pages/pokyny/pokyny.component';
import { SearchComponent } from './pages/search/search.component';
import { FormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { EditorModule } from '@tinymce/tinymce-angular';

import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchAuthorsComponent } from './pages/search-authors/search-authors.component';
import { SearchCriteriaComponent } from './pages/search-criteria/search-criteria.component';
import { SearchGenresComponent } from './pages/search-genres/search-genres.component';
import { SearchKeywordsComponent } from './pages/search-keywords/search-keywords.component';
import { ArticleViewerComponent } from './pages/article-viewer/article-viewer.component';
import { AdminComponent } from './pages/admin/admin.component';
import { FileUploadModule } from 'ng2-file-upload';
import { LoginComponent } from './pages/login/login.component';
import { ArticleInfoComponent } from './components/article-info/article-info.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    SafeHtmlPipe,
    HeaderComponent,
    FooterComponent,
    FreeTextComponent,
    FreePageComponent,
    HomeComponent,
    ActualComponent,
    JournalDetailsComponent,
    ArticleResultComponent,
    ContextsComponent,
    BreadcrumbsComponent,
    SearchTabsComponent,
    ArchivComponent,
    ArchivItemComponent,
    ArchivItemLeftComponent,
    OCasopisuComponent,
    PokynyComponent,
    SearchComponent,
    SearchAuthorsComponent,
    SearchCriteriaComponent,
    SearchKeywordsComponent,
    SearchGenresComponent,
    PaginationComponent,
    ArticleViewerComponent,
    ArticleInfoComponent,
    LoginComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    JournalRoutingModule,
    NouisliderModule,
    AlertModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(), 
    BsDropdownModule.forRoot(),
    FileUploadModule,
    PdfViewerModule,
    EditorModule,
    TranslateModule.forChild({
      defaultLanguage: 'cs',
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    CollapseModule.forRoot(), TooltipModule.forRoot()
  ],
  providers: [AppState]
})
export class JournalModule { }
