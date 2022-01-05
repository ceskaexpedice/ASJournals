import { Component, OnInit } from '@angular/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';

@Component({
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
    this.service.getMagazines().subscribe();
  }

}
