import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router, RouterModule } from '@angular/router';
import { AppState } from '../app.state';
import { AppWindowRef } from '../app.window-ref';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';
import { MaterialCssVarsModule, MaterialCssVarsService } from 'angular-material-css-vars';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FlexLayoutModule, MaterialCssVarsModule, MatButtonModule],
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent {

  mainClass = 'app-main';
  subscriptions: Subscription[] = [];


  subscription: Subscription = new Subscription();
  pathObserver: Subscription = new Subscription();
  paramsObserver: Subscription = new Subscription();

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: AppWindowRef,
    public materialCssVarsService: MaterialCssVarsService,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {

    // this.materialCssVarsService.setDarkTheme(true);

    if (this.state.currentMagazine) {
      this.materialCssVarsService.setPrimaryColor('#'+this.state.currentMagazine.color);
        this.initApp();
    } else {
      // navigate to magazines home
      this.router.navigate(['/']);
    }

    // this.route.params
    //   .subscribe((params: Params) => {
    //       if (this.state.ctxs && this.state.ctxs.length > 0) {
    //         this.state.currentMagazine = this.service.getCtx(params['ctx']);
    //         this.materialCssVarsService.setPrimaryColor('#'+this.state.currentMagazine.color);
    //         this.getConfig();
    //       } 
    //   });
  }

  setColor() {
    this.materialCssVarsService.setPrimaryColor('#'+this.state.currentMagazine.color);
  }

  initApp() {
    let userLang = 'cs';
    if (this.route.snapshot.queryParams['lang']) {
      userLang = this.route.snapshot.queryParams['lang'];
    } else {
      if (isPlatformBrowser(this.platformId)) {
        userLang = this.windowRef.nativeWindow.navigator.language.split('-')[0]; // use navigator lang if available
      }
      userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
      if (this.state.config.hasOwnProperty('defaultLang')) {
        userLang = this.state.config['defaultLang'];
      }
    }
    this.service.changeLang(userLang);
    //this.setCtx(false);

    this.processUrl();
    console.log(this.hasContext)
    this.hasContext = true;
    this.state.stateChanged();

  }

  getConfig(): any {
    if (this.state.currentMagazine) {
      return this.service.getJournalConfig(this.state.currentMagazine).subscribe(res => {
        //return this.http.get("assets/config.json").map(res => {
        let cfg = res;
        if (!this.state.config) {
          this.state.setConfig(cfg);
        }
        this.initApp();
        return this.state.config;
      });
    } else {
      // navigate to magazines home
      this.router.navigate(['/']);
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
      this.mainClass = this.classes[this.state.route];

    } else if (p.length === 2 && p[1] === 'hledat') {
      this.state.route = p[1];
      this.mainClass = this.classes[this.state.route];
    }
  }

}
