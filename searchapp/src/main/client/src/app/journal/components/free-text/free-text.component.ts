import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-free-text',
  templateUrl: './free-text.component.html',
  styleUrls: ['./free-text.component.scss']
})
export class FreeTextComponent implements OnInit, OnDestroy {

  @Input() set page(value: string) {
    this.id = value;
    this.getText();
  }


  subscriptions: Subscription[] = [];

  text: SafeHtml | null = null;
  id: string | null = null;
  img: string  | null = null;

  constructor(private state: AppState,
    private appService: AppService,
    private router: Router,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.subscriptions.push(this.appService.langSubject.subscribe(
      () => {
        this.getText();
      }
    ));

    if (this.page) {
        this.id = this.page;
        this.getText();
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  getText() {
    this.appService.getText(this.id).subscribe(t => {
      this.text = this.sanitizer.bypassSecurityTrustHtml(t);
    });
  }

}
