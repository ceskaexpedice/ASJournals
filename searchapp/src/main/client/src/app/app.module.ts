import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppState } from './app.state';
import { AppService } from './services/app.service';
import { AuthGuard } from './services/auth-guard';
import { SearchService } from './services/search.service';
import { MagazinesModule } from './magazines/magazines.module';
import { JournalModule } from './journal/journal.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    MagazinesModule,
    JournalModule,
  ],
  providers: [HttpClient, AppService, SearchService, AuthGuard, TranslateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
