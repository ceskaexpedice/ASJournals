import {Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute, Params, RouterModule} from '@angular/router';
import {Observable, Subscription} from 'rxjs';

import {TranslateModule, TranslateService} from '@ngx-translate/core';
// import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import { AppState } from 'src/app/app.state';
import { Criterium } from 'src/app/models/criterium';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatMenuModule, 
            TranslateModule, MatCardModule, MatCheckboxModule, MatPaginatorModule, MatTooltipModule
  ],
  selector: 'app-search-criteria',
  templateUrl: './search-criteria.component.html',
  styleUrls: ['./search-criteria.component.scss']
})
export class SearchCriteriaComponent implements OnInit, OnDestroy {

  @ViewChild('lupa') lupa: ElementRef | null = null;
  @Output() onSearch: EventEmitter<Criterium[]> = new EventEmitter<Criterium[]>();
  subscriptions: Subscription[] = [];

  criteria: Criterium[] = [];
  fields = [
    {field: '_text_', label: 'kdekoliv'},
    {field: 'title', label: 'název'},
    {field: 'autor', label: 'autor'},
    {field: 'keywords', label: 'klíčová slova'},
    {field: 'genre', label: 'rubrika'},
    {field: 'ocr', label: 'plný text dokumentu'}
  ]

  operators = [
    {val: 'AND', label: 'a zároveň'},
    {val: 'OR', label: 'nebo'}
  ]

  genres: {val: string, tr: string}[] = [];
  genretr: string = '';
  genre: string | null = null;

  isSiteCountActive: any = [];

  constructor(
    public state: AppState,
    private service: AppService,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isSiteCountActive[10] = true;
    this.criteria.push(new Criterium());
    this.route.params
      .subscribe((params: Params) => {
        if (params['criteria']) {
          this.criteria = [];
          let j = JSON.parse(params['criteria']);
          for (let i in j) {
            let c: Criterium = new Criterium();

            Object.assign(c, j[i]);

            this.criteria.push(c);
            if (c.field === 'genre'){
              this.genre = c.value;
              this.genretr = this.translate.instant('genre.'+this.genre);
            }
          }
          this.service.searchFired(this.criteria);
          
        }
      });

    this.subscriptions.push(this.service.langSubject.subscribe(val => {
      this.setGenres();
    }));
    this.setGenres();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  setField(criterium: Criterium, field: string) {
    criterium.field = field;
  }

  getLabel(criterium: Criterium): string {
    for (let i in this.fields) {
      if (criterium.field === this.fields[i].field) {
        return this.fields[i].label;
      }
    }

    return 'kdekoliv';
  }

  setOperator(criterium: Criterium, val: string) {
    criterium.operator = val;
  }

  getOperator(criterium: Criterium): string {
    for (let i in this.operators) {
      if (criterium.operator === this.operators[i].val) {
        return this.operators[i].label;
      }
    }
    return 'a zároveň';

  }

  addCriterium() {
    this.criteria.push(new Criterium());
  }

  removeCriterium(i: number) {
    this.criteria.splice(i, 1);
    this.search();
  }

  reset() {
    this.criteria = [];
    this.state.resetDates();
    this.criteria.push(new Criterium());
    this.search();
  }

  search() {
    let p: any = {};
    Object.assign(p, this.route.snapshot.params);
    p['criteria'] = JSON.stringify(this.criteria);
    p['date'] = JSON.stringify(this.state.dateRange);
    p['start'] = 0;
    this.lupa?.nativeElement.blur();
    this.router.navigate([p], {relativeTo: this.route, queryParamsHandling: "preserve"});
  }

  // searchGenres(e: TypeaheadMatch , cr: Criterium) {
  //   cr.value = e.item['val'];
  //   this.genre = this.translate.instant('genre.'+e.item['val']);
  //   this.search();
  // }

  setGenres() {
    this.genres = [];
    if(this.genre !== ''){
      this.genretr = this.translate.instant('genre.'+this.genre);
    }
    this.state.genres.forEach(g => {
      let tr = this.translate.instant(g.tr);
      this.genres.push({val: g.val, tr: tr})
    });
  }

}
