import { Component, Inject, Input } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-article-viewer-pdf',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgxExtendedPdfViewerModule,
    MatIconModule, MatTabsModule],
  templateUrl: './article-viewer-pdf.component.html',
  styleUrls: ['./article-viewer-pdf.component.scss']
})
export class ArticleViewerPdfComponent {
  loading = true;

  lang: string;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router) {

  }

  ngOnInit() {

    this.lang = this.state.currentLang;
    this.service.langSubject.subscribe(
      (lang) => {
        this.lang = lang;
      }
    );

  }

  afterLoad(e: any) {
    console.log(e)
    //this.numPages = pdf.numPages;
    this.loading = false;
  }
}
