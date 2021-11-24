import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Configuration } from './models/configuration';
import { Observable } from 'rxjs';
import { AppState } from './app.state';

@Injectable({
    providedIn: 'root'
}) export class AppConfiguration {

    private config!: Configuration;

    public get context() {
        return this.config.context;
    }

    public get lang() {
        return this.config.lang;
    }

    constructor(
        private http: HttpClient,
        private state: AppState) {
    }

    public configLoaded() {
        return this.config && true;
    }

    public load(): Promise<any> {
        console.log('loading config...');
        const promise = this.http.get('assets/config.json')
            .toPromise()
            .then(cfg => {
                this.config = cfg as Configuration;
            }).then(() => {
                return this.getMagazines();
            });
        return promise;
    }

    getMagazines() {
        let url = 'api/search/magazines/select';
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

        return this.http.get(url, {params})
            .toPromise()
            .then((res: any) => {
                console.log('loading magazines...');
                this.state.setJournals(res);
            })
            .catch(res => {
                console.log(res);
                localStorage.removeItem('user');
            });
    }



}
