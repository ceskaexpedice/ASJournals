import { Component, OnInit } from '@angular/core';
import { AppState } from '../../app.state';
import {AppService} from '../../services/app.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  foot: string = '';
  constructor(
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    if (this.state.ctx){
      this.service.getText('footer').subscribe(t => {
        this.foot = t;
      }); 
    }
  }

}
