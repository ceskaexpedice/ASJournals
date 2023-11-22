import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-interface',
  standalone: true,
  imports: [CommonModule, AngularSplitModule, MatCheckboxModule, TranslateModule, MatDividerModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-interface.component.html',
  styleUrls: ['./admin-interface.component.scss']
})
export class AdminInterfaceComponent {

}
