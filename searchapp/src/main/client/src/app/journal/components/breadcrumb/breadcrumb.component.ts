import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

  subscriptions: Subscription[] = [];

  page: string = 'home';
  params: string = '';

  crumbs: any = [];

  constructor(private state: AppState,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    this.subscriptions.push(this.state.stateChangedSubject.subscribe(
      () => {
        let url = this.router.url.substring(1);
        this.setPage(url);
        this.setCrumbs();
      }
    ));

    this.subscriptions.push(this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        let url = val.urlAfterRedirects.substring(1);
        this.setPage(url);
        this.setCrumbs();
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  setPage(url: string) {
    this.page = url.split(";")[0];
    //page is /k5journals/journal/dalsi/veci
    this.page = this.page.split("/").slice(1).join("/");
    if (url.split(";").length > 1) {
      this.params = url.split(";")[1];
    } else {
      this.params = '';
    }
  }

  setCrumbs() {
    this.crumbs = [];
    this.crumbs.push({ link: 'home', label: this.appService.translateKey('menu.home_') });

    if (this.page === '') {

    } else if (this.page === 'home') {

    } else if (this.page.indexOf('article') === 0) {

    } else if (this.page !== 'search') {
      let parts = this.page.split('?')[0].split('/');
      for (let s = 0; s < parts.length; s++) {
        let link = parts.slice(0, s + 1);
        let label = '';
        let mi = this.appService.findMenuItem('/' + link.join('/'));
        if (mi === null) {
          label = this.appService.translateKey('menu.' + link.join('.') + '_');
        } else {
          label = mi[this.state.currentLang]
        }
        this.crumbs.push({ link: link.join('/'), label });
      }
    }
  }

}
