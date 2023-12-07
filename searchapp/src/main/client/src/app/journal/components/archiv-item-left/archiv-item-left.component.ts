import { Component, OnInit } from '@angular/core';
import { ArchivItemComponent } from '../archiv-item/archiv-item.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ArticleResultComponent } from '../article-result/article-result.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ArchivItemComponent, ArticleResultComponent,
    MatSelectModule, MatInputModule, MatFormFieldModule, TranslateModule, MatIconModule, MatButtonModule],
  selector: 'app-archiv-item-left',
  templateUrl: './archiv-item-left.component.html',
  styleUrls: ['./archiv-item-left.component.scss']
})
export class ArchivItemLeftComponent extends ArchivItemComponent {


}
