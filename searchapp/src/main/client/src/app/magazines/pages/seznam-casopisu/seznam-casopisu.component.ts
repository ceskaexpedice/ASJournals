import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Magazine } from 'src/app/models/magazine';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';


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
      this.getData();
    }));
    if (this.state.config) {
      this.getData();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  getData() {
    this.service.getMagazines().subscribe((response: any) => {
      this.state.magazines = response['response']['docs'];
      this.state.magazines.forEach((m: Magazine) => m.isK7 = m.kramerius_version === 'k7');
      this.state.setFacets(response['facet_counts']['facet_fields']);
    });
  }

}
