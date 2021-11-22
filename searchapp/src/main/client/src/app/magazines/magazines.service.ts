import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Observable, Subject} from 'rxjs';

import {MagazineState} from './magazine.state';
import {Router} from '@angular/router';
import { map } from 'rxjs/operators';
import { Magazine } from '../models/magazine';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class MagazinesService {

  //Observe language
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  constructor(
    public state: MagazineState,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient) {}

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

  getText(id: string): Observable<string> {
    var url = 'texts?action=LOAD&ctx=magazines&id=' + id + '&lang=' + this.state.currentLang;

    return this.http.get(url, {responseType: 'text'});
  }


  //Magazines
  getMagazines(): Observable<any> {
    var url = this.state.config['context'] + 'search/magazines/select';
    let params = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '50')
      .set('sort', 'titleCS ' + this.state.currentSortDir)
      .set('json.nl', 'arrarr')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .append('facet.field', 'pristup')
      .append('facet.field', 'oblast')
      .append('facet.field', 'vydavatel')
      .append('facet.field', 'keywords');

    for (let i in this.state.filters) {
      let f: {field: string, value: string} = this.state.filters[i];
      params = params.append('fq', f.field + ':"' + f.value + '"');
    }

    this.state.clear();

    return this.http.get(url, {params: params});
  }

  getEditorMagazines(id: string): Observable<any> {
    var url = this.state.config['context'] + 'search/magazines/select';
    let params = new HttpParams()
      .set('q', 'vydavatel_id:"' + id + '"')
      .set('wt', 'json')
      .set('indent', 'true')
      .set('rows', '50')
      .set('sort', 'titleCS ' + this.state.currentSortDir)
      .set('json.nl', 'arrarr')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .append('facet.field', 'pristup')
      .append('facet.field', 'oblast')
      .append('facet.field', 'keywords');

    for (let i in this.state.filters) {
      let f: {field: string, value: string} = this.state.filters[i];
      params = params.append('fq', f.field + ':"' + f.value + '"');
    }

    this.state.clear();

    return this.http.get(url, {params: params}).pipe(
      map((response: any) => {
        this.state.magazines = response['response']['docs'];
        this.state.setFacets(response['facet_counts']['facet_fields']);
        return this.state;
      })
    )
  }


  getEditors(): Observable<any> {
    var url = this.state.config['context'] + 'search/editors/select';
    let params = new HttpParams().set('q', '*')
      .set('wt', 'json')
      .set('rows', '50')
      .set('json.nl', 'arrntv')
      .set('sort', 'id asc')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .append('facet.field', 'typ');

    this.state.clear();

    return this.http.get(url, {params: params}).pipe(
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

    return this.http.get(url, {params: params});
  }

  deleteEditor(id: string) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'DELETE_EDITOR')
      .set('id', id);

    return this.http.get(url, {params: params});
  }

  saveMagazine(mag: Magazine) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'SAVE_MAGAZINE')
      .set('mag', JSON.stringify(mag));

    return this.http.get(url, {params: params});
  }

  deleteMagazine(ctx: string) {

    var url = 'index';
    let params = new HttpParams()
      .set('action', 'DELETE_MAGAZINE')
      .set('ctx', ctx);

    return this.http.get(url, {params: params});
  }
login() {
    this.state.loginError = false;
    return this.doLogin().subscribe(res => {
      if (res.hasOwnProperty('error')) {
        this.state.loginError = true;
        this.state.logged = false;
      } else {

        this.state.loginError = false;
        this.state.loginuser = '';
        this.state.loginpwd = '';
        this.state.logged = true;
        
        this.router.navigate(['admin'], {queryParamsHandling: "preserve"});
        
      }
    }, error => {
      console.log('error : ' + error);
        this.state.loginError = true;
        this.state.logged = false;
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
    return this.http.post<any>(url, user, {params});

  }

  logout() {
    this.doLogout().subscribe((res: any) => {
      if (res.hasOwnProperty('error')) {
        console.log(res['error']);
      }
      this.state.logged = false;
      this.router.navigate(['.'], {queryParamsHandling: "preserve"});
    });
  }

  doLogout() {

    var url = 'login';
    //console.log(this.loginuser, this.loginpwd, url);
    var params = new HttpParams().set('action', 'LOGOUT');
    return this.http.get(url, {params: params});

  }

  resetPwd(username: string, newpwd: string) {
    const url = 'login';
    var params = new HttpParams().set('action', 'RESET_PWD');
    const user = {
      user: username,
      pwd: newpwd
    }
    return this.http.post<any>(url, user, {params});

  }

}
