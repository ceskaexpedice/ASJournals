import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';

import {MagazineState} from '../../magazine.state';
import {MagazinesService} from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatToolbarModule, MatIconModule, MatCardModule, MatTooltipModule, MatDividerModule, MatButtonModule],
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
      this.service.addFilter(field, value);
    }
  }
  
  normalize(str: string){
    return str.replace(/[^a-z0-9]/gi, '');
  }

  showDetail() {
    this.showingDetail = !this.showingDetail;
  }
}
