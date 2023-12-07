import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { map } from 'rxjs/operators';
import { AppConfiguration } from 'src/app/app-configuration';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppWindowRef } from 'src/app/app.window-ref';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidenavListComponent } from '../../components/sidenav-list/sidenav-list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { Configuration } from 'src/app/models/configuration';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent, SidenavListComponent, FooterComponent, MatSidenavModule, MatListModule],
  selector: 'magazines-root',
  templateUrl: './magazines.component.html',
  styleUrls: ['./magazines.component.scss']
})
export class MagazinesComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private document: Document,
    public materialCssVarsService: MaterialCssVarsService,
    private windowRef: AppWindowRef,
    public config: Configuration,
    public state: MagazineState,
    private service: MagazinesService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router) {

  }

  // setStyles() {
  //   var links = this.document.getElementsByTagName('link');
  //   for (var i = 0; i < links.length; i++) {
  //     var link = links[i];
  //     if (link.rel.indexOf('stylesheet') != -1 && link.title) {
  //       link.disabled = true;
  //     } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('magazines') != -1) {
  //       link.disabled = false;
  //     } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('styles') != -1) {
  //       link.disabled = true;
  //     }
  //   }
  // }

  ngOnInit() {
    // this.getConfig().subscribe(
    //   (cfg: any) => {
      
      this.state.setConfig(this.config);
      // this.state.ctxs
      var userLang = 'cs';
      if (isPlatformBrowser(this.platformId)) {
        userLang = this.windowRef.nativeWindow.navigator.language.split('-')[0]; // use navigator lang if available
      }
      userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
      userLang = this.config.defaultLang;
      this.service.changeLang(userLang);

        this.state.stateChangedSubject.subscribe(route => {
          this.stateChanged(route);
        });

        this.processUrl();
        if (isPlatformBrowser(this.platformId)) {
          this.materialCssVarsService.setPrimaryColor(this.config.color);
        }
        

        // this.setStyles();
      // }
    // );
  }


  getConfig() {
    return this.http.get("assets/config.json").pipe(
      map((res: any) => {
        let cfg = res;

        this.state.setConfig(cfg);
        var userLang = navigator.language.split('-')[0]; // use navigator lang if available
        userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
        if (cfg.hasOwnProperty('defaultLang')) {
          userLang = cfg['defaultLang'];
        }
        this.service.changeLang(userLang);
        return this.config;
      })
    )
  }

  processUrl() {
    this.router.events.subscribe(val => {
      //console.log('pathObserver', val);
      if (val instanceof NavigationEnd) {
        this.state.paramsChanged();
      } else if (val instanceof NavigationStart) {
        this.state.clear();
      }
    });

    //    this.route..subscribe(data => {
    //      console.log(this.route.outlet);
    //    });

    this.state.paramsChanged();
  }


  //Called when changing state
  stateChanged(route: string) {

  }
}
