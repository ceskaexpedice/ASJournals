import { Component } from '@angular/core';


import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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