import { Routes } from "@angular/router";
import { JournalComponent } from "./journal.component";
import { HomeComponent } from "./pages/home/home.component";
import { AuthGuard } from "../services/auth-guard";
import { FreePageComponent } from "../shared/free-page/free-page.component";
import { ActualComponent } from "./pages/actual/actual.component";
import { AdminComponent } from "./pages/admin/admin.component";
import { ArchivComponent } from "./pages/archiv/archiv.component";
import { ArticleViewerComponent } from "./pages/article-viewer/article-viewer.component";
import { LoginComponent } from "./pages/login/login.component";
import { SearchAuthorsComponent } from "./pages/search-authors/search-authors.component";
import { SearchCriteriaComponent } from "./pages/search-criteria/search-criteria.component";
import { SearchGenresComponent } from "./pages/search-genres/search-genres.component";
import { SearchKeywordsComponent } from "./pages/search-keywords/search-keywords.component";
import { SearchComponent } from "./pages/search/search.component";

const routes: Routes = [

    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'actual', component: ActualComponent },
    { path: 'archiv', component: ArchivComponent },
  
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
    { path: '**', component: FreePageComponent },
  ];

export const Journal_Routes: Routes = [
    { path: '', component: JournalComponent, children: routes },
    { path: 'admin', redirectTo: 'magazines/admin', pathMatch: 'full' },
    { path: 'prihlaseni', redirectTo: 'magazines/prihlaseni', pathMatch: 'full' },
    {
      path: ':ctx', component: JournalComponent,
      children: routes
    },
];