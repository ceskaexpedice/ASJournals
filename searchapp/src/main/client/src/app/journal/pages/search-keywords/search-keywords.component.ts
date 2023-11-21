import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Criterium } from 'src/app/models/criterium';
import { AppService } from 'src/app/services/app.service';
import { SearchService } from 'src/app/services/search.service';
import Utils from 'src/app/services/utils';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatPaginatorModule, TranslateModule],
  selector: 'app-search-keywords',
  templateUrl: './search-keywords.component.html',
  styleUrls: ['./search-keywords.component.scss']
})
export class SearchKeywordsComponent implements OnInit, OnDestroy {


  subscriptions: Subscription[] = [];

  public keywordsFiltered: any[] = [];
  public keywords1: any[] = [];
  public keywords2: any[] = [];

  public qkeyword: string | null = null;

  rowsPerCol: number = 10;
  letter: string | null = null;
  page: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private service: AppService,
    public state: AppState) { }

  ngOnInit() {
    this.getKeywords();
    this.subscriptions.push(this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        if (this.route.snapshot.params.hasOwnProperty('letter')) {
          this.setLetter(this.route.snapshot.params['letter']);
        } else {
          this.setLetter(null);
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }


  getKeywords() {

      this.subscriptions.push(this.state.stateChangedSubject.subscribe(
        () => {
          this.filter();
        }
      ));
    
  }

  setLetter(l: string | null) {
    this.page = 0;
    this.letter = l;
    this.filter();
    if (l !== null) {
      this.router.navigate([{ letter: l }], { relativeTo: this.route, queryParamsHandling: "preserve" });
    }
  }

  pageChanged(e: any) {
    this.setPage(e.pageIndex);
  }

  setPage(p: number) {
    this.page = p;
    this.setCols();
  }

  isEmpty(l: string) {
    if (this.state.keywords.length === 0) {
      return true;
    }
    let has = false;
    this.state.keywords.forEach((el) => {
      let k: string = el.val[0];
      if (k.toLocaleLowerCase().charAt(0) === l.toLocaleLowerCase()) {
        has = true;
        return;
      }
    });
    return !has;
  }

  isEmptyNumbers() {
    if (this.state.keywords.length === 0) {
      return true;
    }
    let has = false;
    this.state.keywords.forEach((el) => {
      let k: string = el.val[0];
      if (Number.isInteger(parseInt(k.toLocaleLowerCase().charAt(0)))) {
        has = true;
        return;
      }
    });
    return !has;
  }

  filter() {
    this.keywordsFiltered = [];
    if (this.letter !== null) {

      this.state.keywords.forEach((el) => {
        let k: string = el.val;
        let first: string = k.toLocaleLowerCase().charAt(0);
        if (this.letter === '0-9') {
          if (Number.isInteger(parseInt(first))) {
            this.keywordsFiltered.push(el);
          }
        } else {
          if (Utils.removeDiacritics(first) === this.letter?.toLocaleLowerCase()) {
            this.keywordsFiltered.push(el);
          }
        }
      });
    } else {
      this.keywordsFiltered = this.state.keywords;
    }
    this.totalPages = Math.ceil(this.keywordsFiltered.length / (this.rowsPerCol * 2));
    this.setCols();
  }

  setCols() {
    this.keywords1 = [];
    this.keywords2 = [];
    let min: number = this.page * this.rowsPerCol * 2;
    let max: number = Math.min(min + this.rowsPerCol, this.keywordsFiltered.length);
    for (let i = min; i < max; i++) {
      this.keywords1.push(this.keywordsFiltered[i]);
    }
    //min = (this.page + 1) * this.rowsPerCol * 2;
    min = max;
    max = Math.min(min + this.rowsPerCol, this.keywordsFiltered.length);
    for (let i = min; i < max; i++) {
      this.keywords2.push(this.keywordsFiltered[i]);
    }
  }

  search(s: string | null) {
    this.state.resetDates();
    let c = new Criterium();
    c.field = 'keywords';
    c.value = '"' + s + '"';
    this.router.navigate(['../cokoliv', { criteria: JSON.stringify([c]), start: 0 }], { relativeTo: this.route, queryParamsHandling: "preserve" });
  }

  searchInput() {
    this.search(this.qkeyword);
  }

}
