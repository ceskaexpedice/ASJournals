import { Component, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { ArticleInfoComponent } from '../../components/article-info/article-info.component';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-article-viewer-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, ArticleInfoComponent],
  templateUrl: './article-viewer-details.component.html',
  styleUrls: ['./article-viewer-details.component.scss']
})
export class ArticleViewerDetailsComponent {
  
  citace: string | null = null;
  location: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private router: Router,
    private config: Configuration,
    private service: AppService,
    public state: AppState,) {

    // this.afterLoad = this.afterLoad.bind(this);
  }

  ngOnInit() {
    this.state.viewerActiveLink = 'detail';
    this.route.parent.params.subscribe((params: Params) => {
        this.getCitace();
      });
  }

  getCitace() {
    this.citace = '';
    this.service.getCitace(this.state.viewerPid!, this.state.currentMagazine.k5url).subscribe(resp => {
      this.citace = resp;
      this.location = this.document.location.href;
    });

  }

}
