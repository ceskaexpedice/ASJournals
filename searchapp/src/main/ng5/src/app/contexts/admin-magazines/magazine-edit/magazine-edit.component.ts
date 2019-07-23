import { Component, OnInit, Input } from '@angular/core';
import {Magazine} from '../../../models/magazine';
import {MagazinesService} from '../../magazines.service';

@Component({
  selector: 'app-magazine-edit',
  templateUrl: './magazine-edit.component.html',
  styleUrls: ['./magazine-edit.component.scss']
})
export class MagazineEditComponent implements OnInit {

  @Input() mag: Magazine;
  newKeyword: string = '';
  
  constructor(private service: MagazinesService) { }

  ngOnInit() {
  }
  
  removeKeyword(idx: number){
    this.mag.keywords.splice(idx, 1);
  }
  
  addKeyword(){
    if(this.newKeyword !== ''){
      if(!this.mag.keywords){
        this.mag.keywords = [];
      }
        this.mag.keywords.push(this.newKeyword);
      this.newKeyword = '';
    }
  }

}
