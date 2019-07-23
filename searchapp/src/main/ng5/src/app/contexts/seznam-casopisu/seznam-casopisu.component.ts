import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {MagazineState} from '../magazine.state';
import { MagazinesService } from '../magazines.service';

@Component({
  selector: 'app-seznam-casopisu',
  templateUrl: './seznam-casopisu.component.html',
  styleUrls: ['./seznam-casopisu.component.scss']
})
export class SeznamCasopisuComponent implements OnInit {
  

  subscriptions: Subscription[] = [];

  constructor(public state: MagazineState, private service: MagazinesService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.state.paramsSubject.subscribe((state) => {
      this.service.getMagazines().subscribe();
    }));
    if(this.state.config)
      this.service.getMagazines().subscribe();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

}
