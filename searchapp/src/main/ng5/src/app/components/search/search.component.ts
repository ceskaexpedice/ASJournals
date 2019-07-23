import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';

import {Router, ActivatedRoute, Params, NavigationStart, NavigationEnd} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {Subscription} from 'rxjs/Subscription';
import {NouisliderComponent} from 'ng2-nouislider';

import {HttpParams} from '@angular/common/http';

import {Criterium} from '../../models/criterium';
import {SearchService} from '../../services/search.service';

import {AppService} from '../../services/app.service';
import {AppState} from '../../app.state';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  @ViewChild('results') results: ElementRef;
  @ViewChild('dateSlider') public dateSlider: NouisliderComponent;
  docs: any[];
  numFound: number;
  totalPages: number = 0;

  start: number = 0;
  rowsSelect: number[] = [10, 20, 30];
  rows: number = 10;
  hasDateFilter: boolean = false;

  currentSort: any;

  onlyPeerReviewed: boolean = false;

  //  public dateForm: FormGroup;

  subscriptions: Subscription[] = [];

  constructor(
    private service: AppService,
    private state: AppState,
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  setDateFilter() {
    if (this.route.snapshot.firstChild.params.hasOwnProperty('date')) {
      let date = this.route.snapshot.firstChild.params['date'];
      if (date) {

        this.hasDateFilter = true;
        //      this.dateForm = this.formBuilder.group({ 'range': [[this.dateMin, this.dateMax]] });

        let j = JSON.parse(date);
        this.changeRangeFormValue(j[0], j[1]);
        if (this.state.config) {
          //this.search([]);
        } else {
          let sss = this.state.configSubject.subscribe(() => {

            //this.search([]);
            sss.unsubscribe();
          });
        }

      }
    }
  }

  ngOnInit() {

    this.currentSort = this.state.sorts[0];
    this.state.fulltextQuery = '';
    this.state.mainClass = 'app-page-search';

    this.setDateFilter();
    this.getStats();
    this.subscriptions.push(this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        if (this.route.snapshot.firstChild.params.hasOwnProperty('start')) {
          this.start = +this.route.snapshot.firstChild.params['start'];
        }
        if (this.route.snapshot.firstChild.params.hasOwnProperty('rows')) {
          this.rows = +this.route.snapshot.firstChild.params['rows'];
        }
        if (this.route.snapshot.firstChild.params.hasOwnProperty('sort')) {
          let s = this.route.snapshot.firstChild.params['sort'];
          for (let i in this.state.sorts) {
            //console.log(this.state.sorts[i].field);
            if (this.state.sorts[i].field === s) {
              this.currentSort = this.state.sorts[i];
              break
            }
          }
          //console.log(s, this.currentSort);
        }
        if (this.route.snapshot.firstChild.params.hasOwnProperty('onlyPeerReviewed')) {
          this.onlyPeerReviewed = this.route.snapshot.firstChild.params['onlyPeerReviewed'] === 'true';
        }

        this.setDateFilter();
      } else if (val instanceof NavigationStart) {

      }
    }));
    this.subscriptions.push(this.route.params
      .switchMap((params: Params) => Observable.of(params['start'])).subscribe(start => {
        if (start) {
          this.start = +start;
        }
      }));

    this.subscriptions.push(this.route.params
      .switchMap((params: Params) => Observable.of(params['date'])).subscribe(date => {
        if (date) {
          let j = JSON.parse(date);
          this.changeRangeFormValue(j[0], j[1]);
        }
      }));
    this.subscriptions.push(this.service.searchSubject.subscribe((criteria: Criterium[]) => {
      this.search(criteria);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  showResults() {
    let s = this.route.snapshot.children[0].url[0].path;
    return s.indexOf('cokoliv') > -1;
  }

  lastResult() {
    return Math.min(this.start + this.rows, this.numFound);
  }

  search(criteria: Criterium[]) {
    this.numFound = 0;
    let hl = false;

    var params = new HttpParams().set('q', '*:*')
      .set('q.op', 'AND').set('fq', 'model:article')
      .set('start', this.start + '')
      .set('rows', this.rows + '')
      .set('sort', this.currentSort.field);
    if (criteria.length > 0) {
      let fq = '';
      let op = 'AND';
      for (let i = 0; i < criteria.length; i++) {
        if (criteria[i].value) {
          if (fq !== '') {
            fq += criteria[i - 1].operator + ' ';
          }
          if (criteria[i].field) {
            if (criteria[i].field === 'genre' && !criteria[i].value.startsWith('"')) {
              fq += criteria[i].field + ':"' + criteria[i].value + '" ';
            } else {
              fq += criteria[i].field + ':' + criteria[i].value + ' ';
            }

          } else {
            this.state.fulltextQuery = criteria[i].value;
            fq += criteria[i].value + ' ';
            hl = true;
          }
        }
      }
      params = params.append('fq', fq.trim());

      //Rok jako stats
      params = params.set('stats', 'true');
      params = params.set('stats.field', 'year');
    }

    //Add date filter
    params = params.append('fq', 'year:[' + this.state.dateOd + ' TO ' + this.state.dateDo + ']');


    //Add onlyPeerReviewed
    if (this.onlyPeerReviewed) {
      params = params.append('fq', 'genre:"peer-reviewed"');
    }

    if (hl) {
      params = params.set('hl', 'true')
        .set('hl.fl', 'ocr')
        .set('hl.q', 'ocr:' + this.state.fulltextQuery)
        .set('hl.snippets', '5')
    }


    this.searchService.search(params).subscribe(res => {
      this.docs = res['response']['docs'];
      this.numFound = res['response']['numFound'];
      this.totalPages = Math.ceil(this.numFound / this.rows);

      this.state.setHl(res['highlighting']);

      if (this.numFound == 0) {
        //this.changeRangeFormValue(this.state.dateMin, this.state.dateMax);
      } else if (res.hasOwnProperty('stats') && res['stats']['stats_fields'].hasOwnProperty('year')) {
        //this.changeRangeFormValue(res['stats']['stats_fields']['year']['min'], res['stats']['stats_fields']['year']['max']);
      }

      //this.results.nativeElement.scrollIntoView();

    });
  }

  getStats() {
    if (this.state.config) {
      if (!this.hasDateFilter) {
        this.state.dateMin = 2000;
        this.state.dateMax = 2019;
      }
      //this.dateForm = this.formBuilder.group({ 'range': [[this.dateMin, this.dateMax]] });

      var params = new HttpParams()
        .set('q', '*:*')
        .set('rows', '0')
        .set('stats', 'true')
        .set('stats.field', 'year');

      this.searchService.search(params).subscribe(res => {
        if (res.hasOwnProperty('stats') && res['stats']['stats_fields'].hasOwnProperty('year')) {
          console.log(res['stats']['stats_fields']['year']);
          this.state.dateMin = res['stats']['stats_fields']['year']['min'];
          this.state.dateMax = res['stats']['stats_fields']['year']['max'];
          if (!this.hasDateFilter) {
            this.state.dateOd = this.state.dateMin;
            this.state.dateDo = this.state.dateMax;
            this.state.dateRange = [this.state.dateOd, this.state.dateDo];
          }
          //this.dateForm = this.formBuilder.group({ 'range': [[this.dateMin, this.dateMax]] });

        }

      });
    } else {
      this.subscriptions.push(this.state.configSubject.subscribe(
        () => {
          this.getStats();
        }
      ));
    }
  }

  changeRangeFormValue(dateOd: number, dateDo: number) {
    this.state.dateOd = dateOd;
    this.state.dateDo = dateDo;
    this.state.dateRange = [dateOd, dateDo];
  }

  dateChange() {
    this.onDateChange([this.state.dateOd, this.state.dateDo]);
  }
  onDateChange(e) {
    if (e) {
      this.changeRangeFormValue(e[0], e[1]);
    }
    let p = {};
    Object.assign(p, this.route.snapshot.firstChild.params);
    //p['date'] = JSON.stringify(this.dateForm.controls['range'].value);
    p['date'] = JSON.stringify(this.state.dateRange);
    p['start'] = 0;
    this.router.navigate(['cokoliv', p], {relativeTo: this.route, queryParamsHandling: "preserve"});
    return;
  }


  setPage(page: number) {
    this.start = page * this.rows;
    let p = {};
    Object.assign(p, this.route.snapshot.firstChild.params);
    p['start'] = this.start;
    this.router.navigate(['cokoliv', p], {relativeTo: this.route, queryParamsHandling: "preserve"});
  }

  setRows(r: number) {
    this.rows = r;
    let p = {};
    Object.assign(p, this.route.snapshot.firstChild.params);
    p['rows'] = this.rows;
    this.router.navigate(['cokoliv', p], {relativeTo: this.route, queryParamsHandling: "preserve"});
  }

  setSort(s: any) {
    this.currentSort = s;
    let p = {};
    Object.assign(p, this.route.snapshot.firstChild.params);
    p['sort'] = this.currentSort.field;
    this.router.navigate(['cokoliv', p], {relativeTo: this.route, queryParamsHandling: "preserve"});
  }

  setPeerReviewed() {
    //this.rows = r;
    let p = {};
    Object.assign(p, this.route.snapshot.firstChild.params);
    p['onlyPeerReviewed'] = this.onlyPeerReviewed;
    this.router.navigate(['cokoliv', p], {relativeTo: this.route, queryParamsHandling: "preserve"});
  }


}
