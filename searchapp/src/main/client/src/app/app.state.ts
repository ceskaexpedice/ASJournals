import {Injectable} from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Journal } from './models/journal.model';
import { Magazine } from './models/magazine';

@Injectable()
export class AppState {

  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();

  // private _titleSubject = new Subject();
  // public titleChangedSubject: Observable<any> = this._titleSubject.asObservable();

  private _classSubject = new Subject();
  public classChangedSubject: Observable<any> = this._classSubject.asObservable();

  private _fullScreenSubject = new Subject();
  public fullScreenSubject: Observable<any> = this._fullScreenSubject.asObservable();

  public _paramsSubject = new Subject();
  public paramsSubject: Observable<any> = this._paramsSubject.asObservable();

  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();

  private _journalsSubject: ReplaySubject<any> = new ReplaySubject(2);
  public journalsInitilized: Observable<any> = this._journalsSubject.asObservable();

  private _crumbsSubject = new Subject();
  public crumbsChangedSubject: Observable<any> = this._crumbsSubject.asObservable();

  currentMagazine: Magazine;

  //ctxs: {ctx: string, color: string, journal: string, showTitleLabel: boolean, licence:string}[];
  ctxs: Magazine[] = [];

  username = '';
  loginuser: string | undefined;
  loginpwd: string | undefined;
  loginError: boolean = false;
  logged: boolean = false;
  redirectUrl: string = 'admin';

  //Holds start query parameter
  start: number = 0;

  //Holds number of rows per page. Default value from configuration
  rows: number = 10;

  fulltextQuery: string = '';
  hlTerms: string[] = [];

  archivPosition: any;

  sorts = [
    {"label": "dle relevance", "field": "score desc"},
    {"label": "od nejnovějších", "field": "year desc"},
    {"label": "od nejstarších", "field": "year asc"},
    {"label": "podle názvu A-Z", "field": "title_sort asc"}

  ];
  currentSort: any = this.sorts[0];
  currentLang: string = 'cs';

  public docs: any[] | undefined;

  //Aktualni cislo
  public actualNumber: Journal | null = null;
  public imgSrc: string | null = null;
  public krameriusUrl: string | null = null;

  public mainClass: string | null = null;

  //Controls full screen viewer
  public isFull: boolean = false;
  fullSrc: string;  
  isPdf = false;
  viewerJournal: Journal = new Journal();
  viewerPid: string;
  viewerArticle: any;
  viewerActiveLink: string;

  archivItemDetails: { year: number, volumeNumber: string, issueNumber: string, partName: any } 


  public breadcrumbs: any[] = [];

  dateMin: number = 2000;
  dateMax: number = 2019;
  dateOd: number = 2000;
  dateDo: number = 2019;
  dateRange: number[] = [0, 1];

  public route: string = '';

  public keywords: any[] = [];
  public genres: {val: string, tr: string, valq: string}[] = [];

  public letters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];

  resetDates() {
    this.dateOd = this.dateMin;
    this.dateDo = this.dateMax;
    this.dateRange = [this.dateOd, this.dateDo];
  }

  

  setConfig(cfg: any) {
    this.rows = cfg['searchParams']['rows'];
    this.sorts = cfg['sorts'];
    this.currentSort = cfg[0];
    this.krameriusUrl = cfg['k5'] + cfg['journal'];
    this.imgSrc = cfg['context'] + 'api/img?obalka=true&ctx=' + this.currentMagazine.ctx + '&uuid=' + this.currentMagazine.journal + '&kramerius_version=' + (this.currentMagazine?.isK7 ? 'k7' : 'k5') + '&thumb=true';

    this._configSubject.next(cfg);
  }



  //params
  paramsChanged() {
    this._paramsSubject.next('');
  }

  //params
  stateChanged() {
    this._stateSubject.next(this);
  }

  //params
  crumbsChanged() {
    this._crumbsSubject.next(this);
  }

  //params
  classChanged() {
    this._classSubject.next(this);
  }

  //params
  setJournals(res: any) {
    this.ctxs = res['response']['docs'];
    this.ctxs.forEach((m: Magazine) => m.isK7 = m.kramerius_version === 'k7');
    //this.ctxs = res["journals"];
    //this.ctx = this.ctxs[0];
    this._journalsSubject.next(this);
  }

  fullScreenChanged(b: boolean) {

    this.isFull = b;
    this._fullScreenSubject.next(b);
  }


  //Clear state vars
  clear() {
    this.docs = [];
  }

  setActual(a: Journal | null) {
    this.actualNumber = a;
    // this._titleSubject.next(a);
    this.stateChanged();
  }

  setBreadcrumbs() {

  }

  setHl(res: { [x: string]: { [x: string]: string[]; }; }) {
    this.hlTerms = [];
    if (res) {
      let ids = Object.keys(res);
      for (let i = 0; i < ids.length; i++) {
        let ocr: string[] = res[ids[i]]['ocr'];
    //console.log(ocr);
        ocr.forEach(s => {
          let terms = s.match(/<em>(.*?)<\/em>/g)?.map(function (val) {
            return val.replace(/<\/?em>/g, '');
          });
          terms?.forEach(t => {
            if (!this.hlTerms.includes(t)){
              this.hlTerms.push(t);
            }
          });
        });
      }
    }
  }
}
