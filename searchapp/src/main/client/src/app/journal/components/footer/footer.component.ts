import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public currentYear = new Date().getFullYear();
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
    if (this.state.currentMagazine){
      this.setText();
    }

    this.routeObserver = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = this.router.url.substring(1);
        let route = url.substring(url.indexOf(this.state.currentMagazine?.ctx!) + this.state.currentMagazine.ctx?.length!);
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
        let s = t.replace('{{licence}}', this.state.currentMagazine?.licence!);
        this.foot = this.sanitizer.bypassSecurityTrustHtml(s);
      }); 
  }

}
