import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Configuration } from './models/configuration';
import { Observable } from 'rxjs';
import { AppState } from './app.state';
import { isPlatformBrowser } from '@angular/common';

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
        private http: HttpClient,
        private state: AppState) {
            if (!isPlatformBrowser(this.platformId)) {
                const args = process.argv;
                if (args.length > 2) {
                    this.server = args[2];
                } else {
                    this.server = 'http://localhost:8080/';
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
            })
            .catch(res => {
                console.log(res);
                localStorage.removeItem('user');
            });
    }



}
