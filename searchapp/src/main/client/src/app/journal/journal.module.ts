import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextsComponent } from '../contexts/contexts.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { JournalRoutingModule } from './journal-routing.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HomeComponent } from './pages/home/home.component';
import { FreeTextComponent } from './components/free-text/free-text.component';
import { AppState } from '../app.state';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    FreeTextComponent,
    HomeComponent,
    ContextsComponent
  ],
  imports: [
    CommonModule,
    JournalRoutingModule,
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
  providers: [AppState]
})
export class JournalModule { }
