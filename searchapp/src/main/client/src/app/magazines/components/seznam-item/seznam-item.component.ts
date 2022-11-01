import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';

import {MagazineState} from '../../magazine.state';
import {MagazinesService} from '../../magazines.service';

@Component({
  selector: 'app-seznam-item',
  templateUrl: './seznam-item.component.html',
  styleUrls: ['./seznam-item.component.scss']
})
export class SeznamItemComponent implements OnInit {
  @Input() resultItem: any;
  
  showingDetail: boolean = false;
  id: string = '';
  
  constructor(
  private route: ActivatedRoute,
    private router: Router, 
    public state: MagazineState, 
    public translate: TranslateService,
    private service: MagazinesService) { }

  ngOnInit() {
    this.id = this.normalize(this.resultItem['ctx']);
  }
  
  
  addFilter(field: string, value: string){
    if (!this.state.isFacetUsed(field, value)){
      this.state.addFilter(field, value);
    }
  }
  
  normalize(str: string){
    return str.replace(/[^a-z0-9]/gi, '');
  }

  showDetail() {
    this.showingDetail = !this.showingDetail;
  }
}
