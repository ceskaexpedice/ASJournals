import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Magazine } from 'src/app/models/magazine';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SeznamItemComponent } from '../../components/seznam-item/seznam-item.component';


@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, SeznamItemComponent],
  selector: 'app-seznam-casopisu',
  templateUrl: './seznam-casopisu.component.html',
  styleUrls: ['./seznam-casopisu.component.scss']
})
export class SeznamCasopisuComponent implements OnInit {


  subscriptions: Subscription[] = [];

  constructor(
    public state: MagazineState, 
    private service: MagazinesService,
    private route: ActivatedRoute
    ) {
  }

  ngOnInit() {
    this.subscriptions.push(this.state.paramsSubject.subscribe((state) => {
      this.getData();
    }));
    this.subscriptions.push(this.route.queryParams.subscribe((p: Params) => {
      this.processParams(p);
    }));
    if (this.state.config) {
      this.getData();
    }
  }

  processParams(p: Params) {
    this.state.filters = [];
    const fields = ['pristup','oblast','vydavatel','keywords'];

    fields.forEach(f => {
      if (p[f]) {
        this.state.filters.push({field: f, value: p[f]});
      }
    });
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
