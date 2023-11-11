import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { TranslateModule, TranslateService} from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  // sidenav
  @Output() public sidenavToggle = new EventEmitter();

  subscriptions: Subscription[] = [];

  currentLang: string = 'cs';
  menu: any[] = [];

  public isCollapsed: boolean = false;

  constructor(
    private titleService: Title,
    private meta: Meta,
    public config: Configuration,
    public state: AppState,
    public appservice: AppService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,) { }

  ngOnInit() {
    this.subscriptions.push(this.appservice.langSubject.subscribe(val => {
      this.currentLang = val;
    }));

    // this.subscriptions.push(this.state.titleChangedSubject.subscribe(val => {
    //   if (this.state.actualNumber) {
    //     this.titleService.setTitle( this.state.actualNumber['root_title']!);
    //     this.meta.removeTag('name=description');
    //     this.meta.removeTag('name=author');
    //     this.meta.removeTag('name=keywords');
        
    //     this.meta.addTags( [
    //       { name: 'description', content: this.state.currentMagazine.desc! },
    //       { name: 'author', content: this.state.currentMagazine.vydavatel! },
    //       { name: 'keywords', content: this.state.currentMagazine.keywords.join(',') }
    //     ]);
    //   }
    // }));

      this.menu = this.config.layout.menu;

    //    this.state.fullScreenSubject.subscribe(val=> {
    //      if(!val){
    //        setTimeout(()=>{
    //          this.menu = this.config['menu'];
    //        }, 100);
    //        
    //      } else {
    //        this.menu = {};
    //      }
    //    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  // isVisible(h: string, sub: string) {
  //   if (this.menu.hasOwnProperty(h)) {
  //     return this.menu[h][sub];
  //   } else {
  //     return false;
  //   }
  // }

  changeLang(lang: string) {
    this.appservice.changeLang(lang);

    let p: any = {};
    p['lang'] = lang;
    this.router.navigate([], { relativeTo: this.route, queryParams: p, queryParamsHandling: "merge" });
  }

  logActual() {
    console.log(this.state.actualNumber);
  }

  // sidenav fuction
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
