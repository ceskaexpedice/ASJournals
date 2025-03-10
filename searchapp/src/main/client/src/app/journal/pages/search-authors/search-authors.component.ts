import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import {HttpParams} from '@angular/common/http';
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
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatAutocompleteModule, MatIconModule, MatTooltipModule, MatPaginatorModule],
  selector: 'app-search-authors',
  templateUrl: './search-authors.component.html',
  styleUrls: ['./search-authors.component.scss']
})
export class SearchAuthorsComponent implements OnInit, OnDestroy {


  subscriptions: Subscription[] = [];

  loaded: boolean = false;
  public authors: any[] = [];
  public authorsFiltered: any[] = [];
  public authors1: any[] = [];
  public authors2: any[] = [];

  public qautor: string | null = null;

  rowsPerCol: number = 10;
  letter: string | null = null;
  page: number = 0;
  totalPages: number = 0;

  isLetterActive: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: AppService,
    private searchService: SearchService,
    public state: AppState) { }

  ngOnInit() {
    this.getAuthors();
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


  getAuthors() {
      var params = new HttpParams().set('q', '*:*')
      .set('rows', '0')
      .set('facet', 'true')
      .set('facet.field', 'autor_facet')
      .set('facet.mincount', '1')
      .set('facet.limit', '-1')
      .set('facet.sort', 'index');
      this.loaded = false;
      this.searchService.search(params).subscribe((res: any) => {
        this.authors = [];
        for (let i in res['facet_counts']['facet_fields']['autor_facet']) {
//          this.authors.push(res['facet_counts']['facet_fields']['autor_facet'][i][0]);
          
          
          let val: string = res['facet_counts']['facet_fields']['autor_facet'][i][0];
          if(val && val !== ''){
            let val_lower: string = val.toLocaleLowerCase(); 
            this.authors.push({val: val, val_lower: val_lower});
          }
          
          
        }
        
        this.authors.sort((a, b) => {
          return a.val_lower.localeCompare(b.val_lower, 'cs');
        });
        
        this.filter();
        this.loaded = true;

      });
    
  }

  setLetter(l: string | null) {
    this.page = 0;

    this.letter = l;
    this.filter();
    if (l !== null) {
      this.router.navigate([{ letter: l }], { relativeTo: this.route, queryParamsHandling: "preserve"});
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
    if (this.authors.length === 0) {
      return true;
    }
    let has = false;
    this.authors.forEach((el) => {
      let k: string = el.val[0];
      if (k.toLocaleLowerCase().charAt(0) === l.toLocaleLowerCase()) {
        has = true;
        return;
      }
    });
    return !has;
  }

  filterAuto() {
    this.authorsFiltered = [];
    const filterValue = this.qautor.toLowerCase();
    this.authorsFiltered = this.authors.filter(autor => autor.val.toLowerCase().includes(filterValue));
  }

  filter() {
    this.authorsFiltered = [];
    if (this.letter !== null) {

      this.authors.forEach((el) => {
        //        console.log(el);
        let k: string = el.val;
        if (Utils.removeDiacritics(k.toLocaleLowerCase().charAt(0))  === this.letter?.toLocaleLowerCase()) {
          this.authorsFiltered.push(el);
        }
      });
    } else {
      this.authorsFiltered = this.authors;
    }
    this.totalPages = Math.ceil(this.authorsFiltered.length / (this.rowsPerCol * 2));
    this.setCols();
  }

  setCols() {
    this.authors1 = [];
    this.authors2 = [];
    let min: number = this.page * this.rowsPerCol * 2;
    let max: number = Math.min(min + this.rowsPerCol, this.authorsFiltered.length);
    for (let i = min; i < max; i++) {
      this.authors1.push(this.authorsFiltered[i]);
    }
    min = max;
    max = Math.min(min + this.rowsPerCol, this.authorsFiltered.length);
    for (let i = min; i < max; i++) {
      this.authors2.push(this.authorsFiltered[i]);
    }
  }

  search(s: string) {
      this.state.resetDates();
    let c = new Criterium();
    c.field = 'autor';
    c.value = s;
    this.router.navigate(['../cokoliv', { criteria: JSON.stringify([c]), start: 0}], {relativeTo: this.route, queryParamsHandling: "preserve" });
  }

  searchInput() {
    this.search(this.qautor!);
  }

}
