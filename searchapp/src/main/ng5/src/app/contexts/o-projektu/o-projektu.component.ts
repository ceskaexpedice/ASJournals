import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MagazineState} from '../magazine.state';

import {AppService} from '../../services/app.service';
import {MagazinesService} from '../magazines.service';

@Component({
  selector: 'app-o-projektu',
  templateUrl: './o-projektu.component.html',
  styleUrls: ['./o-projektu.component.scss']
})
export class OProjektuComponent implements OnInit {

  subscriptions: Subscription[] = [];

  text: string;
  id: string = 'o-projektu';

  constructor(private state: MagazineState,
    private service: MagazinesService,
    private router: Router) {}

  ngOnInit() {
    this.subscriptions.push(this.service.langSubject.subscribe(
      () => {
        this.service.getText(this.id).subscribe(t => this.text = t);
      }
    ));
    if (this.state.currentLang) {
      this.service.getText(this.id).subscribe(t => this.text = t);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

}
