import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  foot: SafeHtml | null = null;
  routeObserver: Subscription = new Subscription;

  constructor(
    public state: AppState,
    private service: AppService,
    private sanitizer: DomSanitizer,
    private router: Router) { }

    ngOnDestroy() {
      //this.langObserver.unsubscribe();
      this.routeObserver.unsubscribe();
    }

  ngOnInit() {
    if (this.state.ctx){
      this.setText();
    }

    this.routeObserver = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = this.router.url.substring(1);
        let route = url.substring(url.indexOf(this.state.ctx?.ctx!) + this.state.ctx?.ctx?.length!);
        route = route.split('?')[0]; // remove lang param
        if (this.state.currentLang) {
          this.setText();
        }
      }
    });
  }

  setText() {
    this.service.getText('footer').subscribe((t: string) => {
        // this.foot = t;
        let s = t.replace('{{licence}}', this.state.ctx?.licence!);
        this.foot = this.sanitizer.bypassSecurityTrustHtml(s);
      }); 
  }

}
