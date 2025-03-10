import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {MagazineState} from '../../magazine.state';
import {MagazinesService} from '../../magazines.service';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, MatExpansionModule, MatIconModule],
  selector: 'app-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements OnInit {
  
  subscriptions: Subscription[] = [];
  active : boolean = false;
  
  constructor(
    public state: MagazineState, 
    private service: MagazinesService,
    private router: Router ) {
    
  }

  ngOnInit() {
    this.openCollapsible();
    //this.active = this.state.facets.length > 0;
    this.subscriptions.push(this.state.stateChangedSubject.subscribe((st) => {
      setTimeout(() => {
        this.active = true;
      }, 1000);
      
    }));
    
  }
  
  openCollapsible(){
    this.active = false;
    setTimeout(() => {
        this.active = this.state.facets.length > 0;
      }, 100);
  }

  ngOnDestroy() {
    this.active = false;
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
  
  addFilter(field: string, value: string){
    if (!this.state.isFacetUsed(field, value)){
      this.service.addFilter(field, value);
    } else if (this.state.isFacetUsed(field, value)){
      const idx = this.state.filters.findIndex(f => f.field === field && f.value === value)
      this.service.removeFilter(field, idx);
    }
  }


}
