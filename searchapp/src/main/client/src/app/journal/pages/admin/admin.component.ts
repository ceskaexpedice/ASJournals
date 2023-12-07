import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ɵɵclassMapInterpolate1 } from '@angular/core';
import { Subscription } from 'rxjs';


import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, TranslateModule],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

}