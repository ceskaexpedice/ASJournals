
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AppState } from '../../app.state';

import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-free-page',
  templateUrl: './free-page.component.html',
  styleUrls: ['./free-page.component.scss']
})
export class FreePageComponent implements OnInit {

  langObserver: Subscription;
  stateObserver: Subscription;
  routeObserver: Subscription;

  text: string;
  id: string;
  img = '';

  constructor(public state: AppState,
    private appService: AppService,
    private router: Router) { }

  ngOnInit() {
    this.setImg();
    const url = this.router.url.substring(1);
    this.id = url.substring(url.indexOf(this.state.ctx.ctx) + this.state.ctx.ctx.length);
    this.id = this.id.split('?')[0]; // remove lang param
    

    this.appService.getText(this.id).subscribe(t => this.text = t);
    this.langObserver = this.appService.langSubject.subscribe(
      () => {
        //this.appService.getText(this.id).subscribe(t => this.text = t);
      }
    );

    this.stateObserver = this.state.stateChangedSubject.subscribe(
      () => {
        this.setImg();
      }
    );

    this.routeObserver = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = this.router.url.substring(1);
        this.id = url.substring(url.indexOf(this.state.ctx.ctx) + this.state.ctx.ctx.length);
        this.id = this.id.split('?')[0]; // remove lang param
        if (this.state.currentLang) {
          this.appService.getText(this.id).subscribe(t => this.text = t);
        }
      }
    });

  }

  ngOnDestroy() {
    this.langObserver.unsubscribe();
    this.stateObserver.unsubscribe();
    this.routeObserver.unsubscribe();
  }

  setImg() {
    if (this.state.actualNumber) {
      this.img = this.state.imgSrc;
      // this.img = 'img/item/' + this.state.actualNumber.pid + '/thumb';
    }
  }



  print() {
   const mywindow = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + this.state.actualNumber['root_title']  + '</h1>');

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
