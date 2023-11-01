import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { AppState } from './app.state';
import { AppConfiguration } from './app-configuration';
import { AppWindowRef } from './app.window-ref';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MagazineState } from './magazines/magazine.state';
import { MagazinesService } from './magazines/magazines.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthGuard } from './services/auth-guard';
import { MagazinesAuthGuard } from './magazines/magazines-auth-guard';
import { AppService } from './services/app.service';
import { SearchService } from './services/search.service';
import { Configuration } from './models/configuration';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations(),
    Configuration,
    AppState, SearchService, AppService, AppWindowRef, MagazineState,  MagazinesService, AuthGuard, MagazinesAuthGuard,
    { provide: APP_INITIALIZER, useFactory: (config: AppConfiguration) => () => config.load(), deps: [AppConfiguration], multi: true },
    importProvidersFrom(MatSnackBarModule),
    importProvidersFrom(MaterialCssVarsModule.forRoot()),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }))
  ]
};
