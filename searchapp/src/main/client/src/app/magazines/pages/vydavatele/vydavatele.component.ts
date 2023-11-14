import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
    
      this.service.getEditors().subscribe();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

}
