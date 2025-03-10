import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';

import {Router, RouterModule} from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Criterium } from 'src/app/models/criterium';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { JournalDetailsComponent } from '../journal-details/journal-details.component';


@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, JournalDetailsComponent],
    selector: 'app-article-result',
    templateUrl: './article-result.component.html',
    styleUrls: ['./article-result.component.scss']
})
export class ArticleResultComponent implements OnInit {
    @Input('article') article: any | null = null;
    @Input('active') active: boolean = false;
    @Input('parentJournal') parentJournal: Journal | null = null;
    langObserver: Subscription= new Subscription();
    rozsah: string | null = null;
    authors: string[] = [];
    authors_full: {name: string, role: string}[] = [];
    titleInfo: any;
    title: string | null = null;
    subTitle: string | null = null;
    nonSort: string | null = null;
    viewed: number = 0;
    isPeerReviewed: boolean = false;
    lang: string = 'cs';

    langsMap: any = {
        'cs': 'cze',
        'en': 'eng'
    };

    constructor(
        private router: Router,
        private elementRef: ElementRef,
        private service: AppService,
        public state: AppState) {}

    ngOnInit() {
        this.lang = this.state.currentLang;
        this.langObserver = this.service.langSubject.subscribe(
            (lang) => {
                this.lang = lang;
                this.setTitleInfo();

            }
        );

        //let mods = this.article['mods']["mods:modsCollection"]["mods:mods"];

        let mods = JSON.parse(this.article['mods']);
        this.rozsah = Utils.getRozsah(mods);


        this.service.getViewed(this.article['pid']).subscribe(res => {
            this.viewed = res;
        });

        this.titleInfo = mods["mods:titleInfo"];

        this.setTitleInfo();
        this.setDetails();
        //this.setNames(mods);
        //this.authors = Utils.getAutors(mods);
        this.isPeerReviewed = this.article['genre'].indexOf('peer-reviewed') > -1;
        this.authors = this.article['autor'];
        if (this.article['autor_full']) {
            this.authors_full = this.article['autor_full'];
            this.authors = this.authors_full.filter(a => a.role !== 'trl').map(a => a.name);
        }
        if (this.active) {
            setTimeout(() => {
                this.elementRef.nativeElement.scrollIntoView();
            }, 100);

        }
    }

    setDetails() {
      if(!this.parentJournal){
        this.service.getJournal(this.article['parents'][0]).subscribe(res => {
            this.parentJournal = res;
        });
      }
    }


    setTitleInfo() {

        let modsLang = this.langsMap[this.lang];

        if (this.titleInfo?.hasOwnProperty('length')) {
            this.title = this.titleInfo[0]["mods:title"];
            for (let i in this.titleInfo) {
                if (this.titleInfo[i]["lang"] === modsLang && !this.state.currentMagazine?.keepLang) {
                    this.title = this.titleInfo[i]["mods:title"];
                    this.subTitle = this.titleInfo[i]["mods:subTitle"];
                    this.nonSort = this.titleInfo[i]["mods:nonSort"];
                }
            }
        } else {
            this.title = this.titleInfo["mods:title"];
            this.subTitle = this.titleInfo["mods:subTitle"];
            this.nonSort = this.titleInfo["mods:nonSort"];
        }
    }
    
    namePart(namePart: any){
      if (typeof namePart === 'string') {
          this.authors.push(namePart);
      } else {
          if (typeof namePart[0] === 'string') {
              this.authors.push(namePart[0]);
          } else {
              //Chceme nejdriv prijmeni a potom jmeno
              if (namePart[0]['type'] === 'family') {
                  this.authors.push(namePart[0]['content'] + ' ' + namePart[1]['content']);
              } else {
                  this.authors.push(namePart[1]['content'] + ' ' + namePart[0]['content']);
              }
          }
      }
    }

    setNames(mods: any) {
        //name/type="personal"	namepart/type="family"
        //name/type="personal"	namePart/type"given"
      
      //https://journals.lib.cas.cz/k5journals/article/uuid%3A2aabc1e5-c217-4a71-846f-95bf0ba9d94b
      
      //http://localhost:4200/article/uuid%3A2aabc1e5-c217-4a71-846f-95bf0ba9d94b
      if (this.article.pid === 'uuid:2aabc1e5-c217-4a71-846f-95bf0ba9d94b'){
        console.log(mods["mods:name"]);
      }
        if (mods.hasOwnProperty("mods:name")) {
            let name = mods["mods:name"];
            if (name.hasOwnProperty('length')) {
                for (let i in name) {
                    let namePart = name[i]["mods:namePart"];
                    this.namePart(namePart);
                }
            } else {
                if (name["type"] === 'personal' && name.hasOwnProperty("mods:namePart")) {
                    let namePart = name["mods:namePart"];
                    this.namePart(namePart);
                }
            }

        }
    }

    ngOnDestroy() {
        this.langObserver.unsubscribe();
    }

    onAuthorClicked(s: string) {
        //    this.onSearchAuthor.emit(s);
        let c = new Criterium();
        c.field = 'autor';
        c.value = s;
        //this.router.navigate(['/hledat/cokoliv', {criteria: JSON.stringify([c]), start: 0}])
        this.router.navigate(['/'+this.state.currentMagazine?.ctx+'/hledat/cokoliv', {criteria: JSON.stringify([c]), start: 0}],
        {queryParamsHandling: "preserve"})
    }

}
