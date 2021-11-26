import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { Journal } from '../models/journal.model';
import { AppState } from '../app.state';
import { SearchService } from './search.service';
import { Criterium } from '../models/criterium';


import Utils from './utils';
import { Subject, Observable, of, throwError } from 'rxjs';
import { catchError, expand, map } from 'rxjs/operators';
import { Magazine } from '../models/magazine';

declare var xml2json: any;

@Injectable()
export class AppService {

  //Observe language
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  //Observe searchs
  public _searchSubject = new Subject();
  public searchSubject: Observable<any> = this._searchSubject.asObservable();

  constructor(
    private state: AppState,
    private search: SearchService,
    private translate: TranslateService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  private get<T>(url: string, params: HttpParams = new HttpParams(), responseType?: any): Observable<T> {
    const options = { params, responseType, withCredentials: true };
    return this.http.get<T>(`api/${url}`, options)
      .pipe(catchError(err => { return this.handleError(err) }));
  }

  private post(url: string, obj: any, params: HttpParams = new HttpParams()) {
    return this.http.post<any>(`api/${url}`, obj, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  getJournalConfig(ctx: Magazine) {
    return this.get('texts?action=GET_CONFIG&ctx=' + ctx.ctx).pipe(
      map(res => {
        this.state.ctx = ctx;
        this.state.setConfig(res);
        this.state.config['color'] = ctx.color;
        this.state.config['journal'] = ctx.journal;
        this.state.config['showTitleLabel'] = ctx.showTitleLabel;
        this.switchStyle();
        this.findActual();
        this.getKeywords();
        this.getGenres();
        this.state.stateChanged();
        return res;
      })
    )
  }

  addJournal(ctx: Magazine) {
    this.state.ctxs.push(ctx);
    return this.get('texts?action=ADD_JOURNAL&ctxs=' + JSON.stringify(this.state.ctxs)).pipe(
      map(res => {
        this.state.ctx = ctx;
        this.state.setConfig(res);
        this.state.config['color'] = ctx.color;
        this.state.config['journal'] = ctx.journal;
        this.state.config['showTitleLabel'] = ctx.showTitleLabel;
        this.switchStyle();
        this.findActual();
        this.getKeywords();
        this.getGenres();
        this.state.stateChanged();
        return res;
      })
    )
  }


  getCtx(ctx: string) {
    for (let i = 0; i < this.state.ctxs.length; i++) {
      if (this.state.ctxs[i].ctx === ctx) {
        return this.state.ctxs[i];
      }
    }
    return null;
  }

  setStyles() {

    for (let i = 0; i < this.state.ctxs.length; i++) {
      if (!this.findStyle(this.state.ctxs[i].ctx)) {
        const link = document.createElement('link');
        link.href = 'api/theme?ctx=' + this.state.ctxs[i].ctx + '&color=' + this.state.ctxs[i]['color'];
        link.rel = 'stylesheet';
        link.id = 'css-theme-' + this.state.ctxs[i].ctx;
        link.title = this.state.ctxs[i].ctx!;
        link.disabled = true;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }

  findStyle(theme: any) {
    let links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      if (link.rel.indexOf('stylesheet') != -1 && link.title) {
        if (link.title === theme) {
          return true;
        }
      }
    }
    return false;
  }

  switchStyle() {
    let exists: boolean = this.findStyle(this.state.ctx!.ctx);
    if (!exists) {
      const link = document.createElement('link');
      link.href = 'theme?ctx=' + this.state.ctx!.ctx + '&color=' + this.state.config['color']; // insert url in between quotes
      link.rel = 'stylesheet';
      link.id = 'css-theme-' + this.state.ctx!.ctx;
      link.title = this.state.ctx?.ctx!;
      link.disabled = false;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    let links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      if (link.rel.indexOf('stylesheet') != -1 && link.title) {
        if (link.title === this.state.ctx?.ctx) {
          link.disabled = false;
          exists = true;
        } else {
          link.disabled = true;
        }
      } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('magazines') != -1) {
        link.disabled = true;
      } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('styles') != -1) {
        link.disabled = false;
      }
    }
  }

  getMagazines(): Observable<any> {
    let url = 'search/magazines/select';
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

    return this.get(url, params);
  }

  getJournals() {
    return this.get('texts?action=GET_JOURNALS');
  }

  saveJournalConfig() {

    this.state.config['color'] = this.state.ctx?.color;
    this.state.config['journal'] = this.state.ctx?.journal;
    this.state.config['showTitleLabel'] = this.state.ctx?.showTitleLabel;

    const params = new HttpParams()
      .set('journals', JSON.stringify({ 'journals': this.state.ctxs }))
      .set('cfg', JSON.stringify(this.state.config))
      .set('ctx', this.state.ctx?.ctx!);
    return this.get('texts?action=SAVE_JOURNALS', params);
  }

  searchFired(criteria: Criterium[]) {
    this._searchSubject.next(criteria);
  }

  changeLang(lang: string) {
    this.state.currentLang = lang;

    this.translate.use(lang).subscribe(() => {
      this._langSubject.next(lang);
    });
  }

  translateKey(key: string): string {
    return this.translate.instant(key);
  }

  getItem(pid: string): Observable<any> {
    let url = this.state.config['context'] + 'search/journal/select';
    const params = new HttpParams()
      .set('q', 'pid:"' + pid + '"')
      .set('wt', 'json');

    return this.get(url, params)
      .pipe(
        map((response: any) => {
          return response['response']['docs'][0];
        })
      )
  }

  getItemK5(pid: string): Observable<any> {
    let url = this.state.config['api_point'] + '/item/' + pid;

    return this.get(url);
  }

  getChildrenApi(pid: string): Observable<any> {
    let url = this.state.config['api_point'] + '/item/' + pid + '/children';

    return this.get(url);
  }

  getChildren(pid: string, dir: string = 'desc'): Observable<any> {
    let url = this.state.config['context'] + 'search/journal/select';
    const params = new HttpParams().set('q', '*:*').set('fq', 'parents:"' + pid + '"')
      .set('wt', 'json').set('sort', 'idx ' + dir).set('rows', '500');

    return this.get(url, params).pipe(
      map((response: any) => {
        return response['response']['docs'];
      })
    )
  }

  //  getActual(): Observable<Journal> {
  //    return this.getJournalByPid(this.state.config['journal'], this.state.config['model']);
  //  }

  getJournal(pid: string): Observable<Journal> {

    let url = this.state.config['context'] + 'search/journal/select';
    const params = new HttpParams()
      .set('q', 'pid:"' + pid + '"')
      .set('wt', 'json')
      .set('rows', '1');


    return this.get(url, params).pipe(
      map((response: any) => {
        const j = response['response']['docs'][0];

        const ret = new Journal();
        ret.pid = j['pid'];
        ret.parent = j['parents'][0];
        ret.title = j['title'];
        ret.root_title = j['root_title'];
        ret.root_pid = j['root_pid'];
        ret.model = j['model'];
        ret.details = j['details'];
        ret.year = j['year'];
        ret.siblings = [];
        ret.mods = JSON.parse(j['mods']);
        ret.genres = [];
        ret.genresObject = {};

        return ret;
      })
    )
  }

  getJournalK5(pid: string): Observable<Journal> {

    let url = this.state.config['api_point'] + '/item/' + pid;


    return this.get(url).pipe(
      map((response: any) => {
        //console.log(response);
        const j = response;

        const ret = new Journal();
        ret.pid = j['pid'];
        ret.title = j['title'];
        ret.root_title = j['root_title'];
        ret.root_pid = j['root_pid'];
        ret.model = j['model'];
        ret.details = j['details'];
        ret.siblings = [];
        ret.mods = null;
        ret.genres = [];
        ret.genresObject = {};

        return ret;
      })
    )
  }

  //  getJournalByPid(pid: string, model: string): Observable<Journal> {
  //    var url = this.state.config['api_point'] + '/item/' + pid + '/children';
  //
  //    return this.get(url).map((response: Response) => {
  //      let childs: any[] = response.json();
  //      //console.log(pid, childs);
  //      let last = childs[childs.length - 1];
  //      if (childs.length === 0) {
  //        return new Journal();
  //      }
  //      if (last['model'] === model) {
  //        let ret = new Journal();
  //        ret.pid = last['pid'];
  //        ret.title = last['title'];
  //        ret.root_title = last['root_title'];
  //        ret.root_pid = last['root_pid'];
  //        ret.model = last['model'];
  //        ret.details = last['details'];
  //        ret.siblings = childs;
  //        ret.mods = null;
  //        ret.genres = [];
  //        ret.genresObject = {};
  //
  //        return ret;
  //      } else {
  //        return this.getJournalByPid(last['pid'], model).switch();
  //      }
  //    });
  //  }

  setArticles1(ret: Journal, res1: any) {
    const res = res1['response']['docs'];
    for (const i in res) {
      const art = res[i];
      if (art && art['pid']) {
        this.getMods(art['pid']).subscribe(mods => {
          art['mods'] = mods;
          //let mods = bmods["mods:modsCollection"]["mods:mods"];
          const genre = Utils.getJsonValue(mods, 'mods:genre');
          if (genre.hasOwnProperty('type')) {
            art['genre'] = genre['type'];
          } else if (genre.hasOwnProperty('length')) {
            for (const i in genre) {
              art['genre'] = genre[i]['type'];
            }
          }
          if (this.isGenreVisible(art['genre'])) {
            if (ret.genresObject.hasOwnProperty(art['genre'])) {
              ret.genresObject[art['genre']]['articles'].push(art);
            } else {
              ret.genres.push(art['genre']);
              ret.genresObject[art['genre']] = {};
              ret.genresObject[art['genre']]['articles'] = [];
              ret.genresObject[art['genre']]['articles'].push(art);
            }
          }
          //            if (this.service.getJsonValue(mods, "mods:genre") !== null){
          //            }
        });
      }
    }
  }

  isGenreVisible(genre: string): boolean {
    return genre !== 'cover' &&
      genre !== 'advertisement' &&
      genre !== 'colophon';
  }

  getArticles(pid: string): Observable<any[]> {
    const getRange = (pid: string): Observable<any> => {

      let url = this.state.config['context'] + 'search/journal/select';
      const params = new HttpParams()
        .set('q', '*:*')
        .set('fq', 'parents:"' + pid + '"')
        .set('wt', 'json')
        .set('sort', 'idx asc')
        .set('rows', '500');

      return this.get(url, params);
    };

    return getRange(pid).pipe(
      expand((res: any) => {

        const articles = [];
        let childs: any[];
        if (res.json) {
          childs = res.json()['response']['docs'];
        } else {
          childs = res;
        }
        for (const ch in childs) {
          if (childs[ch]['model'] === 'article') {
            articles.push(childs[ch]);
          }
        }

        if (articles.length > 0) {
          //return Observable.of(articles);
          //return articles;
          return of([]);
        } else {
          if (childs.length > 0) {
            return getRange(childs[0]['pid']);
          } else {
            return of([]);
          }
        }

      }),
      map((res: any) => {
        return res;
      })
    )
  }


  public modsCache: any = {};

  getMods(pid: string): Observable<any> {
    if (this.modsCache.hasOwnProperty(pid)) {
      return of(this.modsCache[pid]);
    }
    const url = this.state.config['context'] + 'search/journal/select';
    const params = new HttpParams()
      .set('q', '*:*')
      .set('fq', 'pid:"' + pid + '"')
      .set('wt', 'json').set('fl', 'mods:[json]');

    return this.get(url, params).pipe(
      map((response: any) => {
        if (response.response.docs.length > 0 && response.response.docs[0].mods) {
          this.modsCache[pid] = response['response']['docs'][0]['mods'];
          return this.modsCache[pid];
        }
      })
    )
  }

  setViewed(pid: string): Observable<any> {
    const url = this.state.config['context'] + 'index';
    const params = new HttpParams()
      .set('action', 'SET_VIEW')
      .set('pid', pid);
    return this.get(url, params);


    //    let url = this.state.config['context'] + 'search/views/update';
    //    let headers = new Headers({ 'Content-Type': 'application/json' });
    //    let options = new RequestOptions({ headers: headers });
    //    let add = { add: { doc: {}, commitWithin: 10 } };
    //    let body = add['add']['doc'];
    //    body['pid'] = pid;
    //    body['views'] = { 'inc': 1 };

    //    return this.http.post(url, JSON.stringify(add), options)
    //      .map((response: Response) => {
    //        return response.json();
    //
    //      });
  }

  getViewed(pid: string): Observable<number> {
    const url = this.state.config['context'] + 'search/views/select';
    const params = new HttpParams().set('q', '*:*')
      .set('fq', 'pid:"' + pid + '"')
      .set('wt', 'json')
      .set('fl', 'views');

    return this.get(url, params).pipe(
      map((response: any) => {
        if (response['response']['numFound'] > 0) {
          return response['response']['docs'][0]['views'];
        } else {
          return 0;
        }

      })
    )
  }


  getModsK5(pid: string): Observable<any> {
    const url = this.state.config['api_point'] + '/item/' + pid + '/streams/BIBLIO_MODS';
    return this.get(url).pipe(
      map((res: any) => {
        return JSON.parse(xml2json(res.text(), ''))['mods:modsCollection']['mods:mods'];
      })
    )
  }

  getSiblings(pid: string): Observable<any> {
    const url = this.state.config['context'] + 'search/journal/select';
    const params = new HttpParams()
      .set('q', 'pid:"' + pid + '"')
      .set('wt', 'json')
      .set('fl', 'parents');

    return this.get(url, params).pipe(
      map((response: any) => {
        const parent = response['response']['docs'][0]['parents'][0];
        return this.getChildren(parent).subscribe();
      })
    )
  }

  getSiblingsk5(pid: string): Observable<any> {
    const url = this.state.config['api_point'] + '/item/' + pid + '/siblings';
    return this.get(url).pipe(
      map((res: any) => {

        return res[0]['siblings'];
      })
    )
  }

  getUploadedFiles(): Observable<any> {
    let url = 'lf?action=LIST&ctx=' + this.state.ctx?.ctx;

    return this.get(url).pipe(
      catchError((error: any) => of('error gettting content: ' + error))
    )
  }

  getText(id: string): Observable<string> {
    let url = 'texts';
    let params = new HttpParams()
      .set('action', 'LOAD')
      .set('ctx', this.state.ctx?.ctx!)
      .set('id', id)
      .set('lang', this.state.currentLang);

    return this.get(url, params, 'text').pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of('error gettting content: ' + error))
    )
  }

