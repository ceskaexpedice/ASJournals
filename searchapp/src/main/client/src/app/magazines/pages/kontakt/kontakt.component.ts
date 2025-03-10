import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [TranslateModule],
  selector: 'app-kontakt',
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.scss']
})
export class KontaktComponent implements OnInit {

  subscriptions: Subscription[] = [];

  text: string | null = null;
  id: string = 'kontakt';

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
