import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
    private service: MagazinesService) { }

  ngOnInit() {
    this.id = this.normalize(this.resultItem['ctx']);
  }
  
  
  addFilter(field: string, value: string){
    if (!this.state.isFacetUsed(field, value)){
      this.state.addFilter(field, value);
      if (this.route.snapshot.url[0].path.indexOf('seznam-casopisu') > -1){
        this.service.getMagazines().subscribe();
      } else {
        this.router.navigate(['/seznam-casopisu'], {queryParamsHandling: "preserve"});
      }
    }
  }
  
  normalize(str: string){
    return str.replace(/[^a-z0-9]/gi, '');
  }

  // toggle content function by id
  toggleDetail(id: string) {
    
    this.showingDetail = !this.showingDetail;
    // $('#' + id + '-btn').toggleClass('active');
    // $('#' + id).slideToggle("fast");
  }
}
