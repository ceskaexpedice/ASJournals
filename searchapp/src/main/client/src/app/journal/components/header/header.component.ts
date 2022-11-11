import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  currentLang: string = 'cs';
  menu: any = null;

  public isCollapsed: boolean = false;

  constructor(
    private titleService: Title,
    private meta: Meta,
    public state: AppState,
    public appservice: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.state.config) {
      this.menu = this.state.config['menu'];
    }
    this.subscriptions.push(this.appservice.langSubject.subscribe(val => {
      this.currentLang = val;
    }));

    this.subscriptions.push(this.state.titleChangedSubject.subscribe(val => {
      if (this.state.actualNumber) {
        this.titleService.setTitle( this.state.actualNumber['root_title']!);
        this.meta.addTags( [
          { name: 'description', content: this.state.ctx!.desc! },
          { name: 'author', content: this.state.ctx!.vydavatel! },
          { name: 'keywords', content: this.state.ctx!.keywords.join(',') }
        ]);
      }
    }));

    this.subscriptions.push(this.state.stateChangedSubject.subscribe(val => {
      this.menu = this.state.config['menu'];
      console.log(this.menu)
      
    }));

    //    this.state.fullScreenSubject.subscribe(val=> {
    //      if(!val){
    //        setTimeout(()=>{
    //          this.menu = this.state.config['menu'];
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

  isVisible(h: string, sub: string) {
    if (this.menu.hasOwnProperty(h)) {
      return this.menu[h][sub];
    } else {
      return false;
    }
  }

  changeLang(lang: string) {
    this.appservice.changeLang(lang);

    let p: any = {};
    p['lang'] = lang;
    this.router.navigate([], { relativeTo: this.route, queryParams: p, queryParamsHandling: "merge" });
  }

  logActual() {
    console.log(this.state.actualNumber);
  }
}
