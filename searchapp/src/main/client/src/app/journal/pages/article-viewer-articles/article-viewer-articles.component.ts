import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-article-viewer-articles',
  standalone: true,
  imports: [CommonModule, TranslateModule, ArticleResultComponent, MatDividerModule],
  templateUrl: './article-viewer-articles.component.html',
  styleUrls: ['./article-viewer-articles.component.scss']
})
export class ArticleViewerArticlesComponent {
  
  breakpoint: number = 1000;
  windowSize: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router) {

    // this.afterLoad = this.afterLoad.bind(this);
  }
}
