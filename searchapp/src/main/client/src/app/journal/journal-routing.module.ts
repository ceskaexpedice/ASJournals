import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContextsComponent } from '../contexts/contexts.component';
import { AuthGuard } from '../services/auth-guard';
import { FreePageComponent } from './components/free-page/free-page.component';
import { ActualComponent } from './pages/actual/actual.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ArchivComponent } from './pages/archiv/archiv.component';
import { ArticleViewerComponent } from './pages/article-viewer/article-viewer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { OCasopisuComponent } from './pages/o-casopisu/o-casopisu.component';
import { PokynyComponent } from './pages/pokyny/pokyny.component';
import { SearchAuthorsComponent } from './pages/search-authors/search-authors.component';
import { SearchCriteriaComponent } from './pages/search-criteria/search-criteria.component';
import { SearchGenresComponent } from './pages/search-genres/search-genres.component';
import { SearchKeywordsComponent } from './pages/search-keywords/search-keywords.component';
import { SearchComponent } from './pages/search/search.component';

const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  // { path: 'test', component: TestComponent },
  { path: 'actual', component: ActualComponent },
  { path: 'archiv', component: ArchivComponent },
  //{ path: 'archiv/:pid', component: ArchivComponent },
  {
    path: 'pro-autory', component: PokynyComponent,
    children: [
      { path: '', component: FreePageComponent },
      { path: '**', component: FreePageComponent }

    ]
  },
  {
    path: 'o-casopisu', component: OCasopisuComponent,
    children: [
      { path: '', component: FreePageComponent },
      { path: '**', component: FreePageComponent }

    ]
  },
  { path: 'kontakt', component: FreePageComponent },
  { path: 'e-shop', component: FreePageComponent },
  {
    path: 'hledat', component: SearchComponent,
    children: [
      { path: '', redirectTo: 'cokoliv', pathMatch: 'full' },
      { path: 'cokoliv', component: SearchCriteriaComponent },
      { path: 'cokoliv/:criteria', component: SearchCriteriaComponent },
      { path: 'autory', component: SearchAuthorsComponent },
      { path: 'keywords', component: SearchKeywordsComponent },
      { path: 'rubriky', component: SearchGenresComponent }

    ]
  },
  { path: 'article/:pid', component: ArticleViewerComponent },
  { path: 'prihlaseni', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [AuthGuard], component: AdminComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot([

    //{path: '', component: ContextsComponent},
    { path: 'admin', redirectTo: 'magazines/admin', pathMatch: 'full' },
    { path: 'prihlaseni', redirectTo: 'magazines/prihlaseni', pathMatch: 'full' },
    //{path: 'k5journals', redirectTo: 'k5journals/journal', pathMatch: 'full'},
    {
      path: ':ctx', component: ContextsComponent,
      children: routes
    },

  ])],
  exports: [RouterModule]
})
export class JournalRoutingModule { }
