import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-heading',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss']
})
export class HeadingComponent {

  title: string;
  subtitle: string;
  constructor(
    public config: Configuration,
    public service: AppService,
    public state: AppState,
    public translate: TranslateService) { }

  ngOnInit() {
    this.setTitle();
    // this.service.langSubject.subscribe(() => {
    //   this.setTitle();
    // })
  }

  setTitle() {
    if (this.state.currentLang === 'en') {
      this.title = this.state.currentMagazine.title_en;
      this.subtitle = this.state.currentMagazine.subtitle_en;
    } else {
      this.title = this.state.currentMagazine.title;
      this.subtitle = this.state.currentMagazine.subtitle;
    }


  }

}
