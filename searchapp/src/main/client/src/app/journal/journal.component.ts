import { Component, Inject, Injector, Optional, PLATFORM_ID, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
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
import { HeadingComponent } from "./components/heading/heading.component";
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { Meta } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';

interface CssVariable {
  name: string;
  val: string;
}

@Component({
  standalone: true,
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  imports: [CommonModule, RouterModule, MaterialCssVarsModule, MatButtonModule, FooterComponent, NavbarComponent, MatSidenavModule, MatListModule, HeadingComponent, BreadcrumbComponent]
})
export class JournalComponent {
  public isMobile = true;

  subscriptions: Subscription[] = [];


  subscription: Subscription = new Subscription();
  pathObserver: Subscription = new Subscription();
  paramsObserver: Subscription = new Subscription();

  hasContext: boolean = false;

  constructor(
    @Optional() @Inject(REQUEST) private request: any,
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: AppWindowRef,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public materialCssVarsService: MaterialCssVarsService,
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

  getColor() {

    const a = this._computePaletteColors('--palette-primary-', '#cccc00');// + this.state.currentMagazine.color);
    this._setStyle(a);

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
    this.service.findActual();
    this.service.getKeywords();
    this.service.getGenres();

    this.processUrl();
    this.hasContext = true;
    this.state.stateChanged();

    this.updateMetaTags();

  }

  addMetaTags() {
    let url = '';
    if (isPlatformServer(this.platformId)) {
      let req = this.injector.get(REQUEST);
      //console.log("locales from crawlers: " + req.headers["accept-language"]);
      //console.log("host: " + req.get('host'));
      //console.log("headers: ", req.headers);
      // url = 'http://' + req.headers['x-forwarded-host'];
      url = 'http://' + (req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers['host']) ;
      // console.log(url);
  } else {
      url = this.document.location.origin;
  }
    this.meta.addTags([
      { name: 'description', content: this.state.currentMagazine['desc_' + this.state.currentLang] },
      { name: 'author', content: this.state.currentMagazine.vydavatel },
      { name: 'keywords', content: this.state.currentMagazine['keyword_' + this.state.currentLang] ? this.state.currentMagazine['keyword_' + this.state.currentLang].join(',') : '' },
      { property: 'og:title', content: this.state.currentMagazine['title_' + this.state.currentLang] }, // <meta property="og:title" content="Your appealing title here" />
      { property: 'og:description', content: this.state.currentMagazine['desc_' + this.state.currentLang] },
      { property: 'og:image', content: url + this.state.imgSrc },
    ]);
  }

  updateMetaTags() {

    this.meta.removeTag('name=description');
    this.meta.removeTag('name=author');
    this.meta.removeTag('name=keywords');
    this.meta.removeTag('name=abstract');
    // Pro Google Scholar
    this.meta.removeTag('name=citation_title');
    this.meta.removeTag('name=citation_author');
    this.meta.removeTag('name=citation_pdf_url');
    this.meta.removeTag('name=citation_publication_date');
    this.meta.removeTag('name=citation_journal_title');
    this.meta.removeTag('name=citation_issn');
    this.meta.removeTag('name=citation_volume');
    this.meta.removeTag('name=citation_issue');
    this.meta.removeTag('name=citation_firstpage');
    this.meta.removeTag('name=citation_lastpage');

    this.addMetaTags();
  }

  processUrl() {
    // this.setMainClass(this.router.url);
    this.pathObserver = this.router.events.subscribe(val => {
      //console.log('pathObserver', val);
      if (val instanceof NavigationEnd) {
        this.state.paramsChanged();
        // this.setMainClass(val.url);
        this.updateMetaTags();
      } else if (val instanceof NavigationStart) {
        this.state.clear();
      }
    });

    this.state.paramsChanged();
  }

}
