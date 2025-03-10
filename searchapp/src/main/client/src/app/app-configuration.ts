import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Configuration } from './models/configuration';
import { AppState } from './app.state';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Magazine } from './models/magazine';
import { MagazineState } from './magazines/magazine.state';

@Injectable({
    providedIn: 'root'
}) export class AppConfiguration {

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
        private config: Configuration,
        private state: AppState,
        private magState: MagazineState) {
        if (!isPlatformBrowser(this.platformId)) {
            const args = process.argv;
            if (args.length > 2) {
                this.server = args[2];
            } else {
                this.server = 'http://localhost:9083';
            }
        }
    }

    public configLoaded() {
        return this.config && true;
    }

    public load(): Promise<any> {
        const url = this.server + '/api/assets/config.json';

        console.log('loading config... ' + url);
        const promise = this.http.get(url)
            .toPromise()
            .then(cfg => {
                this.config.fromJSON(cfg);
                console.log('config loaded');
            }).then(() => {
                return this.getMagazines();
            }).then(() => {
                return this.checkLogin();
            });
        return promise;
    }


    checkLogin() {
        let url = this.server + '/api/login?action=TESTLOGIN';
        console.log('checking login... ');
        return this.http.get(url)
            .toPromise()
            .then((res: any) => {

                if (res.hasOwnProperty('error')) {
                    this.state.logged = false;
                    this.state.username = '';
                } else {
                    if (this.state.currentMagazine?.ctx) {
                        if (res.isAdmin || res.ctxs.includes(this.state.currentMagazine.ctx)) {
                            this.state.username = res.username;
                            this.state.logged = true;
                        }
                    } else if (res.isAdmin) {
                        this.magState.logged = true;
                        this.magState.user = res;
                    } else {
                        this.magState.logged = false;
                        this.state.logged = false;
                    }
                }

                return null;

            })
            .catch(res => {
                console.log(res);
                localStorage.removeItem('user');
            });
    }

    getMagazines() {
        let url = this.server + '/api/search/get_magazines';

        console.log('loading magazines...' + url);
        return this.http.get(url)
            .toPromise()
            .then((res: any) => {
                this.state.setJournals(res);
                console.log('magazines loaded');
                const path = this.document.location.pathname.split("/")[1]
                if (path && path !== 'magazines') {
                    const ctx = this.state.ctxs.find(c => c.ctx === path);
                    if (ctx) {
                        return this.getJournalConfig(ctx);
                    }

                }
                return null;

            })
            .catch(res => {
                console.log(res);
                localStorage.removeItem('user');
            });
    }

    getJournalConfig(ctx: Magazine) {
        console.log('loading journal config... ' + ctx.ctx);
        let url = this.server + '/api/texts?action=GET_LAYOUT&ctx=' + ctx.ctx;
        return this.http.get(url)
            .toPromise()
            .then((res: any) => {
                this.state.currentMagazine = ctx;

                this.state.setConfig(this.config);
                if (!this.state.currentMagazine.keyword) {
                    this.state.currentMagazine.keyword = [];
                }

                if (!this.state.currentMagazine.defaultView) {
                    this.state.currentMagazine.defaultView = 'detail';
                }
                this.state.viewerActiveLink = this.state.currentMagazine.defaultView;
                this.config.setLayout(res);
                // this.state.stateChanged();
            })
            .catch(res => {
                console.log(res);
            });
    }



}
