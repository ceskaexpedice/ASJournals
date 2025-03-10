import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import { AppState } from '../app.state';


import {SearchResult} from '../models/search-result.model';
import {CurrentSearch} from '../models/current-search.model';
import {Journal} from '../models/journal.model';
import { Configuration } from '../models/configuration';


@Injectable()
export class SearchService {

    
  constructor(
    private config: Configuration,
    private state: AppState,
    private http: HttpClient) { }

  search(params : HttpParams) {
    let p = params.append('fq', 'root_pid:"' + this.state.currentMagazine.journal + '"');
    var url = 'api/search/journal/select';    
    return this.http.get(url, { params: p });
  }


}
