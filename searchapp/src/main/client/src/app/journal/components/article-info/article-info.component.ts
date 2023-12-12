import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';

import {Router, RouterModule} from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Criterium } from 'src/app/models/criterium';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { CommonModule } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { TranslateModule } from '@ngx-translate/core';
import { JournalDetailsComponent } from '../journal-details/journal-details.component';


@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, JournalDetailsComponent],
    selector: 'app-article-info',
    templateUrl: './article-info.component.html',
    styleUrls: ['./article-info.component.scss']
})
export class ArticleInfoComponent implements OnInit {
    @Input('article') article: any;
    @Input('journal') journal: any;
    @Input('active') active: boolean = false;
    langObserver: Subscription = new Subscription;

    rozsah: string | null = null;
    authors: string[] = [];
    authors_full: {name: string, role: string}[] = [];

    titleInfo: any;
    title: string | null = null;
    subTitle: string | null = null;
    nonSort: string | null = null;

    keywords: string[] = [];

    viewed: number = 0;

    lang: string = 'cs';

    langsMap: any = {
        'cs': 'cze',
        'en': 'eng'
    };

    doi: string | null = null;
    isPeerReviewed: boolean = false;

    licence: string | null | undefined;

    constructor(
        private config: Configuration,
        private router: Router,
        private elementRef: ElementRef,
        private service: AppService,
        public state: AppState) {}

    ngOnInit() {
        this.lang = this.state.currentLang;
        this.langObserver = this.service.langSubject.subscribe(
            (lang) => {
                this.lang = lang;
                this.setData();

            }
        );
        this.setData();
    }

    ngOnChanges() {
        this.setData();
    }

    setData() {
        if (!this.article) {
            return;
        }

        this.authors = [];
        this.authors_full = [];
        this.rozsah = "";


        this.title = "";
        this.subTitle = "";
        this.nonSort = "";

        this.keywords = [];

        this.viewed = 0;
        this.doi = "";
        this.isPeerReviewed = false;

        let mods = this.article['mods'];
        
        this.rozsah = Utils.getRozsah(mods);

        this.titleInfo = mods["mods:titleInfo"];
        this.setTitleInfo();
        // this.setNames(mods);
        this.authors = this.article['autor'];
        if (this.article['autor_full']) {
            this.authors_full = this.article['autor_full'];
        }
        

        if (mods.hasOwnProperty("mods:identifier")) {
            let ids = mods["mods:identifier"];
            if (ids.hasOwnProperty('length')) {
                for (let i in ids) {
                    if (ids[i]["type"] === 'doi') {
                        this.doi = ids[i]['content'];
                    }
                }
            } else {
                if (ids["type"] === 'doi') {
                    this.doi = ids['content'];
                }
            }
        }

        this.isPeerReviewed = this.article['genre'].indexOf('peer-reviewed') > -1;

        this.licence = this.state.currentMagazine?.licence;
        

        if (this.state.currentMagazine?.licences) {
            const licences = JSON.parse(this.state.currentMagazine.licences);
            const paths: string[] = this.article.pid_paths;
            let hasLic = false;
            paths.forEach(p => {
                const pids = p.split('/').reverse();
                pids.forEach(pid => {
                    if (licences[pid]) {
                        this.licence = licences[pid];
                        hasLic = true;
                        return;
                    }
                    
                });
                if (hasLic) {
                    return;
                }
            });
        }

    }


    setTitleInfo() {

        let modsLang = this.langsMap[this.lang];
        
        if (this.titleInfo.hasOwnProperty('length')) {
            this.title = this.titleInfo[0]["mods:title"];
            for (let i in this.titleInfo) {
                if (this.titleInfo[i]["lang"] === modsLang) {
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

    setNames(mods: any) {
        //name/type="personal"	namepart/type="family"
        //name/type="personal"	namePart/type"given"
        if (mods.hasOwnProperty("mods:name")) {
            let name = mods["mods:name"];
            if (name.hasOwnProperty('length')) {
                for (let i in name) {
                    let namePart = name[i]["mods:namePart"];
                    let role = name[i]["mods:role"];
                    if (name[i]["type"] === 'personal' && namePart) {
                        //Chceme nejdriv prijmeni a potom jmeno
                        if (namePart[0]['type'] === 'family') {
                            this.authors.push(namePart[0]['content'] + ' ' + namePart[1]['content']);
                        } else {
                            this.authors.push(namePart[1]['content'] + ' ' + namePart[0]['content']);
                        }
                    }
                }
            } else {
                if (name["type"] === 'personal' && name.hasOwnProperty("mods:namePart")) {
                    let namePart = name["mods:namePart"];
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
            }

        }
    }

    setKeywords() {
        this.keywords = [];
    }

    ngOnDestroy() {
        this.langObserver.unsubscribe();
    }

    onAuthorClicked(s: string) {
        let c = new Criterium();
        c.field = 'autor';
        c.value = '"' + s + '"';
        this.router.navigate(['/hledat/cokoliv', {criteria: JSON.stringify([c]), start: 0}], {queryParamsHandling: "preserve"});
    }

}
