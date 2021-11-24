import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'magazines-root',
  templateUrl: './magazines.component.html',
  styleUrls: ['./magazines.component.scss']
})
export class MagazinesComponent implements OnInit {

  constructor(
    public state: MagazineState,
    private service: MagazinesService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router) {

  }
  setStyles() {
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.rel.indexOf('stylesheet') != -1 && link.title) {
        link.disabled = true;
      } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('magazines') != -1) {
        link.disabled = false;
      } else if (link.rel.indexOf('stylesheet') != -1 && link.href.indexOf('styles') != -1) {
        link.disabled = true;
      }
    }
  }

  ngOnInit() {
    console.log('kk')
    this.getConfig().subscribe(
      (cfg: any) => {

        this.state.stateChangedSubject.subscribe(route => {
          this.stateChanged(route);
        });

        this.processUrl();
        this.setStyles();
      }
    );
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
        return this.state.config;
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
