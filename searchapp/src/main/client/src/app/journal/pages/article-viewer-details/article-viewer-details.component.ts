import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-article-viewer-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './article-viewer-details.component.html',
  styleUrls: ['./article-viewer-details.component.scss']
})
export class ArticleViewerDetailsComponent {

}
