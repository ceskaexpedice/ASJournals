import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute,  } from '@angular/router';
import {HttpParams} from '@angular/common/http';
import { AppState } from 'src/app/app.state';
import { Criterium } from 'src/app/models/criterium';
import { AppService } from 'src/app/services/app.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-genres',
  templateUrl: './search-genres.component.html',
  styleUrls: ['./search-genres.component.scss']
})
export class SearchGenresComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  genres: any[] = [];

  public qgenre: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private service: AppService,
    public state: AppState) { }

  ngOnInit() {
    this.getGenres();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  getGenres() {
    if (this.state.config) {
      var params = new HttpParams()
      .set('q', '*:*')
      .set('fq', '-genre:""')
      .set('fq', 'model:article')
      .set('rows', '0')
      .set('facet', 'true')
      .set('facet.field', 'genre')
      .set('facet.mincount', '1')
      .set('facet.sort', 'index');
      this.searchService.search(params).subscribe((res: any) => {

        this.genres= [];
        for(let i in res['facet_counts']['facet_fields']['genre']){
          let genre = res['facet_counts']['facet_fields']['genre'][i][0];
          
          if(!this.service.isHiddenByGenre([genre])){
            this.genres.push(genre);
          }
        }
        this.genres.sort((a, b) => {
          return a.localeCompare(b, 'cs');
        });

      });
    } else {

      this.subscriptions.push(this.state.configSubject.subscribe(
        () => {
          this.getGenres();
        }
      ));
    }
  }

  search(genre: string | null) {
      this.state.resetDates();
    let c = new Criterium();
    c.field = 'genre';
    c.value = genre;
    this.router.navigate(['../cokoliv', { criteria: JSON.stringify([c]), start: 0}], {relativeTo: this.route, queryParamsHandling: "preserve" });
  }

  searchInput() {
    this.search(this.qgenre);
  }


}
