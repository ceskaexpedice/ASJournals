import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {MagazineState} from '../../magazine.state';
import {MagazinesService} from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, MatListModule, MatTooltipModule, MatIconModule],
  selector: 'app-facets-used',
  templateUrl: './facets-used.component.html',
  styleUrls: ['./facets-used.component.scss']
})
export class FacetsUsedComponent implements OnInit {
  
  subscriptions: Subscription[] = [];

  constructor(public state: MagazineState, 
    private service: MagazinesService,
    private router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
  
  removeFilter(field: string, idx: number){
    this.service.removeFilter(field, idx);
  }
  
  removeAllFilters(){
    const p: any = {};
    this.router.navigate(['.']);

    // this.state.filters = [];
    // this.state.paramsChanged();
  }

}
