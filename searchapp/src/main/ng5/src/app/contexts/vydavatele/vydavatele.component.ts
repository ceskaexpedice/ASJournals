import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {MagazineState} from '../magazine.state';
import { MagazinesService } from '../magazines.service';


@Component({
  selector: 'app-vydavatele',
  templateUrl: './vydavatele.component.html',
  styleUrls: ['./vydavatele.component.scss']
})
export class VydavateleComponent implements OnInit {

  subscriptions: Subscription[] = [];

  constructor(public state: MagazineState, private service: MagazinesService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.state.paramsSubject.subscribe((state) => {
      this.service.getEditors().subscribe();
    }));
    if(this.state.config)
      this.service.getEditors().subscribe();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

}
