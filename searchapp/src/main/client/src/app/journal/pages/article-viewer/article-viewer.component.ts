import { Inject, Component, OnInit, ViewChild, HostListener, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// import {PDFDocumentProxy, PDFPageProxy, PdfViewerComponent} from 'ng2-pdf-viewer';
import { AppState } from 'src/app/app.state';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { MatDividerModule } from '@angular/material/divider';
import { ArticleViewerArticlesComponent } from '../article-viewer-articles/article-viewer-articles.component';
import { AppWindowRef } from 'src/app/app.window-ref';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShareDialogComponent } from '../../components/share-dialog/share-dialog.component';
import { Meta } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgxExtendedPdfViewerModule,
    MatIconModule, MatTabsModule, MatDividerModule, MatDialogModule, ArticleViewerArticlesComponent],
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.component.html',
  styleUrls: ['./article-viewer.component.scss']
})
export class ArticleViewerComponent implements OnInit {

  activeLink = 'detail';
  breakpoint: number = 960;
  windowSize: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowSize = (event.target as Window).innerWidth;
    if (this.windowSize > this.breakpoint && this.activeLink === 'articles') {
      //this.router.navigate(['.', 'detail']);
      this.activeLink = 'detail';
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
    }
  }

  viewerPid: string | null = null;
  

  loading = true;

  downloadFilename: string | null = null;
  pagesRendered = 0;
  numPages = -1;

  zoom = 1.0;

  siblingIndex: number = 0;
  isPrintSupported = false;
  showShare = false;
  settingData = false;

  mods: any;

  hideList = true;


  lang: string = 'cs';
  langsMap = {
    'cs': 'cze',
    'en': 'eng'
  };

  magazine: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: AppWindowRef,
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta,
    public dialog: MatDialog,
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router) {

    // this.afterLoad = this.afterLoad.bind(this);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.windowSize = this.windowRef.nativeWindow.innerWidth;
    } else {
      this.windowSize = 2000;
    }

    const parts = this.document.location.href.split('/');
    this.activeLink = parts[parts.length - 1];

    this.route.params
      .subscribe((params: Params) => {
        this.state.viewerPid = params['pid'];
        if (this.config) {
          this.hideList = true;
          this.setData();
        }

      });

    this.lang = this.state.currentLang;
    this.service.langSubject.subscribe(
      (lang) => {
        this.lang = lang;
        this.setData();

      }
    );

  }

  setData() {
    if (this.settingData) {
      return;
    }

    if (!this.state.viewerPid) {
      return;
    }
    this.settingData = true;
    this.state.fullSrc = null;
    this.loading = true;
    this.service.setViewed(this.state.viewerPid).subscribe(res => {
      //console.log('viewed!');
    });

    this.service.getItem(this.state.viewerPid).subscribe(res => {

      if (res['datanode']) {
        this.state.viewerArticle = res;
        console.log(this.state.viewerArticle)
        this.meta.addTags([
          { name: 'abstract', content: this.state.viewerArticle.abstract },
        ]);

        this.pagesRendered = 0;
        this.numPages = -1;

        if (this.state.viewerArticle.hasOwnProperty('url_pdf')) {
          this.state.isPdf = true;
          const title = this.state.viewerArticle['title'];
          if (title) {
            this.downloadFilename = title.substring(0, 30) + '.pdf';
          } else {
            this.downloadFilename = this.state.viewerPid + '.pdf';
          }

          this.state.fullSrc = this.config['context'] + 'api/img?uuid=' + this.state.viewerPid + '&kramerius_version=' + res['kramerius_version'];
        } else {
          this.state.isPdf = false;
          this.downloadFilename = this.state.viewerPid;
          this.state.fullSrc = this.config['context'] + 'api/img?uuid=' + this.state.viewerPid + '&kramerius_version=' + res['kramerius_version'];
          this.loading = false;
        }

        this.mods = JSON.parse(this.state.viewerArticle['mods']);

        // this.doi = Utils.getDoi(this.mods);
        // let ctx = res['context'][0];
        //        let parent = ctx[ctx.length - 2]['pid'];
        const parent = res['parents'][0];
        if (!this.state.viewerJournal || this.state.viewerJournal.pid !== parent) {
          this.service.getJournal(parent).subscribe((a: any) => {

            if (a.pid) {
              this.state.viewerJournal = a;
              this.service.getMods(a['pid']).subscribe(mods => {
                this.state.viewerJournal.mods = mods;

                this.service.getArticles(a['pid']).subscribe((res: any) => {
                  // this.articles = res['response']['docs'];
                  this.state.viewerJournal.setArticles(res, this.config['mergeGenres']);
                });

              });
              //this.service.getSiblings(a['pid']).subscribe(siblings => {
              this.service.getChildren(a['parent'], 'asc').subscribe(siblings => {
                this.state.viewerJournal.siblings = siblings;
                //console.log(siblings);
                for (let i = 0; i < this.state.viewerJournal.siblings.length; i++) {
                  if (this.state.viewerJournal.siblings[i]['pid'] === this.state.viewerJournal.pid) {
                    this.siblingIndex = i;
                    break;
                  }
                }
              });
            }

          });
        }
      } else {
        this.findFirstdatanode(this.state.viewerPid!);
      }
      this.settingData = false;


      if (this.windowSize > this.breakpoint && this.activeLink === 'articles') {
        //this.router.navigate(['.', 'detail']);
        this.activeLink = 'pdf';
        this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
      }

    });
  }

  findFirstdatanode(pid: string) {
    this.service.getChildren(pid, 'asc').subscribe(res => {
      if (res[0]['datanode']) {
        this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', res[0]['pid']], { queryParamsHandling: 'preserve' });
      } else {
        this.findFirstdatanode(res[0]['pid']);
      }
    });
  }

  searchInPdf() {
    // if (this.state.fulltextQuery !== '' && this.pdfComponent) {
    //   this.pdfComponent.pdfFindController.executeCommand('find', {
    //     caseSensitive: false, findPrevious: undefined, highlightAll: true, phraseSearch: false, query: this.state.hlTerms.join(' ')
    //   });
    // }
  }

  pageRendered(e: any) {
    //console.log('(page-rendered)', e);
    this.pagesRendered++;
    if (this.pagesRendered === this.numPages) {
      this.searchInPdf();
    }

  }

  zoomIn() {
    this.zoom = this.zoom + .5;
  }

  zoomOut() {
    this.zoom = this.zoom - .5;
  }

  minimize() {
    this.state.fullScreenChanged(false);
  }

  maximize() {
    this.state.fullScreenChanged(true);
  }

  next() {
    if (this.hasNext()) {
      const pid = this.state.viewerJournal.siblings[this.siblingIndex + 1]['pid'];
      // this.journal = null;
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', pid], { queryParamsHandling: 'preserve' });
    }
  }

  prev() {
    if (this.hasPrev()) {
      const pid = this.state.viewerJournal.siblings[this.siblingIndex - 1]['pid'];
      // this.journal = null;
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', pid], { queryParamsHandling: 'preserve' });
    }
  }

  toggleShare() {
    this.showShare = !this.showShare;
  }

  hasNext() {
    if (this.state.viewerJournal.siblings) {
      return this.siblingIndex < this.state.viewerJournal.siblings.length - 1;
    } else {
      return false;
    }
  }

  hasPrev() {
    return this.siblingIndex > 0;
  }

  url() {
    //return window.location.href;
    return this.document.location.href;
  }

  _socialUrl() {
    //return window.location.href;
    return this.document.location.href;
  }

  facebookShare() {
    const share = 'https://www.facebook.com/sharer/sharer.php?u=' + this._socialUrl();
    window.open(share, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
    this.toggleShare();
    return false;
  }

  linkShare() {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '700px',
      data: {url: this.url(), doi: Utils.getDoi(this.mods)},
      panelClass: 'app-register-dialog'
    });
  }

  public showCitace() {
    
  }


  


}
