import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Configuration } from './models/configuration';
import { Observable } from 'rxjs';
import { AppState } from './app.state';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Magazine } from './models/magazine';

@Injectable({
    providedIn: 'root'
}) export class AppConfiguration {

    public config!: Configuration;


    public get context() {
        return this.config.context;
    }

    public get defaultLang() {
        return this.config.defaultLang;
    }
    
    server = '';
    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        @Inject(DOCUMENT) private document: Document,
        private http: HttpClient,
        private state: AppState) {
            if (!isPlatformBrowser(this.platformId)) {
                const args = process.argv;
                if (args.length > 2) {
                    this.server = args[2];
                } else {
                    this.server = 'http://localhost:8080';
                }
            }
        }

    public configLoaded() {
        return this.config && true;
    }

    public load(): Promise<any> {
        const url = this.server + '/api/assets/config.json';
        
        console.log('loading config... ');
        const promise = this.http.get(url)
            .toPromise()
            .then(cfg => {
                this.config = cfg as Configuration;
                console.log('config loaded');
            }).then(() => {
                return this.getMagazines();
            });
        return promise;
    }

    getMagazines() {
        let url = this.server + '/api/search/magazines/select';
        const params = new HttpParams()
            .set('q', '*')
            .set('wt', 'json')
            .set('rows', '50')
            .set('sort', 'titleCS asc')
            .set('json.nl', 'arrarr')
            .set('facet', 'true')
            .set('facet.mincount', '1')
            .append('facet.field', 'pristup')
            .append('facet.field', 'oblast')
            .append('facet.field', 'keywords');

        console.log('loading magazines...');
        return this.http.get(url, {params})
            .toPromise()
            .then((res: any) => {
                this.state.setJournals(res);
                console.log('magazines loaded');
                const path = this.document.location.pathname.split("/")[1]
                if ( path && path !== 'magazines') {
                    const ctx = this.state.ctxs.find(c => c.ctx === path);
                    if (ctx) {
                        return this.getJournalConfig(ctx);
                    }
                    
                }
                return;
            })
            .catch(res => {
                console.log(res);
                localStorage.removeItem('user');
            });
    }

    getJournalConfig(ctx: Magazine) {
        console.log('loading journal config...' + ctx.ctx);
        let url = this.server + '/api/texts?action=GET_CONFIG&ctx=' + ctx.ctx;
        return this.http.get(url)
        .toPromise()
        .then((res: any) => {
            this.state.ctx = ctx;
            if (!this.state.ctx.keywords) {
                this.state.ctx.keywords = [];
            }
            this.state.setConfig(res);
            this.state.config['color'] = ctx.color;
            this.state.config['journal'] = ctx.journal;
            this.state.config['showTitleLabel'] = ctx.showTitleLabel;
            this.state.stateChanged();
          })
          .catch(res => {
              console.log(res);
          });
      }



}