  getCitace(uuid: string): Observable<string> {
    let url = 'index';
    let params = new HttpParams()
      .set('action', 'CITATION')
      .set('uuid', uuid);
    return this.get(url, params, 'text').pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => of('error gettting citation: ' + error))
    )
  }

  saveText(id: string, text: string, menu: string | null = null): Observable<string> {

    //var url = 'texts?action=SAVE&id=' + id + '&lang=' + this.state.currentLang;
    let url = 'texts';

    let params = new HttpParams()
      .set('user', this.state.loginuser!)
      .set('id', id)
      .set('action', 'SAVE')
      .set('lang', this.state.currentLang)
      .set('ctx', this.state.ctx?.ctx!);

    if (menu) {
      params = params.set('menu', menu);
      //url += '&menu=' + menu;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'text/plain;charset=UTF-8' });
    const options = { headers: headers, params: params };

    return this.http.post<string>(url, text, options);


  }

  saveMenu(menu: string) {

    //var url = 'texts?action=SAVE&id=' + id + '&lang=' + this.state.currentLang;
    let url = 'texts';

    let params = new HttpParams()
      .set('action', 'SAVE_MENU')
      .set('ctx', this.state.ctx?.ctx!)
      .set('menu', menu);

    return this.get(url, params);


  }

  getMagazine(web: string) {
    const url = this.state.config['context'] + 'search/magazines/select';
    const params = new HttpParams()
      .set('q', 'web:"' + web + '"')
      .set('wt', 'json');

    return this.get(url, params);

  }

  index(uuid: string) {
    let url = 'index?action=INDEX_DEEP&pid=' + uuid;

    return this.get(url).pipe(
      map((response: any) => {
        return response.json();
      }),
      catchError((error: any) => of('indexing uuid:: ' + error))
    )

  }

  delete(uuid: string) {
    let url = 'index?action=DELETE_PID&pid=' + uuid;

    return this.get(url).pipe(
      map((response: any) => {
        return response.json();
      }),
      catchError((error: any) => of('deleting uuid: ' + error))
    )

  }

  login() {
    this.state.loginError = false;
    return this.doLogin().subscribe((res: any) => {
      if (res.hasOwnProperty('error')) {
        this.state.loginError = true;
        this.state.logged = false;
      } else {

        this.state.loginError = false;
        this.state.loginuser = '';
        this.state.loginpwd = '';
        this.state.logged = true;

        if (this.state.redirectUrl) {
          if (this.state.redirectUrl.startsWith('/')) {
            this.router.navigate([this.state.redirectUrl], { queryParamsHandling: 'preserve' });
          } else {
            this.router.navigate([this.state.ctx ? this.state.ctx.ctx : '/admin'], { queryParamsHandling: 'preserve' });
          }
        }
      }
    }, error => {
      console.log('error : ' + error);
      this.state.loginError = true;
      this.state.logged = false;
    });
  }

  doLogin() {
    let url = 'login';
    let params = new HttpParams()
      .set('user', this.state.loginuser!)
      .set('pwd', this.state.loginpwd!)
      .set('ctx', this.state.ctx?.ctx!)
      .set('action', 'LOGIN');
    return this.get(url, params);

  }

  logout() {
    this.doLogout().subscribe((res: any) => {
      if (res.hasOwnProperty('error')) {
        console.log(res['error']);
      }

      this.state.loginError = false;
      this.state.loginuser = '';
      this.state.loginpwd = '';
      this.state.logged = false;
      this.router.navigate([this.state.ctx ? this.state.ctx.ctx : '/home'], { queryParamsHandling: 'preserve' });
    });
  }

  doLogout() {

    let url = 'login';
    //console.log(this.loginuser, this.loginpwd, url);
    let params = new HttpParams().set('action', 'LOGOUT');
    return this.get(url, params);

  }

  isHiddenByGenre(genres: string[]) {
    //console.log(this.state.config['hiddenGenres'], genres);
    for (const g in genres) {
      //console.log(g);
      if (this.state.config['hiddenGenres'].indexOf(genres[g]) > -1) {
        return true;
      }
    }
    return false;
  }


  pidActual: string | null | undefined;
  findActual() {
    this.pidActual = null;
    this.findActualByPid(this.state.config['journal']);
  }

  findActualByPid(pid: string) {
    this.getChildren(pid).subscribe((res: any) => {
      if (res.length === 0) {
        this.state.setActual(null);
        this.pidActual = null;
        console.log('ERROR. Cannot find actual number', pid);
      } else if (res[0]['datanode']) {
        this.pidActual = pid;
        this.getJournal(pid).subscribe(a => {
          this.state.setActual(a);
          this.getArticles(this.state.actualNumber!['pid']!).subscribe((res: any) => {
            this.state.actualNumber!.setArticles(res, this.state.config['mergeGenres']);
            //this.service.getMods(this.state.actualNumber['pid']).subscribe(mods => this.state.actualNumber.mods = mods);
            this.state.stateChanged();
          });
        });
      } else {
        this.findActualByPid(res[0]['pid']);
      }
    });
  }

  getKeywords() {
    let params = new HttpParams()
      .set('q', '*:*')
      .set('rows', '0')
      .set('facet', 'true')
      .set('facet.field', 'keywords_facet')
      .set('facet.mincount', '1')
      .set('facet.limit', '-1')
      .set('facet.sort', 'index');
    this.search.search(params).subscribe((res: any) => {
      this.state.keywords = [];

      for (const i in res['facet_counts']['facet_fields']['keywords_facet']) {
        const val: string = res['facet_counts']['facet_fields']['keywords_facet'][i][0];
        if (val && val !== '') {
          const val_lower: string = val.toLocaleLowerCase();
          this.state.keywords.push({ val: val, val_lower: val_lower, valq: '"' + val + '"' });
        }
      }

      this.state.keywords.sort((a, b) => {
        return a.val_lower.localeCompare(b.val_lower, 'cs');
      });

    });
  }

  getGenres() {
    //Rok jako stats
    let params = new HttpParams()
      .set('q', '*:*')
      .set('fq', '-genre:""')
      .set('fq', 'model:article')
      .set('rows', '0')
      .set('facet', 'true')
      .set('facet.field', 'genre')
      .set('facet.mincount', '1')
      .set('facet.sort', 'index');
    this.search.search(params).subscribe((res: any) => {

      this.state.genres = [];
      for (const i in res['facet_counts']['facet_fields']['genre']) {
        const genre = res['facet_counts']['facet_fields']['genre'][i][0];
        if (!this.isHiddenByGenre([genre])) {
          //this.state.genres.push(genre);
          const tr: string = this.translateKey('genre.' + genre);
          this.state.genres.push({ val: genre, tr: tr, valq: '"' + genre + '"' });
        }
      }
      this.state.genres.sort((a, b) => {
        return a.tr.localeCompare(b.tr, 'cs');
      });

    });

  }


}
