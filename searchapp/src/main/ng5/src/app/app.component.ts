import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {ActivatedRoute, Router, NavigationStart, NavigationEnd, NavigationExtras, Params} from '@angular/router';

import {AppService} from './services/app.service';
import {SearchService} from './services/search.service';
import {AppState} from './app.state';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  subscription: Subscription;
  pathObserver: Subscription;
  paramsObserver: Subscription;
  
  hasContext: boolean = false;
  noctx: boolean = false;

  classes = {
    'home': 'app-page-home',
    'actual': 'app-page-actual',
    'o-casopisu': 'app-page-ocasopisu',
    'pro-autory': 'app-page-pokyny-pro-autory',
    'archiv': 'app-page-archiv-level-1',
    'article': 'app-page-archiv-reader',
    'hledat': 'app-page-search'
  };
  mainClass: string = this.classes['home'];

  constructor(
    public state: AppState,
    private service: AppService,
    private route: ActivatedRoute,
    private router: Router) {

  }


  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => Observable.of(params['ctx'])).subscribe(ctx => {
          if (this.state.ctxs) {
            this.state.ctx = this.service.getCtx(ctx);
            this.getConfig();
          } else {
            this.subscription = this.state.journalsInitilized.subscribe(cf => {
              
              this.state.ctx = this.service.getCtx(ctx);
              this.getConfig();
              this.subscription.unsubscribe();
            });
          }
      });
    
    //this.service.getJournals().subscribe(res => {
    this.service.getMagazines().subscribe(res => {
      this.state.setJournals(res);
      this.service.setStyles();
      //this.getConfig();
    });
    
  }

  initApp() {
    var userLang; 
    if (this.route.snapshot.queryParams['lang']){
      userLang = this.route.snapshot.queryParams['lang'];
    } else {
      userLang = navigator.language.split('-')[0]; // use navigator lang if available
      userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
      if (this.state.config.hasOwnProperty('defaultLang')) {
        userLang = this.state.config['defaultLang'];
      }
    }
    this.service.changeLang(userLang);
    //this.setCtx(false);
    
    setTimeout(() => {
      this.processUrl();
      this.hasContext = true;
      this.state.stateChanged();
    }, 500);

  }

  getConfig() {
    if (this.state.ctx) {
      return this.service.getJournalConfig(this.state.ctx).subscribe(res => {
        //return this.http.get("assets/config.json").map(res => {
        let cfg = res;
        if (!this.state.config) {
          this.state.setConfig(cfg);
        }
        this.initApp();
        return this.state.config;
      });
    } else {
      this.noctx = true;
    }
    
  }
  processUrl() {
    this.setMainClass(this.router.url);
    this.pathObserver = this.router.events.subscribe(val => {
      //console.log('pathObserver', val);
      if (val instanceof NavigationEnd) {
        this.state.paramsChanged();
        this.setMainClass(val.url);
      } else if (val instanceof NavigationStart) {
        this.state.clear();
      }
    });

    this.state.paramsChanged();
  }
  
  setMainClass(url: string) {
    let p = url.split('/');
    if (p.length > 2) {
      this.state.route = p[2].split(';')[0];
      this.state.mainClass = this.classes[this.state.route];
    }
  }

}
