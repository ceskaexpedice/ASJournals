import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export function createTranslateLoaderServer(http: HttpClient) {
  let server = 'http://localhost:8080/';
    const args = process.argv;
    if (args.length > 2) {
      server = args[2];
    }
  return new TranslateHttpLoader(http, server + 'api/assets/i18n/', '.json');
  // return new TranslateHttpLoader(http, 'api/assets/i18n/', '.json');
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoaderServer,
        deps: [HttpClient]
      }
    }))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
