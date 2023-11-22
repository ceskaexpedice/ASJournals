import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { TranslateModule, TranslateService} from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-heading',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss']
})
export class HeadingComponent {

  constructor(
    public config: Configuration,
    public state: AppState,
    public translate: TranslateService) { }

}
