import { Inject, Injectable, PLATFORM_ID, importProvidersFrom } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, throwError } from 'rxjs';

import { MagazineState } from './magazine.state';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { Magazine } from '../models/magazine';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { error } from 'console';
import { get } from 'http';
import server from 'server';

@Injectable()
export class MagazinesService {

  //Observe language
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    public state: MagazineState,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient) { }

  private get<T>(url: string, params: HttpParams = new HttpParams(), responseType?: any): Observable<T> {
    const options = { params, responseType, withCredentials: true };

    const server = isPlatformBrowser(this.platformId) ? '' : 'http://localhost:8080';

    return this.http.get<T>(`${server}/api/${url}`, options)
      .pipe(catchError(err => { return this.handleError(err, url) }));
  }

  private post(url: string, obj: any, params: HttpParams = new HttpParams()) {
    const server = isPlatformBrowser(this.platformId) ? '' : 'http://localhost:8080';
    return this.http.post<any>(`${server}/api/${url}`, obj, { params })
      .pipe(catchError(err => { return this.handleError(err, url) }));
    //.pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse, url: string) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', url, error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend for ${url} returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      `Error for ${url} returned code ${error.status}, ${error.error}`);
  }

  changeLang(lang: string) {
    this.state.currentLang = lang;
    this.translate.use(lang);
    this._langSubject.next(lang);
  }

  showSnackBar(s: string, r: string = '', error: boolean = false) {
    const right = r !== '' ? this.translate.instant(r) : '';
    const clazz = error ? 'app-snack-error' : 'app-snack-success';
    this.snackBar.open(this.translate.instant(s), right, {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: clazz
    });
  }

  saveText(id: string, text: string): Observable<string> {

    const server = isPlatformBrowser(this.platformId) ? '' : 'http://localhost:8080';
    let url = 'texts';

    let params = new HttpParams()
      .set('id', id)
      .set('action', 'SAVE')
      .set('lang', this.translate.currentLang)
      .set('ctx', 'magazines');

    const body: any = { text: text }

    return this.post(url, body, params);

  }

  getText(id: string): Observable<string> {
    const url = 'texts';
    let params = new HttpParams()
      .set('action', 'LOAD')
      .set('ctx', 'magazines')
      .set('id', id)
      .set('lang', this.translate.currentLang);

    return this.get(url, params, 'text/plain');
  }

  //Magazines
  getMagazines(): Observable<any> {
    var url = 'search/get_magazines';
    let params = new HttpParams()
    .set('lang', this.state.currentLang)
    .set('sortDir', this.state.currentSortDir);

      // for (let i in this.state.filters) {
      //   let f: { field: string, value: string } = this.state.filters[i];
      //   params = params.append('fq', f.field + ':"' + f.value + '"');
      // }
      
      for (let i in this.state.filters) {
        let f: { field: string, value: string } = this.state.filters[i];
        params = params.append(f.field, f.value);
      }

    this.state.clear();

    return this.get(url, params);
  }

  getEditorMagazines(id: string): Observable<any> {
    var url = 'search/get_magazines';
    let params = new HttpParams()
      .set('fq', 'vydavatel_id:"' + id + '"')
      .set('sortDir', this.state.currentSortDir);

    for (let i in this.state.filters) {
      let f: { field: string, value: string } = this.state.filters[i];
      params = params.append('fq', f.field + ':"' + f.value + '"');
    }

    this.state.clear();

    return this.get(url, params).pipe(
      map((response: any) => {
        this.state.magazines = response['response']['docs'];
        this.state.setFacets(response['facet_counts']['facet_fields']);
        return this.state;
      })
    )
  }


  getEditors(): Observable<any> {
    var url = 'search/get_editors';

    this.state.clear();

    return this.get(url).pipe(
      map((response) => {
        this.state.setEditors(response);
        return this.state;
      })
    )
  }

  saveEditor(editor: any) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'SAVE_EDITOR')
      .set('editor', JSON.stringify(editor));

    return this.get(url, params);
  }

  deleteEditor(id: string) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'DELETE_EDITOR')
      .set('id', id);

    return this.get(url, params);
  }

  getUsers(): Observable<any> {
    var url = 'search/users/select';
    let params = new HttpParams().set('q', '*')
      .set('wt', 'json')
      .set('rows', '50')
      .set('json.nl', 'arrntv')
      .set('sort', 'username asc');

    this.state.clear();

    return this.get(url, params);
  }

  saveUser(user: any) {
    var url = 'index';
    let params = new HttpParams()
      .set('action', 'SAVE_USER');
    return this.post(url, user, params);
  }

  deleteUser(username: string) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'DELETE_USER')
      .set('username', username);

    return this.get(url, params);
  }

  saveMagazine(mag: Magazine) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'SAVE_MAGAZINE');

    return this.post(url, mag, params);
  }

  deleteMagazine(ctx: string) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'DELETE_MAGAZINE')
      .set('ctx', ctx);

    return this.get(url, params);
  }
  login() {
    this.state.loginError = false;
    return this.doLogin().subscribe(res => {
      if (res.hasOwnProperty('error')) {
        this.state.loginError = true;
        this.state.logged = false;
        this.state.user = null;
      } else {

        this.state.loginError = false;
        this.state.loginuser = '';
        this.state.loginpwd = '';
        this.state.logged = true;
        this.state.user = res;
        this.router.navigate(['/magazines/admin'], { queryParamsHandling: "preserve" });

      }
    }, error => {
      console.log('error : ' + error);
      this.state.loginError = true;
      this.state.logged = false;
      this.state.user = null;
    });
  }

  doLogin() {
    const url = 'login';
    var params = new HttpParams().set('action', 'LOGIN');
    const user = {
      user: this.state.loginuser,
      pwd: this.state.loginpwd,
      ctx: 'admin'
    }
    return this.post(url, user, params);

  }

  logout() {
    this.doLogout().subscribe((res: any) => {
      if (res.hasOwnProperty('error')) {
        console.log(res['error']);
      }
      this.state.logged = false;
      this.state.user = null;
      this.router.navigate(['.'], { queryParamsHandling: "preserve" });
    });
  }

  doLogout() {

    var url = 'login';
    //console.log(this.loginuser, this.loginpwd, url);
    var params = new HttpParams().set('action', 'LOGOUT');
    return this.get(url, params);

  }

  resetPwd(username: string, newpwd: string) {
    const url = 'login';
    var params = new HttpParams().set('action', 'RESET_PWD');
    const user = {
      user: username,
      pwd: newpwd
    }
    return this.post(url, user, params);
  }

  public addFilter(field: string, value: string) {
    const p: any = {};
    p[field] = [value];
    for (let i in this.state.filters){
      if (this.state.filters[i].field === field && this.state.filters[i].value !== value){
        p[field].push(this.state.filters[i].value);
      }
    }
    console.log()
    this.router.navigate([], { queryParams: p, queryParamsHandling: 'merge' });
  }

  removeFilter(field: string, idx: number) {
    this.state.filters.splice(idx, 1);
    const fs = this.state.filters.filter(f => f.field === field)
    const p: any = {};
    if (fs.length === 0) {
      p[field] = null;
    } else {
      p[field] = [];
      for (let i in fs){
          p[field].push(fs[i].value);
      }
    }
    
    this.router.navigate([], { queryParams: p, queryParamsHandling: 'merge' });
  }

}
