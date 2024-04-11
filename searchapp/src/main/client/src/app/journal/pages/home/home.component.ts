import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import { FreeTextComponent } from '../../components/free-text/free-text.component';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatDividerModule, MatIconModule, TranslateModule,
  FreeTextComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  img: string | null = null;
  actual: Journal | null = null;
  actualInfo: string | null = null;
  year: string | null = null;
  volumeNumber: string | null = null;
  issueNumber: string | null = null;
  partName: string | null = null;
  supplement: string | null = null;
  home_text: string = '';

  routeObserver: Subscription = new Subscription;

  constructor(
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private router: Router
  ) {}

  ngOnDestroy() {
    //this.langObserver.unsubscribe();
    this.routeObserver.unsubscribe();
  }
  

  ngOnInit() {
    if (this.state.currentLang === 'en') {
      this.home_text = this.config.home_en; 
    } else {
      this.home_text = this.config.home_cs; 
    }
    
    this.setData();
    this.state.stateChangedSubject.subscribe(
      () => {
        this.setData();
      }
    );

    this.routeObserver = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        if (this.state.currentLang) {
          this.service.getText('home').subscribe(t => this.home_text = t);
        }
      }
    });

  }

  showDb() {
    const db =  this.config.layout.pages.find((m:any) => m.route === 'db');
    console.log(db)
    return db && db.visible
  }

  showNews() {
    const db =  this.config.layout.pages.find((m:any) => m.route === 'news');
    return db && db.visible
  }

  setData() {
    if (this.state.actualNumber) {
      this.actual = this.state.actualNumber;
      this.img = this.state.imgSrc;
      // this.setActualInfo();
      this.actualButton();
      //this.img = 'img/item/' + this.state.actualNumber.pid + '/thumb';
    }
  }

  actualButton() {
    
    if (this.actual?.mods) {
      let mods = this.actual.mods;
      if (this.actual.model === 'periodicalvolume') {

        if (mods['mods:originInfo']) {
          this.year = mods['mods:originInfo']['mods:dateIssued'];
          if (mods['mods:titleInfo']) {
            this.volumeNumber = mods['mods:titleInfo']['mods:partNumber'];
          }
        } else {
          //podpora pro starsi mods. ne podle zadani
          if (mods['part'] && mods['part']['date']) {
            this.year = mods['part']['date'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
            this.year = mods['mods:part']['mods:date'];
          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }
        }
      } else if (this.actual.model === 'periodicalitem') {
        this.service.getMods(this.actual?.parent!).subscribe(parentMods => {
          if (parentMods['mods:originInfo']) {
            this.year = parentMods['mods:originInfo']['mods:dateIssued'];
            if (parentMods['mods:titleInfo']) {
              this.volumeNumber = parentMods['mods:titleInfo']['mods:partNumber'];
            }
          }
        });
        if (mods['mods:originInfo']) {
          if (mods['mods:titleInfo']) {
            this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            this.partName = mods['mods:titleInfo']['mods:partName'];
          }
        } else if  (mods['mods:titleInfo']) {
            this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
            this.partName = mods['mods:titleInfo']['mods:partName'];
        
        } else {
          //podpora pro starsi mods. ne podle zadani
          if (mods['part'] && mods['part']['date']) {
            this.year = mods['part']['date'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
            this.year = mods['mods:part']['mods:date'];
          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.issueNumber = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
          }
        }

      } else if (this.actual.model === 'supplement') {
        if (mods['mods:titleInfo']) {
          if (mods['mods:titleInfo'].hasOwnProperty('length')) {
            this.supplement = mods['mods:titleInfo'][0]['mods:partName'];
          } else {
            this.supplement = mods['mods:titleInfo']['mods:partNumber'];
          }
        }
      }
    } else if (this.actual?.pid) {
      // this.appService.getMods(this.actual?.pid!).subscribe(mods => {
      //   if (this.actual) {
      //     this.actual.mods = mods;
      //     this.details();
      //   }
      // });
    }
    //     Úroveň: Ročník
    //§  Rok: originInfo/dateIssued
    //§  Číslo ročníku: titleInfo/partNumber
    //o   Úroveň: Číslo
    //§  Číslo čísla: titleInfo/partNumber
    //Speciální název čísla: titleInfo/partName


  }
  
  setActualInfo(){
    
    if (this.actual?.mods) {
      let mods = this.actual.mods;
      
      if (this.actual.model === 'periodicalvolume') {
        
        if(mods['mods:originInfo']){
          if (mods['mods:originInfo']['mods:dateIssued']['content']) {
            this.actualInfo = mods['mods:originInfo']['mods:dateIssued']['content'];
          } else {
            this.actualInfo = mods['mods:originInfo']['mods:dateIssued'];
          }
          
          if (mods['mods:titleInfo']) {
            this.actualInfo = mods['mods:titleInfo']['mods:partNumber'] + '/' + this.actualInfo;
          }
        } else {
        //podpora pro starsi mods. ne podle zadani
        //
          //console.log(mods);
          if(mods['part'] && mods['part']['date']){
            this.actualInfo  = mods['part']['date']; 
          } else if(mods['mods:part'] && mods['mods:part']['mods:date']){
            this.actualInfo = mods['mods:part']['mods:date']; 
          }
          
          if(mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']){
            this.actualInfo = mods['part']['detail']['number'] + '/' + this.actualInfo;
          } else if(mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']){
            this.actualInfo = mods['mods:part']['mods:detail']['mods:number'] + '/' + this.actualInfo;
          }
        }
      } else if (this.actual.model === 'periodicalitem') {
        
      
        if (mods['mods:originInfo']) {
          if (mods['mods:originInfo']['mods:dateIssued']['content']) {
            this.actualInfo = mods['mods:originInfo']['mods:dateIssued']['content'];
          } else {
            this.actualInfo = mods['mods:originInfo']['mods:dateIssued'];
          }
          if (mods['mods:titleInfo']['mods:partNumber']) {
            this.actualInfo += ' ' + mods['mods:titleInfo']['mods:partNumber'] ;
          }
          if (mods['mods:titleInfo']['mods:partName']) {
            this.actualInfo +=  ' ' + mods['mods:titleInfo']['mods:partName'];
          }
        } else {
        
          //podpora pro starsi mods. ne podle zadani
          //
          //console.log(mods);
          if (mods['part'] && mods['part']['date']) {
            this.actualInfo = mods['part']['date'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
            this.actualInfo = mods['mods:part']['mods:date'];
          }

          if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
            this.actualInfo = mods['part']['detail']['number'];
          } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
            this.actualInfo = mods['mods:part']['mods:detail']['mods:number'];
          }
        }
          
      }
    } else {
//      this.appService.getMods(this.actual['pid']).subscribe(mods => {
//        this.actual.mods = mods;
//        this.details();
//      });
    }
    //     Úroveň: Ročník
    //§  Rok: originInfo/dateIssued
    //§  Číslo ročníku: titleInfo/partNumber
    //o   Úroveň: Číslo
    //§  Číslo čísla: titleInfo/partNumber
    //Speciální název čísla: titleInfo/partName


  }
  
  gotoArchiv(pid: string){
    this.router.navigate(['archiv/', pid], {queryParamsHandling: "preserve"})
  }
  

}
