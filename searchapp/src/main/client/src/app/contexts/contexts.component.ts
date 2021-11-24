import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/overlay/overlay-directives';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, NavigationEnd, NavigationStart} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {AppState} from '../app.state';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-contexts',
  templateUrl: './contexts.component.html',
  styleUrls: ['./contexts.component.scss']
})
export class ContextsComponent implements OnInit {

  subscription: Subscription = new Subscription;
  pathObserver: Subscription = new Subscription;
  paramsObserver: Subscription = new Subscription;
  
  hasContext: boolean = false;

  classes: any = {
    'home': 'app-page-home',
    'actual': 'app-page-actual',
    'o-casopisu': 'app-page-ocasopisu',
    'pro-autory': 'app-page-pokyny-pro-autory',
    'archiv': 'app-page-archiv-level-1',
    'article': 'app-page-archiv-reader',
    'hledat': 'app-page-search'
  };
  
  noctx: boolean = false;
  theClass: string = '';

  constructor(
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit() {
    
    this.route.params
      .subscribe((params: Params) => {
        console.log(params.ctx)
          if (this.state.ctxs && this.state.ctxs.length > 0) {
            this.state.ctx = this.service.getCtx(params.ctx);
            this.getConfig();
          } else {
            this.subscription = this.state.journalsInitilized.subscribe(cf => {
              this.state.ctx = this.service.getCtx(params.ctx);
              this.getConfig();
              this.theClass = this.state?.mainClass!;
              this.subscription.unsubscribe();
            });
          }
      });
      
  }

  setCtx(ctx: any) {
    this.service.getJournalConfig(ctx).subscribe(res => {
        this.router.navigate([this.state.ctx?.ctx, 'home'], {queryParamsHandling: "preserve"});
    });
  }

  initApp() {
    let userLang;
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

  getConfig(): any {
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
    let p = url.split('?')[0].split('/');
    if (p.length > 2) {
      this.state.route = p[2].split(';')[0];
      this.state.mainClass = this.classes[this.state.route];
    } else if (p.length === 2 && p[1] === 'hledat'){
      this.state.route = p[1];
      this.state.mainClass = this.classes[this.state.route];
    }
  }


}
