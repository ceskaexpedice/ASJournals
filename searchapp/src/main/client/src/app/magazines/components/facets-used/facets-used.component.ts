import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import {MagazineState} from '../../magazine.state';
import {MagazinesService} from '../../magazines.service';


@Component({
  selector: 'app-facets-used',
  templateUrl: './facets-used.component.html',
  styleUrls: ['./facets-used.component.scss']
})
export class FacetsUsedComponent implements OnInit {
  
  subscriptions: Subscription[] = [];

  constructor(public state: MagazineState, private service: MagazinesService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
  
  removeFilter(idx: number){
    this.state.removeFilter(idx);
    // this.service.getMagazines().subscribe();
  }
  
  removeAllFilters(){
    this.state.filters = [];
    this.state.paramsChanged();
    // this.service.getMagazines().subscribe();
  }

}
