import { Component, OnInit } from '@angular/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule],
  selector: 'app-sort-bar',
  templateUrl: './sort-bar.component.html',
  styleUrls: ['./sort-bar.component.scss']
})
export class SortBarComponent implements OnInit {

  constructor(public state: MagazineState, private service: MagazinesService) { }

  ngOnInit() {
  }
  
  setSort(dir: string){
    this.state.currentSortDir = dir;
    this.service.getMagazines().subscribe((response: any) => {
      this.state.magazines = response['response']['docs'];
      this.state.setFacets(response['facet_counts']['facet_fields']);
    });
  }

}
