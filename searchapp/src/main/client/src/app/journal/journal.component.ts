import { Component, Inject, PLATFORM_ID, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router, RouterModule } from '@angular/router';
import { AppState } from '../app.state';
import { AppWindowRef } from '../app.window-ref';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';
import { MatCssPalettePrefix, MaterialCssVarsModule, MaterialCssVarsService } from 'angular-material-css-vars';
import { MatButtonModule } from '@angular/material/button';
import { Configuration } from '../models/configuration';
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SidenavListComponent } from './components/sidenav-list/sidenav-list.component';
import { HeadingComponent } from "./components/heading/heading.component";
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

interface CssVariable {
  name: string;
  val: string;
}

@Component({
  standalone: true,
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  imports: [CommonModule, RouterModule, MaterialCssVarsModule, MatButtonModule, FooterComponent, NavbarComponent, MatSidenavModule, MatListModule, SidenavListComponent, HeadingComponent, BreadcrumbComponent]
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
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public materialCssVarsService: MaterialCssVarsService,
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

    getColor(){
      console.log(document.getElementsByTagName('html')[0].getAttribute('style'));

      const a = this._computePaletteColors('--palette-primary-', '#cccc00');// + this.state.currentMagazine.color);
     this._setStyle(a);
      console.log(a)
      
    }

    private _computePaletteColors(
      prefix: string,
      hex: string,
    ): CssVariable[] {
      return this.materialCssVarsService.getPaletteForColor(hex).map((item) => {
        const c = item.color;
        return {
          name: `${prefix}${item.hue}`,
          val: `rgb(${c.r}, ${c.g}, ${c.b})`,
        };
      });
    }

    private _setStyle(vars: CssVariable[]) {
      vars.forEach((s) => {
        this.renderer.setStyle(
          this.document.documentElement,
          s.name,
          s.val,
          RendererStyleFlags2.DashCase,
        );
        this.renderer.setStyle(
          this.document.documentElement,
          s.name + "-no-rgb",
          this._replaceNoRgbValue(s.name, s.val),
          RendererStyleFlags2.DashCase,
        );
      });
    }

    private _replaceNoRgbValue(name: string, value: string) {
      const isContrast: boolean = name.includes(
        'contrast-',
      );
      let noRgb = "";
      if (isContrast) {
        noRgb = value.replace(")", "-no-rgb)");
      } else {
        noRgb = value.replace("rgba(", "").replace("rgb(", "").replace(")", "");
        if (noRgb.startsWith("var(")) {
          noRgb = noRgb.concat(")");
        }
      }
      return noRgb;
    }
    
  ngOnInit() {

    if (this.state.currentMagazine) {

      if (isPlatformBrowser(this.platformId)) {
        this.materialCssVarsService.setPrimaryColor('#' + this.state.currentMagazine.color);
      } else {
        // const s = '--palette-primary-50: rgb(239, 228, 231); --palette-primary-50-no-rgb: 239, 228, 231; --palette-primary-100: rgb(216, 187, 194); --palette-primary-100-no-rgb: 216, 187, 194; --palette-primary-200: rgb(190, 141, 154); --palette-primary-200-no-rgb: 190, 141, 154; --palette-primary-300: rgb(164, 95, 114); --palette-primary-300-no-rgb: 164, 95, 114; --palette-primary-400: rgb(145, 61, 83); --palette-primary-400-no-rgb: 145, 61, 83; --palette-primary-500: rgb(125, 27, 53); --palette-primary-500-no-rgb: 125, 27, 53; --palette-primary-600: rgb(117, 24, 48); --palette-primary-600-no-rgb: 117, 24, 48; --palette-primary-700: rgb(106, 20, 40); --palette-primary-700-no-rgb: 106, 20, 40; --palette-primary-800: rgb(96, 16, 34); --palette-primary-800-no-rgb: 96, 16, 34; --palette-primary-900: rgb(77, 8, 22); --palette-primary-900-no-rgb: 77, 8, 22; --palette-primary-A100: rgb(255, 130, 149); --palette-primary-A100-no-rgb: 255, 130, 149; --palette-primary-A200: rgb(255, 79, 106); --palette-primary-A200-no-rgb: 255, 79, 106; --palette-primary-A400: rgb(255, 28, 63); --palette-primary-A400-no-rgb: 255, 28, 63; --palette-primary-A700: rgb(255, 3, 41); --palette-primary-A700-no-rgb: 255, 3, 41; --palette-primary-contrast-50: var(--dark-primary-text); --palette-primary-contrast-50-no-rgb: var(--dark-primary-text-no-rgb); --palette-primary-contrast-100: var(--dark-primary-text); --palette-primary-contrast-100-no-rgb: var(--dark-primary-text-no-rgb); --palette-primary-contrast-200: var(--dark-primary-text); --palette-primary-contrast-200-no-rgb: var(--dark-primary-text-no-rgb); --palette-primary-contrast-300: var(--light-primary-text); --palette-primary-contrast-300-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-400: var(--light-primary-text); --palette-primary-contrast-400-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-500: var(--light-primary-text); --palette-primary-contrast-500-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-600: var(--light-primary-text); --palette-primary-contrast-600-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-700: var(--light-primary-text); --palette-primary-contrast-700-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-800: var(--light-primary-text); --palette-primary-contrast-800-no-rgb: var(--light-primary-text-no-rgb); --palette-primary-contrast-900: var(--light-primary-text); --palette-primary-contrast-900-no-rgb: var(--light-primary-text-no-rgb);';
        // this.document.getElementsByTagName('html')[0].setAttribute('style', s);

        const a = this._computePaletteColors('--palette-primary-', '#' + this.state.currentMagazine.color);
        this._setStyle(a);

      }
      this.initApp();
    } else {
      // navigate to magazines home
      this.router.navigate(['/']);
    }
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
      if (this.config.hasOwnProperty('defaultLang')) {
        userLang = this.config['defaultLang'];
      }
    }
    this.service.changeLang(userLang);
    //this.setCtx(false);

    this.service.findActual();
    this.service.getKeywords();
    this.service.getGenres();

    this.processUrl();
    this.hasContext = true;
    this.state.stateChanged();

  }

  getConfig(): any {
    if (this.state.currentMagazine) {
      return this.service.getJournalConfig(this.state.currentMagazine).subscribe(res => {
        //return this.http.get("assets/config.json").map(res => {
        let cfg = res;
        if (!this.config) {
          this.state.setConfig(cfg);
        }
        this.initApp();
        return this.config;
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
