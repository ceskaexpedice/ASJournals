
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { SafeHtmlPipe } from 'src/app/services/safe-html.pipe';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SafeHtmlPipe, MatIconModule, MatButtonModule ],
  selector: 'app-free-page',
  templateUrl: './free-page.component.html',
  styleUrls: ['./free-page.component.scss']
})
export class FreePageComponent implements OnInit {

  langObserver: Subscription = new Subscription;
  stateObserver: Subscription = new Subscription;
  routeObserver: Subscription = new Subscription;

  text: string = '';
  page: string | null = null;
  img: string | null = null;

  constructor(
    private config: Configuration,
    public state: AppState,
    private appService: AppService,
    private router: Router) { }

  ngOnInit() {
    this.setImg();
    const url = this.router.url.substring(1);
    let route = url.substring(url.indexOf(this.state.currentMagazine?.ctx!) + this.state.currentMagazine?.ctx?.length!);
    route = route.split('?')[0]; // remove lang param
    
    this.setPage(route);
    // this.langObserver = this.appService.langSubject.subscribe(
    //   () => {
    //     this.appService.getText(this.id).subscribe(t => this.text = t);
    //   }
    // );

    this.stateObserver = this.state.stateChangedSubject.subscribe(
      () => {
        this.setImg();
      }
    );

    this.routeObserver = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = this.router.url.substring(1);
        let route = url.substring(url.indexOf(this.state.currentMagazine?.ctx!) + this.state.currentMagazine?.ctx?.length!);
        route = route.split('?')[0]; // remove lang param
        if (this.state.currentLang) {
          this.setPage(route);
        }
      }
    });

  }

  setPage(route: string) {


    if (!route.startsWith('/')) {
      route = '/' + route;
    }
    this.page = route;


    
    // find page by menu config
    this.config.layout.menu.forEach((m: any) => {
      if (route === ('/'+m.route)) {
        this.page = m.id;
        return;
      } else if (m.children.length > 0) {
        m.children.forEach((m2: any) => {
          if (('/'+m.route + '/' + m2.route) === route) {
            this.page = m.id + '/' + m2.id;
            return;
          }
        });
      }
    });
    if (!this.page) {
      this.page = 'home';
    }
    this.appService.getText(this.page).subscribe(t => this.text = t);
  }

  ngOnDestroy() {
    //this.langObserver.unsubscribe();
    this.stateObserver.unsubscribe();
    this.routeObserver.unsubscribe();
  }

  setImg() {
    console.log(this.state.imgSrc)
    if (this.state.actualNumber) {
      this.img = this.state.imgSrc;
    }
  }



  print() {
   const mywindow: any = window.open('', '_blank', 'top=0,left=0,height=800px,width=auto');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + this.state.actualNumber!['root_title']  + '</h1>');

    const t = this.text.replace(/src="([^(http|https)])/gi, 'src="' + window.location.protocol + '//' + window.location.host + '/$1');
    
    mywindow.document.write(t);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10

    mywindow.onload=function(){ // necessary if the div contain images

      mywindow.focus(); // necessary for IE >= 10
      mywindow.print();
      mywindow.close();
  };

  // mywindow.focus(); // necessary for IE >= 10*/
  //   setTimeout(() => {
  //     mywindow.print();
  //     mywindow.close();
  // }, 2000);

    return true;
}

}
